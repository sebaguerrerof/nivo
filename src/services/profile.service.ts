import { getSupabaseClient } from '@/lib/supabase/client'
import type { Profile, ProfileUpdate } from '@/types/profile'

const profileColumns = 'id, user_id, first_name, last_name, avatar_url, currency, timezone, created_at, updated_at'

export const profileService = {
  async getOwnProfile(userId: string): Promise<Profile> {
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .select(profileColumns)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw error
    }

    return data as Profile
  },

  async updateOwnProfile(userId: string, input: ProfileUpdate): Promise<Profile> {
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .update(input)
      .eq('user_id', userId)
      .select(profileColumns)
      .single()

    if (error) {
      throw error
    }

    return data as Profile
  },
}
