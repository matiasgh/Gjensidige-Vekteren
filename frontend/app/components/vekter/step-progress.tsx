import { cn } from '~/lib/utils'

export function StepProgress({ value, total = 6, className }: { value: number; total?: number; className?: string }) {
  const count = Number.isFinite(total) ? Math.max(1, Math.floor(total)) : 6
  const current = Number.isFinite(value) ? Math.min(count, Math.max(0, Math.floor(value))) : 0
  return <div role="progressbar" aria-label="Fremdrift i onboarding" aria-valuemin={0} aria-valuemax={count} aria-valuenow={current} className={cn('flex gap-1.5', className)}>{Array.from({ length: count }, (_, index) => <span key={index} className={cn('h-1 flex-1 rounded-full', index < current ? 'bg-primary' : 'bg-muted')} />)}</div>
}
