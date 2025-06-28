import { supabase } from '../lib/supabase'
import { trackingService } from './trackingService'

export const clickService = {
  // Get all clicks for current user
  async getUserClicks() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('clicks')
        .select(`
          *,
          links!inner(user_id)
        `)
        .eq('links.user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user clicks:', error)
      throw error
    }
  },

  // Get clicks for a specific link
  async getLinkClicks(linkId) {
    try {
      const { data, error } = await supabase
        .from('clicks')
        .select('*')
        .eq('link_id', linkId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching link clicks:', error)
      throw error
    }
  },

  // Record a click with webhook notifications
  async recordClick(linkId, clickData = {}) {
    try {
      const { data, error } = await supabase
        .from('clicks')
        .insert({
          link_id: linkId,
          ip_address: clickData.ip_address || null,
          user_agent: clickData.user_agent || null,
          referer: clickData.referer || null,
          country: clickData.country || null,
          city: clickData.city || null,
          device: clickData.device || null,
          browser: clickData.browser || null,
          os: clickData.os || null
        })
        .select()
        .single()

      if (error) throw error

      // Send webhook notifications asynchronously
      trackingService.sendWebhookNotification(linkId, {
        ...clickData,
        click_id: data.id,
        timestamp: data.created_at
      }).catch(error => {
        console.error('Webhook notification failed:', error)
      })

      return data
    } catch (error) {
      console.error('Error recording click:', error)
      throw error
    }
  },

  // Get click analytics
  async getClickAnalytics(linkId, timeRange = '7d') {
    try {
      let startDate = new Date()
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
        default:
          startDate.setDate(startDate.getDate() - 7)
      }

      const { data, error } = await supabase
        .from('clicks')
        .select('*')
        .eq('link_id', linkId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching click analytics:', error)
      throw error
    }
  }
}
