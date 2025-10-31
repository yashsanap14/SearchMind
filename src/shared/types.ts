import z from "zod";

// Search result from Serper API
export const SearchResultSchema = z.object({
  title: z.string(),
  link: z.string(), 
  snippet: z.string(),
  position: z.number().optional(),
  date: z.string().optional(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// Citation object
export const CitationSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  position: z.number(),
});

export type Citation = z.infer<typeof CitationSchema>;

// Search request
export const SearchRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// Search response
export const SearchResponseSchema = z.object({
  id: z.number(),
  query: z.string(),
  summary: z.string(),
  citations: z.array(CitationSchema),
  raw_results: z.array(SearchResultSchema).optional(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// TTS request
export const TTSRequestSchema = z.object({
  text: z.string().min(1, "Text cannot be empty"),
});

export type TTSRequest = z.infer<typeof TTSRequestSchema>;
