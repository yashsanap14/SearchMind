import { Hono } from "hono";
import { cors } from "hono/cors";
import { SearchRequestSchema } from "@/shared/types";

interface AppEnv {
  DB: D1Database;
  SERPER_API_KEY: string;
  GEMINI_API_KEY: string;
}

interface SerperSearchResult {
  title?: string;
  link?: string;
  snippet?: string;
  date?: string;
}

interface SerperResponse {
  organic?: SerperSearchResult[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}



const app = new Hono<{ Bindings: AppEnv }>();

app.use("*", cors());

// Search endpoint
app.post("/api/search", async (c) => {
  try {
    const body = await c.req.json();
    const { query } = SearchRequestSchema.parse(body);

    // Get Serper API key
    const serperApiKey = c.env.SERPER_API_KEY;
    if (!serperApiKey) {
      return c.json({ error: "Serper API key not configured" }, 500);
    }

    // Search with Serper API
    const searchResponse = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": serperApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 10,
      }),
    });

    if (!searchResponse.ok) {
      throw new Error(`Serper API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json() as SerperResponse;
    const organicResults = searchData.organic || [];

    // Parse search results
    const searchResults = organicResults.map((result: SerperSearchResult, index: number) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || "",
      position: index + 1,
      date: result.date,
    }));

    // Get Gemini API key
    const geminiApiKey = (c.env as any).GOOGLE_API_KEY || c.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return c.json({ error: "Gemini API key not configured" }, 500);
    }

    // Create context for AI summary
    const context = searchResults
      .slice(0, 8) // Use top 8 results
      .map((result, idx: number) => `[${idx + 1}] ${result.title}\n${result.snippet}\nURL: ${result.link}`)
      .join("\n\n");

    // Generate AI summary with citations using Gemini
    const prompt = `You are a research assistant that summarizes web search results. 

Instructions:
1. Provide a comprehensive, well-structured summary of the search results
2. Include relevant details and key insights
3. Use numbered citations [1], [2], etc. that correspond to the search result positions
4. Be objective and accurate
5. If the search results don't contain enough information, acknowledge limitations
6. Keep the summary between 200-500 words

Search results to summarize:
${context}

Query: ${query}

Please provide a comprehensive summary of these search results:`;

    // Call Gemini API with fallback models and detailed errors
    const configuredModel = (c.env as any).MODEL_NAME as string | undefined;
    const preferredModel = configuredModel || "gemini-2.5-flash";
    const fallbackModel = "gemini-1.5-flash";

    function buildModelUrl(model: string): string {
      const path = model.startsWith("models/") ? model : `models/${model}`;
      return `https://generativelanguage.googleapis.com/v1beta/${path}:generateContent?key=${geminiApiKey}`;
    }

    async function generateWithModel(model: string) {
      const url = buildModelUrl(model);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });
      return response;
    }

    let summary = "";
    try {
      let geminiResponse = await generateWithModel(preferredModel);
      if (geminiResponse.status === 404) {
        // Try fallback model without the -latest alias
        geminiResponse = await generateWithModel(fallbackModel);
      }

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini error ${geminiResponse.status}`);
      }

      const geminiData = (await geminiResponse.json()) as GeminiResponse;
      summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (_err) {
      // Graceful fallback: synthesize a concise summary from top results
      const top = searchResults.slice(0, 5);
      const bullets = top
        .map((r, i) => `- [${i + 1}] ${r.title || r.link}: ${r.snippet}`)
        .join("\n");
      summary = `Summary unavailable from AI. Here's a quick overview based on top results:\n\n${bullets}`;
    }

    if (!summary) {
      summary = "Unable to generate summary.";
    }

    // Store in database
    const insertQuery = await c.env.DB.prepare(
      "INSERT INTO search_queries (query, response_text, citations) VALUES (?, ?, ?)"
    )
      .bind(
        query,
        summary,
        JSON.stringify(searchResults)
      )
      .run();

    const searchQueryId = insertQuery.meta.last_row_id;

    // Insert citations
    for (const result of searchResults) {
      await c.env.DB.prepare(
        "INSERT INTO citations (search_query_id, title, url, snippet, position) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(
          searchQueryId,
          result.title,
          result.link,
          result.snippet,
          result.position
        )
        .run();
    }

    const citations = searchResults.map((result, idx: number) => ({
      id: idx + 1,
      title: result.title,
      url: result.link,
      snippet: result.snippet,
      position: result.position || idx + 1,
    }));

    return c.json({
      id: searchQueryId,
      query,
      summary,
      citations,
      raw_results: searchResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      500
    );
  }
});

// Get search history
app.get("/api/searches", async (c) => {
  try {
    const searches = await c.env.DB.prepare(
      "SELECT id, query, response_text, created_at FROM search_queries ORDER BY created_at DESC LIMIT 20"
    ).all();

    return c.json(searches.results);
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch search history" }, 500);
  }
});

// Get specific search with citations
app.get("/api/searches/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const search = await c.env.DB.prepare(
      "SELECT * FROM search_queries WHERE id = ?"
    ).bind(id).first();

    if (!search) {
      return c.json({ error: "Search not found" }, 404);
    }

    const citations = await c.env.DB.prepare(
      "SELECT * FROM citations WHERE search_query_id = ? ORDER BY position"
    ).bind(id).all();

    return c.json({
      id: search.id,
      query: search.query,
      summary: search.response_text,
      citations: citations.results.map((citation: any) => ({
        id: citation.id,
        title: citation.title,
        url: citation.url,
        snippet: citation.snippet,
        position: citation.position,
      })),
    });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch search" }, 500);
  }
});

export default app;
