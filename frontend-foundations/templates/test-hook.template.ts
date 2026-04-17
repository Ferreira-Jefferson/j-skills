/**
 * Template — Teste de hook (tests/unit/hooks/useX.test.ts)
 *
 * Use renderHook para testes isolados; render + component-wrapper quando o hook
 * precisa de DOM/ref.
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useClipboard } from '@/hooks/useClipboard'

describe('useClipboard', () => {
  it('copies text and toggles copied state', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    const { result } = renderHook(() => useClipboard(500))

    expect(result.current.copied).toBe(false)

    await act(async () => {
      await result.current.copy('hello')
    })

    expect(writeText).toHaveBeenCalledWith('hello')
    expect(result.current.copied).toBe(true)
  })

  it('resets copied after timeout', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { result } = renderHook(() => useClipboard(1000))

    await act(async () => {
      await result.current.copy('x')
    })
    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1001)
    })
    expect(result.current.copied).toBe(false)

    vi.useRealTimers()
  })
})
