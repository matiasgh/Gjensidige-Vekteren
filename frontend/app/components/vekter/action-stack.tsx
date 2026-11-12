import { Children, cloneElement, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

type ActionButton = ReactElement<ComponentProps<typeof Button>, typeof Button>

/**
 * A group of page actions: exactly one primary on top, optional secondaries below, 16px apart.
 * Variant and size are set here, so a group can never contain two primary buttons.
 */
export function ActionStack({ primary, secondary, hint, className }: { primary: ActionButton; secondary?: ActionButton | ActionButton[]; hint?: ReactNode; className?: string }) {
  const style = (button: ActionButton, variant: 'default' | 'outline', key?: number) =>
    cloneElement(button, { key, variant, size: 'action', className: cn('w-full', button.props.className) })
  return <div className={cn('flex flex-col gap-4', className)}>
    <div className="grid w-full gap-4 lg:w-max lg:min-w-64 lg:max-w-full lg:self-center">
      {style(primary, 'default')}
      {Children.toArray(secondary).filter(isValidElement).map((button, index) => style(button as ActionButton, 'outline', index))}
    </div>
    {hint && <p className="text-sm text-muted-foreground lg:text-center">{hint}</p>}
  </div>
}
