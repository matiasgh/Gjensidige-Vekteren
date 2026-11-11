# Gjensidige-Vekteren
Hackathon Gjensidige

## Vekteren prototype

The home route `/` implements the Figma insurance overview. Select a policy to view its details; Bil has staged coverage switches and **Lagre endringer** applies deterministic mock actions to the local profile. Turning off Delkasko also turns off Kasko; enabling Kasko also enables Delkasko. The monthly price and home total reflect saved selections. Prices and the illustrated “100 % dekket” score are fictitious prototype data, not quotes or a needs assessment.

The employer-paid travel policy is read-only. Its family-coverage action opens a contextual question, not a purchase. **Spør Vekter’n** opens the existing chat at `/chat`; the chat receives the same saved profile and can change supported demo options through validated mock actions. Asking questions still requires the AI environment variables below.

Stored state uses schema version 2 with Kari Haugen's onboarding scenario. House and contents are grouped in the overview but remain separate policies for coverage changes. Open Kari's profile button, then the conversation room, to manage conversations or reset demo data through **Om Vekter’n**.

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
| `/` | Insurance overview. New profiles start onboarding; completed profiles see the desktop overview/chat layout or mobile overview. |
| `/onboarding` | Seven onboarding steps, from `/onboarding?steg=1` to `steg=7`. Existing `/?steg=N` links redirect here. Completion leads to `/`. |
| `/chat` | Chat with Vekter'n, with the persistent overview column on desktop. |
| `/components` | Interactive catalog of the component library. |
| `/api/chat` | Server-only resource route (POST) for the AI call. |

The customer seed (the Kari scenario, policies with `provider`/`coverageSummary`, and the hardcoded `gapAnalysis`) lives in the client-safe `app/lib/mock-customer.ts`. The onboarding and the chat both read it from the persisted demo state below, so it is the single source of truth. Both screens are built from the component library (`app/components/ui` and `app/components/vekter`).

Any OpenAI-compatible provider works if you change `AI_BASE_URL` and `AI_MODEL`, for example OpenAI, Gemini (`https://generativelanguage.googleapis.com/v1beta/openai`), Groq (`https://api.groq.com/openai/v1`) or OpenRouter (`https://openrouter.ai/api/v1`).

### Persistent demo state

The onboarding and `/chat` seed the fictitious customer from `app/lib/mock-customer.ts` on first use and store the current customer, all conversations, the selected conversation and the onboarding progress (`onboarding.completed` and the step 3 `priorities`) in browser localStorage under `vekteren.mock-state.v2`. Version 1 data (`vekteren.mock-state.v1`, previous demo customer) is migrated once: conversations are kept and the customer is replaced by the Kari seed. Reloading restores that state; **Ny samtale** keeps previous conversations available in the conversation selector. The step 3 priorities are sent to the AI as the customer's own stated priorities. Pages that need the state render a placeholder until it has been read after hydration. Storage is local to the browser, not a server-side customer record. Invalid/unsupported stored state falls back to the defaults; storage failures are displayed rather than silently claiming persistence.

Open **Om Vekter’n → Tilbakestill alle demodata** to restore the default customer and policy choices, reset the onboarding progress, delete all conversations, and start a new empty conversation in one click. A visible confirmation explains what was reset. This replaces only this app's stored demo state, not other localStorage entries. Storage failures are shown in the dialog. Do not enter real personal data: chat messages and the current demo profile are sent to the configured AI provider.

Coverage changes use the provider's function/tool-calling support. The server validates an explicit `update_mock_coverage` action, and the browser applies it together with the assistant's confirmation to the persisted state. Free-text replies never mutate the customer. The allowlist supports existing boolean policy options, Figma car switches with deterministic fictitious prices, and level changes within the house/child/travel product families. Employer-paid travel remains locked. New purchases and travel extensions are not supported. The provider/model must support Chat Completions tools.

Future flows should extend the `MockAction` union and `applyMockAction` in `app/lib/mock-actions.ts`, the tool schema/instructions in `ai.server.ts`, and the customer shape/validation when needed. Keep mutations deterministic and validate them on both the server and client. Bump/migrate the stored state version when its shape changes. These actions change only fictitious local data, never real insurance agreements.

### Deploy

The app runs on any Node host, for example Render or Railway. Root directory: `frontend`. Build: `npm install && npm run build`. Start: `npm run start`. Set the env vars `AI_API_KEY`, `AI_MODEL` and, optionally, `AI_BASE_URL`.

**Vercel (free Hobby plan):** import the repo at vercel.com/new and set Root Directory to `frontend`; the framework is detected automatically. Add the same env vars and deploy. The `@vercel/react-router` preset is applied automatically when building on Vercel.
