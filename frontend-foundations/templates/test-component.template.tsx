/**
 * Template — Teste unitário de componente (tests/unit/components/.../X.test.tsx)
 *
 * Regras:
 * - Teste comportamento observável, não implementação
 * - Prefira getByRole/getByLabelText sobre getByTestId
 * - String de match no MESMO idioma da UI
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Thing } from '@/components/ui/thing' // TODO(author): path certo

describe('Thing', () => {
  it('renders with content', () => {
    render(<Thing>Salvar</Thing>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Thing onClick={onClick}>Go</Thing>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies destructive variant', () => {
    render(<Thing variant="destructive">Excluir</Thing>)
    const el = screen.getByRole('button')
    expect(el.className).toMatch(/destructive|red/) // classe ou token
  })

  it('is disabled when disabled prop set', () => {
    render(<Thing disabled>X</Thing>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
