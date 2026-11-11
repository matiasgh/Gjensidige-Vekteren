import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, CircleHelp, LoaderCircle, Plus } from 'lucide-react'
import type { Route } from './+types/chat'
import { mockCustomer } from '~/lib/mock-customer.server'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { AssistantIdentity, ChatBubble, ChatComposer } from '~/components/vekter'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export const meta: Route.MetaFunction = () => [{ title: 'Chat – Vekter’n' }]

export function loader() {
  return { firstName: mockCustomer.firstName }
}

const bubbleText = 'text-base break-words whitespace-pre-wrap'

export default function Chat({ loaderData }: Route.ComponentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversation, setConversation] = useState(0)
  const pendingRef = useRef(false)
  const logRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, isLoading, error])

  useEffect(() => {
    if (conversation > 0) composerRef.current?.focus()
  }, [conversation])

  async function requestReply(next: ChatMessage[]) {
    if (pendingRef.current) return
    pendingRef.current = true
    setError('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Noe gikk galt.')
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Vekter’n svarte ikke. Prøv igjen.')
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt.')
    } finally {
      pendingRef.current = false
      setIsLoading(false)
    }
  }

  function send(text: string) {
    if (!text.trim() || pendingRef.current) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text.trim() }]
    setMessages(next)
    void requestReply(next)
  }

  function newConversation() {
    if (pendingRef.current) return
    setMessages([])
    setError('')
    setConversation((value) => value + 1)
  }

  return (
    <div className="vekter-theme h-dvh">
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col">
        <header className="flex shrink-0 items-center gap-2 px-5 pt-8 pb-3.5">
          <Button asChild variant="ghost" size="icon-lg" className="-ml-2 rounded-full">
            <Link to="/" aria-label="Tilbake til start"><ChevronLeft className="size-6" /></Link>
          </Button>
          <AssistantIdentity className="flex-1" />
          <Button type="button" variant="ghost" size="icon-lg" onClick={newConversation} disabled={isLoading} aria-label="Ny samtale" className="rounded-full"><Plus /></Button>
          <Dialog>
            <DialogTrigger asChild><Button type="button" variant="ghost" size="icon-lg" aria-label="Om Vekter’n" className="-mr-2 rounded-full"><CircleHelp /></Button></DialogTrigger>
            <DialogContent className="vekter-theme">
              <DialogHeader><DialogTitle>Om Vekter’n</DialogTitle><DialogDescription>Din digitale forsikringsassistent · hackathonprototype</DialogDescription></DialogHeader>
              <p className="text-sm leading-6">Svarene er AI-generert og kan inneholde feil. Kontroller viktig informasjon mot forsikringsvilkårene dine. Ingen forsikringsavtale endres her.</p>
              <p className="text-sm leading-6 text-muted-foreground">Samtalen vises bare i denne fanen og forsvinner når siden lastes på nytt. Meldinger sendes til den konfigurerte AI-tjenesten. Ikke del sensitive personopplysninger.</p>
              <Link to="/components" className="text-sm text-primary underline underline-offset-4">Se komponentbiblioteket</Link>
            </DialogContent>
          </Dialog>
        </header>

        <main ref={logRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2">
          <h1 className="sr-only">Samtale med Vekter’n</h1>
          <div role="log" aria-label="Samtale" aria-live="polite" className="flex flex-col gap-3.5">
            <ChatBubble role="assistant" className={bubbleText}>Hei, {loaderData.firstName}! Jeg er på vakt. Spør meg om forsikringene dine, så svarer jeg ut fra det jeg vet om deg.</ChatBubble>
            {messages.map((message, index) => <ChatBubble key={index} role={message.role} className={bubbleText}>{message.content}</ChatBubble>)}
          </div>
          {isLoading && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Vekter’n tenker …</p>}
          {error && <div role="alert" className="mt-4 rounded-xl border border-destructive/50 bg-card p-4"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" disabled={isLoading} className="mt-3" onClick={() => void requestReply(messages)}>Prøv igjen</Button></div>}
        </main>

        <div className="shrink-0 px-5 pt-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <ChatComposer key={conversation} inputRef={composerRef} onSend={send} disabled={isLoading} />
          <p className="mt-2.5 text-center text-xs text-muted-foreground">Vekter’n kan ta feil. Sjekk viktig informasjon.</p>
        </div>
      </div>
    </div>
  )
}
