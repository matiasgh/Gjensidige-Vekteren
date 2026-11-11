import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import type { Route } from './+types/chat'
import { mockCustomer } from '../lib/mock-customer.server'
import { VekternMark } from '../components/vektern-mark'
import { SendButton } from '../components/send-button'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export const meta: Route.MetaFunction = () => [{ title: "Chat – Vekter'n" }]

export function loader() {
  return { firstName: mockCustomer.firstName }
}

const userBubble = 'ml-auto max-w-[82%] rounded-[20px] rounded-br-[4px] bg-sun p-3.5 text-navy'
const assistantBubble = 'mr-auto max-w-[92%] rounded-[20px] rounded-tl-[4px] bg-navy-800 p-3.5 text-white'

export default function Chat({ loaderData }: Route.ComponentProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages, isLoading, error])

  async function send(event: FormEvent) {
    event.preventDefault()
    const text = message.trim()
    if (!text || isLoading) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setMessage('')
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
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-dvh bg-gradient-to-b from-navy to-navy-900 text-white">
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col">
        <header className="flex shrink-0 items-center gap-3 px-5 pt-8 pb-3.5">
          <Link to="/" aria-label="Tilbake til start" className="-ml-1 rounded-full p-0.5 hover:bg-white/10">
            <ChevronLeft size={24} strokeWidth={2} aria-hidden />
          </Link>
          <VekternMark size={40} />
          <div>
            <p className="font-display text-lg leading-[1.3] font-medium">Vekter'n</p>
            <p className="text-sm font-medium text-mist">På vakt</p>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pb-2" aria-live="polite">
          <p className={assistantBubble}>Hei, {loaderData.firstName}! Jeg er på vakt. Spør meg om forsikringene dine, så svarer jeg ut fra det jeg vet om deg.</p>
          {messages.map((m, i) => (
            <p key={i} className={`animate-rise-in whitespace-pre-wrap ${m.role === 'user' ? userBubble : assistantBubble}`}>{m.content}</p>
          ))}
          {isLoading && <p className={`${assistantBubble} text-mist`}>Vekter'n tenker …</p>}
          {error && <p role="alert" className="rounded-xl border border-red-300/40 bg-red-500/10 p-3.5 text-sm text-red-200">{error}</p>}
          <div ref={endRef} />
        </main>

        <form onSubmit={send} className="shrink-0 px-5 pt-3.5 pb-5">
          <div className="flex items-center gap-2 rounded-full border border-navy-600 bg-navy-800 py-1.5 pr-1.5 pl-5 focus-within:border-sun">
            <label htmlFor="message" className="sr-only">Skriv til Vekter'n</label>
            <input
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Skriv til Vekter'n …"
              autoComplete="off"
              className="pill-input min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-mist"
            />
            <SendButton disabled={!message.trim() || isLoading} label="Send melding" />
          </div>
          <p className="mt-2.5 text-center text-xs text-mist">Vekter'n kan ta feil. Sjekk viktig informasjon.</p>
        </form>
      </div>
    </div>
  )
}
