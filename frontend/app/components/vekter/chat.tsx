import { useState, type ReactNode, type Ref } from 'react'
import { ArrowUp, Plus, X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

export function ChatBubble({ role, children, className }: { role: 'user' | 'assistant'; children: ReactNode; className?: string }) {
  return <div className={cn('max-w-[90%] rounded-xl px-4 py-3 text-sm leading-6', role === 'user' ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground' : 'mr-auto rounded-bl-sm bg-card text-card-foreground', className)}><span className="sr-only">{role === 'user' ? 'Deg' : 'Vekter’n'}: </span>{children}</div>
}

/** A photo the customer sent, framed like the Figma chat (yellow border, right-aligned). */
export function ChatImageBubble({ src, alt, onLoad, className }: { src: string; alt: string; onLoad?: () => void; className?: string }) {
  return <figure className={cn('ml-auto w-fit max-w-[80%] overflow-hidden rounded-xl border-4 border-primary bg-card', className)}><span className="sr-only">Deg: </span><img src={src} alt={alt} onLoad={onLoad} className="block max-h-72 w-auto max-w-full object-cover" /></figure>
}

/** `allowEmpty` lets the caller accept a submit without text (e.g. when other selections are pending). `onAttach` adds a "Legg ved" button; `attachment` (an image data URL) is shown as a removable preview and counts as content, so it is only sent with Send. */
export function ChatComposer({ onSend, onAttach, attachment, onRemoveAttachment, disabled = false, className, inputRef, placeholder = 'Skriv til Vekter’n …', allowEmpty = false }: { onSend: (message: string) => void; onAttach?: () => void; attachment?: string; onRemoveAttachment?: () => void; disabled?: boolean; className?: string; inputRef?: Ref<HTMLTextAreaElement>; placeholder?: string; allowEmpty?: boolean }) {
  const [message, setMessage] = useState('')
  const canSend = !!message.trim() || !!attachment || allowEmpty
  function submit() {
    if (disabled || !canSend) return
    onSend(message.trim())
    setMessage('')
  }
  return <form aria-label="Send melding til Vekter’n" className={cn('flex flex-col gap-2 rounded-2xl border border-border bg-card p-2', className)} onSubmit={(event) => { event.preventDefault(); submit() }}>
    {attachment && <div className="relative ml-1 w-fit"><img src={attachment} alt="Vedlagt bilde" className="block max-h-24 w-auto rounded-lg border-2 border-primary object-cover" /><Button type="button" variant="secondary" size="icon-sm" disabled={disabled} onClick={onRemoveAttachment} aria-label="Fjern vedlagt bilde" className="absolute -top-2 -right-2 size-6 rounded-full"><X /></Button></div>}
    <div className="flex items-end gap-2">
    {onAttach && <Button type="button" variant="ghost" size="icon-lg" disabled={disabled} onClick={onAttach} aria-label="Legg ved bilde" className="rounded-full text-primary"><Plus /></Button>}
    <Textarea ref={inputRef} aria-label="Melding" placeholder={placeholder} rows={1} value={message} disabled={disabled} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); submit() } }} className="min-h-10 max-h-40 resize-y border-0 bg-transparent shadow-none" />
    <Button type="submit" size="icon-lg" disabled={disabled || !canSend} aria-label="Send melding" className="rounded-full"><ArrowUp /></Button>
    </div>
  </form>
}
