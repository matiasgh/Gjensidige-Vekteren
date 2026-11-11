import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, Bell, Briefcase, CarFront, Check, Eye, Hand, House, Lock, Plus } from 'lucide-react'
import type { Route } from './+types/onboarding'
import { mockCustomer } from '../lib/mock-customer.server'
import { VekternMark } from '../components/vektern-mark'
import { SendButton } from '../components/send-button'

const STEP_COUNT = 7
const SPLASH_MS = 2000
const TICK_MS = 600

type SourceKind = 'gjensidige' | 'employer' | 'other'
const sourceOrder: SourceKind[] = ['gjensidige', 'employer', 'other']

export const meta: Route.MetaFunction = () => [{ title: "Kom i gang – Vekter'n" }]

export function loader() {
  const { firstName, employment, insurances, gapAnalysis } = mockCustomer
  const kindOf = (provider: string): SourceKind =>
    provider === 'Gjensidige' ? 'gjensidige' : provider.startsWith('Via jobb') ? 'employer' : 'other'

  // Policies are counted per category, matching the grouped list in step 5 (house + contents = one).
  const categoriesOf = (list: typeof insurances) => [...new Set(list.map((i) => i.category))]
  const groups = new Map<string, typeof insurances>()
  for (const insurance of insurances) groups.set(insurance.provider, [...(groups.get(insurance.provider) ?? []), insurance])

  const sources = [...groups.entries()]
    .map(([provider, list]) => {
      const kind = kindOf(provider)
      const types = [...new Set(list.map((i) => i.type.toLowerCase()))].join(', ')
      const count = categoriesOf(list).length
      if (kind === 'gjensidige') return { kind, title: 'Gjensidige', detail: `${count} ${count === 1 ? 'forsikring' : 'forsikringer'} funnet` }
      if (kind === 'employer') return { kind, title: 'Via jobben', detail: `${employment.employer} · ${types}` }
      return { kind, title: 'Annet selskap', detail: `${provider}: ${types} funnet` }
    })
    .sort((a, b) => sourceOrder.indexOf(a.kind) - sourceOrder.indexOf(b.kind))

  const policies = categoriesOf(insurances).map((category) => {
    const provider = insurances.find((i) => i.category === category)!.provider
    return { category, provider: provider.startsWith('Via jobb') ? 'Via jobb' : provider }
  })

  return { firstName, sources, policies, gapAnalysis }
}

type LoaderData = Route.ComponentProps['loaderData']

const stepHref = (step: number) => `/?steg=${step}`

function parseStep(value: string | null) {
  const step = Number.parseInt(value ?? '', 10)
  return Number.isNaN(step) ? 1 : Math.min(Math.max(step, 1), STEP_COUNT)
}

export default function Onboarding({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const step = parseStep(searchParams.get('steg'))

  switch (step) {
    case 1: return <Splash />
    case 2: return <Intro />
    case 3: return <Priorities />
    case 4: return <ExistingInsurance sources={loaderData.sources} />
    case 5: return <ReadingTerms policies={loaderData.policies} />
    case 6: return <GapAnalysis gaps={loaderData.gapAnalysis} />
    default: return <Done firstName={loaderData.firstName} />
  }
}

const navyGradient = 'bg-gradient-to-b from-navy to-navy-900'

function Screen({ background = navyGradient, className = '', children }: { background?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`min-h-dvh text-white ${background}`}>
      <div className={`mx-auto flex min-h-dvh w-full max-w-[430px] flex-col ${className}`}>{children}</div>
    </div>
  )
}

function Progress({ step }: { step: number }) {
  const filled = step - 1
  return (
    <div className="flex w-full gap-1.5" role="progressbar" aria-label="Fremdrift" aria-valuemin={1} aria-valuemax={STEP_COUNT - 1} aria-valuenow={filled}>
      {Array.from({ length: STEP_COUNT - 1 }, (_, i) => (
        <span key={i} className={`h-1 flex-1 rounded-[2px] transition-colors duration-500 ${i < filled ? 'bg-sun' : 'bg-navy-600'}`} />
      ))}
    </div>
  )
}

