import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useLocation, useNavigationType, useSearchParams } from 'react-router'
import { ArrowRight, Bell, Briefcase, CarFront, Check, Circle, Eye, Hand, House, Plus } from 'lucide-react'
import type { Route } from './+types/onboarding'
import type { MockCustomer } from '~/lib/mock-customer'
import { MAX_PRIORITIES, MAX_PRIORITY_LENGTH, type MockState } from '~/lib/mock-state'
import { saveMockState, useMockState } from '~/lib/use-mock-state'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { AdvisorNote, AssistantIdentity, AssistantMark, ChatBubble, ChatComposer, CoverageRing, InsuranceRow, StepProgress } from '~/components/vekter'

const STEP_COUNT = 7
const TICK_MS = 600

type SourceKind = 'gjensidige' | 'employer' | 'other'
const sourceOrder: SourceKind[] = ['gjensidige', 'employer', 'other']

export const meta: Route.MetaFunction = () => [{ title: "Kom i gang – Vekter'n" }]

function deriveOnboarding({ firstName, insurances, gapAnalysis }: MockCustomer) {

  // Policies are counted per category, matching the grouped list in step 5 (house + contents = one).
  const categoriesOf = (list: typeof insurances) => [...new Set(list.map((i) => i.category))]
  const groups = new Map<string, typeof insurances>()
  for (const insurance of insurances) groups.set(insurance.provider, [...(groups.get(insurance.provider) ?? []), insurance])

  const sources = [...groups.entries()]
    .map(([provider, list]) => {
      const kind: SourceKind = list.every((insurance) => insurance.employer) ? 'employer' : provider === 'Gjensidige' ? 'gjensidige' : 'other'
      const types = [...new Set(list.map((i) => i.type.toLowerCase()))].join(', ')
      const count = categoriesOf(list).length
      if (kind === 'gjensidige') return { kind, title: 'Gjensidige', detail: `${count} ${count === 1 ? 'forsikring' : 'forsikringer'} funnet` }
      if (kind === 'employer') return { kind, title: provider, detail: `Via jobb · ${types}` }
      return { kind, title: 'Annet selskap', detail: `${provider}: ${types} funnet` }
    })
    .sort((a, b) => sourceOrder.indexOf(a.kind) - sourceOrder.indexOf(b.kind))

  const policies = categoriesOf(insurances).map((category) => {
    const provider = insurances.find((i) => i.category === category)!.provider
    return { category, provider }
  })

  return { firstName, sources, policies, gapAnalysis }
}

type OnboardingData = ReturnType<typeof deriveOnboarding>

const stepHref = (step: number) => `/onboarding?steg=${step}`

function parseStep(value: string | null) {
  const step = Number.parseInt(value ?? '', 10)
  return Number.isNaN(step) ? 1 : Math.min(Math.max(step, 1), STEP_COUNT)
}

export default function Onboarding() {
  const [searchParams] = useSearchParams()
  const step = parseStep(searchParams.get('steg'))
  // Demo state lives in localStorage, so it is only available after hydration.
  const { state, setState, storageError } = useMockState()

  // Surface persistence problems on every step, including the introductory ones.
  const content = step === 1 ? <Splash /> : step === 2 ? <Intro /> : !state ? <Loading step={step} /> : <OnboardingStep step={step} state={state} setState={setState} />
  return <>{storageError && <p role="alert" className="vekter-theme px-7 py-3 text-sm text-destructive">{storageError}</p>}{content}</>
}

function OnboardingStep({ step, state, setState }: { step: number; state: MockState; setState: ReturnType<typeof useMockState>['setState'] }) {
  const data = deriveOnboarding(state.customer)
  switch (step) {
    case 3: return <Priorities saved={state.onboarding.priorities} onChange={(priorities) => setState((current) => current && ({ ...current, onboarding: { ...current.onboarding, priorities } }))} />
    case 4: return <ExistingInsurance sources={data.sources} />
    case 5: return <ReadingTerms policies={data.policies} />
    case 6: return <GapAnalysis gaps={data.gapAnalysis} />
    default: return <Done firstName={data.firstName} onFinish={() => {
      const next: MockState = { ...state, onboarding: { ...state.onboarding, completed: true } }
      saveMockState(next)
      setState(next)
    }} />
  }
}

function Loading({ step }: { step: number }) {
  return (
    <Screen className="gap-5 px-7 pt-8">
      {step < STEP_COUNT && <Progress step={step} />}
      <div role="status" aria-label="Laster" className="flex flex-col gap-4 pt-2">
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-card" />
        <div className="h-5 w-full animate-pulse rounded bg-card" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-card" />
      </div>
    </Screen>
  )
}

