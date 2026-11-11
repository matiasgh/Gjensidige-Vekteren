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

Any OpenAI-compatible provider works if you change `AI_BASE_URL` and `AI_MODEL`, for example OpenAI, Gemini (`https://generativelanguage.googleapis.com/v1beta/openai`), Groq (`https://api.groq.com/openai/v1`) or OpenRouter (`https://openrouter.ai/api/v1`).

### Persistent demo state

The home page seeds the fictitious customer from `app/lib/mock-customer.ts` on first use and stores the current customer, all conversations, and the selected conversation in browser localStorage under `vekteren.mock-state.v1`. Reloading restores that state; **Ny samtale** keeps previous conversations available in the sidebar (or conversation selector on mobile). Storage is local to the browser, not a server-side customer record. Invalid/unsupported stored state falls back to the defaults; storage failures are displayed rather than silently claiming persistence.

Open **Om Vekter’n → Tilbakestill demoprofil** to restore the default customer and policy choices. Conversation history is retained, but old confirmations do not override the reset customer. To remove all local demo data, remove the `vekteren.mock-state.v1` entry in browser developer tools. Do not enter real personal data: chat messages and the current demo profile are sent to the configured AI provider.

Coverage changes use the provider's function/tool-calling support. The server validates an explicit `update_mock_coverage` action, and the browser applies it together with the assistant's confirmation to the persisted state. Free-text replies never mutate the customer. The initial allowlist supports existing boolean policy options (for example, enabling puncture cover) and switching between Reise and Reise Pluss. It deliberately does not invent Bil Pluss, prices, new policies, travel extensions, or other undefined flows. The provider/model must support Chat Completions tools.

Future flows should extend the `MockAction` union and `applyMockAction` in `app/lib/mock-actions.ts`, the tool schema/instructions in `ai.server.ts`, and the customer shape/validation when needed. Keep mutations deterministic and validate them on both the server and client. Bump/migrate the stored state version when its shape changes. These actions change only fictitious local data, never real insurance agreements.

### Deploy

The app runs on any Node host, for example Render or Railway. Root directory: `frontend`. Build: `npm install && npm run build`. Start: `npm run start`. Set the env vars `AI_API_KEY`, `AI_MODEL` and, optionally, `AI_BASE_URL`.

**Vercel (free Hobby plan):** import the repo at vercel.com/new and set Root Directory to `frontend`; the framework is detected automatically. Add the same env vars and deploy. The `@vercel/react-router` preset is applied automatically when building on Vercel.
