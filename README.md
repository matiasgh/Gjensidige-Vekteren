# Gjensidige-Vekteren
Hackathon Gjensidige

## Vekteren prototype

The home route `/` implements the Figma insurance overview. All Gjensidige policies have staged coverage switches; required coverages stay on and display **Påkrevd**. The detail price updates immediately, while the overview total updates after **Lagre endringer** successfully persists the choices. Saving is disabled without changes and shows a dismissible five-second toast with the changes and new price. Turning off Delkasko also turns off Kasko; enabling Kasko also enables Delkasko. Optional user-specific `tip` fields live on coverages in Kari's demo profile, with at most two shown per policy and no shared advice below the list. All coverage prices are fictitious demo allocations, not product quotes. The illustrated “100 % dekket” score remains unchanged and is not a needs assessment.

The employer-paid travel policy is read-only. Its family-coverage action opens a contextual question, not a purchase. **Spør Vekter’n** opens the existing chat at `/chat`; the chat receives the same saved profile and can change supported demo options through validated mock actions. Asking questions still requires the AI environment variables below.

Stored state uses schema version 2 with Kari Haugen's onboarding scenario. Pre-toggle Kari profiles are enriched with coverage rows while preserving saved options, conversations and onboarding; incompatible profiles fall back to the seed. House and contents are grouped in the overview but remain separate policies for coverage changes. Open Kari's profile button, then the conversation room, to manage conversations or reset demo data through **Om Vekter’n**.

### Bulk i bilen (car damage flow)

When Kari reports damage to her car, the AI calls the tool `start_car_damage_flow` and `/api/chat` returns a flow marker. The chat then follows the Figma frame “3 · Chat: bulk i bilen” with fixed texts from `app/lib/car-damage.ts`. It asks whether everyone is unhurt (“Noen er skadet” shows a 113 safety reply), asks for a photo, and offers **Meld skade**, **Finn verksted** and **Kontakt bilbergning**. The **+** button in the composer opens **Legg ved** (camera, photo library, file, or a bundled example image). It is always available, and any photo gets the same scripted analysis: there is no image recognition. Photos are downscaled to about 800 px JPEG and stored in the conversation in localStorage. They are never sent to the AI; `/api/chat` receives the note “[Kari sendte et bilde av skaden]” instead. Coverage, deductible and registration come from the saved profile: with Kasko off the dent is not covered, and with Veihjelp off towing is shown as not covered. Confirmations (case number, booking, towing) are posted back into the active conversation. Nothing is sent, booked or called for real.

### Reise til Thailand (travel offer flow)

Chat presentation uses Gemini's OpenAI-compatible Structured Outputs (`response_format: json_schema`) with one `{ text, blocks[] }` contract; text-only answers use `blocks: []`. Action selection runs separately with the coverage-update and car-damage tools, preserving existing action validation and scripted confirmations. If no action is selected, a second, tool-free completion generates the schema-constrained answer. Routing text is never displayed. Malformed, incomplete or invalid replies are rejected with a 422, not recovered by parsing JSON out of prose. Blocks (Figma frames R1–R4) are a server-validated union: `coverage-check { coverageId }` (✓/✗ lines read from the policy's coverage summary, never written by the AI), `quick-replies { options: { label, action?: 'open-overview' }[] }`, `tip { title, body, remindInDays? }` and `offer { offerId }`. Offer cards and the approval sheet take every field (product, who, period, covers, provider, price) from `app/lib/travel-offer.ts`; unknown/already bought offers, unknown coverages, extra keys and arbitrary URLs/actions are rejected with a 422. Text and cards are passed separately to the frontend.

The Thailand family-travel flow is staged by the app (`app/lib/travel-flow.ts`, Figma 26:135). Gemini selects `review_family_travel`, which shows current coverage first, then a separate `followUp` question and quick replies. The `travelStage` marker and follow-up text survive storage and API history round trips. Only an immediate “Ja, vis meg” reply to that stage reveals the vaccine tip and draft offer; “Ikke nå” ends it without an offer. Current coverage is rechecked before showing the proposal. Generic AI replies cannot emit offers. The existing approval sheet remains the only purchase path. Coverage cards render before other cards, and follow-up text renders before quick replies.

