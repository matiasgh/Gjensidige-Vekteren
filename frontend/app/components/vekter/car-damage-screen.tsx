import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '~/components/ui/button'
import { AdvisorNote, ApprovedBadge, DetailRow, FlowScreen, StaticMap, StatusCheck } from '~/components/vekter'
import { bookingConfirmation, carCoverage, carDamageTexts, claimConfirmation, createCaseNumber, defaultClaimDetails, latestDamagePhoto, money, towOrder, withAssistantMessages, workshops, type CarCoverage, type CarDamageKind } from '~/lib/car-damage'
import type { MockState } from '~/lib/mock-state'
import { saveMockState, type useMockState } from '~/lib/use-mock-state'
import { cn } from '~/lib/utils'

export type CarDamageFlow = 'meld' | 'verksted' | 'berging'
type Finish = (content: string, kind?: CarDamageKind) => void
type ScreenProps = { coverage: CarCoverage | null; finish: Finish; error: string }

const actionClass = 'h-[52px] w-full rounded-sm text-base font-bold! whitespace-normal lg:w-auto lg:self-center lg:px-6'
const outlineClass = `${actionClass} border-[#7f8bc0] bg-transparent`

function ErrorText({ error }: { error: string }) {
  return error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null
}

function ClaimScreen({ coverage, finish, error, photo }: ScreenProps & { photo?: string }) {
  const [details, setDetails] = useState(defaultClaimDetails)
  return <FlowScreen title="Skademelding" actions={<>
    <ErrorText error={error} />
    <Button className={actionClass} onClick={() => finish(claimConfirmation(details, coverage, createCaseNumber()))}>Send skademelding</Button>
    <Button asChild variant="outline" className={outlineClass}><Link to="/chat">Avbryt</Link></Button>
  </>}>
    <AdvisorNote>Jeg har fylt ut det jeg kunne fra bildet og kontoen din. Sjekk og godkjenn.</AdvisorNote>
    <dl className="mt-3">
      <DetailRow label="Skade" value={details.damage} onSave={(damage) => setDetails({ ...details, damage })} />
      <DetailRow label="Når" value={details.when} onSave={(when) => setDetails({ ...details, when })} />
      <DetailRow label="Hvor" value={details.where} onSave={(where) => setDetails({ ...details, where })} />
      <DetailRow label="Bil" value={coverage ? [coverage.vehicle, coverage.registrationNumber].filter(Boolean).join(' · ') : 'Ingen bil i profilen'} />
      <DetailRow label="Dekning" value={coverage?.kasko ? 'Kasko' : 'Ikke dekket – du har ikke kasko'} />
      <DetailRow label="Egenandel" value={coverage?.kasko ? money(coverage.deductibleNok) : 'Ingen dekning, du betaler selv'} />
    </dl>
    {photo && <div className="mt-4 flex items-center gap-3"><img src={photo} alt="Vedlagt bilde av skaden" className="h-16 w-24 rounded-lg object-cover" /><span className="text-sm">1 bilde vedlagt</span></div>}
  </FlowScreen>
}

function WorkshopScreen({ coverage, finish, error }: ScreenProps) {
  const [selectedId, setSelectedId] = useState(workshops[0].id)
  const selected = workshops.find(({ id }) => id === selectedId) ?? workshops[0]
  return <FlowScreen title="Verksted nær deg" actions={<>
    <ErrorText error={error} />
    <Button className={actionClass} onClick={() => finish(bookingConfirmation(selected, coverage))}>Book {selected.day} kl. {selected.time}</Button>
    <p className="text-center text-sm leading-5 text-muted-foreground">Jeg viser bare verksteder som er godkjent og har ledig tid.</p>
  </>}>
    <StaticMap pins={[{ x: 50, y: 50, kind: 'you' }, { x: 25, y: 34 }, { x: 75, y: 40 }, { x: 62, y: 78 }]} />
    {!coverage?.kasko && <AdvisorNote className="mt-4">Du har ikke kasko, så prisene er det du betaler selv.</AdvisorNote>}
    <fieldset className="mt-2">
      <legend className="sr-only">Velg verksted</legend>
      {workshops.map((workshop) => <label key={workshop.id} className={cn('block cursor-pointer border-b-2 py-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring', workshop.id === selectedId ? 'border-primary' : 'border-border')}>
        <input type="radio" name="workshop" value={workshop.id} checked={workshop.id === selectedId} onChange={() => setSelectedId(workshop.id)} className="sr-only" />
        <span className="flex items-baseline justify-between gap-3"><span className="font-bold">{workshop.name}</span><span className="text-sm text-muted-foreground">{workshop.distance}</span></span>
        <span className="mt-1 block text-sm">Ledig {workshop.day} {workshop.time} · est. {workshop.estimate}</span>
        <span className="mt-1.5 block"><ApprovedBadge /></span>
      </label>)}
    </fieldset>
  </FlowScreen>
}

function TowScreen({ coverage, finish, error }: ScreenProps) {
  return <FlowScreen title="Bilbergning" actions={<>
    <ErrorText error={error} />
    <Button className={actionClass} onClick={() => finish(carDamageTexts.towCalled)}>Ring bergeren</Button>
    <Button variant="outline" className={outlineClass} onClick={() => finish(carDamageTexts.towCancelled)}>Avbryt bestilling</Button>
  </>}>
    <StaticMap className="h-40" pins={[{ x: 80, y: 30, kind: 'you' }, { x: 20, y: 72 }]} />
    <h2 className="mt-6 font-display text-[32px] leading-10">Bergingsbil er på vei</h2>
    <p className="mt-2 text-primary">Ankommer om ca. {towOrder.etaMinutes} minutter</p>
    <ul className="mt-4">
      <StatusCheck done>Posisjonen din er delt</StatusCheck>
      <StatusCheck done>Bergeren er varslet</StatusCheck>
      <StatusCheck done={false}>{towOrder.driver} ringer deg før han kommer</StatusCheck>
    </ul>
    <p className="mt-4 text-sm">{coverage?.roadside ? 'Dekket av veihjelp. Ingen egenandel.' : 'Ikke dekket av veihjelp.'}</p>
  </FlowScreen>
}

export default function CarDamageScreen({ flow, state, setState }: { flow: CarDamageFlow } & Pick<ReturnType<typeof useMockState>, 'state' | 'setState'>) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  if (!state) return <p role="status" className="p-6">Laster …</p>
  const loaded: MockState = state
  const coverage = carCoverage(state.customer)

  // Persist before navigating: /chat is a different route module and remounts the state owner.
  const finish: Finish = (content, kind = 'damage-confirmation') => {
    const next = withAssistantMessages(loaded, [{ content, kind }])
    if (!saveMockState(next)) {
      setError('Kunne ikke lagre i samtalen. Prøv igjen.')
      return
    }
    setState(next)
    navigate('/chat')
  }

  if (flow === 'meld') {
    const messages = state.conversations.find(({ id }) => id === state.activeConversationId)?.messages ?? []
    return <ClaimScreen coverage={coverage} finish={finish} error={error} photo={latestDamagePhoto(messages)} />
  }
  if (flow === 'verksted') return <WorkshopScreen coverage={coverage} finish={finish} error={error} />
  return <TowScreen coverage={coverage} finish={finish} error={error} />
}
