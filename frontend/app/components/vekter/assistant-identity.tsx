import { cn } from '~/lib/utils'

/** The Vekter'n guard illustration, exported from Figma (public/vektern.svg). */
export function AssistantMark({ className }: { className?: string }) {
  return <img src="/vektern.svg" alt="" aria-hidden="true" className={cn('inline-block size-10 shrink-0 rounded-full', className)} />
}

export function AssistantIdentity({ className, status = 'På vakt' }: { className?: string; status?: string | null }) {
  return <div className={cn('flex items-center gap-3', className)}><AssistantMark /><div><p className="font-display text-lg">Vekter’n</p>{status && <p className="text-sm text-muted-foreground">{status}</p>}</div></div>
}
