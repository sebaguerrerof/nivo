import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput extends SignInInput {
  firstName: string
  lastName?: string
}

function redirectUrl(path: string) {
  return new URL(path, window.location.origin).toString()
}

export const authService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await getSupabaseClient().auth.getSession()

    if (error) {
      throw error
    }

    return data.session
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return getSupabaseClient().auth.onAuthStateChange((event, session) => callback(event, session))
  },

  async signIn({ email, password }: SignInInput) {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password })

    if (error) {
      throw error
    }

    return data.user
  },

  async signUp({ email, password, firstName, lastName }: SignUpInput) {
    const { data, error } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName?.trim() || null,
          currency: 'CLP',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago',
        },
        emailRedirectTo: redirectUrl('/auth/callback'),
      },
    })

    if (error) {
      throw error
    }

    return {
      user: data.user,
      needsEmailConfirmation: !data.session,
    }
  },

  async signOut() {
    const { error } = await getSupabaseClient().auth.signOut()

    if (error) {
      throw error
    }
  },

  async sendPasswordReset(email: string) {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl('/auth/reset-password'),
    })

    if (error) {
      throw error
    }
  },


  async updatePassword(password: string) {
    const { data, error } = await getSupabaseClient().auth.updateUser({ password })

    if (error) {
      throw error
    }

    return data.user
  },

  async exchangeCodeForSession(code: string) {
    const { data, error } = await getSupabaseClient().auth.exchangeCodeForSession(code)

    if (error) {
      throw error
    }

    return data.session
  },
}

export function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''

  if (message.includes('Invalid login credentials')) {
    return 'El correo o la contraseña no son correctos.'
  }

  if (message.includes('Email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.'
  }

  if (message.includes('User already registered')) {
    return 'Ya existe una cuenta con este correo.'
  }

  if (message.includes('Password should be')) {
    return 'La contraseña no cumple los requisitos de seguridad.'
  }

  if (message.includes('Falta la configuración de Supabase')) {
    return message
  }

  return 'No pudimos completar la acción. Intenta nuevamente.'
}

export type AuthUser = User
