import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CarFront, CircleHelp, House, LoaderCircle, MessageCircle, Plus, ShieldCheck, Umbrella } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { AdvisorNote, AssistantIdentity, AssistantMark, ChatBubble, ChatComposer } from '~/components/vekter'
import { applyMockAction, isMockAction } from '~/lib/mock-actions'
import { createDefaultCustomer } from '~/lib/mock-customer'
import { createConversation, type ChatMessage } from '~/lib/mock-state'
import { useMockState } from '~/lib/use-mock-state'

const suggestions = [
  { icon: Umbrella, title: 'Reise', question: 'Hva dekker reiseforsikringen?' },
  { icon: CarFront, title: 'Bil', question: 'Hva bør jeg vite om bilforsikring?' },
  { icon: House, title: 'Hjem', question: 'Hva er forskjellen på hus- og innboforsikring?' },
  { icon: ShieldCheck, title: 'Skade', question: 'Hvordan melder jeg en skade?' },
]

const coverageOptionLabels: Record<string, string> = {
  rentalCar: 'leiebil',
  puncture: 'punkteringsdekning',
  extendedMobileInsurance: 'utvidet mobilforsikring',
  increasedBicycleTheftLimit: 'økt grense for sykkeltyveri',
}

export default function Home() {
  const { state, setState, storageError } = useMockState()
  const activeConversation = state?.conversations.find(({ id }) => id === state.activeConversationId)
  const messages = activeConversation?.messages ?? []
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversation, setConversation] = useState(0)
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
        body: JSON.stringify({ messages: next, customer: state.customer }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Noe gikk galt.')
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Vekter’n svarte ikke. Prøv igjen.')
      if (!Array.isArray(data.actions) || !data.actions.every(isMockAction)) throw new Error('Vekter’n returnerte en ugyldig endring. Ingen demodata er endret.')
      const customer = data.actions.reduce(applyMockAction, state.customer)
      setState((current) => current && ({
        ...current,
        customer,
        conversations: current.conversations.map((item) => item.id === conversationId
          ? { ...item, messages: [...next, { role: 'assistant', content: data.reply }] }
          : item),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt.')
    } finally {
      pendingRef.current = false
      setIsLoading(false)
    }
  }

  function send(text: string) {
    if (!text.trim() || pendingRef.current || !state) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text.trim() }]
    setState({ ...state, conversations: state.conversations.map((item) => item.id === state.activeConversationId ? { ...item, messages: next } : item) })
    void requestReply(next)
  }

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

  function resetCustomer() {
    if (pendingRef.current) return
    setState((current) => current && ({ ...current, customer: createDefaultCustomer() }))
    setError('')
  }

  useEffect(() => {
    if (conversation > 0) composerRef.current?.focus()
  }, [conversation])

  return (
    <div className="vekter-theme flex h-dvh min-h-0 overflow-hidden">
      <aside aria-label="Samtalerom" className="hidden w-64 shrink-0 flex-col gap-8 border-r border-border/60 bg-background/40 p-6 lg:flex">
        <AssistantIdentity />
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Ditt samtalerom</p>
          <Button type="button" onClick={newConversation} disabled={isLoading || !state} className="w-full justify-start"><Plus /> Ny samtale</Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Samtaler</p>
          <div className="space-y-2">
            {state?.conversations.slice().reverse().map((item) => (
              <Button key={item.id} type="button" variant={item.id === state.activeConversationId ? 'secondary' : 'ghost'} disabled={isLoading} onClick={() => selectConversation(item.id)} aria-pressed={item.id === state.activeConversationId} className="h-auto w-full justify-start whitespace-normal text-left">
                <MessageCircle aria-hidden="true" className="shrink-0" /><span className="line-clamp-2 break-words">{item.messages[0]?.content ?? 'Ny samtale'}</span>
              </Button>
            ))}
          </div>
        </div>
        <AdvisorNote>Du bestemmer. Endringer lagres bare i din lokale demoprofil, aldri i reelle avtaler.</AdvisorNote>
        <Link to="/components" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Komponentbibliotek</Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-8">
          <AssistantIdentity />
          <div className="flex items-center gap-2 sm:gap-4">
            <Badge variant="outline" className="hidden sm:inline-flex">Prototype</Badge>
            <Button type="button" variant="ghost" size="icon-lg" onClick={newConversation} disabled={isLoading || !state} aria-label="Ny samtale" className="lg:hidden"><Plus /></Button>
            <Dialog>
              <DialogTrigger asChild><Button type="button" variant="ghost" size="icon-lg" aria-label="Om Vekter’n"><CircleHelp /></Button></DialogTrigger>
              <DialogContent className="vekter-theme">
                <DialogHeader><DialogTitle>Om Vekter’n</DialogTitle><DialogDescription>Din digitale forsikringsassistent · hackathonprototype</DialogDescription></DialogHeader>
                <p className="text-sm leading-6">Svarene er AI-generert og kan inneholde feil. Kontroller viktig informasjon mot forsikringsvilkårene dine. Ingen forsikringsavtale endres her.</p>
                <p className="text-sm leading-6 text-muted-foreground">Demoprofilen og alle samtaler lagres i localStorage i denne nettleseren og beholdes når siden lastes på nytt. Meldinger og gjeldende demoprofil sendes til den konfigurerte AI-tjenesten. Ikke del sensitive personopplysninger.</p>
                <section className="space-y-3" aria-label="Demoprofil">
                  <h2 className="text-sm font-bold">Demoprofil: {state?.customer.name ?? 'Laster …'}</h2>
                  <ul className="space-y-1 text-sm text-muted-foreground">{state?.customer.insurances.map((insurance) => <li key={insurance.coverageId}>{insurance.type}: {insurance.coverage}{insurance.optionalCoverages && ` · ${Object.entries(insurance.optionalCoverages).filter(([, enabled]) => enabled).map(([option]) => coverageOptionLabels[option]).join(', ') || 'ingen tilvalg'}`}</li>)}</ul>
                  <Button type="button" variant="outline" disabled={isLoading || !state} onClick={resetCustomer}>Tilbakestill demoprofil</Button>
                  <p className="text-xs text-muted-foreground">Gjenoppretter standardkunden og forsikringene. Samtalene beholdes som historikk; tidligere endringer i demoprofilen gjelder ikke lenger.</p>
                </section>
                <Link to="/components" className="text-sm text-primary underline underline-offset-4">Se komponentbiblioteket</Link>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          {storageError && <p role="alert" className="px-5 py-3 text-sm text-destructive sm:px-8">{storageError}</p>}
          <div className="border-b border-border/40 px-5 py-2 lg:hidden">
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
                  {messages.map((message, index) => <ChatBubble key={index} role={message.role} className="break-words"><p className="whitespace-pre-wrap">{message.content}</p></ChatBubble>)}
                </div>
                {isLoading && <p role="status" className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Vekter’n tenker …</p>}
                {!isLoading && !error && messages.at(-1)?.role === 'user' && <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void requestReply(messages)}>Hent svar</Button>}
                {error && <div role="alert" className="mt-5 rounded-xl border border-destructive/50 bg-card p-4"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" disabled={isLoading} className="mt-3" onClick={() => void requestReply(messages)}>Prøv igjen</Button></div>}
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
              <ChatComposer key={conversation} inputRef={composerRef} onSend={send} disabled={isLoading || !state} />
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Vekter’n kan ta feil. Sjekk viktig informasjon.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
