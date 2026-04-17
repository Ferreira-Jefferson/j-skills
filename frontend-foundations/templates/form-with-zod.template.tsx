/**
 * Template — Formulário com validação Zod
 *
 * Regras:
 * - Validação sempre no submit; campos com erro mostram mensagem inline
 * - Inputs via primitivos de ui/ + wrapper FormField de domain/
 * - Tipos inferidos de z.infer<typeof schema>
 */
import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { FormField } from '@/components/domain/FormField'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  email: z.string().email('E-mail inválido'),
  price: z.coerce.number().positive('Deve ser positivo'),
  description: z.string().optional(),
})

export type ThingFormData = z.infer<typeof schema>

export function ThingForm({
  onSubmit,
  loading,
  initial,
}: {
  onSubmit: (data: ThingFormData) => Promise<void> | void
  loading?: boolean
  initial?: Partial<ThingFormData>
}) {
  const [values, setValues] = useState<Partial<ThingFormData>>(initial ?? {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof ThingFormData>(k: K, v: ThingFormData[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        next[issue.path.join('.')] = issue.message
      }
      setErrors(next)
      return
    }
    setErrors({})
    await onSubmit(parsed.data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField name="name" label="Nome" required error={errors.name}>
        <Input id="name" value={values.name ?? ''} onChange={(e) => update('name', e.target.value)} />
      </FormField>
      <FormField name="email" label="E-mail" required error={errors.email}>
        <Input id="email" type="email" value={values.email ?? ''} onChange={(e) => update('email', e.target.value)} />
      </FormField>
      <FormField name="price" label="Preço" required error={errors.price}>
        <Input id="price" type="number" step="0.01" value={values.price ?? ''} onChange={(e) => update('price', Number(e.target.value))} />
      </FormField>
      <FormField name="description" label="Descrição" error={errors.description}>
        <Textarea id="description" value={values.description ?? ''} onChange={(e) => update('description', e.target.value)} rows={3} />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
