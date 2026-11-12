import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Check, ChevronLeft } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

/** Full-height flow screen with a back link, a scrolling body and pinned actions. */
export function FlowScreen({ title, backTo = '/chat', backLabel = 'Tilbake til samtalen', actions, children }: { title: string; backTo?: string; backLabel?: string; actions?: ReactNode; children: ReactNode }) {
  return <main className="mx-auto flex h-dvh w-full max-w-[441px] flex-col lg:max-w-xl">
    <header className="flex shrink-0 items-center gap-2 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
      <Button asChild variant="ghost" size="icon-lg" className="-ml-2"><Link to={backTo} aria-label={backLabel}><ChevronLeft className="size-6" /></Link></Button>
      <h1 className="font-display text-xl">{title}</h1>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">{children}</div>
    {actions && <div className="flex shrink-0 flex-col gap-4 px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{actions}</div>}
  </main>
}

/** Label/value row. With `onSave` it gets an inline "Endre" editor. */
export function DetailRow({ label, value, onSave, maxLength = 80 }: { label: string; value: ReactNode; onSave?: (value: string) => void; maxLength?: number }) {
  const [draft, setDraft] = useState<string | null>(null)
  const id = useId()
  const save = () => {
    if (draft === null || !draft.trim()) return
    onSave?.(draft.trim())
    setDraft(null)
  }
  return <div className="border-b border-border py-3.5">
    {draft === null ? <div className="flex items-center gap-4">
      <dt className="w-20 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 font-bold">{value}</dd>
      {onSave && typeof value === 'string' && <Button type="button" variant="link" size="sm" className="h-auto px-0 text-primary" onClick={() => setDraft(value)} aria-label={`Endre ${label.toLowerCase()}`}>Endre</Button>}
    </div> : <div className="flex items-center gap-4">
      <dt className="w-20 shrink-0 text-sm text-muted-foreground"><label htmlFor={id}>{label}</label></dt>
      <dd className="min-w-0 flex-1"><form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); save() }}>
        <Input id={id} autoFocus value={draft} maxLength={maxLength} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }} className="min-w-0 flex-1" />
        <Button type="submit" size="sm" disabled={!draft.trim()}>Lagre</Button>
      </form></dd>
    </div>}
  </div>
}

/** Decorative map, not a real location. Pins are percentages of the frame. */
export function StaticMap({ pins, className }: { pins: { x: number; y: number; kind?: 'you' | 'place' }[]; className?: string }) {
  return <div aria-hidden="true" className={cn('relative h-36 overflow-hidden rounded-xl bg-[#262d78]', className)}>
    <svg viewBox="0 0 320 144" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none" stroke="#3d4795" strokeWidth="6">
      <path d="M-10 40 L330 92" /><path d="M-10 110 L330 60" /><path d="M110 -10 L170 154" /><path d="M250 -10 L210 154" strokeWidth="4" />
    </svg>
    {pins.map(({ x, y, kind = 'place' }, index) => <span key={index} className={cn('absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#262d78]', kind === 'you' ? 'size-5 bg-white' : 'size-4 bg-primary')} style={{ left: `${x}%`, top: `${y}%` }} />)}
  </div>
}

/** Progress item with a done (yellow tick) or pending (dashed) state. */
export function StatusCheck({ done, children }: { done: boolean; children: ReactNode }) {
  return <li className="flex items-center gap-3 py-2">
    {done ? <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" strokeWidth={3} /></span> : <span className="size-5 shrink-0 rounded-full border-2 border-dashed border-muted-foreground" />}
    <span>{children}<span className="sr-only">{done ? ' (fullført)' : ' (venter)'}</span></span>
  </li>
}

/** Rounded reply chips under an assistant message. Answers are equal, so none is highlighted. */
export function QuickReplies({ options, onSelect, disabled }: { options: string[]; onSelect: (option: string) => void; disabled?: boolean }) {
  return <div role="group" aria-label="Svaralternativer" className="flex flex-wrap gap-2">
    {options.map((option) => <Button key={option} type="button" size="sm" variant="outline" disabled={disabled} onClick={() => onSelect(option)} className="h-10 rounded-full px-4">{option}</Button>)}
  </div>
}

export function ApprovedBadge({ children = 'Godkjent av Gjensidige' }: { children?: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-sm bg-[#2b336f] px-1.5 py-0.5 text-[11px] text-primary"><Check aria-hidden="true" className="size-3" />{children}</span>
}
