export const supportedCurrencies = ['CLP', 'USD', 'EUR'] as const

export type Currency = (typeof supportedCurrencies)[number]

export const onboardingInterestOptions = ['routine', 'work', 'sport', 'reading', 'finances', 'therapy', 'habits', 'other'] as const

export type OnboardingInterest = (typeof onboardingInterestOptions)[number]

export interface NotificationPreferences {
  activities: boolean
  payments: boolean
  finances: boolean
  achievements: boolean
}

export interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string | null
  avatar_url: string | null
  currency: Currency
  timezone: string
  onboarding_completed_at: string | null
  onboarding_interests: OnboardingInterest[]
  notification_preferences: NotificationPreferences
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  first_name: string
  last_name: string | null
  currency: Currency
  timezone: string
  avatar_url?: string | null
  onboarding_completed_at?: string | null
  onboarding_interests?: OnboardingInterest[]
  notification_preferences?: NotificationPreferences
}