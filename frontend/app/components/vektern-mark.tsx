export function VekternMark({ size, className = '' }: { size: number; className?: string }) {
  return <img src="/vektern.svg" alt="" width={size} height={size} className={`shrink-0 ${className}`} style={{ width: size, height: size }} />
}
