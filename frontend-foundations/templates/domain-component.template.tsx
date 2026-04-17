/**
 * Template — Composto de domínio (src/components/domain/)
 *
 * Um composto:
 * - Conhece tipos do domínio (`@/types`)
 * - Consome primitivos de `@/components/ui`
 * - Pode usar dados fixos de `@/data` ou hooks de `@/hooks`
 * - NÃO importa de `@/pages`
 */
import type { /* TODO(author): type do domínio */ } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// TODO(author): renomear Thing para o nome do composto (ex: ProductCard, PersonaCard)

export type ThingProps = {
  item: /* TODO(author): tipo */ unknown
  selected?: boolean
  onSelect?: () => void
  onDelete?: () => void
  className?: string
}

export function Thing({ item, selected, onSelect, onDelete, className }: ThingProps) {
  return (
    <article
      className={cn(
        'p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] transition-colors',
        selected && 'border-[var(--primary)]',
        className,
      )}
    >
      {/* TODO(author): renderização do conteúdo usando primitivos */}
      <h3 className="font-semibold text-[var(--foreground)]">{/* item.name */}</h3>
      <p className="text-sm text-[var(--muted-foreground)]">{/* item.description */}</p>

      <footer className="flex items-center justify-between mt-3">
        <Badge variant="secondary">{/* item.status */}</Badge>
        <div className="flex gap-2">
          {onSelect && <Button size="sm" variant="outline" onClick={onSelect}>Selecionar</Button>}
          {onDelete && <Button size="sm" variant="destructive" onClick={onDelete}>Excluir</Button>}
        </div>
      </footer>
    </article>
  )
}
