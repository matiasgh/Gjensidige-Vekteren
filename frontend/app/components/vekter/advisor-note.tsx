import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'
import { AssistantMark } from './assistant-identity'

export function AdvisorNote({ children, className }: { children: ReactNode; className?: string }) {
  return <aside aria-label="Tips fra Vekter’n" className={cn('flex items-start gap-3 rounded-xl bg-card p-3.5 text-sm leading-6 text-card-foreground', className)}><AssistantMark className="size-8" /><div className="flex-1">{children}</div></aside>
}
