# Gjensidige-Vekteren
Hackathon Gjensidige

## Vekteren chat

### Internal component library

The frontend uses shadcn/ui primitives with a scoped Vekter’n theme based on the Figma prototype. Run the frontend and visit `/components` for the interactive catalog. Reusable product components live in `frontend/app/components/vekter`, with usage and design limitations documented in [`frontend/app/components/README.md`](frontend/app/components/README.md). The catalog is a normal development showcase route, not access-controlled.

`frontend/` is a React Router v7 app in framework mode with server-side rendering (SSR). The AI call lives in the server-only resource route `app/routes/api.chat.ts`, which uses `app/lib/ai.server.ts`. It calls an OpenAI-compatible Chat Completions API with `fetch`, so the key never reaches the browser.

```sh
cd frontend
cp .env.example .env   # set AI_API_KEY and AI_MODEL
npm install
npm run dev            # dev server with HMR
npm run build          # production build into build/
npm run start          # serve the build with react-router-serve (PORT, default 3000)
npm run typecheck
```

### Routes

| Route | What it is |
| --- | --- |
| `/` | Onboarding (7 steps, Figma "Vekter'n – prototype"). The step is in the URL: `/?steg=1` … `/?steg=7`. The default is 1, and invalid values are clamped. Everything except the chat is mocked. |
| `/chat` | Chat with Vekter'n. "Gå til oversikten" in the last onboarding step leads here. |
| `/components` | Interactive catalog of the component library. |
| `/api/chat` | Server-only resource route (POST) for the AI call. |

The customer data (the Kari scenario, policies with `provider`, and the hardcoded `gapAnalysis`) lives in `app/lib/mock-customer.server.ts`. It is the single source of truth for both the onboarding and the chat. Both screens are built from the component library (`app/components/ui` and `app/components/vekter`).

Any OpenAI-compatible provider works if you change `AI_BASE_URL` and `AI_MODEL`, for example OpenAI, Gemini (`https://generativelanguage.googleapis.com/v1beta/openai`), Groq (`https://api.groq.com/openai/v1`) or OpenRouter (`https://openrouter.ai/api/v1`).

### Deploy

The app runs on any Node host, for example Render or Railway. Root directory: `frontend`. Build: `npm install && npm run build`. Start: `npm run start`. Set the env vars `AI_API_KEY`, `AI_MODEL` and, optionally, `AI_BASE_URL`.

**Vercel (free Hobby plan):** import the repo at vercel.com/new and set Root Directory to `frontend`; the framework is detected automatically. Add the same env vars and deploy. The `@vercel/react-router` preset is applied automatically when building on Vercel.
