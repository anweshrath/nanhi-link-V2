import { supabase } from '../lib/supabase'

export const linkService = {
  // Create a new link
  async createLink(linkData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate short code if not provided
      if (!linkData.short_code) {
        linkData.short_code = this.generateShortCode()
      }

      // Ensure destination_url is set
      if (!linkData.destination_url && linkData.original_url) {
        linkData.destination_url = linkData.original_url
      }

      const { data, error } = await supabase
        .from('links')
        .insert({
          ...linkData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating link:', error)
      throw error
    }
  },

  // Get all links for current user
  async getLinks() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching links:', error)
      throw error
    }
  },

  // Get link by ID
  async getLinkById(id) {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching link:', error)
      throw error
    }
  },

  // Get link by short code (for redirects)
  async getLinkByShortCode(shortCode) {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('short_code', shortCode)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching link by short code:', error)
      throw error
    }
  },

  // Update link
  async updateLink(id, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Ensure destination_url is updated if original_url changes
      if (updates.original_url && !updates.destination_url) {
        updates.destination_url = updates.original_url
      }

      const { data, error } = await supabase
        .from('links')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating link:', error)
      throw error
    }
  },

  // Delete link
  async deleteLink(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting link:', error)
      throw error
    }
  },

  // Record click (called by redirect service)
  async recordClick(linkId, clickData) {
    try {
      const { error } = await supabase
        .from('clicks')
        .insert({
          link_id: linkId,
          ...clickData,
          clicked_at: new Date().toISOString()
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error recording click:', error)
      throw error
    }
  },

  // Get analytics for a link
  async getLinkAnalytics(linkId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Verify user owns this link
      const { data: link } = await supabase
        .from('links')
        .select('id')
        .eq('id', linkId)
        .eq('user_id', user.id)
        .single()

      if (!link) throw new Error('Link not found or access denied')

      const { data, error } = await supabase
        .from('clicks')
        .select('*')
        .eq('link_id', linkId)
        .order('clicked_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  },

  // Generate random short code
  generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // Check if short code is available
  async isShortCodeAvailable(shortCode) {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('id')
        .eq('short_code', shortCode)
        .single()

      if (error && error.code === 'PGRST116') {
        // No rows returned, short code is available
        return true
      }
      
      if (error) throw error
      
      // Short code exists
      return false
    } catch (error) {
      console.error('Error checking short code availability:', error)
      return false
    }
  },

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get total links
      const { count: totalLinks } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get total clicks
      const { data: clicksData } = await supabase
        .from('links')
        .select('total_clicks')
        .eq('user_id', user.id)

      const totalClicks = clicksData?.reduce((sum, link) => sum + (link.total_clicks || 0), 0) || 0

      // Get active links
      const { count: activeLinks } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Get recent clicks (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentClicks } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .gte('clicked_at', thirtyDaysAgo.toISOString())
        .in('link_id', 
          await supabase
            .from('links')
            .select('id')
            .eq('user_id', user.id)
            .then(({ data }) => data?.map(link => link.id) || [])
        )

      return {
        totalLinks: totalLinks || 0,
        totalClicks: totalClicks || 0,
        activeLinks: activeLinks || 0,
        recentClicks: recentClicks || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalLinks: 0,
        totalClicks: 0,
        activeLinks: 0,
        recentClicks: 0
      }
    }
  }
}
