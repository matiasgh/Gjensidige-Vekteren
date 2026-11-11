import { cn } from '~/lib/utils'
import { AssistantMark } from './assistant-identity'

const CIRCUMFERENCE = 609.5

function point(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return `${(110 + 97 * Math.cos(rad)).toFixed(2)} ${(110 + 97 * Math.sin(rad)).toFixed(2)}`
}

/** Pass `segments` for the prototype's segmented ring (one arc per policy); otherwise a single progress arc. */
export function CoverageRing({ value, segments, className }: { value: number; segments?: number; className?: string }) {
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
  const count = segments && Number.isFinite(segments) ? Math.max(1, Math.floor(segments)) : 0
  const filled = Math.round((percent / 100) * count)
  const span = 360 / Math.max(count, 1)
  return <div role="img" aria-label={`${Math.round(percent)} prosent dekket`} className={cn('relative flex size-55 items-center justify-center', className)}>
    {count ? (
      <svg aria-hidden="true" viewBox="0 0 220 220" className="absolute inset-0 size-full">
        {Array.from({ length: count }, (_, index) => <path key={index} d={`M ${point(index * span + 6)} A 97 97 0 0 1 ${point((index + 1) * span - 6)}`} fill="none" strokeWidth="14" strokeLinecap="round" stroke={index < filled ? 'var(--primary)' : 'var(--input)'} className="transition-[stroke] duration-500" />)}
      </svg>
    ) : (
      <svg aria-hidden="true" viewBox="0 0 220 220" className="absolute inset-0 size-full -rotate-90"><circle cx="110" cy="110" r="97" fill="none" stroke="var(--input)" strokeWidth="14" /><circle cx="110" cy="110" r="97" fill="none" stroke="var(--primary)" strokeWidth="14" strokeDasharray={`${percent * (CIRCUMFERENCE / 100)} ${CIRCUMFERENCE}`} strokeLinecap="round" /></svg>
    )}
    <AssistantMark className="size-32" />
  </div>
}
