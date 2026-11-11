# Gjensidige-Vekteren
Hackathon Gjensidige

## Vekteren chat (frontend + AI-agent)

The app in `frontend/` is a Vite + React SPA. The chat endpoint `frontend/api/chat.ts` uses the Vercel AI SDK with OpenAI. It runs server-side only, so the API key never reaches the browser.

### Local setup

```sh
cd frontend
cp .env.example .env   # set OPENAI_API_KEY (and optionally OPENAI_MODEL)
npm install
npm run dev
```

`npm run dev` serves `/api/chat` through a small Vite plugin, so the Vercel CLI isn't needed.

### Deploy to Vercel

1. Import the repo in Vercel and set **Root Directory** to `frontend`.
2. Add the env vars `OPENAI_API_KEY` and, optionally, `OPENAI_MODEL` (default `gpt-4.1-mini`).
3. Deploy. Vercel builds the SPA and serves `api/chat.ts` as a serverless function.
