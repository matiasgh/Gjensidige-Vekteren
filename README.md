# Gjensidige-Vekteren
Hackathon Gjensidige

## Vekteren chat

The app in `frontend/` is a Vite + React SPA. `frontend/api/chat.ts` is a server-only handler that calls an OpenAI-compatible Chat Completions API with `fetch`, so the key never reaches the browser.

### Setup and dev

```sh
cd frontend
cp .env.example .env   # set AI_API_KEY and AI_MODEL
npm install
npm run dev            # serves /api/chat through a small Vite plugin
```

Any OpenAI-compatible provider works if you change `AI_BASE_URL` and `AI_MODEL`, for example OpenAI, Gemini (`https://generativelanguage.googleapis.com/v1beta/openai`), Groq (`https://api.groq.com/openai/v1`) or OpenRouter (`https://openrouter.ai/api/v1`).

### Deploy to Vercel

Set **Root Directory** to `frontend` and add the env vars `AI_API_KEY`, `AI_MODEL` and, optionally, `AI_BASE_URL`. Vercel serves `api/chat.ts` as a serverless function.
