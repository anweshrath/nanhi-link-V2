import { supabase } from '../lib/supabase'

export const analyticsService = {
  // Get analytics data for a time range
  async getAnalytics(timeRange = '7d') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24)
          break
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        case '90d':
          startDate.setDate(now.getDate() - 90)
          break
        default:
          startDate.setDate(now.getDate() - 7)
      }

      // Get user's links
      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('id, total_clicks, is_active')
        .eq('user_id', user.id)

      if (linksError) throw linksError

      // Get clicks data for the time range
      const { data: clicks, error: clicksError } = await supabase
        .from('clicks')
        .select('*')
        .in('link_id', links.map(link => link.id))
        .gte('clicked_at', startDate.toISOString())
        .lte('clicked_at', now.toISOString())

      if (clicksError) throw clicksError

      // Calculate analytics
      const totalClicks = clicks?.length || 0
      const uniqueVisitors = new Set(clicks?.map(click => click.ip_address) || []).size
      const activeLinks = links?.filter(link => link.is_active).length || 0

      // Get click trends (daily data for charts)
      const clickTrends = this.calculateClickTrends(clicks || [], timeRange)
      
      // Get top referrers
      const topReferrers = this.calculateTopReferrers(clicks || [])
      
      // Get geographic data
      const geoData = this.calculateGeoData(clicks || [])
      
      // Get device data
      const deviceData = this.calculateDeviceData(clicks || [])

      return {
        totalClicks,
        uniqueVisitors,
        activeLinks,
        clickTrends,
        topReferrers,
        geoData,
        deviceData,
        timeRange
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  },

  // Calculate click trends for charts
  calculateClickTrends(clicks, timeRange) {
    const trends = []
    const now = new Date()
    
    let days = 7
    switch (timeRange) {
      case '24h':
        days = 1
        break
      case '30d':
        days = 30
        break
      case '90d':
        days = 90
        break
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayClicks = clicks.filter(click => {
        const clickDate = new Date(click.clicked_at)
        return clickDate >= date && clickDate < nextDate
      })
      
      trends.push({
        date: date.toISOString().split('T')[0],
        clicks: dayClicks.length
      })
    }
    
    return trends
  },

  // Calculate top referrers
  calculateTopReferrers(clicks) {
    const referrerCounts = {}
    
    clicks.forEach(click => {
      const referrer = click.referrer || 'Direct'
      const domain = this.extractDomain(referrer)
      referrerCounts[domain] = (referrerCounts[domain] || 0) + 1
    })
    
    return Object.entries(referrerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }))
  },

  // Calculate geographic data
  calculateGeoData(clicks) {
    // This would typically use IP geolocation
    // For now, return mock data
    return [
      { country: 'United States', clicks: Math.floor(clicks.length * 0.4) },
      { country: 'United Kingdom', clicks: Math.floor(clicks.length * 0.2) },
      { country: 'Canada', clicks: Math.floor(clicks.length * 0.15) },
      { country: 'Germany', clicks: Math.floor(clicks.length * 0.1) },
      { country: 'France', clicks: Math.floor(clicks.length * 0.08) }
    ]
  },

  // Calculate device data from user agents
  calculateDeviceData(clicks) {
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
    
    clicks.forEach(click => {
      const userAgent = click.user_agent || ''
      if (this.isMobile(userAgent)) {
        deviceCounts.mobile++
      } else if (this.isTablet(userAgent)) {
        deviceCounts.tablet++
      } else {
        deviceCounts.desktop++
      }
    })
    
    return Object.entries(deviceCounts).map(([device, count]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      count,
      percentage: clicks.length > 0 ? Math.round((count / clicks.length) * 100) : 0
    }))
  },

  // Helper function to extract domain from URL
  extractDomain(url) {
    if (!url || url === 'Direct') return 'Direct'
    
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return 'Direct'
    }
  },

  // Helper function to detect mobile devices
  isMobile(userAgent) {
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  },

  // Helper function to detect tablets
  isTablet(userAgent) {
    return /iPad|Android(?!.*Mobile)/i.test(userAgent)
  },

  // Get link-specific analytics
  async getLinkAnalytics(linkId, timeRange = '7d') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24)
          break
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        case '90d':
          startDate.setDate(now.getDate() - 90)
          break
        default:
          startDate.setDate(now.getDate() - 7)
      }

      // Get link data
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('*')
        .eq('id', linkId)
        .eq('user_id', user.id)
        .single()

      if (linkError) throw linkError

      // Get clicks for this link
      const { data: clicks, error: clicksError } = await supabase
        .from('clicks')
        .select('*')
        .eq('link_id', linkId)
        .gte('clicked_at', startDate.toISOString())
        .lte('clicked_at', now.toISOString())

      if (clicksError) throw clicksError

      return {
        link,
        totalClicks: clicks?.length || 0,
        uniqueVisitors: new Set(clicks?.map(click => click.ip_address) || []).size,
        clickTrends: this.calculateClickTrends(clicks || [], timeRange),
        topReferrers: this.calculateTopReferrers(clicks || []),
        geoData: this.calculateGeoData(clicks || []),
        deviceData: this.calculateDeviceData(clicks || [])
      }
    } catch (error) {
      console.error('Error fetching link analytics:', error)
      throw error
    }
  }
}