/** Sunrise backdrop for the splash and the final step (amber is a Figma-only accent, not a theme token). */
const sunrise = (amberAt: number): CSSProperties => ({
  background: `linear-gradient(180deg, var(--background) 0%, var(--secondary) ${amberAt - 30}%, #c97f1a ${amberAt}%, var(--primary) 100%)`,
})

function Screen({ className, style, fixedHeight = false, children }: { className?: string; style?: CSSProperties; fixedHeight?: boolean; children: ReactNode }) {
  return (
    <div className={cn('vekter-theme', fixedHeight ? 'h-dvh' : 'min-h-dvh')} style={style}>
      <div className="lg:min-h-dvh">
        <main className={cn('mx-auto flex w-full max-w-[430px] flex-col lg:max-w-3xl lg:px-12', fixedHeight ? 'h-dvh' : 'min-h-dvh', className)}>{children}</main>
      </div>
    </div>
  )
}

const Progress = ({ step, className }: { step: number; className?: string }) => <StepProgress value={step - 1} total={STEP_COUNT - 1} className={className} />

const fadeUp = 'animate-in fade-in slide-in-from-bottom-2 duration-300'

function StepLink({ to, variant = 'default', className, state, onClick, children }: { to: string; variant?: 'default' | 'outline'; className?: string; state?: unknown; onClick?: () => void; children: ReactNode }) {
  return <Button asChild variant={variant} className={cn('w-full text-base font-bold lg:w-auto lg:self-center lg:px-6', className)}><Link to={to} state={state} onClick={onClick}>{children}</Link></Button>
}

function Splash() {
  return (
    <Screen style={sunrise(85)}>
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-8">
        <AssistantMark className={cn('size-[170px]', fadeUp)} />
        <h1 className="font-display text-[52px] leading-none">Vekter'n</h1>
        <p className="text-xl font-medium text-primary">Vekter'n har våknet</p>
      </div>
      <div className="flex flex-col gap-6 px-7 pb-9">
        <StepLink to={stepHref(2)} className="shadow-lg">Møt Vekter'n</StepLink>
        <p className="text-center text-sm font-medium text-primary-foreground">drevet av Gjensidige</p>
      </div>
    </Screen>
  )
}

const promises = [
  { icon: Eye, title: 'Jeg ser hele bildet', text: 'Også det du har via jobb og hos andre selskaper.' },
  { icon: Bell, title: 'Jeg sier fra', text: 'Når det er hull, eller når livet endrer seg.' },
  { icon: Hand, title: 'Du bestemmer', text: 'Jeg foreslår. Ingenting skjer uten ditt ja.' },
]

