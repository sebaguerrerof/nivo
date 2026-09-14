import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useFinancialCategoryActions } from '@/features/finances/hooks/use-finances'
import { financialCategorySchema, type FinancialCategoryFormValues } from '@/features/finances/finance.schemas'
import type { FinancialCategory } from '@/features/finances/finance.types'

interface CategoryManagerProps {
  userId: string
  categories: FinancialCategory[]
}

export function CategoryManager({ userId, categories }: CategoryManagerProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FinancialCategory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const actions = useFinancialCategoryActions(userId)
  const form = useForm<FinancialCategoryFormValues>({ resolver: zodResolver(financialCategorySchema), defaultValues: { name: '', type: 'expense', icon: '' } })

  useEffect(() => {
    form.reset({ name: editing?.name ?? '', type: editing?.type ?? 'expense', icon: editing?.icon ?? '' })
    setError(null)
  }, [editing, form])

  const closeEditor = () => { setEditing(null); setError(null); form.reset({ name: '', type: 'expense', icon: '' }) }
  const submit = form.handleSubmit(async (values) => {
    try {
      setError(null)
      if (editing?.id) await actions.update.mutateAsync({ categoryId: editing.id, input: values })
      else await actions.create.mutateAsync(values)
      closeEditor()
    } catch {
      setError(editing ? 'No pudimos actualizar la categoría. Si ya tiene movimientos, conserva su tipo actual.' : 'No pudimos crear esta categoría. Revisa que no exista otra con el mismo nombre y tipo.')
    }
  })

  const toggleActive = async (category: FinancialCategory) => {
    try { setError(null); await actions.setActive.mutateAsync({ categoryId: category.id, active: !category.active }) } catch { setError('No pudimos actualizar esta categoría.') }
  }

  const remove = async (category: FinancialCategory) => {
    if (!window.confirm(`¿Eliminar definitivamente la categoría “${category.name}”? Si tiene movimientos, la mantendremos protegida.`)) return
    try { setError(null); await actions.remove.mutateAsync(category.id) } catch { setError('No pudimos eliminarla porque está siendo usada. Puedes desactivarla para conservar el historial.') }
  }

  const personalCategories = categories.filter((category) => !category.is_system)
  const systemCategories = categories.filter((category) => category.is_system)

  return <section aria-label="Administrar categorías" className="border-t border-[var(--border-subtle)] pt-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Categorías</p><h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Hazlas tuyas</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Las categorías base están disponibles para todos; las personales solo para ti.</p></div><Button onClick={() => setOpen((value) => !value)} size="sm" type="button" variant="secondary">{open ? 'Cerrar' : 'Administrar'}</Button></div>{open ? <div className="mt-6 grid gap-5 border-t border-[var(--border)] pt-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[var(--foreground)]">Tus categorías personales</h3><Button onClick={() => setEditing({ id: '', user_id: userId, name: '', type: 'expense', icon: null, is_system: false, active: true, created_at: '', updated_at: '' })} size="sm" type="button"><Plus aria-hidden="true" className="size-4" />Nueva</Button></div>{editing ? <form className="grid gap-3 rounded-2xl bg-[var(--surface-muted)] p-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end" onSubmit={(event) => void submit(event)}><Input {...form.register('name')} error={form.formState.errors.name?.message} label="Nombre" placeholder="Ej. Mascotas" /><Select {...form.register('type')} disabled={Boolean(editing.id)} error={form.formState.errors.type?.message} label="Tipo"><option value="expense">Gasto</option><option value="income">Ingreso</option></Select><div className="flex gap-2"><Button loading={actions.create.isPending || actions.update.isPending} size="sm" type="submit">{editing.id ? 'Guardar' : 'Crear'}</Button><Button onClick={closeEditor} size="sm" type="button" variant="ghost">Cancelar</Button></div>{error ? <p className="text-sm text-rose-600 sm:col-span-3 dark:text-rose-300">{error}</p> : null}</form> : null}{personalCategories.length === 0 ? <p className="rounded-xl bg-[var(--surface-muted)] px-4 py-4 text-sm text-[var(--foreground-muted)]">Todavía no has creado categorías personales.</p> : <div className="grid gap-2">{personalCategories.map((category) => <article className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-3" key={category.id}><span className={`size-2.5 rounded-full ${category.type === 'expense' ? 'bg-rose-500' : 'bg-teal-500'}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[var(--foreground)]">{category.name}</p><p className="text-xs text-[var(--foreground-muted)]">{category.type === 'expense' ? 'Gasto' : 'Ingreso'} · {category.active ? 'Activa' : 'Inactiva'}</p></div><div className="flex"><Button aria-label={`Editar ${category.name}`} onClick={() => setEditing(category)} size="sm" type="button" variant="ghost"><Pencil aria-hidden="true" className="size-3.5" /></Button><Button aria-label={`${category.active ? 'Desactivar' : 'Activar'} ${category.name}`} loading={actions.setActive.isPending} onClick={() => void toggleActive(category)} size="sm" type="button" variant="ghost"><Power aria-hidden="true" className="size-3.5" /></Button><Button aria-label={`Eliminar ${category.name}`} loading={actions.remove.isPending} onClick={() => void remove(category)} size="sm" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-3.5 text-rose-600" /></Button></div></article>)}</div>}<div><h3 className="text-sm font-semibold text-[var(--foreground)]">Categorías base</h3><p className="mt-1 text-sm text-[var(--foreground-muted)]">No se eliminan para conservar una experiencia consistente.</p><div className="mt-3 flex flex-wrap gap-2">{systemCategories.map((category) => <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)]" key={category.id}>{category.name}</span>)}</div></div>{error && !editing ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}</div> : null}</section>
}
