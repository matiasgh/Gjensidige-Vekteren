import { ShieldCheck } from 'lucide-react'
import { cn } from '~/lib/utils'

/** Placeholder until the original Vekter'n illustration is supplied as an asset. */
export function AssistantMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground', className)}><ShieldCheck className="size-[60%]" strokeWidth={1.5} /></span>
}

export function AssistantIdentity({ className }: { className?: string }) {
  return <div className={cn('flex items-center gap-3', className)}><AssistantMark /><div><p className="font-display text-lg">Vekter’n</p><p className="text-sm text-muted-foreground">På vakt</p></div></div>
}