const primaryButton = 'flex h-[52px] w-full shrink-0 items-center justify-center rounded-[4px] bg-sun font-bold text-navy transition hover:brightness-105 active:brightness-95'
const secondaryButton = 'flex h-[52px] w-full shrink-0 items-center justify-center rounded-[4px] border border-lavender font-bold text-white transition hover:bg-white/5'

function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate(stepHref(2), { replace: true }), SPLASH_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Screen background="bg-[linear-gradient(180deg,#090c33_0%,#2b3475_55%,#c97f1a_85%,#f7c948_100%)]">
      <Link to={stepHref(2)} replace aria-label="Gå videre" className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-8">
          <VekternMark size={170} className="animate-rise-in" />
          <h1 className="font-display text-[52px] leading-none font-medium">Vekter'n</h1>
          <p className="text-xl font-medium text-sun">Vekter'n har våknet</p>
        </div>
        <p className="py-9 text-center text-sm font-medium text-navy">drevet av Gjensidige</p>
      </Link>
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
    <Screen className="gap-5 px-7 pt-8">
      <Progress step={2} />
      <VekternMark size={72} />
      <h1 className="font-display text-[40px] leading-[44px] font-medium">Hei! Jeg er Vekter'n.</h1>
      <p className="text-mist">Jeg passer på forsikringene dine, uansett hvem som leverer dem.</p>
      <ul className="flex flex-col gap-4 pt-2">
        {promises.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3.5">
            <Icon size={24} strokeWidth={1.75} className="shrink-0 text-sun" aria-hidden />
            <div className="leading-normal">
              <p className="font-bold">{title}</p>
              <p className="text-sm font-medium text-mist">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex-1" />
      <Link to={stepHref(3)} className={primaryButton}>Kom i gang</Link>
      <p className="pt-1.5 pb-5 text-center text-sm font-medium text-mist">Hvordan bruker du dataene mine?</p>
    </Screen>
  )
}

const priorityChips = ['Gammelt hus, redd for råte', 'Tre barn', 'Eget lite selskap', 'Reiser mye', 'Bil', 'Helse', 'Flytter snart']
const priorityReply = 'Takk. Da ser jeg først på bolig, familie og firmaet ditt. Neste steg er å finne ut hva du allerede har.'

function joinNorwegian(parts: string[]) {
  return parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`
}

function Bubble({ from, children }: { from: 'user' | 'vektern'; children: ReactNode }) {
  return from === 'user' ? (
    <div className="flex justify-end">
      <p className="animate-rise-in max-w-[82%] rounded-[20px] rounded-br-[4px] bg-sun p-3.5 whitespace-pre-wrap text-navy">{children}</p>
    </div>
  ) : (
    <div className="animate-rise-in max-w-[92%] rounded-[20px] rounded-tl-[4px] bg-navy-800 p-4 whitespace-pre-wrap">{children}</div>
  )
}

function Priorities() {
  const [selected, setSelected] = useState<string[]>([])
  const [lastSent, setLastSent] = useState<string[]>([])
  const [text, setText] = useState('')
  const [sent, setSent] = useState<string[]>([])

  const chipsChanged = selected.join('|') !== lastSent.join('|')
  const canSend = text.trim() !== '' || (selected.length > 0 && chipsChanged)

  function toggle(chip: string) {
    setSelected((current) => (current.includes(chip) ? current.filter((c) => c !== chip) : [...current, chip]))
  }

  function send(event: FormEvent) {
    event.preventDefault()
    if (!canSend) return
    const chips = chipsChanged ? priorityChips.filter((c) => selected.includes(c)) : []
    const chipText = chips.length ? `${joinNorwegian(chips.map((c, i) => (i === 0 ? c : c.charAt(0).toLowerCase() + c.slice(1))))}.` : ''
    setSent((current) => [...current, [chipText, text.trim()].filter(Boolean).join(' ')])
    setLastSent(selected)
    setText('')
  }

  return (
    <div className={`h-dvh text-white ${navyGradient}`}>
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-3.5 px-6 pt-8">
          <Progress step={3} />
          <div className="flex items-center gap-2.5">
            <VekternMark size={40} />
            <p className="font-display text-lg leading-[1.3] font-medium">Vekter'n</p>
          </div>
          <div className="-mx-6 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-6 pb-2">
            <Bubble from="vektern">Fortell meg hva du er opptatt av akkurat nå. Velg så mange du vil, eller skriv selv.</Bubble>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Hva er viktig for deg?">
              {priorityChips.map((chip) => {
                const active = selected.includes(chip)
                return (
                  <button
                    key={chip}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(chip)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-medium transition ${active ? 'bg-sun text-navy' : 'border border-lavender text-white hover:bg-white/5'}`}
                  >
                    {active && <Check size={16} strokeWidth={2.2} aria-hidden />}
                    {chip}
                  </button>
                )
              })}
            </div>
            {sent.map((message, i) => (
              <div key={i} className="flex flex-col gap-3.5">
                <Bubble from="user">{message}</Bubble>
                <Bubble from="vektern">{priorityReply}</Bubble>
              </div>
            ))}
          </div>
          <Link to={stepHref(4)} className={primaryButton}>Fortsett</Link>
        </div>
        <form onSubmit={send} className="px-5 pt-3.5 pb-[30px]">
          <div className="flex items-center gap-2 rounded-full border border-navy-600 bg-navy-800 py-1.5 pr-1.5 pl-5 focus-within:border-sun">
            <label htmlFor="priority-text" className="sr-only">Skriv til Vekter'n</label>
            <input
              id="priority-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Eller skriv til meg …"
              autoComplete="off"
              className="pill-input min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-mist"
            />
            <SendButton disabled={!canSend} />
          </div>
        </form>
      </div>
    </div>
  )
}

