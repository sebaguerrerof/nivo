import { getSupabaseClient } from '@/lib/supabase/client'
import type { NotificationPreferences, OnboardingInterest, Profile, ProfileUpdate } from '@/types/profile'

const profileColumns = 'id, user_id, first_name, last_name, avatar_url, currency, timezone, onboarding_completed_at, onboarding_interests, notification_preferences, created_at, updated_at'

function toProfile(value: unknown): Profile {
  const profile = value as Omit<Profile, 'onboarding_interests' | 'notification_preferences'> & {
    onboarding_interests?: OnboardingInterest[] | null
    notification_preferences?: Partial<NotificationPreferences> | null
  }

  return {
    ...profile,
    onboarding_interests: profile.onboarding_interests ?? [],
    notification_preferences: {
      activities: profile.notification_preferences?.activities ?? true,
      payments: profile.notification_preferences?.payments ?? true,
      finances: profile.notification_preferences?.finances ?? true,
      achievements: profile.notification_preferences?.achievements ?? true,
    },
  }
}

export const profileService = {
  async getOwnProfile(userId: string): Promise<Profile> {
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .select(profileColumns)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return toProfile(data)
  },

  async updateOwnProfile(userId: string, input: ProfileUpdate): Promise<Profile> {
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .update(input)
      .eq('user_id', userId)
      .select(profileColumns)
      .single()

    if (error) throw error
    return toProfile(data)
  },
}