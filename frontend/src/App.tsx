import { useRef, useState } from 'react'
import { ArrowRight, ArrowUp, CarFront, CircleHelp, House, MessageCircle, Plus, ShieldCheck, Sparkles, Umbrella, X } from 'lucide-react'

const suggestions = [
  { icon: Umbrella, title: 'Reise', question: 'Hva dekker reiseforsikringen?' },
  { icon: CarFront, title: 'Bil', question: 'Hva bør jeg vite om bilforsikring?' },
  { icon: House, title: 'Hjem', question: 'Hva er forskjellen på hus- og innboforsikring?' },
  { icon: ShieldCheck, title: 'Skade', question: 'Hvordan melder jeg en skade?' },
]

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-navy">
      <img
        src="https://cdn.gjensidige.no/builders/builders-platform/assets/favicons/gjensidige/android-chrome-192x192.png"
        alt=""
        className="h-9 w-9 rounded-full object-contain"
      />
      {!compact && <span className="text-[21px] font-semibold tracking-[-0.06em]">gjensidige</span>}
    </div>
  )
}

function App() {
  const [message, setMessage] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function send(text: string) {
    if (!text.trim() || isLoading) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text.trim() }]
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

  function newConversation() {
    setMessages([])
    setError('')
    setMessage('')
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-navy md:flex">
      <aside className="hidden min-h-screen w-[260px] shrink-0 flex-col border-r border-[#e1e7ec] bg-white px-5 pb-5 pt-7 md:flex">
        <div className="px-2"><Brand /></div>
        <div className="mt-11 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8795]">Ditt samtalerom</div>
        <button type="button" onClick={newConversation} className="mt-4 flex w-full items-center gap-3 rounded-xl bg-[#e8f4fa] px-4 py-3.5 text-left text-sm font-semibold text-[#005b91] transition hover:bg-[#d9eef8]">
          <Plus size={19} strokeWidth={1.8} /> Ny samtale
        </button>
        <div className="mt-9 px-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8795]">Samtaler</p>
          <div className="mt-5 flex items-start gap-3 text-sm leading-5 text-[#84909d]">
            <MessageCircle size={17} className="mt-0.5 shrink-0" strokeWidth={1.6} />
            <span>Samtalene dine vil vises her.</span>
          </div>
        </div>
        <div className="mt-auto rounded-2xl bg-[#f2f7fa] p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0074ad]"><Sparkles size={17} /></div>
          <p className="mt-3 text-sm font-semibold">Laget for å hjelpe deg</p>
          <p className="mt-1 text-xs leading-5 text-[#667584]">Vekteren er et hackathonprosjekt under utvikling.</p>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#e1e7ec] bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden"><Brand compact /></div>
            <span className="hidden h-8 w-px bg-[#e4e9ed] md:block" />
            <div>
              <p className="text-sm font-semibold">Vekteren</p>
              <p className="mt-0.5 text-xs text-[#778492]">Din digitale assistent</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden items-center gap-2 rounded-full bg-[#f0f7fa] px-3 py-1.5 text-xs font-medium text-[#426779] sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-[#59a6bd]" /> Prototype</span>
            <button type="button" onClick={() => setShowInfo(!showInfo)} aria-label="Om Vekteren" aria-expanded={showInfo} className="flex h-10 w-10 items-center justify-center rounded-full text-[#647587] transition hover:bg-[#f1f5f7]"><CircleHelp size={20} strokeWidth={1.7} /></button>
          </div>
        </header>

        {showInfo && (
          <div role="status" className="mx-5 mt-4 flex items-start justify-between gap-4 rounded-xl border border-[#cce4ef] bg-[#edf8fd] p-4 text-sm leading-6 text-[#315769] sm:mx-8">
            <p>Vekteren er en prototype laget for Gjensidige-hackathonet. Svarene er AI-generert og kan inneholde feil.</p>
            <button type="button" onClick={() => setShowInfo(false)} aria-label="Lukk informasjon" className="shrink-0 rounded p-1"><X size={17} /></button>
          </div>
        )}

        <main className="flex flex-1 flex-col px-5 sm:px-8">
          {messages.length > 0 ? (
          <div className="mx-auto flex w-full max-w-[780px] flex-1 flex-col gap-4 py-8">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'ml-auto max-w-[85%] rounded-2xl bg-[#0075ad] px-4 py-3 text-sm leading-6 text-white' : 'mr-auto max-w-[85%] rounded-2xl border border-[#e2e9ee] bg-white px-4 py-3 text-sm leading-6'}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {isLoading && <p className="text-sm text-[#7b8795]">Vekteren tenker ...</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}
          </div>
          ) : (
          <div className="mx-auto flex w-full max-w-[780px] flex-1 flex-col justify-center py-12 sm:py-16">
            <div className="mx-auto max-w-[600px] text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#dceff8] sm:h-24 sm:w-24">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_18px_rgba(27,86,120,0.1)] sm:h-14 sm:w-14"><Brand compact /></div>
                <span className="absolute -right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#f6f8fa] bg-[#0075ad] text-white"><Sparkles size={12} /></span>
              </div>
              <div className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3981a4]"><span className="h-px w-5 bg-[#a5cddb]" /> Hei, og velkommen <span className="h-px w-5 bg-[#a5cddb]" /></div>
              <h1 className="mt-4 font-display text-[38px] leading-[1.13] tracking-[-0.025em] sm:text-[52px]">Hva kan jeg hjelpe deg med?</h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-[#6b7b89] sm:text-base">Jeg er Vekteren, din digitale assistent. Her kan du etter hvert stille spørsmål om forsikring og få hjelp på veien.</p>
            </div>

            <div className="mt-11 sm:mt-14">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Hva lurer du på?</h2>
                <span className="text-xs text-[#8b98a4]">Velg et forslag for å begynne</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map(({ icon: Icon, title, question }) => (
                  <button key={title} type="button" onClick={() => send(question)} className="group flex min-h-[92px] items-center gap-4 rounded-2xl border border-[#e2e9ee] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#a8d1e4] hover:shadow-[0_8px_24px_rgba(22,67,92,0.06)]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf7fb] text-[#0878aa]"><Icon size={20} strokeWidth={1.6} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-[#638090]">{title}</span><span className="mt-1 block text-sm font-medium leading-5">{question}</span></span>
                    <ArrowRight size={17} className="shrink-0 text-[#9eb0bb] transition group-hover:translate-x-1 group-hover:text-[#0075ad]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}

          <div className="mx-auto w-full max-w-[780px] pb-6 sm:pb-8">
            <div className="rounded-2xl border border-[#dce5eb] bg-white p-3 shadow-[0_8px_32px_rgba(22,58,80,0.06)] sm:p-4">
              <label htmlFor="message" className="sr-only">Skriv en melding</label>
              <textarea ref={inputRef} id="message" rows={2} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(message) } }} placeholder="Skriv spørsmålet ditt her ..." className="block min-h-[56px] w-full resize-none bg-transparent px-1 py-1 text-sm leading-6 text-navy outline-none placeholder:text-[#9aa8b2]" />
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#f0f3f5] pt-3">
                <span className="flex items-center gap-2 text-xs text-[#91a0ab]"><Sparkles size={15} /> Vekteren AI</span>
                <button type="button" onClick={() => send(message)} disabled={!message.trim() || isLoading} aria-label="Send melding" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0075ad] text-white transition disabled:cursor-not-allowed disabled:bg-[#dce9ef]"><ArrowUp size={19} strokeWidth={2} /></button>
              </div>
            </div>
            <p className="mt-3 text-center text-xs leading-5 text-[#8d9ba7]">Vekteren kan ta feil. Sjekk viktig informasjon.</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
