/**
 * Template — Store Zustand (src/stores/thing-store.ts)
 *
 * Regras:
 * - Uma entidade de domínio por store
 * - Persist com chave estável — NUNCA mude o shape sem migration
 * - Tipos do state/actions vêm de @/types
 * - Nenhum import de componentes
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { /* TODO(author): Thing */ } from '@/types'

// TODO(author): renomeie Thing para a entidade (ex: Client, Product).

type Thing = { id: string; name: string /* ... */ }

type ThingState = {
  items: Thing[]
  selectedId: string | null
}

type ThingActions = {
  add: (data: Omit<Thing, 'id'>) => void
  update: (id: string, patch: Partial<Thing>) => void
  remove: (id: string) => void
  select: (id: string | null) => void
}

export const useThingStore = create<ThingState & ThingActions>()(
  persist(
    (set) => ({
      items: [],
      selectedId: null,

      add: (data) =>
        set((state) => ({
          items: [...state.items, { id: crypto.randomUUID(), ...data }],
        })),

      update: (id, patch) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      remove: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),

      select: (id) => set({ selectedId: id }),
    }),
    {
      name: 'app-things',             // TODO(author): chave estável do localStorage
      storage: createJSONStorage(() => localStorage),
      version: 1,                      // incrementar + migrate quando mudar shape
      // migrate: (persisted, version) => { ... }
    },
  ),
)
