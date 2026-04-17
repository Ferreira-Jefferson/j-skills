/**
 * Template — Primitivo (src/components/ui/)
 *
 * Um primitivo:
 * - É ZERO domínio (nenhum import de stores/data/types de negócio)
 * - Tem API homogênea via cva (variant, size, ...)
 * - Usa forwardRef para permitir refs
 * - Tem teste unitário correspondente em tests/unit/components/ui/
 */
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// TODO(author): renomeie tudo que segue abaixo para o nome do primitivo (ex: Thing, thingVariants).

const thingVariants = cva(
  // classes base comuns a todas as variantes
  'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
        destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
        outline: 'border border-[var(--border)] bg-transparent',
        ghost: 'hover:bg-[var(--accent)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ThingProps
  extends ComponentPropsWithoutRef<'button'>, // TODO(author): substituir 'button' pelo elemento certo
    VariantProps<typeof thingVariants> {}

export const Thing = forwardRef<HTMLButtonElement, ThingProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(thingVariants({ variant, size, className }))}
      {...props}
    />
  ),
)
Thing.displayName = 'Thing'

export { thingVariants }
