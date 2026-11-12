import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, CarFront, CircleHelp, House, LoaderCircle, Phone, Plus, ShieldCheck, Umbrella } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { AssistantIdentity, AssistantMark, AttachSheet, ChatBubble, ChatComposer, ChatImageBubble, QuickReplies } from '~/components/vekter'
import { analysisText, CAR_DAMAGE_FLOW, carCoverage, carDamageTexts, DAMAGE_PHOTO_CONTENT, type CarDamageKind } from '~/lib/car-damage'
import { applyMockAction, isMockAction } from '~/lib/mock-actions'
import { optionLabels } from '~/lib/mock-customer'
import { createConversation, createDefaultState, toApiMessages, type ChatMessage } from '~/lib/mock-state'
import type { useMockState } from '~/lib/use-mock-state'

const suggestions = [
  { icon: Umbrella, title: 'Reise', question: 'Hva dekker reiseforsikringen?' },
  { icon: CarFront, title: 'Bil', question: 'Hva bør jeg vite om bilforsikring?' },
  { icon: House, title: 'Hjem', question: 'Hva er forskjellen på hus- og innboforsikring?' },
  { icon: ShieldCheck, title: 'Skade', question: 'Hvordan melder jeg en skade?' },
]

const coverageOptionLabels = optionLabels
const PHOTO_ANALYSIS_DELAY_MS = 1200
const awaitingPhotoKinds: (CarDamageKind | undefined)[] = ['damage-start', 'damage-photo-request', 'damage-injured']
const damageActions = [
  { to: '/skade/meld', label: 'Meld skade' },
  { to: '/skade/verksted', label: 'Finn verksted' },
  { to: '/skade/berging', label: 'Kontakt bilbergning' },
]

