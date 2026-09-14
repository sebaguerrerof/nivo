import { getSupabaseClient } from '@/lib/supabase/client'
import type { InAppNotification } from '@/features/notifications/notification.types'

const notificationColumns = 'id, user_id, type, title, message, entity_type, entity_id, action_path, read_at, created_at'

export const notificationService = {
  async sync() {
    const { error } = await getSupabaseClient().rpc('sync_in_app_notifications')
    if (error) throw error
  },

  async getOwnNotifications(userId: string): Promise<InAppNotification[]> {
    const { data, error } = await getSupabaseClient().from('notifications').select(notificationColumns).eq('user_id', userId).order('created_at', { ascending: false }).limit(30)
    if (error) throw error
    return (data ?? []) as InAppNotification[]
  },

  async markRead(notificationId: string) {
    const { error } = await getSupabaseClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', notificationId).is('read_at', null)
    if (error) throw error
  },

  async markAllRead(userId: string) {
    const { error } = await getSupabaseClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null)
    if (error) throw error
  },
}
