import { cn } from '~/lib/utils'
import { AssistantMark } from './assistant-identity'

function point(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return `${(110 + 97 * Math.cos(rad)).toFixed(2)} ${(110 + 97 * Math.sin(rad)).toFixed(2)}`
}

/** Custom segment counts support onboarding; the overview uses the original five Figma arcs. */
export function CoverageRing({ value, segments, className }: { value: number; segments?: number; className?: string }) {
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
  return <div role="img" aria-label={`${percent} prosent dekket`} className={cn('relative flex size-55 items-center justify-center', className)}>
    <svg aria-hidden="true" viewBox="0 0 220 220" className="absolute inset-0 size-full" fill="none" strokeWidth="14" strokeLinecap="round">
      {segments && Number.isFinite(segments) ? Array.from({ length: Math.min(20, Math.max(1, Math.floor(segments))) }, (_, index) => {
        const count = Math.min(20, Math.max(1, Math.floor(segments)))
        return <path key={index} d={`M ${point(index * 360 / count + 6)} A 97 97 0 ${count === 1 ? 1 : 0} 1 ${point((index + 1) * 360 / count - 6)}`} stroke={index < Math.round(percent / 100 * count) ? 'var(--primary)' : 'var(--input)'} />
      }) : ['M118.02 18.35C134.651 19.8044 150.572 25.7566 164.078 35.5688C177.585 45.3809 188.167 58.6831 194.69 74.05', 'M199.64 89.3C203.396 105.566 202.656 122.548 197.498 138.425C192.34 154.302 182.959 168.477 170.36 179.43', 'M157.38 188.86C143.071 197.457 126.693 201.999 110 201.999C93.3072 201.999 76.9289 197.457 62.62 188.86', 'M49.64 179.43C37.0413 168.477 27.6604 154.302 22.5024 138.425C17.3444 122.548 16.6038 105.566 20.36 89.3', 'M25.31 74.05C31.8335 58.6831 42.4153 45.3809 55.9215 35.5688C69.4277 25.7566 85.3493 19.8044 101.98 18.35'].map((d, index) => <path key={d} d={d} stroke={index * 20 >= percent ? 'var(--input)' : index === 3 ? 'var(--employer)' : index === 4 ? 'white' : 'var(--primary)'} />)}
    </svg>
    <AssistantMark className="size-[126px]" />
  </div>
}