const sourceIcons = { gjensidige: House, employer: Briefcase, other: CarFront }

function ExistingInsurance({ sources }: { sources: LoaderData['sources'] }) {
  return (
    <Screen className="gap-[18px] px-7 pt-8">
      <Progress step={4} />
      <h1 className="font-display text-4xl leading-10 font-medium">Hva har du fra før?</h1>
      <p className="text-mist">Du trenger ikke ha alt hos Gjensidige. Jeg ser på alt, uansett hvem som leverer.</p>
      <ul className="flex flex-col">
        {sources.map(({ kind, title, detail }) => {
          const Icon = sourceIcons[kind]
          return (
            <li key={title} className="flex items-center gap-3.5 border-b border-navy-700 py-4">
              <Icon size={22} strokeWidth={1.75} className="shrink-0" aria-hidden />
              <div className="min-w-0 flex-1 leading-normal">
                <p className="font-bold">{title}</p>
                <p className="text-sm font-medium text-mist">{detail}</p>
              </div>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sun text-navy">
                <Check size={16} strokeWidth={2.4} aria-label="Funnet" />
              </span>
            </li>
          )
        })}
        <li className="flex items-center gap-3.5 border-b border-navy-700 py-4">
          <Plus size={22} strokeWidth={1.75} className="shrink-0" aria-hidden />
          <div className="min-w-0 flex-1 leading-normal">
            <p className="font-bold">Et annet jeg har</p>
            <p className="text-sm font-medium text-mist">Last opp polise eller velg selskap</p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-lavender">
            <Plus size={16} strokeWidth={2} aria-hidden />
          </span>
        </li>
      </ul>
      <div className="flex gap-2.5 rounded-xl bg-navy-800 p-3.5">
        <Lock size={20} strokeWidth={1.75} className="shrink-0 text-sun" aria-hidden />
        <p className="text-sm font-medium text-mist-light">Du samtykker til hva jeg får lese, og kan trekke det tilbake når som helst.</p>
      </div>
      <div className="flex-1" />
      <Link to={stepHref(5)} className={primaryButton}>Fortsett</Link>
      <Link to={stepHref(5)} className="self-center pb-5 text-sm font-medium text-mist hover:text-white">Hopp over for nå</Link>
    </Screen>
  )
}

function polar(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return `${(120 + radius * Math.cos(rad)).toFixed(2)} ${(120 + radius * Math.sin(rad)).toFixed(2)}`
}

