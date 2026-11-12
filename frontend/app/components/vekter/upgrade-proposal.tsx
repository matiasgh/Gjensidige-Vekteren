import { ArrowUpRight, CircleCheck } from 'lucide-react'
import { Button } from '~/components/ui/button'

type UpgradeProposalProps = {
  from: string
  to: string
  reason: string
  currentPriceNok: number
  newPriceNok: number
  upgraded: boolean
  onAccept: () => void
  onDismiss: () => void
}

// Offers a higher coverage level; the parent owns dismissal so it can adapt the surrounding copy.
export function UpgradeProposal({ from, to, reason, currentPriceNok, newPriceNok, upgraded, onAccept, onDismiss }: UpgradeProposalProps) {
  if (upgraded) {
    return (
      <section role="status" className="flex items-start gap-3 rounded-xl bg-card p-3.5 text-card-foreground">
        <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-bold">Oppgradert til {to}</p>
          <p className="text-[13px] leading-[18px] font-medium text-muted-foreground">Nå {newPriceNok} kr/mnd. Oversikten er oppdatert.</p>
        </div>
      </section>
    )
  }
  return (
    <section aria-label={`Forslag: oppgrader til ${to}`} className="flex flex-col gap-2.5 rounded-xl bg-card p-3.5 text-card-foreground">
      <div className="flex items-start gap-3">
        <ArrowUpRight aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-xs leading-4 font-medium text-primary">Forslag fra Vekter’n</p>
          <p className="leading-snug font-bold">Oppgrader fra {from} til {to}</p>
          <p className="text-[13px] leading-[18px] font-medium text-muted-foreground">{reason}</p>
          <p className="pt-0.5 text-sm font-medium">{newPriceNok} kr/mnd <span className="text-muted-foreground">(+{newPriceNok - currentPriceNok} kr fra i dag, {currentPriceNok} kr)</span></p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button className="h-10 flex-1" onClick={onAccept}>Godta forslag</Button>
        <Button variant="outline" className="h-10 flex-1" onClick={onDismiss}>Ikke nå</Button>
      </div>
    </section>
  )
}
