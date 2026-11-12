# Vekter’n component library

Open `/components` for the interactive catalog. It uses local demo state and never changes insurance contracts or calls the AI endpoint. The catalog is shipped as a normal route, **not an authenticated internal portal**.

## Layers

- `ui/`: actual shadcn/ui registry components, owned by this repository. Radix provides accessible switch, dialog, and tab behavior. `cn` combines clsx and tailwind-merge.
- `vekter/`: product patterns composed from those primitives: `AssistantIdentity`, `AssistantMark`, `AdvisorNote`, `CoverageRow`, `InsuranceRow`, `CoverageRing`, `StepProgress`, `ChatBubble`, `ChatImageBubble`, `ChatComposer` (optional `onAttach` shows a **+** button), `AttachSheet` (the “Legg ved” bottom sheet), and the flow-screen parts `FlowScreen`, `DetailRow` (inline Endre), `StaticMap` (decorative illustration, not a real map), `StatusCheck`, `QuickReplies` and `ApprovedBadge`.
- `app/app.css`: semantic theme tokens. Add `vekter-theme` to a container to opt into the prototype's navy/yellow appearance. The onboarding (`/onboarding`), overview (`/`), chat (`/chat`) and catalog all use this theme; the root defaults remain light for other consumers.

```tsx
import { Button } from '~/components/ui/button'
import { CoverageRow, AdvisorNote } from '~/components/vekter'

<section className="vekter-theme rounded-xl p-6">
  <CoverageRow title="Leiebil" description="kr 45 / mnd" checked={rentalCar} onCheckedChange={setRentalCar} />
  <AdvisorNote>Ingenting skjer uten ditt ja.</AdvisorNote>
  <Button onClick={requestConfirmation}>Lagre endringer</Button>
</section>
```

Use controlled switches for real domain state; disabled coverage rows represent mandatory or externally managed coverage. `ChatComposer` submits trimmed text on Enter (Shift+Enter adds a line) and calls the supplied callback; the caller owns network requests, pending state, errors, and message history. Pass `disabled` while a request is pending.

Dialogs render through a portal, so apply `className="vekter-theme"` to `DialogContent` as well as the surrounding page. Always include a `DialogTitle` and `DialogDescription`. Icon-only controls need accessible labels. `InsuranceRow` is a button when given `onClick` and a static row otherwise; `trailing` replaces the price/chevron slot (e.g. a status icon or provider badge). `CoverageRing` takes optional `segments` for the segmented per-policy ring. `ChatComposer` accepts `placeholder` and `allowEmpty` (submit without text, e.g. when chips are selected).

## Design evidence and limitations

Source: https://www.figma.com/design/Ha7T4lDGgun8vyqCn8Kkto/Vekter-n-%E2%80%93-prototype?node-id=26-130

Read from Figma metadata/variables: mobile width 393px, 24–28px horizontal insets, 52px primary actions, 48×28px coverage switches, Gjensidige Sans body 16/24 and small text 14/21, Gjensidige Display headings. Existing CDN font loading is reused.

The home and policy implementation uses design context and screenshots from node `26:131`. Its exported palette, spacing, segmented coverage ring paths, and original Vekter’n mascot are reused; the mascot is stored at `public/images/vekter-mark.svg` so it does not depend on the Figma desktop asset server. Coverage rings expose a clamped percentage to assistive technology and light up five segments. Figma comments and responsive rules were not available; centering the mobile-width app on desktop is an implementation choice.

## Add primitives

From `frontend/`: `npx shadcn@latest add <component>`. Configuration is in `components.json`; import aliases are shared by TypeScript and Vite. Review generated changes and keep utility imports pointed at `~/lib/utils` (the current registry CLI may emit an unrelated `cn` package import). Preserve product tokens and avoid bulk overwrites of customized primitives.

Run `npm run typecheck` and `npm run build`. Do not add tests unless explicitly requested.
