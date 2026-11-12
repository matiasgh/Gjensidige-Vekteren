import type { ReactNode } from 'react'
import { Bell, Check, LockKeyhole, Lightbulb, X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog'
import type { InsuranceOffer } from '~/lib/travel-offer'
import { cn } from '~/lib/utils'
import { DetailRow, StatusCheck } from './flow'

const eyebrow = 'text-xs font-bold uppercase tracking-[0.14em] text-primary'
const outlineAction = 'border-[#7f8bc0] bg-transparent'

function ChatCard({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return <section aria-label={label} className={cn('mr-auto w-full max-w-[90%] rounded-xl bg-card p-4 text-sm leading-6 text-card-foreground', className)}>{children}</section>
}

/** ✓/✗ lines for a policy. The caller derives the lines from the profile, never from AI text. */
export function CoverageCheck({ title, items, className }: { title?: string; items: { label: string; covered: boolean }[]; className?: string }) {
  return <ChatCard label={title ? `Dekningssjekk: ${title}` : 'Dekningssjekk'} className={className}>
    {title && <p className={eyebrow}>{title}</p>}
    <ul className={cn(title && 'mt-2')}>{items.map(({ label, covered }) => <li key={label} className="flex items-start gap-3 py-1.5">
      {covered ? <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#8ed8c0]" strokeWidth={2} /> : <X aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" strokeWidth={2} />}
      <span>{label}<span className="sr-only">{covered ? ' (dekket)' : ' (ikke dekket)'}</span></span>
    </li>)}</ul>
  </ChatCard>
}

/** Practical advice with an optional local reminder button. */
export function TipCard({ title, body, remindInDays, reminderSet = false, onRemind, disabled, className }: { title: string; body: string; remindInDays?: number; reminderSet?: boolean; onRemind?: () => void; disabled?: boolean; className?: string }) {
  const period = remindInDays && (remindInDays % 7 === 0 ? `${remindInDays / 7} ${remindInDays === 7 ? 'uke' : 'uker'}` : `${remindInDays} ${remindInDays === 1 ? 'dag' : 'dager'}`)
  return <ChatCard label={`Tips: ${title}`} className={className}>
    <p className={eyebrow}>Tips</p>
    <div className="mt-2 flex items-start gap-3">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2b336f] text-primary"><Lightbulb className="size-4.5" /></span>
      <div><p className="font-bold">{title}</p><p className="text-[#d6ddee]">{body}</p></div>
    </div>
    {period && <Button type="button" size="sm" variant="outline" disabled={disabled || reminderSet} onClick={onRemind} className={cn('mt-3 h-10 rounded-full px-4 disabled:opacity-100', outlineAction, reminderSet && 'text-primary')}>
      {reminderSet ? <>Påminnelse satt <Check aria-hidden="true" /></> : <><Bell aria-hidden="true" /> Minn meg på om {period}</>}
    </Button>}
  </ChatCard>
}

/** A proposal that always needs Kari's explicit yes. All fields come from the offer data. */
export function OfferCard({ offer, onReview, onDecline, disabled, purchased = false, className }: { offer: InsuranceOffer; onReview?: () => void; onDecline?: () => void; disabled?: boolean; purchased?: boolean; className?: string }) {
  return <ChatCard label={`Forslag: ${offer.title}`} className={cn('border border-primary/40', className)}>
    <p className={eyebrow}>Forslag · krever ditt ja</p>
    <h3 className="mt-2 font-display text-xl leading-7">{offer.title}</h3>
    <p className="text-[#d6ddee]">{offer.who} · {offer.period}</p>
    <p className="text-[#d6ddee]">{offer.covers}</p>
    <p className="mt-2 font-display text-2xl text-primary">{offer.priceLabel}</p>
    {purchased ? <p className="mt-3 flex items-center gap-2 font-bold text-primary"><Check aria-hidden="true" className="size-4" /> Godkjent og lagt til</p>
      : <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={disabled} onClick={onReview} className="h-10 rounded-full px-4">Se og godkjenn</Button>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onDecline} className={cn('h-10 rounded-full px-4', outlineAction)}>Nei takk</Button>
      </div>}
  </ChatCard>
}

/** Bottom sheet summarising an offer before anything is added. "Avbryt" only closes it. */
export function ApproveOfferSheet({ offer, open, onOpenChange, onApprove, error }: { offer: InsuranceOffer; open: boolean; onOpenChange: (open: boolean) => void; onApprove: () => void; error?: string }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="vekter-theme top-auto bottom-0 max-w-none translate-y-0 gap-2 rounded-t-3xl rounded-b-none border-x-0 border-b-0 bg-[#1a1f5c] px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:max-w-md sm:bottom-6 sm:rounded-3xl sm:border-x sm:border-b">
      <span aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/50" />
      <DialogTitle className="font-display text-xl">Godkjenn tilleggsdekning</DialogTitle>
      <DialogDescription className="sr-only">Se over forslaget før du godkjenner.</DialogDescription>
      <dl className="mt-1">
        <DetailRow label="Produkt" value={`${offer.product}, ${offer.destination}`} />
        <DetailRow label="Hvem" value={offer.who} />
        <DetailRow label="Når" value={offer.period} />
        <DetailRow label="Dekker" value={offer.covers} />
        <DetailRow label="Selskap" value={offer.provider} />
        <DetailRow label="Pris" value={<span className="text-primary">{offer.priceLabel}</span>} />
      </dl>
      <p className="mt-2 flex items-start gap-2.5 rounded-xl bg-card p-3.5 text-sm leading-5.5 text-[#d6ddee]"><LockKeyhole aria-hidden="true" className="size-[18px] shrink-0 text-primary" />Ingenting skjer før du godkjenner. Du kan angre innen 14 dager.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="mt-2 flex flex-col gap-3">
        <Button type="button" onClick={onApprove} className="h-12 w-full rounded-sm text-base font-bold">Godkjenn og betal</Button>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className={cn('h-12 w-full rounded-sm text-base font-bold', outlineAction)}>Avbryt</Button>
      </div>
    </DialogContent>
  </Dialog>
}

/** Deterministic confirmation after an approval. Only list lines that are actually true. */
export function ReceiptCard({ title, lines, className }: { title: string; lines: string[]; className?: string }) {
  return <ChatCard label="Kvittering" className={className}>
    <p className="font-bold">{title}</p>
    <ul className="mt-1">{lines.map((line) => <StatusCheck key={line} done>{line}</StatusCheck>)}</ul>
  </ChatCard>
}
