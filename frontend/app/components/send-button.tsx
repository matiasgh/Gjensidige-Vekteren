import { ArrowRight } from 'lucide-react'

export function SendButton({ disabled, label = 'Send' }: { disabled: boolean; label?: string }) {
  return (
    <button type="submit" disabled={disabled} aria-label={label} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sun text-navy transition disabled:opacity-40">
      <ArrowRight size={20} strokeWidth={2.2} aria-hidden />
    </button>
  )
}
