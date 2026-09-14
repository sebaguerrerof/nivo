import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const requestSchema = z.object({ confirmation: z.literal('ELIMINAR') })

function jsonResponse(body: { error: string }, status: number) {
  return Response.json(body, { status })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Método no permitido.' }), { status: 405, headers: { Allow: 'POST', 'Content-Type': 'application/json' } })
    const values = requestSchema.safeParse(await request.json().catch(() => null))
    if (!values.success) return jsonResponse({ error: 'Confirma la eliminación antes de continuar.' }, 400)

    const accessToken = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '').trim()
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!accessToken || !supabaseUrl || !supabaseAnonKey) return jsonResponse({ error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }, 401)
    if (!serviceRoleKey) return jsonResponse({ error: 'La eliminación de cuenta aún no está configurada. Intenta nuevamente más tarde.' }, 503)

    const authClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await authClient.auth.getUser(accessToken)
    if (error || !data.user) return jsonResponse({ error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }, 401)

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id)
    if (deleteError) return jsonResponse({ error: 'No pudimos eliminar tu cuenta. Intenta nuevamente más tarde.' }, 502)
    return Response.json({ ok: true })
  },
}