function ProgressRing({ segments, done }: { segments: number; done: number }) {
  const span = 360 / segments
  const gap = 12
  return (
    <div className="relative size-60 shrink-0">
      <svg viewBox="0 0 240 240" className="absolute inset-0 size-full" aria-hidden>
        {Array.from({ length: segments }, (_, i) => {
          const start = i * span + gap / 2
          const end = (i + 1) * span - gap / 2
          return (
            <path
              key={i}
              d={`M ${polar(start, 100)} A 100 100 0 0 1 ${polar(end, 100)}`}
              fill="none"
              strokeWidth={16}
              strokeLinecap="round"
              className={`transition-[stroke] duration-500 ${i < done ? 'stroke-sun' : 'stroke-navy-600'}`}
            />
          )
        })}
      </svg>
      <VekternMark size={140} className="absolute top-[50px] left-[50px]" />
    </div>
  )
}

function ReadingTerms({ policies }: { policies: LoaderData['policies'] }) {
  const navigate = useNavigate()
  const [done, setDone] = useState(0)

  useEffect(() => {
    if (done >= policies.length) {
      const timer = setTimeout(() => navigate(stepHref(6), { replace: true }), TICK_MS + 300)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setDone((d) => d + 1), TICK_MS)
    return () => clearTimeout(timer)
  }, [done, policies.length, navigate])

  return (
    <Screen className="items-center gap-[18px] px-7 pt-8 pb-[34px]">
      <Progress step={5} />
      <ProgressRing segments={policies.length} done={done} />
      <h1 className="text-center font-display text-[30px] font-medium">Jeg leser vilkårene dine …</h1>
      <ul className="flex w-full flex-col" aria-live="polite">
        {policies.map(({ category, provider }, i) => (
          <li key={category} className="flex items-center gap-3 border-b border-navy-700 py-2.5">
            {i < done ? (
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-sun text-navy animate-rise-in">
                <Check size={14} strokeWidth={2.6} aria-label="Lest" />
              </span>
            ) : (
              <span className="size-[22px] shrink-0 rounded-full border border-dashed border-lavender" aria-label="Venter" />
            )}
            <span className="flex-1">{category}</span>
            <span className="text-sm font-medium text-mist">{provider}</span>
          </li>
        ))}
      </ul>
      <div className="flex-1" />
      <p className="text-center text-sm font-medium text-mist">Jeg sammenligner med skadedata for hus på din alder og din del av landet.</p>
    </Screen>
  )
}

function GapAnalysis({ gaps }: { gaps: LoaderData['gapAnalysis'] }) {
  return (
    <Screen className="gap-4 px-7 pt-8 pb-[30px]">
      <Progress step={6} />
      <h1 className="font-display text-4xl leading-10 font-medium">Du er nesten riktig dekket.</h1>
      <p className="text-mist">Tre ting jeg la merke til, og hvorfor.</p>
      <ol className="flex flex-col">
        {gaps.map(({ title, reason, actionLabel }, i) => (
          <li key={title} className="flex items-start gap-4 border-b border-navy-700 py-4">
            <span className="w-5 shrink-0 font-display text-[30px] leading-none font-medium text-sun">{i + 1}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 leading-normal">
              <p className="font-bold">{title}</p>
              <p className="text-sm font-medium text-mist">{reason}</p>
              <span className="flex items-center gap-1.5 pt-1 text-sm font-medium text-sun">
                {actionLabel} <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </span>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex-1" />
      <Link to={stepHref(7)} className={primaryButton}>Gå gjennom forslagene</Link>
      <Link to={stepHref(7)} className={secondaryButton}>Ikke nå</Link>
      <p className="text-center text-sm font-medium text-mist">Ingenting skjer før du sier ja.</p>
    </Screen>
  )
}

function Done({ firstName }: { firstName: string }) {
  return (
    <Screen background="bg-[linear-gradient(180deg,#090c33_0%,#2b3475_65%,#c97f1a_100%)]">
      <div className="flex flex-1 flex-col items-center justify-center gap-[18px] px-8 text-center">
        <VekternMark size={150} className="animate-rise-in" />
        <h1 className="font-display text-[40px] leading-[44px] font-medium">Alt er på plass, {firstName}.</h1>
        <p className="text-mist-light">Fra nå passer jeg på. Jeg sier fra når livet endrer seg, og du bestemmer alltid.</p>
      </div>
      <div className="px-7 pb-11">
        <Link to="/chat" className={primaryButton}>Gå til oversikten</Link>
      </div>
    </Screen>
  )
}
