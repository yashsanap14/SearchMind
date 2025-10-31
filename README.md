## SearchMind 🔎🧠

AI-powered web search and summarization with citations. Type or dictate your query, SearchMind fetches results (Serper), summarizes with Gemini, and stores history in Cloudflare D1.
<div>
    <a href="https://www.loom.com/share/e54b47b45c7949f09aa93fb2efd340f2">
      <p>SearchMind </p>
    </a>
    <a href="https://www.loom.com/share/e54b47b45c7949f09aa93fb2efd340f2">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/e54b47b45c7949f09aa93fb2efd340f2-18d75d43e4805736-full-play.gif">
    </a>
  </div>
### Features
- Voice input (speech-to-text) and text-to-speech for summaries
- AI summary with numbered citations [1], [2], …
- Search history with details and citations
- Graceful fallback summary if AI isn’t available

### Tech Stack
- Frontend: React 19, Vite 7, TailwindCSS
- Worker API: Cloudflare Workers + Hono
- Database: Cloudflare D1 (SQLite)
- AI + Search: Google Generative Language (Gemini), Serper API
- Tooling: TypeScript, Wrangler

## Getting Started

### 1) Prerequisites
- Node.js 18+ (recommend 20+)
- npm 9+
- Cloudflare Wrangler: `npm i -g wrangler` (or use npx)
- Cloudflare account for D1 (optional for local, required to deploy)

### 2) Install
```
npm install
```

### 3) Configure environment
Copy the example and set your keys:
```
cp .dev.vars.example .dev.vars
```
Then fill in values in `.dev.vars`:
- `SERPER_API_KEY`: Serper API key
- `GOOGLE_API_KEY`: Gemini (AI Studio) API key
- `MODEL_NAME`: A model that your key can access (e.g. `models/gemini-2.5-flash` or one listed by the API)

Tip: list available models for your key
```
export GOOGLE_API_KEY="YOUR_KEY"
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_API_KEY"
```

### 4) Migrations (local D1)
```
npx wrangler d1 migrations apply 019a2d79-df7a-7a22-a63d-d1bf848c6372
```

### 5) Run dev
```
npx wrangler dev
```
This serves both the SPA and the Worker in one process.

## Build
```
npm run build
```
Outputs:
- Worker bundle: `dist/<build-id>/index.js`
- Client: `dist/client/`

## Deploy
1) Set secrets (remote):
```
wrangler secret put SERPER_API_KEY
wrangler secret put GOOGLE_API_KEY
```
2) Apply migrations remotely:
```
wrangler d1 migrations apply 019a2d79-df7a-7a22-a63d-d1bf848c6372 --remote
```
3) Deploy:
```
wrangler deploy
```

## API
All routes are hosted by the Worker (`src/worker/index.ts`).

- `POST /api/search`
  - body: `{ query: string }`
  - returns: `{ id, query, summary, citations: [{ id, title, url, snippet, position }], raw_results }`

- `GET /api/searches`
  - returns recent searches

- `GET /api/searches/:id`
  - returns a saved search with citations

## Notes on AI Models
- The worker prefers `GOOGLE_API_KEY` then falls back to `GEMINI_API_KEY`.
- Set `MODEL_NAME` to any valid model returned by the ListModels endpoint, e.g. `models/gemini-2.5-flash`.
- If Gemini returns 404 or is unavailable, the worker synthesizes a concise non‑AI summary from the top results.

## Security
- Do not commit real keys. `.dev.vars` is gitignored; share `.dev.vars.example` instead.
- Production secrets should be stored as Worker secrets via `wrangler secret`.

## Scripts
- `npm run dev` — Vite dev server (not used when running via Wrangler dev)
- `npm run build` — Type-check + build client and worker
- `npm run check` — Type-check, build, and `wrangler deploy --dry-run`
- `npm run lint` — ESLint

## Contributing
Issues and PRs welcome.

## License
MIT

