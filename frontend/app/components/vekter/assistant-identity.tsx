import { cn } from '~/lib/utils'

export function AssistantMark({ className }: { className?: string }) {
  return <img src="/images/vekter-mark.svg" alt="" aria-hidden="true" className={cn('inline-block size-10 shrink-0', className)} />
}

export function AssistantIdentity({ className }: { className?: string }) {
  return <div className={cn('flex items-center gap-3', className)}><AssistantMark /><div><p className="font-display text-lg">Vekter’n</p><p className="text-sm text-muted-foreground">På vakt</p></div></div>
}
