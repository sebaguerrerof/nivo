import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const client = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        // Los callbacks intercambian el código explícitamente por ruta. Así se
        // evita una carrera entre el proveedor de sesión y las pantallas de
        // confirmación/restablecimiento.
        detectSessionInUrl: false,
      },
    })
  : null

export class SupabaseConfigurationError extends Error {
  constructor() {
    super('Falta la configuración de Supabase. Revisa las variables de entorno.')
    this.name = 'SupabaseConfigurationError'
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    throw new SupabaseConfigurationError()
  }

  return client
}