**Se og godkjenn** opens the sheet “Godkjenn tilleggsdekning”. Only its **Godkjenn og betal** button applies the client-side `buy-offer` action, which adds the policy to the saved profile (the AI cannot buy; `buy-offer` is not an AI tool and is rejected if returned by `/api/chat`). **Avbryt** closes the sheet without a message. The app then posts “Godkjent” with a deterministic receipt (“Ferdig. Familien er dekket fra 14. juli.”; the vaccine line appears only if a reminder was set) and asks the AI for the follow-up. **Minn meg på om 2 uker** stores a reminder in the demo state (no notification is sent). **Se oversikten** navigates to the overview on mobile and highlights the new policy in the overview column on desktop. Other quick replies and **Nei takk** are sent as Kari's message; used buttons are disabled. Blocks are sent to the AI only as short notes such as “[Viste forslag: familyTravelThailand]”. Nothing is bought or paid for real.

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
| `/skade/meld`, `/skade/verksted`, `/skade/berging` | Follow-up screens of the “bulk i bilen” flow (skademelding, workshop booking, towing). They return to `/chat` and render in the chat column on desktop. |
| `/components` | Interactive catalog of the component library. |
| `/api/chat` | Server-only resource route (POST) for the AI call. |

The customer seed (the Kari scenario and policies with `provider`/`coverageSummary`) lives in the client-safe `app/lib/mock-customer.ts`. The onboarding and the chat both read it from the persisted demo state below, so it is the single source of truth. Both screens are built from the component library (`app/components/ui` and `app/components/vekter`).

Any OpenAI-compatible provider works if you change `AI_BASE_URL` and `AI_MODEL`, for example OpenAI, Gemini (`https://generativelanguage.googleapis.com/v1beta/openai`), Groq (`https://api.groq.com/openai/v1`) or OpenRouter (`https://openrouter.ai/api/v1`).

### Persistent demo state

The onboarding and `/chat` seed the fictitious customer from `app/lib/mock-customer.ts` on first use and store the current customer, all conversations, the selected conversation and the onboarding progress (`onboarding.completed` and the step 3 `priorities`) in browser localStorage under `vekteren.mock-state.v3`, together with travel `reminders` (`{ title, dueDate }`). Older data is migrated once: v2 keeps the customer and conversations but refreshes the trip/gap seed fields (Thailand); v1 (previous demo customer) keeps conversations and replaces the customer with the Kari seed. Reloading restores that state; **Ny samtale** keeps previous conversations available in the conversation selector. The step 3 priorities are sent to the AI as the customer's own stated priorities. Pages that need the state render a placeholder until it has been read after hydration. Storage is local to the browser, not a server-side customer record. Invalid/unsupported stored state falls back to the defaults; storage failures are displayed rather than silently claiming persistence. Chat messages may carry optional `image` (data URL), `kind` (flow step), `blocks` (assistant cards) and `receipt` (approved offer) fields.

Open **Om Vekter’n → Tilbakestill alle demodata** to restore the default customer and policy choices, reset the onboarding progress, delete all conversations, and start a new empty conversation in one click. A visible confirmation explains what was reset. This replaces only this app's stored demo state, not other localStorage entries. Storage failures are shown in the dialog. Do not enter real personal data: chat messages and the current demo profile are sent to the configured AI provider.

Coverage changes use the provider's function/tool-calling support. The server validates an explicit `update_mock_coverage` action, and the browser applies it together with the assistant's confirmation to the persisted state. Free-text replies never mutate the customer. The allowlist supports existing boolean policy options, Figma car switches with deterministic fictitious prices, and level changes within the house/child/travel product families. Employer-paid travel remains locked. The only purchase is the fixed Thailand family travel offer, approved by Kari in the sheet (see “Reise til Thailand”); the AI can only propose it. The provider/model must support Chat Completions tools.

Future flows should extend the `MockAction` union and `applyMockAction` in `app/lib/mock-actions.ts`, the tool schema/instructions in `ai.server.ts`, and the customer shape/validation when needed. Keep mutations deterministic and validate them on both the server and client. Bump/migrate the stored state version when its shape changes. These actions change only fictitious local data, never real insurance agreements.

### Deploy

The app runs on any Node host, for example Render or Railway. Root directory: `frontend`. Build: `npm install && npm run build`. Start: `npm run start`. Set the env vars `AI_API_KEY`, `AI_MODEL` and, optionally, `AI_BASE_URL`.

**Vercel (free Hobby plan):** import the repo at vercel.com/new and set Root Directory to `frontend`; the framework is detected automatically. Add the same env vars and deploy. The `@vercel/react-router` preset is applied automatically when building on Vercel.