export default function ChatRoom({ state, setState, storageError }: ReturnType<typeof useMockState>) {
  const [searchParams] = useSearchParams()
  const initialQuestion = useRef(searchParams.get('question'))
  const activeConversation = state?.conversations.find(({ id }) => id === state.activeConversationId)
  const messages = activeConversation?.messages ?? []
  const lastActionsIndex = messages.map(({ kind }) => kind).lastIndexOf('damage-actions')
  const awaitingPhoto = awaitingPhotoKinds.includes(messages.at(-1)?.kind)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversation, setConversation] = useState(0)
  const [resetNotice, setResetNotice] = useState('')
  const [loadingText, setLoadingText] = useState('Vekter’n tenker …')
  const [attachOpen, setAttachOpen] = useState(false)
  const pendingRef = useRef(false)
  const logRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, isLoading, error])

  async function requestReply(next: ChatMessage[]) {
    if (pendingRef.current || !state) return
    const conversationId = state.activeConversationId
    pendingRef.current = true
    setError('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toApiMessages(next, state.customer.firstName), customer: state.customer, priorities: state.onboarding.priorities }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Noe gikk galt.')
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Vekter’n svarte ikke. Prøv igjen.')
      if (!Array.isArray(data.actions) || !data.actions.every(isMockAction)) throw new Error('Vekter’n returnerte en ugyldig endring. Ingen demodata er endret.')
      // The AI only decides that the car damage flow starts; its first step is scripted.
      const reply: ChatMessage = data.flow === CAR_DAMAGE_FLOW
        ? { role: 'assistant', content: carDamageTexts.start, kind: 'damage-start' }
        : { role: 'assistant', content: data.reply }
      setState((current) => current && ({
        ...current,
        customer: data.actions.reduce(applyMockAction, current.customer),
        conversations: current.conversations.map((item) => item.id === conversationId
          ? { ...item, messages: [...next, reply] }
          : item),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt.')
    } finally {
      pendingRef.current = false
      setIsLoading(false)
    }
  }

  function setMessages(next: ChatMessage[], conversationId = state?.activeConversationId) {
    setState((current) => current && ({ ...current, conversations: current.conversations.map((item) => item.id === conversationId ? { ...item, messages: next } : item) }))
  }

  // Scripted analysis: every photo gets the same Figma description, with the
  // verdict derived from the current car coverage. The image is never sent anywhere.
  function analysePhoto(next: ChatMessage[]) {
    if (pendingRef.current || !state) return
    const conversationId = state.activeConversationId
    const coverage = carCoverage(state.customer)
    pendingRef.current = true
    setError('')
    setLoadingText('Vekter’n ser på bildet …')
    setIsLoading(true)
    window.setTimeout(() => {
      setMessages([...next, { role: 'assistant', content: analysisText(coverage), kind: 'damage-analysis' }, { role: 'assistant', content: carDamageTexts.actions, kind: 'damage-actions' }], conversationId)
      pendingRef.current = false
      setIsLoading(false)
      setLoadingText('Vekter’n tenker …')
    }, PHOTO_ANALYSIS_DELAY_MS)
  }

  function respond(next: ChatMessage[]) {
    if (next.at(-1)?.image) analysePhoto(next)
    else void requestReply(next)
  }

  function sendPhoto(image: string) {
    if (pendingRef.current || !state) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: DAMAGE_PHOTO_CONTENT, image }]
    setMessages(next)
    analysePhoto(next)
  }

  function answerSafety(option: string) {
    if (pendingRef.current || !state) return
    const injured = option === carDamageTexts.injuredReply
    setMessages([...messages, { role: 'user', content: option }, injured
      ? { role: 'assistant', content: carDamageTexts.injured, kind: 'damage-injured' }
      : { role: 'assistant', content: carDamageTexts.photoRequest, kind: 'damage-photo-request' }])
  }

  function scrollToEnd() {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }

  function send(text: string) {
    if (!text.trim() || pendingRef.current || !state) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text.trim() }]
    setState({ ...state, conversations: state.conversations.map((item) => item.id === state.activeConversationId ? { ...item, messages: next } : item) })
    void requestReply(next)
  }

  useEffect(() => {
    if (!state || !initialQuestion.current) return
    const question = initialQuestion.current
    initialQuestion.current = null
    send(question)
  }, [state])

  function newConversation() {
    if (pendingRef.current || !state) return
    const next = createConversation()
    setState({ ...state, conversations: [...state.conversations, next], activeConversationId: next.id })
    setError('')
    setConversation((value) => value + 1)
  }

  function selectConversation(id: string) {
    if (pendingRef.current || !state) return
    setState({ ...state, activeConversationId: id })
    setError('')
    setConversation((value) => value + 1)
  }

  function resetAllDemoData() {
    if (pendingRef.current || !state) return
    setState(createDefaultState())
    setError('')
    setConversation((value) => value + 1)
    setResetNotice('Alle demodata er tilbakestilt. Standardkunden er gjenopprettet og alle samtaler er slettet.')
  }

  useEffect(() => {
    if (conversation > 0) composerRef.current?.focus()
  }, [conversation])

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon-lg" className="lg:hidden"><Link to="/" aria-label="Tilbake til forsikringene"><ArrowLeft /></Link></Button><AssistantIdentity /></div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Badge variant="outline" className="hidden sm:inline-flex">Prototype</Badge>
            <Button type="button" variant="ghost" size="icon-lg" onClick={newConversation} disabled={isLoading || !state} aria-label="Ny samtale"><Plus /></Button>
            <Dialog onOpenChange={() => setResetNotice('')}>
              <DialogTrigger asChild><Button type="button" variant="ghost" size="icon-lg" aria-label="Om Vekter’n"><CircleHelp /></Button></DialogTrigger>
              <DialogContent className="vekter-theme">
                <DialogHeader><DialogTitle>Om Vekter’n</DialogTitle><DialogDescription>Din digitale forsikringsassistent · hackathonprototype</DialogDescription></DialogHeader>
                <p className="text-sm leading-6">Svarene er AI-generert og kan inneholde feil. Kontroller viktig informasjon mot forsikringsvilkårene dine. Ingen forsikringsavtale endres her.</p>
                <p className="text-sm leading-6 text-muted-foreground">Demoprofilen og alle samtaler lagres i localStorage i denne nettleseren og beholdes når siden lastes på nytt. Meldinger og gjeldende demoprofil sendes til den konfigurerte AI-tjenesten. Ikke del sensitive personopplysninger.</p>
                <section className="space-y-3" aria-label="Demoprofil">
                  <h2 className="text-sm font-bold">Demoprofil: {state?.customer.name ?? 'Laster …'}</h2>
                  <ul className="space-y-1 text-sm text-muted-foreground">{state?.customer.insurances.map((insurance) => <li key={insurance.coverageId}>{insurance.type}: {insurance.coverage}{insurance.optionalCoverages && ` · ${Object.entries(insurance.optionalCoverages).filter(([, enabled]) => enabled).map(([option]) => coverageOptionLabels[option]).join(', ') || 'ingen tilvalg'}`}</li>)}</ul>
                  <Button type="button" variant="destructive" disabled={isLoading || !state} onClick={resetAllDemoData}>Tilbakestill alle demodata</Button>
                  <p className="text-xs text-muted-foreground">Gjenoppretter standardkunden og forsikringene, sletter alle samtaler og starter en ny, tom samtale. Dette kan ikke angres.</p>
                  {resetNotice && <p role="status" className="text-sm text-primary">{resetNotice}</p>}
                  {storageError && <p role="alert" className="text-sm text-destructive">{storageError}</p>}
                </section>
                <Link to="/components" className="text-sm text-primary underline underline-offset-4">Se komponentbiblioteket</Link>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          {storageError && <p role="alert" className="px-5 py-3 text-sm text-destructive sm:px-8">{storageError}</p>}
          <div className="border-b border-border/40 px-5 py-2">
            <label className="flex items-center gap-3 text-sm">Samtale
              <select aria-label="Velg samtale" className="min-w-0 flex-1 rounded-md border border-border bg-background p-2" disabled={isLoading || !state} value={state?.activeConversationId ?? ''} onChange={(event) => selectConversation(event.target.value)}>
                {!state && <option value="">Laster …</option>}
                {state?.conversations.slice().reverse().map((item) => <option key={item.id} value={item.id}>{item.messages[0]?.content.slice(0, 60) ?? 'Ny samtale'}</option>)}
              </select>
            </label>
          </div>
          <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8">
            {messages.length > 0 ? (
              <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
                <h1 className="sr-only">Samtale med Vekter’n</h1>
                <div role="log" aria-label="Samtale" aria-live="polite" className="space-y-4">
                  {messages.map((message, index) => <div key={index} className="space-y-3">
                    {message.image ? <ChatImageBubble src={message.image} alt="Bilde av skaden" onLoad={scrollToEnd} /> : <ChatBubble role={message.role} className="break-words"><p className="whitespace-pre-wrap">{message.content}</p></ChatBubble>}
                    {message.kind === 'damage-start' && index === messages.length - 1 && <QuickReplies options={[carDamageTexts.uninjuredReply, carDamageTexts.injuredReply]} onSelect={answerSafety} disabled={isLoading} />}
                    {message.kind === 'damage-injured' && <Button asChild variant="outline" size="sm" className="h-10 rounded-full border-[#7f8bc0] bg-transparent px-4"><a href="tel:113"><Phone /> Ring 113</a></Button>}
                    {message.kind === 'damage-actions' && index === lastActionsIndex && <div className="flex flex-col gap-3">{damageActions.map(({ to, label }, actionIndex) => <Button key={to} asChild variant={actionIndex === 0 ? 'default' : 'outline'} className={`h-12 w-full rounded-sm text-base font-bold ${actionIndex > 0 ? 'border-[#7f8bc0] bg-transparent' : ''}`}><Link to={to}>{label}</Link></Button>)}</div>}
                  </div>)}
                </div>
                {isLoading && <p role="status" className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> {loadingText}</p>}
                {!isLoading && !error && messages.at(-1)?.role === 'user' && <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => respond(messages)}>Hent svar</Button>}
                {error && <div role="alert" className="mt-5 rounded-xl border border-destructive/50 bg-card p-4"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" disabled={isLoading} className="mt-3" onClick={() => respond(messages)}>Prøv igjen</Button></div>}
              </div>
            ) : (
              <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center py-10 sm:py-14">
                <div className="mx-auto max-w-xl text-center">
                  <AssistantMark className="mx-auto size-24 sm:size-28" />
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">Vekter’n er på vakt</p>
                  <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Hei! Hva kan jeg hjelpe deg med?</h1>
                  <p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">Spør meg om forsikringene dine, hva de dekker, eller hva du bør gjøre når noe skjer.</p>
                </div>
                <section aria-labelledby="suggestions-heading" className="mt-10">
                  <h2 id="suggestions-heading" className="mb-4 text-sm font-bold">Hva lurer du på?</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {suggestions.map(({ icon: Icon, title, question }) => (
                      <Button key={title} type="button" variant="outline" onClick={() => send(question)} disabled={isLoading || !state} className="group h-auto min-h-24 justify-start gap-3 whitespace-normal rounded-xl border-border/60 bg-card/60 p-4 text-left">
                        <Icon aria-hidden="true" className="size-6! shrink-0 text-primary" strokeWidth={1.5} />
                        <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">{title}</span><span className="mt-1 block leading-5">{question}</span></span>
                        <ArrowRight aria-hidden="true" className="text-primary transition-transform group-hover:translate-x-1" />
                      </Button>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border/40 bg-background/70 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-5">
            <div className="mx-auto w-full max-w-3xl">
              <ChatComposer key={conversation} inputRef={composerRef} onSend={send} onAttach={() => setAttachOpen(true)} disabled={isLoading || !state} placeholder={awaitingPhoto ? 'Skriv eller legg ved bilde …' : undefined} />
              <AttachSheet open={attachOpen} onOpenChange={setAttachOpen} onImage={sendPhoto} />
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Vekter’n kan ta feil. Sjekk viktig informasjon.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
