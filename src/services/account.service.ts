import { z } from 'zod'
import { authService } from '@/services/auth.service'

const responseSchema = z.object({ error: z.string().trim().min(1).max(500) })

export async function deleteOwnAccount() {
  const session = await authService.getSession()
  if (!session) throw new Error('Tu sesión terminó. Inicia sesión nuevamente.')
  const response = await fetch('/api/delete-account', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmation: 'ELIMINAR' }),
  })
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    const parsed = responseSchema.safeParse(payload)
    throw new Error(parsed.success ? parsed.data.error : 'No pudimos eliminar tu cuenta. Intenta nuevamente.')
  }
}