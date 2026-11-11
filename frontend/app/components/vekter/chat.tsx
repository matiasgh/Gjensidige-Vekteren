import { useState, type ReactNode, type Ref } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

export function ChatBubble({ role, children, className }: { role: 'user' | 'assistant'; children: ReactNode; className?: string }) {
  return <div className={cn('max-w-[90%] rounded-xl px-4 py-3 text-sm leading-6', role === 'user' ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground' : 'mr-auto rounded-bl-sm bg-card text-card-foreground', className)}><span className="sr-only">{role === 'user' ? 'Deg' : 'Vekter’n'}: </span>{children}</div>
}

/** `allowEmpty` lets the caller accept a submit without text (e.g. when other selections are pending). */
export function ChatComposer({ onSend, disabled = false, className, inputRef, placeholder = 'Skriv til Vekter’n …', allowEmpty = false }: { onSend: (message: string) => void; disabled?: boolean; className?: string; inputRef?: Ref<HTMLTextAreaElement>; placeholder?: string; allowEmpty?: boolean }) {
  const [message, setMessage] = useState('')
  function submit() {
    if (disabled || (!message.trim() && !allowEmpty)) return
    onSend(message.trim())
    setMessage('')
  }
  return <form aria-label="Send melding til Vekter’n" className={cn('flex items-end gap-2 rounded-2xl border border-border bg-card p-2', className)} onSubmit={(event) => { event.preventDefault(); submit() }}>
    <Textarea ref={inputRef} aria-label="Melding" placeholder={placeholder} rows={1} value={message} disabled={disabled} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); submit() } }} className="min-h-10 max-h-40 resize-y border-0 bg-transparent shadow-none" />
    <Button type="submit" size="icon-lg" disabled={disabled || (!message.trim() && !allowEmpty)} aria-label="Send melding" className="rounded-full"><ArrowUp /></Button>
  </form>
}
