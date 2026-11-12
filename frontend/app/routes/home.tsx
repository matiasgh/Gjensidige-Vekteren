import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, BriefcaseBusiness, CarFront, Check, ChevronLeft, House, LockKeyhole, Plane, Users, X } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { AssistantMark, CoverageRing, CoverageRow, InsuranceRow } from '~/components/vekter'
import { applyMockAction, carCoverageOptions, carMonthlyPrice } from '~/lib/mock-actions'
import { optionLabels, type InsuranceCategory, type MockInsurance } from '~/lib/mock-customer'
import { saveMockState, useMockState } from '~/lib/use-mock-state'
import { createConversation } from '~/lib/mock-state'
import ChatRoom from '~/components/vekter/chat-room'
import CarDamageScreen, { type CarDamageFlow } from '~/components/vekter/car-damage-screen'

const damageFlows: Record<string, CarDamageFlow> = { '/skade/meld': 'meld', '/skade/verksted': 'verksted', '/skade/berging': 'berging' }

const money = (value: number) => value.toLocaleString('nb-NO')
const icons = { 'Hus og innbo': House, Bil: CarFront, 'Familie og barn': Users, Reise: Plane, Bedrift: BriefcaseBusiness }
const policyOrder: InsuranceCategory[] = ['Hus og innbo', 'Bil', 'Familie og barn', 'Reise', 'Bedrift']
const actionClass = 'w-full rounded-sm text-base font-bold whitespace-normal'

function CoverageList({ title, items, excluded = false }: { title: string; items: string[]; excluded?: boolean }) {
  const Icon = excluded ? X : Check
  return <section className="w-full" aria-label={title}>
    <h2 className="policy-eyebrow">{title}</h2>
    <ul className="mt-3.5">{items.map((item) => <li key={item} className="flex min-h-11 items-center gap-3 py-2.5"><Icon aria-hidden="true" className={`size-5 shrink-0 ${excluded ? 'text-destructive' : 'text-[#8ed8c0]'}`} strokeWidth={1.5} /><span>{item}</span></li>)}</ul>
  </section>
}

function PolicyNote({ children, locked = false }: { children: ReactNode; locked?: boolean }) {
  return <div className="flex w-full items-start gap-2.5 rounded-xl bg-card p-3.5 text-sm leading-5.5 text-[#d6ddee]">
    {locked ? <LockKeyhole aria-hidden="true" className="size-[18px] shrink-0 text-primary" /> : <AssistantMark className="size-7.5" />}{children}
  </div>
}

