import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, CircleHelp, LoaderCircle, Plus } from 'lucide-react'
import type { Route } from './+types/chat'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { AssistantIdentity, ChatBubble, ChatComposer } from '~/components/vekter'
import { applyMockAction, isMockAction } from '~/lib/mock-actions'
import { optionLabels } from '~/lib/mock-customer'
import { createConversation, createDefaultState, type ChatMessage } from '~/lib/mock-state'
import { useMockState } from '~/lib/use-mock-state'

export const meta: Route.MetaFunction = () => [{ title: 'Chat – Vekter’n' }]

const bubbleText = 'text-base break-words whitespace-pre-wrap'

export default function Chat() {
  const { state, setState, storageError } = useMockState()
  const activeConversation = state?.conversations.find(({ id }) => id === state.activeConversationId)
  const messages = activeConversation?.messages ?? []
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversation, setConversation] = useState(0)
  const [resetNotice, setResetNotice] = useState('')
  const pendingRef = useRef(false)
  const logRef = useRef<HTMLElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, isLoading, error])

  useEffect(() => {
    if (conversation > 0) composerRef.current?.focus()
  }, [conversation])

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
        body: JSON.stringify({ messages: next, customer: state.customer, priorities: state.onboarding.priorities }),
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

  function resetAllDemoData() {
    if (pendingRef.current || !state) return
    setState(createDefaultState())
    setError('')
    setConversation((value) => value + 1)
    setResetNotice('Alle demodata er tilbakestilt. Standardkunden er gjenopprettet, oppstarten er nullstilt og alle samtaler er slettet.')
  }

  return (
    <div className="vekter-theme h-dvh">
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col">
        <header className="flex shrink-0 items-center gap-2 px-5 pt-8 pb-3.5">
          <Button asChild variant="ghost" size="icon-lg" className="-ml-2 rounded-full">
            <Link to="/" aria-label="Tilbake til start"><ChevronLeft className="size-6" /></Link>
          </Button>
          <AssistantIdentity className="flex-1" />
          <Button type="button" variant="ghost" size="icon-lg" onClick={newConversation} disabled={isLoading || !state} aria-label="Ny samtale" className="rounded-full"><Plus /></Button>
          <Dialog onOpenChange={() => setResetNotice('')}>
            <DialogTrigger asChild><Button type="button" variant="ghost" size="icon-lg" aria-label="Om Vekter’n" className="-mr-2 rounded-full"><CircleHelp /></Button></DialogTrigger>
            <DialogContent className="vekter-theme max-h-[90dvh] overflow-y-auto">
              <DialogHeader><DialogTitle>Om Vekter’n</DialogTitle><DialogDescription>Din digitale forsikringsassistent · hackathonprototype</DialogDescription></DialogHeader>
              <p className="text-sm leading-6">Svarene er AI-generert og kan inneholde feil. Kontroller viktig informasjon mot forsikringsvilkårene dine. Ingen forsikringsavtale endres her.</p>
              <p className="text-sm leading-6 text-muted-foreground">Demoprofilen, oppstartsvalgene og alle samtaler lagres i localStorage i denne nettleseren og beholdes når siden lastes på nytt. Meldinger, gjeldende demoprofil og prioriteringene dine fra oppstarten sendes til den konfigurerte AI-tjenesten. Ikke del sensitive personopplysninger.</p>
              <section className="space-y-3" aria-label="Demoprofil">
                <h2 className="text-sm font-bold">Demoprofil: {state?.customer.name ?? 'Laster …'}</h2>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {state?.customer.insurances.map((insurance) => (
                    <li key={insurance.type}>
                      {insurance.type}: {insurance.coverage} ({insurance.provider})
                      {insurance.optionalCoverages && ` · ${Object.entries(insurance.optionalCoverages).filter(([, enabled]) => enabled).map(([option]) => (optionLabels[option] ?? option).toLowerCase()).join(', ') || 'ingen tilvalg'}`}
                    </li>
                  ))}
                </ul>
                <Button type="button" variant="destructive" disabled={isLoading || !state} onClick={resetAllDemoData}>Tilbakestill alle demodata</Button>
                <p className="text-xs text-muted-foreground">Gjenoppretter standardkunden og forsikringene, nullstiller oppstarten, sletter alle samtaler og starter en ny, tom samtale. Dette kan ikke angres.</p>
                {resetNotice && <p role="status" className="text-sm text-primary">{resetNotice}</p>}
                {storageError && <p role="alert" className="text-sm text-destructive">{storageError}</p>}
              </section>
              <Link to="/components" className="text-sm text-primary underline underline-offset-4">Se komponentbiblioteket</Link>
            </DialogContent>
          </Dialog>
        </header>

        {state && state.conversations.length > 1 && (
          <label className="mx-5 mb-2 flex shrink-0 items-center gap-3 text-sm text-muted-foreground">Samtale
            <select aria-label="Velg samtale" className="min-w-0 flex-1 rounded-md border border-border bg-background p-2 text-foreground" disabled={isLoading} value={state.activeConversationId} onChange={(event) => selectConversation(event.target.value)}>
              {state.conversations.slice().reverse().map((item) => <option key={item.id} value={item.id}>{item.messages[0]?.content.slice(0, 60) ?? 'Ny samtale'}</option>)}
            </select>
          </label>
        )}

        <main ref={logRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2">
          <h1 className="sr-only">Samtale med Vekter’n</h1>
          {storageError && <p role="alert" className="mb-3 text-sm text-destructive">{storageError}</p>}
          <div role="log" aria-label="Samtale" aria-live="polite" className="flex flex-col gap-3.5">
            {state && <ChatBubble role="assistant" className={bubbleText}>Hei, {state.customer.firstName}! Jeg er på vakt. Spør meg om forsikringene dine, så svarer jeg ut fra det jeg vet om deg.</ChatBubble>}
            {messages.map((message, index) => <ChatBubble key={index} role={message.role} className={bubbleText}>{message.content}</ChatBubble>)}
          </div>
          {isLoading && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Vekter’n tenker …</p>}
          {!isLoading && !error && messages.at(-1)?.role === 'user' && <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void requestReply(messages)}>Hent svar</Button>}
          {error && <div role="alert" className="mt-4 rounded-xl border border-destructive/50 bg-card p-4"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" disabled={isLoading} className="mt-3" onClick={() => void requestReply(messages)}>Prøv igjen</Button></div>}
        </main>

        <div className="shrink-0 px-5 pt-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <ChatComposer key={conversation} inputRef={composerRef} onSend={send} disabled={isLoading || !state} />
          <p className="mt-2.5 text-center text-xs text-muted-foreground">Vekter’n kan ta feil. Sjekk viktig informasjon.</p>
        </div>
      </div>
    </div>
  )
}