function Intro() {
  return (
    <Screen className="gap-4 px-7 pt-6">
      <Progress step={2} />
      <AssistantMark className="size-[72px]" />
      <h1 className="font-display text-[40px] leading-[44px]">Hei! Jeg er Vekter'n.</h1>
      <p className="text-muted-foreground">Jeg passer på forsikringene dine, uansett hvem som leverer dem.</p>
      <ul className="flex flex-col gap-4 pt-2">
        {promises.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3.5">
            <Icon size={24} strokeWidth={1.75} className="shrink-0 text-primary" aria-hidden />
            <div className="leading-normal">
              <p className="font-bold">{title}</p>
              <p className="text-sm font-medium text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex-1" />
      <StepLink to={stepHref(3)}>Kom i gang</StepLink>
      <p className="pt-1.5 pb-5 text-center text-sm font-medium text-muted-foreground">Hvordan bruker du dataene mine?</p>
    </Screen>
  )
}

const priorityChips = ['Gammelt hus, redd for råte', 'Tre barn', 'Eget lite selskap', 'Reiser mye', 'Bil', 'Helse', 'Flytter snart']
const priorityReply = 'Takk. Da ser jeg først på bolig, familie og firmaet ditt. Neste steg er å finne ut hva du allerede har.'

function joinNorwegian(parts: string[]) {
  return parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`
}

const bubbleText = 'text-base whitespace-pre-wrap'

// Saved priorities are the selected chips (in chip order) followed by free-text entries.
function Priorities({ saved, onChange }: { saved: string[]; onChange: (priorities: string[]) => void }) {
  const [selected, setSelected] = useState(() => saved.filter((p) => priorityChips.includes(p)))
  const [freeText, setFreeText] = useState(() => saved.filter((p) => !priorityChips.includes(p)))
  const [lastSent, setLastSent] = useState(selected)
  const [sent, setSent] = useState(freeText)
  const logRef = useRef<HTMLDivElement>(null)

  // Only runs after the user sends something, so the reply is in view.
  useEffect(() => {
    if (sent.length && logRef.current) logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [sent])

  const chipsChanged = selected.length > 0 && selected.join('|') !== lastSent.join('|')

  function persist(chips: string[], texts: string[]) {
    const ordered = priorityChips.filter((c) => chips.includes(c))
    onChange([...ordered, ...texts].slice(0, MAX_PRIORITIES))
  }

  function toggle(chip: string) {
    const next = selected.includes(chip) ? selected.filter((c) => c !== chip) : [...selected, chip]
    setSelected(next)
    persist(next, freeText)
  }

  function send(text: string) {
    const chips = chipsChanged ? priorityChips.filter((c) => selected.includes(c)) : []
    const chipText = chips.length ? `${joinNorwegian(chips.map((c, i) => (i === 0 ? c : c.charAt(0).toLowerCase() + c.slice(1))))}.` : ''
    const message = [chipText, text].filter(Boolean).join(' ')
    if (!message) return
    setSent((current) => [...current, message])
    setLastSent(selected)
    const written = text.trim().slice(0, MAX_PRIORITY_LENGTH)
    if (written && !freeText.includes(written)) {
      const texts = [...freeText, written]
      setFreeText(texts)
      persist(selected, texts)
    }
  }

  return (
    <Screen fixedHeight>
      <div className="flex min-h-0 flex-1 flex-col gap-3.5 px-6 pt-8">
        <Progress step={3} />
        <AssistantIdentity status={null} />
        <div ref={logRef} role="log" aria-label="Samtale" aria-live="polite" className="-mx-6 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-6 pb-2">
          <ChatBubble role="assistant" className={bubbleText}>Fortell meg hva du er opptatt av akkurat nå. Velg så mange du vil, eller skriv selv.</ChatBubble>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Hva er viktig for deg?">
            {priorityChips.map((chip) => {
              const active = selected.includes(chip)
              return (
                <Button key={chip} type="button" size="sm" variant={active ? 'default' : 'outline'} aria-pressed={active} onClick={() => toggle(chip)} className="h-10 rounded-full px-3.5 text-sm">
                  {active && <Check aria-hidden />}
                  {chip}
                </Button>
              )
            })}
          </div>
          {sent.map((message, i) => (
            <div key={i} className="flex flex-col gap-3.5">
              <ChatBubble role="user" className={cn(bubbleText, fadeUp)}>{message}</ChatBubble>
              <ChatBubble role="assistant" className={cn(bubbleText, fadeUp)}>{priorityReply}</ChatBubble>
            </div>
          ))}
        </div>
        <StepLink to={stepHref(4)}>Fortsett</StepLink>
      </div>
      <ChatComposer onSend={send} allowEmpty={chipsChanged} placeholder="Eller skriv til meg …" className="mx-5 mt-3.5 mb-[30px]" />
    </Screen>
  )
}

const sourceIcons = { gjensidige: House, employer: Briefcase, other: CarFront }

const statusDot = 'flex size-7 shrink-0 items-center justify-center rounded-full'

function ExistingInsurance({ sources }: { sources: OnboardingData['sources'] }) {
  return (
    <Screen className="gap-2.5 px-7 pt-6">
      <Progress step={4} />
      <h1 className="font-display text-4xl leading-10">Hva har du fra før?</h1>
      <p className="text-muted-foreground">Du trenger ikke ha alt hos Gjensidige. Jeg ser på alt, uansett hvem som leverer.</p>
      <div>
        {sources.map(({ kind, title, detail }) => {
          const Icon = sourceIcons[kind]
          return (
            <InsuranceRow
              key={title}
              icon={<Icon strokeWidth={1.75} className="text-foreground" />}
              title={title}
              provider={detail}
              trailing={<span className={cn(statusDot, 'bg-primary text-primary-foreground')}><Check size={16} strokeWidth={2.4} aria-label="Funnet" /></span>}
            />
          )
        })}
        <InsuranceRow
          icon={<Plus strokeWidth={1.75} className="text-foreground" />}
          title="Et annet jeg har"
          provider="Last opp polise eller velg selskap"
          trailing={<span className={cn(statusDot, 'border border-border')}><Plus size={16} strokeWidth={2} aria-hidden /></span>}
        />
      </div>
      <AdvisorNote className="text-muted-foreground">Du samtykker til hva jeg får lese, og kan trekke det tilbake når som helst.</AdvisorNote>
      <div className="flex-1" />
      <StepLink to={stepHref(5)} state={READ_TERMS}>Fortsett</StepLink>
      <Button asChild variant="link" className="self-center pb-5 text-muted-foreground hover:text-foreground"><Link to={stepHref(5)} state={READ_TERMS}>Hopp over for nå</Link></Button>
    </Screen>
  )
}

const READ_TERMS = { readTerms: true }

// Step 5 animates reading the policies only when the user just arrived from
// step 4; back/refresh/deep links show the result. "Neste" unlocks when done.
function ReadingTerms({ policies }: { policies: OnboardingData['policies'] }) {
  const navigationType = useNavigationType()
  const location = useLocation()
  const animate = navigationType === 'PUSH' && (location.state as typeof READ_TERMS | null)?.readTerms === true
  const [done, setDone] = useState(animate ? 0 : policies.length)
  const finished = done >= policies.length

  useEffect(() => {
    if (!animate || finished) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(policies.length)
      return
    }
    const timer = setTimeout(() => setDone((d) => d + 1), TICK_MS)
    return () => clearTimeout(timer)
  }, [animate, done, finished, policies.length])

  return (
    <Screen className="items-center gap-3 px-7 pt-6 pb-5">
      <Progress step={5} className="w-full" />
      <CoverageRing value={(done / policies.length) * 100} segments={policies.length} className="size-[min(240px,27dvh)]" />
      <h1 className="text-center font-display text-[26px] leading-[30px]">{finished ? 'Jeg har lest vilkårene dine.' : 'Jeg leser vilkårene dine …'}</h1>
      <div className="w-full" aria-live="polite">
        {policies.map(({ category, provider }, i) => (
          <InsuranceRow
            key={category}
            className="min-h-0 py-2"
            icon={i < done
              ? <span className={cn('flex size-[22px] items-center justify-center rounded-full bg-primary text-primary-foreground', fadeUp)}><Check className="size-3.5!" strokeWidth={2.6} aria-label="Lest" /></span>
              : <Circle strokeWidth={1.25} strokeDasharray="3 3" aria-label="Venter" />}
            title={category}
            trailing={<Badge variant="outline">{provider}</Badge>}
          />
        ))}
      </div>
      <div className="flex-1" />
      <p className="text-center text-sm font-medium text-muted-foreground">Jeg sammenligner med skadedata for hus på din alder og din del av landet.</p>
      {finished
        ? <StepLink to={stepHref(6)}>Neste</StepLink>
        : <Button disabled className="w-full text-base font-bold lg:w-auto lg:self-center lg:px-6">Neste</Button>}
    </Screen>
  )
}

function GapAnalysis({ gaps }: { gaps: OnboardingData['gapAnalysis'] }) {
  return (
    <Screen className="gap-2.5 px-6 pt-5 pb-4">
      <Progress step={6} />
      <h1 className="font-display text-[30px] leading-8">Du er nesten riktig dekket.</h1>
      <p className="text-sm font-medium text-muted-foreground">Tre ting jeg la merke til, og hvorfor.</p>
      <ol className="flex flex-col">
        {gaps.map(({ title, reason, actionLabel }, i) => (
          <li key={title}>
            <div className="flex items-start gap-3.5 py-2.5">
              <span className="w-5 shrink-0 font-display text-[26px] leading-none text-primary">{i + 1}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="leading-snug font-bold">{title}</p>
                <p className="text-[13px] leading-[18px] font-medium text-muted-foreground">{reason}</p>
                <span className="flex items-center gap-1.5 pt-0.5 text-sm font-medium text-primary">
                  {actionLabel} <ArrowRight size={16} strokeWidth={2} aria-hidden />
                </span>
              </div>
            </div>
            <Separator className="bg-border/60" />
          </li>
        ))}
      </ol>
      <div className="flex-1" />
      <div className="flex flex-col gap-2">
        <StepLink to={stepHref(7)} className="h-12">Gå gjennom forslagene</StepLink>
        <StepLink to={stepHref(7)} variant="outline" className="h-12">Ikke nå</StepLink>
      </div>
      <p className="text-center text-[13px] font-medium text-muted-foreground">Ingenting skjer før du sier ja.</p>
    </Screen>
  )
}

function Done({ firstName, onFinish }: { firstName: string; onFinish: () => void }) {
  return (
    <Screen style={sunrise(100)}>
      <div className="flex flex-1 flex-col items-center justify-center gap-[18px] px-8 text-center">
        <AssistantMark className={cn('size-[150px]', fadeUp)} />
        <h1 className="font-display text-[40px] leading-[44px]">Alt er på plass, {firstName}.</h1>
        <p className="text-foreground/85">Fra nå passer jeg på. Jeg sier fra når livet endrer seg, og du bestemmer alltid.</p>
      </div>
      <div className="px-7 pb-11 lg:flex lg:justify-center">
        <StepLink to="/" onClick={onFinish}>Gå til oversikten</StepLink>
      </div>
    </Screen>
  )
}
