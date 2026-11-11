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

export function InsuranceRow({ icon, title, provider, price, onClick }: { icon: ReactNode; title: string; provider: string; price?: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-18 w-full items-center gap-3 rounded-sm border-b border-border/60 py-3 text-left transition-colors hover:bg-accent/50">
    <span aria-hidden="true" className="text-muted-foreground [&>svg]:size-[22px]">{icon}</span><span className="flex-1"><span className="block font-medium">{title}</span><span className="block text-sm text-muted-foreground">{provider}</span></span><span className="text-sm">{price ?? '—'}</span><ChevronRight aria-hidden="true" className="size-[18px] text-muted-foreground" />
  </button>
}
