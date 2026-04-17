/**
 * Template — Página (src/pages/ThingPage.tsx)
 *
 * Regra: página = composição + handlers, alvo ≤150 LOC.
 * Sub-componentes específicos vão em src/pages/ThingPage/components/*.
 */
import { useState } from 'react'
import { PageLayout } from '@/components/domain/PageLayout'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/domain/EmptyState'
// TODO(author): importar sub-componentes específicos desta página
// import { ThingDetailPanel } from './ThingPage/components/ThingDetailPanel'
// import { ThingDialog } from './ThingPage/components/ThingDialog'
import { useThingStore } from '@/stores/thing-store'

export default function ThingPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const selected = useThingStore((s) => s.selected)

  return (
    <PageLayout
      title="Things"
      description="Gerencie suas things"
      actions={<Button onClick={() => setDialogOpen(true)}>Nova thing</Button>}
    >
      {/* TODO(author): layout principal — tipicamente grid de 2 colunas, lista + detalhe */}
      {selected ? (
        <div /* <ThingDetailPanel thing={selected} /> */ />
      ) : (
        <EmptyState title="Selecione uma thing" description="Escolha na lista ao lado" />
      )}

      {/* TODO(author): dialogs / modais da página */}
      {/* <ThingDialog open={dialogOpen} onOpenChange={setDialogOpen} /> */}
    </PageLayout>
  )
}
