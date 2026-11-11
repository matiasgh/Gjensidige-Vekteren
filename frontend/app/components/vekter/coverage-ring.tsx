import { cn } from '~/lib/utils'
import { AssistantMark } from './assistant-identity'

export function CoverageRing({ value, className }: { value: number; className?: string }) {
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
  return <div role="img" aria-label={`${percent} prosent dekket`} className={cn('relative flex size-55 items-center justify-center', className)}>
    <svg aria-hidden="true" viewBox="0 0 220 220" className="absolute inset-0 size-full -rotate-90"><circle cx="110" cy="110" r="97" fill="none" stroke="var(--input)" strokeWidth="14" /><circle cx="110" cy="110" r="97" fill="none" stroke="var(--primary)" strokeWidth="14" strokeDasharray={`${percent * 6.095} 609.5`} strokeLinecap="round" /></svg>
    <AssistantMark className="size-32" />
  </div>
}
