import { progressAnalyticsSchema } from '@/features/progress/progress.schemas'
import type { ProgressAnalytics, ProgressPeriodRange } from '@/features/progress/progress.types'
import { getSupabaseClient } from '@/lib/supabase/client'

export const analyticsService = {
  async getProgressAnalytics(range: ProgressPeriodRange): Promise<ProgressAnalytics> {
    const { data, error } = await getSupabaseClient().rpc('get_progress_analytics', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_previous_start_date: range.previousStartDate,
      p_previous_end_date: range.previousEndDate,
      p_heatmap_start_date: range.heatmapStartDate,
    })

    if (error) throw error
    return progressAnalyticsSchema.parse(data)
  },
}