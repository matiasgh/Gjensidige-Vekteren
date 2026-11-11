import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CarFront, CircleHelp, House, LoaderCircle, MessageCircle, Plus, ShieldCheck, Umbrella } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { AdvisorNote, AssistantIdentity, AssistantMark, ChatBubble, ChatComposer } from '~/components/vekter'

const suggestions = [
  { icon: Umbrella, title: 'Reise', question: 'Hva dekker reiseforsikringen?' },
  { icon: CarFront, title: 'Bil', question: 'Hva bør jeg vite om bilforsikring?' },
  { icon: House, title: 'Hjem', question: 'Hva er forskjellen på hus- og innboforsikring?' },
  { icon: ShieldCheck, title: 'Skade', question: 'Hvordan melder jeg en skade?' },
]

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export default function Home() {
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

  useEffect(() => {
    if (conversation > 0) composerRef.current?.focus()
  }, [conversation])

  return (
    <div className="vekter-theme flex h-dvh min-h-0 overflow-hidden">
      <aside aria-label="Samtalerom" className="hidden w-64 shrink-0 flex-col gap-8 border-r border-border/60 bg-background/40 p-6 lg:flex">
        <AssistantIdentity />
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Ditt samtalerom</p>
          <Button type="button" onClick={newConversation} disabled={isLoading} className="w-full justify-start"><Plus /> Ny samtale</Button>
        </div>
        <div className="min-h-0 flex-1">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Denne samtalen</p>
          <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"><MessageCircle aria-hidden="true" className="mt-1 size-4 shrink-0" /><p className="line-clamp-3 break-words">{messages[0]?.content ?? 'Start med et spørsmål. Jeg er her for å hjelpe.'}</p></div>
        </div>
        <AdvisorNote>Jeg foreslår. Du bestemmer. Ingen avtale endres i denne prototypen.</AdvisorNote>
        <Link to="/components" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Komponentbibliotek</Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-8">
          <AssistantIdentity />
          <div className="flex items-center gap-2 sm:gap-4">
            <Badge variant="outline" className="hidden sm:inline-flex">Prototype</Badge>
            <Button type="button" variant="ghost" size="icon-lg" onClick={newConversation} disabled={isLoading} aria-label="Ny samtale" className="lg:hidden"><Plus /></Button>
            <Dialog>
              <DialogTrigger asChild><Button type="button" variant="ghost" size="icon-lg" aria-label="Om Vekter’n"><CircleHelp /></Button></DialogTrigger>
              <DialogContent className="vekter-theme">
                <DialogHeader><DialogTitle>Om Vekter’n</DialogTitle><DialogDescription>Din digitale forsikringsassistent · hackathonprototype</DialogDescription></DialogHeader>
                <p className="text-sm leading-6">Svarene er AI-generert og kan inneholde feil. Kontroller viktig informasjon mot forsikringsvilkårene dine. Ingen forsikringsavtale endres her.</p>
                <p className="text-sm leading-6 text-muted-foreground">Samtalen vises bare i denne fanen og forsvinner når siden lastes på nytt. Meldinger sendes til den konfigurerte AI-tjenesten. Ikke del sensitive personopplysninger.</p>
                <Link to="/components" className="text-sm text-primary underline underline-offset-4">Se komponentbiblioteket</Link>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8">
            {messages.length > 0 ? (
              <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
                <h1 className="sr-only">Samtale med Vekter’n</h1>
                <div role="log" aria-label="Samtale" aria-live="polite" className="space-y-4">
                  {messages.map((message, index) => <ChatBubble key={index} role={message.role} className="break-words"><p className="whitespace-pre-wrap">{message.content}</p></ChatBubble>)}
                </div>
                {isLoading && <p role="status" className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Vekter’n tenker …</p>}
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
                      <Button key={title} type="button" variant="outline" onClick={() => send(question)} disabled={isLoading} className="group h-auto min-h-24 justify-start gap-3 whitespace-normal rounded-xl border-border/60 bg-card/60 p-4 text-left">
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
              <ChatComposer key={conversation} inputRef={composerRef} onSend={send} disabled={isLoading} />
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Vekter’n kan ta feil. Sjekk viktig informasjon.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
