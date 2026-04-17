/**
 * Template — Hook (src/hooks/useSomething.ts)
 *
 * Regras:
 * - Uma responsabilidade por hook
 * - Cleanup no useEffect é obrigatório para side effects
 * - Retorno tipado e estável (funções via useCallback quando expostas)
 * - Testável com renderHook
 */
import { useEffect, useRef, type RefObject } from 'react'

// ═══════════════════════════════════════════════════════════
// EXEMPLO 1 — useClickOutside
// Dispara handler quando o usuário clica fora do elemento referenciado.
// ═══════════════════════════════════════════════════════════
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  when = true,
): void {
  useEffect(() => {
    if (!when) return
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler(e)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler, when])
}

// ═══════════════════════════════════════════════════════════
// EXEMPLO 2 — useEscapeKey
// ═══════════════════════════════════════════════════════════
export function useEscapeKey(handler: () => void, when = true): void {
  useEffect(() => {
    if (!when) return
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler()
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [handler, when])
}

// ═══════════════════════════════════════════════════════════
// EXEMPLO 3 — Novo hook (TODO author)
// ═══════════════════════════════════════════════════════════
export function useSomething(/* params */): { value: string } {
  // TODO(author): lógica do hook
  const ref = useRef<number>(0)
  void ref // remover ao implementar
  return { value: '' }
}