function PolicyDetails({ insurance, onSave }: { insurance: MockInsurance; onSave: (options: Record<string, boolean>) => void }) {
  const [options, setOptions] = useState({ ...insurance.optionalCoverages })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const isCar = insurance.coverageId === 'car-kasko'
  const canEditCar = isCar && insurance.provider === 'Gjensidige' && !insurance.employer
  const isWork = !!insurance.employer
  const price = isCar ? carMonthlyPrice(options) : insurance.monthlyPriceNok
  const dirty = Object.keys(options).some((key) => options[key] !== insurance.optionalCoverages?.[key])
  const question = isCar ? 'Hva bør jeg vite om bilforsikringen min og tilvalgene mine?' : isWork ? 'Hva dekker reiseforsikringen min via jobb?' : `Hva dekker ${insurance.displayName.toLowerCase()}?`
  const askUrl = `/chat?question=${encodeURIComponent(question)}`

  function save() {
    try {
      onSave(options)
      setError('')
      setNotice('Endringene er lagret i demoprofilen. Ingen reell avtale er endret.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke lagre endringene.')
    }
  }

  return <main className="policy-screen flex flex-col gap-3.5 px-6 pb-[max(30px,env(safe-area-inset-bottom))]">
    <div className="flex min-h-6 items-center justify-between">
      <Button asChild size="icon-sm" variant="ghost" className="-ml-2"><Link to="/" aria-label="Tilbake til hjem"><ChevronLeft className="size-6" /></Link></Button>
      <Badge className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${isWork ? 'bg-[var(--employer)] text-background' : insurance.provider === 'If' ? 'bg-white text-background' : ''}`}>{isWork ? `Via ${insurance.employer}` : insurance.provider}</Badge>
    </div>
    <h1 className={`font-display ${isCar ? 'text-[32px] leading-9' : 'text-4xl leading-10'}`}>{insurance.displayName}{isCar && ` · ${insurance.vehicle}`}</h1>
    {isWork ? <p className="leading-6 text-muted-foreground">Betalt av arbeidsgiver · gjelder deg, opptil {insurance.maxTripDays} dager per reise</p> : insurance.oneTimePriceNok !== undefined ? <div className="flex flex-col gap-1"><div className="flex items-end gap-2"><p className="font-display text-5xl leading-[52px] text-primary">kr {money(insurance.oneTimePriceNok)}</p><span className="text-muted-foreground">engangs</span></div><p className="leading-6 text-muted-foreground">{insurance.coverage}{insurance.insuredPeople && ` · ${insurance.insuredPeople.length} personer`}</p></div> : <div className="flex items-end gap-2"><p className="font-display text-5xl leading-[52px] text-primary">kr {money(price)}</p><span className="text-muted-foreground">/ mnd</span></div>}
    {isCar ? <>
      <p className="text-sm text-muted-foreground">Egenandel kr {money(insurance.collisionDeductibleNok ?? 0)} · Fornyes {insurance.renewalDate}</p>
      <section aria-labelledby="car-coverages" className="w-full">
        <h2 id="car-coverages" className="policy-eyebrow mb-3.5">Dekninger</h2>
        <CoverageRow title="Ansvar" description="Påkrevd ved lov" checked disabled className="policy-switch policy-switch-required" />
        {carCoverageOptions.map(({ option, title, price: optionPrice }) => <CoverageRow key={option} title={title} description={`kr ${optionPrice} / mnd`} checked={options[option]} disabled={!canEditCar} className="policy-switch" onCheckedChange={(enabled) => {
          setOptions((current) => ({ ...current, [option]: enabled, ...(option === 'partial' && !enabled ? { collision: false } : {}), ...(option === 'collision' && enabled ? { partial: true } : {}) }))
          setNotice('')
        }} />)}
      </section>
      {canEditCar ? <PolicyNote>Veihjelp har du ikke brukt på 3 år, men den er billig. Leiebil trenger du kanskje ikke.</PolicyNote> : <PolicyNote locked>Bilforsikringen er hos {insurance.provider}. Kontakt selskapet for å endre dekningene.</PolicyNote>}
    </> : <>
      {(insurance.coverageSummary?.includes ?? insurance.includes) && <CoverageList title="Dekker" items={insurance.coverageSummary?.includes ?? insurance.includes!} />}
      {(insurance.coverageSummary?.excludes ?? insurance.excludes) && <CoverageList title="Dekker ikke" items={insurance.coverageSummary?.excludes ?? insurance.excludes!} excluded />}
      {insurance.optionalCoverages && <section className="w-full" aria-label="Lagrede tilvalg"><h2 className="policy-eyebrow">Tilvalg i demoprofilen</h2>{Object.entries(insurance.optionalCoverages).map(([option, enabled]) => <p key={option} className="mt-3 text-sm">{optionLabels[option] ?? option}: {enabled ? 'Valgt' : 'Ikke valgt'}</p>)}</section>}
      {isWork && <PolicyNote locked>Dekningene kan ikke endres her. Avtalen styres av arbeidsgiveren din.</PolicyNote>}
      {insurance.note && insurance.oneTimePriceNok !== undefined && <PolicyNote>{insurance.note}</PolicyNote>}
      {!isWork && <PolicyNote>Dette er en forenklet oversikt over en fiktiv demoavtale. Spør meg om du vil vite mer om dekningene.</PolicyNote>}
    </>}
    <div className="min-h-4 flex-1" />
    {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {dirty && <p className="text-xs text-muted-foreground">Du har ulagrede endringer. Chatten bruker den sist lagrede demoprofilen.</p>}
    {canEditCar && <Button onClick={save} className={actionClass}>Lagre endringer</Button>}
    <Button asChild variant={isCar ? 'outline' : 'default'} className={`${actionClass} ${isCar ? 'border-[#7f8bc0] bg-transparent' : ''}`}><Link to={askUrl}>Spør Vekter’n om {isCar ? 'bilforsikringen' : isWork ? 'reisen' : 'forsikringen'}</Link></Button>
    {isWork && <Button asChild variant="outline" className={`${actionClass} border-[#7f8bc0] bg-transparent`}><Link to={`/chat?question=${encodeURIComponent('Hvilken ekstra reiseforsikring kan jeg vurdere for familien, siden jobbens avtale bare dekker meg?')}`}>Se ekstra dekning for familien</Link></Button>}
  </main>
}

export default function Home() {
  const store = useMockState()
  const { state, setState, storageError } = store
  const location = useLocation()
  const damageFlow = damageFlows[location.pathname]
  // Follow-up screens of the car damage flow live in the chat column.
  const isChat = location.pathname === '/chat' || !!damageFlow
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [chatError, setChatError] = useState('')
  // A policy just added in the chat ("Se oversikten"), highlighted in the overview.
  const [highlight, setHighlight] = useState<string | null>(null)
  const highlighted = highlight ?? params.get('markert')
  const customer = state?.customer
  const insurance = customer?.insurances.find((item) => item.coverageId === params.get('insurance'))
  const total = customer?.insurances.reduce((sum, item) => sum + item.monthlyPriceNok, 0) ?? 0
  const firstName = customer?.name.split(' ')[0]
  const initials = customer?.name.split(' ').map((part) => part[0]).slice(0, 2).join('')

  useEffect(() => {
    if (highlighted && customer) document.getElementById(`policy-${highlighted}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [highlighted, !!customer])

  // Desktop keeps the overview column next to the chat; mobile navigates to it.
  function openOverview(coverageId?: string) {
    if (window.matchMedia('(min-width: 1024px)').matches) setHighlight(coverageId ?? null)
    else navigate(coverageId ? `/?markert=${encodeURIComponent(coverageId)}` : '/')
  }

  if (params.has('steg')) return <Navigate to={`/onboarding?steg=${encodeURIComponent(params.get('steg') ?? '1')}`} replace />
  if (state && !state.onboarding.completed) return <Navigate to="/onboarding" replace />

  function saveCar(options: Record<string, boolean>) {
    if (!state || !insurance) return
    const updated = Object.entries(options).reduce((current, [option, enabled]) => applyMockAction(current, { type: 'set-coverage-option', coverageId: insurance.coverageId, option, enabled }), state.customer)
    setState({ ...state, customer: updated })
  }

  function startChat() {
    if (!state) return
    const conversation = createConversation()
    const next = { ...state, conversations: [...state.conversations, conversation], activeConversationId: conversation.id }
    // Persist before navigating: switching routes can remount the state owner.
    if (!saveMockState(next)) {
      setChatError('Kunne ikke lagre den nye samtalen. Prøv igjen.')
      return
    }
    setChatError('')
    setState(next)
    const query = new URLSearchParams({ conversation: conversation.id })
    if (message.trim()) query.set('question', message.trim())
    setMessage('')
    navigate(`/chat?${query}`)
  }

  return <div className="vekter-theme min-h-dvh lg:flex lg:h-dvh lg:overflow-hidden">
    <aside aria-label="Forsikringsoversikt" className={`${insurance || isChat ? 'hidden' : 'flex'} mx-auto min-h-dvh w-full max-w-[393px] flex-col pt-[max(48px,env(safe-area-inset-top))] lg:mx-0 lg:flex lg:h-dvh lg:min-h-0 lg:w-[393px] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-border`}>
      {storageError && <p role="alert" className="px-6 pb-3 text-sm text-destructive">{storageError}</p>}
      {!customer ? <p role="status" className="px-6">Laster forsikringene dine …</p> : <>
        {params.has('insurance') && !insurance && <p role="alert" className="px-6 pb-3 text-sm text-destructive">Forsikringen finnes ikke i demoprofilen.</p>}
        <div className="flex flex-1 flex-col items-center gap-3 px-6">
          <header className="flex w-full items-center justify-between">
            <h1 className="font-display text-lg leading-[1.3]">God morgen, {firstName}</h1>
            <Dialog><DialogTrigger asChild><Button size="icon" variant="secondary" className="size-9 rounded-full bg-card text-sm" aria-label="Åpne demoprofil">{initials}</Button></DialogTrigger>
              <DialogContent className="vekter-theme"><DialogHeader><DialogTitle>{customer.name}</DialogTitle><DialogDescription>Fiktiv kundeprofil · Vekter’n prototype</DialogDescription></DialogHeader>
                <p className="text-sm leading-6">Alle priser, avtalevalg og opplysninger i oversikten er demodata. Endringer lagres bare i denne nettleseren, aldri i reelle forsikringsavtaler.</p>
                <p className="text-sm leading-6 text-muted-foreground">«100 % dekket» er en illustrasjon fra prototypen, ikke en vurdering av forsikringsbehovet ditt.</p>
                <Button asChild><Link to="/chat">Åpne samtalerommet</Link></Button><Link to="/onboarding?steg=2" className="text-sm text-muted-foreground underline">Se introduksjonen på nytt</Link><Link to="/chat" className="text-sm text-muted-foreground underline">Administrer samtaler og tilbakestill demodata i Om Vekter’n</Link><Link to="/components" className="text-sm text-muted-foreground underline">Komponentbibliotek</Link>
              </DialogContent>
            </Dialog>
          </header>
          <CoverageRing value={100} />
          <p className="font-display text-[32px] leading-[39px]">100 % dekket</p>
          <p className="text-center text-sm leading-[21px] text-muted-foreground">{policyOrder.filter((category) => customer.insurances.some((item) => item.category === category)).length} forsikringsområder fra {new Set(customer.insurances.map((item) => item.provider)).size} kilder · kr {money(total)} / mnd</p>
          <nav aria-label="Forsikringene dine" className="w-full">
            {policyOrder.map((category) => {
              const policies = customer.insurances.filter((item) => item.category === category)
              if (!policies.length) return null
              const item = policies[0]
              const Icon = icons[category]
              return <div key={category}><InsuranceRow icon={<Icon strokeWidth={1.5} />} title={category} provider={item.employer ? 'Via jobb' : item.provider} price={item.employer ? undefined : `kr ${money(policies.reduce((sum, policy) => sum + policy.monthlyPriceNok, 0))}`} onClick={() => navigate(`/?insurance=${encodeURIComponent(item.coverageId)}`)} />{policies.length > 1 && <div className="flex flex-wrap gap-4 py-2 pl-9">{policies.map((policy) => <Link key={policy.coverageId} id={`policy-${policy.coverageId}`} to={`/?insurance=${encodeURIComponent(policy.coverageId)}`} className={`text-sm underline underline-offset-4 ${policy.coverageId === highlighted ? 'rounded-sm font-bold text-primary ring-2 ring-primary ring-offset-4 ring-offset-background' : 'text-muted-foreground'}`}>{policy.displayName}{policy.coverageId === highlighted && <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[11px] text-primary-foreground no-underline">Ny</span>}</Link>)}</div>}</div>
            })}
          </nav>
        </div>
        <footer className="px-5 pt-3.5 pb-[max(30px,env(safe-area-inset-bottom))]">
          {chatError && <p role="alert" className="mb-3 text-sm text-destructive">{chatError}</p>}
          <form aria-label="Spør Vekter’n" className="flex items-center gap-2 rounded-full border border-input bg-card p-1.5 pl-5" onSubmit={(event) => { event.preventDefault(); startChat() }}>
            <input aria-label="Melding til Vekter’n" placeholder="Skriv til Vekter’n …" value={message} onChange={(event) => setMessage(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted-foreground" />
            <Button type="submit" size="icon-lg" className="rounded-full" disabled={!state} aria-label={message.trim() ? 'Start ny samtale og send melding' : 'Start ny samtale'}><ArrowRight className="size-6" /></Button>
          </form>
        </footer>
      </>}
    </aside>
    <div className={`${insurance || isChat ? 'block' : 'hidden'} min-w-0 flex-1 lg:block lg:h-dvh lg:overflow-y-auto`}>
      {insurance ? <div className="mx-auto w-full max-w-[441px] pt-[max(48px,env(safe-area-inset-top))] lg:max-w-none lg:px-8"><PolicyDetails key={insurance.coverageId} insurance={insurance} onSave={saveCar} /></div> : damageFlow ? <CarDamageScreen key={location.pathname} flow={damageFlow} state={state} setState={setState} /> : <ChatRoom key={`${location.pathname}${location.search}`} {...store} onOpenOverview={openOverview} />}
    </div>
  </div>
}
