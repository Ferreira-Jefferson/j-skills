/**
 * Template — Teste de store Zustand (tests/unit/stores/thing-store.test.ts)
 *
 * Regras:
 * - Reset do estado em beforeEach (setState diretamente)
 * - Testar cada action + edge case (ex: remover o selecionado deseleciona)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useThingStore } from '@/stores/thing-store'

describe('thing-store', () => {
  beforeEach(() => {
    useThingStore.setState({ items: [], selectedId: null })
  })

  it('starts empty', () => {
    expect(useThingStore.getState().items).toEqual([])
    expect(useThingStore.getState().selectedId).toBeNull()
  })

  it('adds an item with id', () => {
    useThingStore.getState().add({ name: 'Foo' })
    const items = useThingStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].id).toBeTruthy()
    expect(items[0].name).toBe('Foo')
  })

  it('updates partial fields', () => {
    useThingStore.getState().add({ name: 'Foo' })
    const id = useThingStore.getState().items[0].id
    useThingStore.getState().update(id, { name: 'Bar' })
    expect(useThingStore.getState().items[0].name).toBe('Bar')
  })

  it('removes an item', () => {
    useThingStore.getState().add({ name: 'Foo' })
    const id = useThingStore.getState().items[0].id
    useThingStore.getState().remove(id)
    expect(useThingStore.getState().items).toEqual([])
  })

  it('deselects when removed item was selected', () => {
    useThingStore.getState().add({ name: 'Foo' })
    const id = useThingStore.getState().items[0].id
    useThingStore.getState().select(id)
    useThingStore.getState().remove(id)
    expect(useThingStore.getState().selectedId).toBeNull()
  })
})
