import { useId, type ComponentProps, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Switch } from '~/components/ui/switch'
import { cn } from '~/lib/utils'

type CoverageRowProps = Pick<ComponentProps<typeof Switch>, 'checked' | 'defaultChecked' | 'onCheckedChange' | 'disabled'> & {
  title: string
  description?: string
  className?: string
}

export function CoverageRow({ title, description, className, ...props }: CoverageRowProps) {
  const id = useId()
  return <div className={cn('flex min-h-[62px] items-center justify-between gap-4 border-b border-border/60 py-2', className)}>
    <label htmlFor={id} className="flex-1 cursor-pointer"><span className="block font-bold">{title}</span>{description && <span id={`${id}-description`} className="block text-sm text-muted-foreground">{description}</span>}</label>
    <Switch id={id} aria-describedby={description ? `${id}-description` : undefined} className="data-[size=default]:h-7 data-[size=default]:w-12 [&_[data-slot=switch-thumb]]:size-[22px] [&_[data-slot=switch-thumb]]:data-[state=unchecked]:translate-x-0.5 [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-[22px]" {...props} />
  </div>
}

type InsuranceRowProps = { icon: ReactNode; title: string; provider?: string; price?: string; trailing?: ReactNode; onClick?: () => void; className?: string }

/** Clickable with `onClick` (price + chevron); static when omitted. `trailing` replaces the price/chevron slot. */
export function InsuranceRow({ icon, title, provider, price, trailing, onClick, className }: InsuranceRowProps) {
  const content = <>
    <span aria-hidden="true" className="[&>svg]:size-[22px]">{icon}</span><span className="min-w-0 flex-1"><span className="block font-bold">{title}</span>{provider && <span className="flex items-center gap-1.5 text-sm text-muted-foreground">{onClick && <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', provider.startsWith('Via jobb') ? 'bg-[var(--employer)]' : provider === 'If' ? 'bg-white' : 'bg-primary')} />}{provider}</span>}</span>
    {trailing ?? <><span className="text-sm">{price ?? '—'}</span>{onClick && <ChevronRight aria-hidden="true" className="size-[18px] text-muted-foreground" />}</>}
  </>
  const classes = cn('flex min-h-18 w-full items-center gap-3 rounded-sm border-b border-border/60 py-3 text-left', className)
  return onClick
    ? <button type="button" onClick={onClick} className={cn(classes, 'transition-colors hover:bg-accent/50')}>{content}</button>
    : <div className={classes}>{content}</div>
}
