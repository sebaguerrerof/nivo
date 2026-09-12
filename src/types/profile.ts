export const supportedCurrencies = ['CLP', 'USD', 'EUR'] as const

export type Currency = (typeof supportedCurrencies)[number]

export interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string | null
  avatar_url: string | null
  currency: Currency
  timezone: string
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  first_name: string
  last_name: string | null
  currency: Currency
  timezone: string
}
