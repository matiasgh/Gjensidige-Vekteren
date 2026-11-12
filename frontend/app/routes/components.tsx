import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, CarFront, Check, Heart, House, Plane, ShieldCheck, Users } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { ActionStack, AdvisorNote, ApprovedBadge, ApproveOfferSheet, AssistantIdentity, AttachSheet, ChatBubble, ChatComposer, ChatImageBubble, CoverageCheck, CoverageRing, CoverageRow, DetailRow, InsuranceRow, OfferCard, QuickReplies, ReceiptCard, StaticMap, StatusCheck, StepProgress, TipCard } from '~/components/vekter'
import { EXAMPLE_DAMAGE_IMAGE } from '~/lib/image'
import { insuranceOffers } from '~/lib/travel-offer'

export const meta = () => [{ title: 'Komponentbibliotek · Vekter’n' }]

function Specimen({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <Card className="min-w-0 border-border/60 bg-background/50 shadow-none"><CardHeader><CardTitle className="font-display text-xl">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-4">{children}</CardContent></Card>
}

function InsuranceExample() {
  const [coverages, setCoverages] = useState({ delkasko: true, kasko: true, veihjelp: true, leiebil: false })
  const [saved, setSaved] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const price = 65 + (coverages.delkasko ? 70 : 0) + (coverages.kasko ? 120 : 0) + (coverages.veihjelp ? 35 : 0) + (coverages.leiebil ? 45 : 0)
  return <div className="mx-auto w-full max-w-[393px] rounded-2xl border border-border/60 bg-background/30 p-6">
    <div className="mb-4 flex justify-between"><span className="text-sm text-muted-foreground">Eksempel · bilforsikring</span><Badge>Gjensidige</Badge></div>
    <h2 className="font-display text-3xl">Bil · Volvo XC60</h2><p className="mt-3 text-5xl font-bold text-primary">kr {price} <span className="text-sm font-normal text-muted-foreground">/ mnd</span></p>
    <p className="mt-5 text-sm text-muted-foreground">Egenandel kr 6 000 · Fornyes 1. mars</p><p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Dekninger</p>
    <CoverageRow title="Ansvar" description="Påkrevd" checked disabled />
    {(['delkasko', 'kasko', 'veihjelp', 'leiebil'] as const).map((key) => <CoverageRow key={key} title={key[0].toUpperCase() + key.slice(1)} description={`kr ${{ delkasko: 70, kasko: 120, veihjelp: 35, leiebil: 45 }[key]} / mnd`} checked={coverages[key]} onCheckedChange={(checked) => { setCoverages({ ...coverages, [key]: checked }); setSaved(false) }} />)}
    <AdvisorNote className="mt-4">Veihjelp har du ikke brukt på 3 år, men den er billig. Leiebil trenger du kanskje ikke.</AdvisorNote>
    <ActionStack className="mt-8" primary={<Button onClick={() => setConfirmOpen(true)}>Lagre endringer</Button>} />
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent className="vekter-theme"><DialogHeader><DialogTitle>Godkjenn endringer</DialogTitle><DialogDescription>Se over endringene før du godkjenner.</DialogDescription></DialogHeader><p>Pris: kr {price} / mnd</p><ActionStack primary={<Button onClick={() => { setSaved(true); setConfirmOpen(false) }}>Godkjenn</Button>} secondary={<Button onClick={() => setConfirmOpen(false)}>Avbryt</Button>} /></DialogContent></Dialog>
    <p role="status" className="mt-3 min-h-5 text-center text-sm text-muted-foreground">{saved ? 'Endringene er lagret.' : ''}</p>
  </div>
}

function ChatExample() {
  const [messages, setMessages] = useState<string[]>([])
  return <div className="space-y-4"><AssistantIdentity /><Separator /><ChatBubble role="user">Jeg skal til Thailand med familien. Er vi dekket?</ChatBubble><ChatBubble role="assistant">Reiseforsikringen hos Gjensidige gjelder deg. Barna er ikke med på avtalen.</ChatBubble><AdvisorNote>Handlinger krever alltid at du godkjenner. Dette eksempelet kaller ikke AI-tjenesten.</AdvisorNote><div role="log" aria-label="Eksempelsamtale" className="max-h-64 space-y-3 overflow-y-auto">{messages.map((message, index) => <ChatBubble key={index} role="user">{message}</ChatBubble>)}</div><ChatComposer onSend={(message) => setMessages([...messages, message])} /></div>
}

function DamageFlowExample() {
  const [reply, setReply] = useState('')
  const [attachOpen, setAttachOpen] = useState(false)
  const [photo, setPhoto] = useState(EXAMPLE_DAMAGE_IMAGE)
  return <div className="space-y-4">
    <ChatBubble role="assistant">Å nei. Er alle uskadet?</ChatBubble>
    <QuickReplies options={['Alle er uskadet', 'Noen er skadet']} onSelect={setReply} />
    <p role="status" className="text-sm text-muted-foreground">{reply ? `Valgt: ${reply}` : 'Velg et svar.'}</p>
    <ChatImageBubble src={photo} alt="Eksempelbilde av en bulk" />
    <ChatComposer placeholder="Skriv eller legg ved bilde …" onAttach={() => setAttachOpen(true)} onSend={() => undefined} />
    <AttachSheet open={attachOpen} onOpenChange={setAttachOpen} onImage={setPhoto} />
  </div>
}

function FlowPartsExample() {
  const [damage, setDamage] = useState('Bulk, høyre bakdør')
  return <div className="space-y-4">
    <dl><DetailRow label="Skade" value={damage} onSave={setDamage} /><DetailRow label="Dekning" value="Kasko" /></dl>
    <StaticMap pins={[{ x: 50, y: 50, kind: 'you' }, { x: 25, y: 34 }, { x: 75, y: 40 }]} />
    <ApprovedBadge />
    <ul><StatusCheck done>Bergeren er varslet</StatusCheck><StatusCheck done={false}>Ola ringer deg før han kommer</StatusCheck></ul>
  </div>
}

function TravelFlowExample() {
  const offer = insuranceOffers.familyTravelThailand
  const [reminder, setReminder] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [approved, setApproved] = useState(false)
  return <div className="space-y-4">
    <ChatBubble role="assistant">Delvis. Reiseforsikringen hos Gjensidige dekker deg, men ikke barna.</ChatBubble>
    <CoverageCheck title="Reise · Gjensidige" items={[{ label: 'Sykdom og akutt hjelp på reise', covered: true }, { label: 'Bagasje og forsinkelse', covered: true }, { label: 'Avbestilling', covered: true }, { label: 'Familiedekning', covered: false }]} />
    <TipCard title="Husk reisevaksine" body="Thailand krever ofte vaksiner. Bestill time i god tid før avreise." remindInDays={14} reminderSet={reminder} onRemind={() => setReminder(true)} />
    <OfferCard offer={offer} purchased={approved} onReview={() => setSheetOpen(true)} onDecline={() => undefined} />
    <ApproveOfferSheet offer={offer} open={sheetOpen} onOpenChange={setSheetOpen} onApprove={() => { setApproved(true); setSheetOpen(false) }} />
    {approved && <ReceiptCard title={`Ferdig. Familien er dekket fra ${offer.startLabel}.`} lines={['Kvittering sendt på e-post', 'Oversikten din er oppdatert', ...(reminder ? ['Påminnelse om vaksine er satt'] : [])]} />}
  </div>
}

export default function Components() {
  const [step, setStep] = useState(2)
  const [selected, setSelected] = useState('')
  return <div className="vekter-theme min-h-screen">
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-10">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-6"><div><Link to="/chat" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Til samtalerommet</Link><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Vekter’n · internt komponentbibliotek</p><h1 className="mt-3 font-display text-4xl sm:text-5xl">Én stemme. Felles byggeklosser.</h1><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">shadcn/ui-primitiver med Vekter’n-tema og gjenbrukbare mønstre fra Figma.</p></div><Badge variant="outline">v0.1</Badge></header>
      <Tabs defaultValue="components"><TabsList className="mb-8"><TabsTrigger value="components">Komponenter</TabsTrigger><TabsTrigger value="patterns">Sammensatte mønstre</TabsTrigger><TabsTrigger value="tokens">Design tokens</TabsTrigger></TabsList>
        <TabsContent value="components" className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Specimen title="Handlinger" description="ActionStack: én primær, sekundære under (16px), og kompakte valg."><ActionStack primary={<Button>Kom i gang</Button>} secondary={<Button>Ikke nå</Button>} hint="Én primærhandling øverst, sekundære under." /><div className="flex flex-wrap gap-2"><Button size="sm" className="rounded-full"><Check /> Tre barn</Button><Button variant="outline" size="sm" className="rounded-full">Reiser mye</Button><Button disabled size="sm">Utilgjengelig</Button></div></Specimen>
          <Specimen title="Fremdrift" description="Seks segmenter fra onboardingflyten."><StepProgress value={step} /><p className="text-sm text-muted-foreground">Steg {step} av 6</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>Tilbake</Button><Button size="sm" disabled={step === 6} onClick={() => setStep(step + 1)}>Fortsett</Button></div><AssistantIdentity /></Specimen>
          <Specimen title="Felt og merker" description="Semantiske farger, feltetikett og tastaturfokus."><label htmlFor="policy" className="text-sm font-medium">Forsikringsselskap</label><Input id="policy" placeholder="Skriv navnet på selskapet" /><div className="flex flex-wrap gap-2"><Badge>Gjensidige</Badge><Badge variant="secondary">Via arbeidsgiver</Badge><Badge variant="outline">Aktiv</Badge></div><AdvisorNote>Du bestemmer. Ingenting skjer uten ditt ja.</AdvisorNote></Specimen>
          <Specimen title="Forsikringsliste" description="Klikkbare rader med leverandør og pris.">{[{ title: 'Hus og innbo', icon: <House />, provider: 'Gjensidige', price: 'kr 410' }, { title: 'Bil', icon: <CarFront />, provider: 'If', price: 'kr 290' }, { title: 'Barneforsikring', icon: <Users />, provider: 'Gjensidige', price: 'kr 120' }, { title: 'Reise', icon: <Plane />, provider: 'Gjensidige', price: 'kr 100' }, { title: 'Livsforsikring', icon: <Heart />, provider: 'Storebrand' }, { title: 'Uføreforsikring', icon: <ShieldCheck />, provider: 'Storebrand' }].map((item) => <InsuranceRow key={item.title} {...item} onClick={() => setSelected(item.title)} />)}<p role="status" className="text-sm text-muted-foreground">{selected ? `${selected} valgt i eksempelet.` : 'Velg en forsikring.'}</p></Specimen>
          <Specimen title="Dekningsring" description="Tilgjengelig prosentvis status, som én bue eller segmentert per forsikring."><CoverageRing value={100} className="mx-auto" /><CoverageRing value={60} segments={5} className="mx-auto" /><p className="text-center text-2xl font-bold">100 % dekket</p><p className="text-center text-sm text-muted-foreground">Eksempeldata · 5 forsikringer</p></Specimen>
          <Specimen title="Samtale" description="Meldinger og sendefelt med Enter / Shift+Enter."><ChatExample /></Specimen>
          <Specimen title="Skadeflyt i chat" description="Hurtigsvar, bildeboble og «Legg ved»-ark. Bildet nedskaleres og blir i nettleseren."><DamageFlowExample /></Specimen>
          <Specimen title="Reise i chat" description="Dekningssjekk, tips med påminnelse, forslag som krever ja, godkjenningsark og kvittering."><TravelFlowExample /></Specimen>
          <Specimen title="Flytskjermer" description="Redigerbar detaljrad, statisk kart, godkjent-merke og statuslinjer fra skademelding, verksted og berging."><FlowPartsExample /></Specimen>
        </TabsContent>
        <TabsContent value="patterns"><div className="grid items-start gap-8 md:grid-cols-2"><InsuranceExample /><Specimen title="Assistent i samtalen" description="Mønster med identitet, meldinger, råd og skrivefelt."><ChatExample /></Specimen></div></TabsContent>
        <TabsContent value="tokens"><Specimen title="Temagrunnlag" description="Typografi og mål er lest fra Figma. Fargeverdiene er visuelle anslag og må bekreftes mot originalen."><div className="grid gap-4 sm:grid-cols-3">{['background', 'card', 'primary', 'secondary', 'muted', 'border'].map((token) => <div key={token} className="rounded-xl border p-4"><div className="mb-3 h-16 rounded-lg border" style={{ background: `var(--${token})` }} /><code className="text-sm">--{token}</code></div>)}</div><Separator /><h2 className="font-display text-3xl">Gjensidige Display</h2><p>Gjensidige Sans · brødtekst 16 / 24 · liten tekst 14 / 21</p><p className="text-sm text-muted-foreground">Mobilramme: 393px · sidemarg: 24–28px · primærknapp: 52px · bryter: 48 × 28px. Mellomrom og hjørner styres med Tailwind og semantiske CSS-variabler.</p></Specimen></TabsContent>
      </Tabs>
      <footer className="mt-12 border-t border-border/60 pt-6 text-sm leading-6 text-muted-foreground">Kilde: Figma, node 26:130. Vekter’n-illustrasjonen er eksportert fra Figma (public/vektern.svg). Denne ruten er en utviklerkatalog, ikke tilgangsbeskyttet.</footer>
    </div>
  </div>
}
