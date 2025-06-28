// UTM parameter management service
export const utmService = {
  // Parse UTM parameters from URL
  parseUTMFromUrl(url) {
    try {
      const urlObj = new URL(url)
      return {
        utm_source: urlObj.searchParams.get('utm_source'),
        utm_medium: urlObj.searchParams.get('utm_medium'),
        utm_campaign: urlObj.searchParams.get('utm_campaign'),
        utm_term: urlObj.searchParams.get('utm_term'),
        utm_content: urlObj.searchParams.get('utm_content')
      }
    } catch (error) {
      console.error('Error parsing UTM parameters:', error)
      return {}
    }
  },

  // Build URL with UTM parameters
  buildUrlWithUTM(baseUrl, utmParams) {
    try {
      const url = new URL(baseUrl)
      
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value && value.trim()) {
          url.searchParams.set(key, value.trim())
        }
      })

      return url.toString()
    } catch (error) {
      console.error('Error building URL with UTM:', error)
      return baseUrl
    }
  },

  // Generate UTM parameters for campaign
  generateCampaignUTM(campaign, medium = 'link', source = 'sureto.click') {
    return {
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign.toLowerCase().replace(/\s+/g, '_'),
      utm_term: '',
      utm_content: ''
    }
  },

  // Validate UTM parameters
  validateUTMParams(utmParams) {
    const errors = []
    
    if (utmParams.utm_source && utmParams.utm_source.length > 100) {
      errors.push('UTM Source must be less than 100 characters')
    }
    
    if (utmParams.utm_medium && utmParams.utm_medium.length > 100) {
      errors.push('UTM Medium must be less than 100 characters')
    }
    
    if (utmParams.utm_campaign && utmParams.utm_campaign.length > 100) {
      errors.push('UTM Campaign must be less than 100 characters')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Get UTM analytics for links
  async getUTMAnalytics(linkIds) {
    try {
      const { data, error } = await supabase
        .from('clicks')
        .select('link_id, created_at')
        .in('link_id', linkIds)

      if (error) throw error

      // Group by UTM parameters (would need to join with links table)
      // This is a simplified version - in production you'd want more detailed analytics
      return data
    } catch (error) {
      console.error('Error getting UTM analytics:', error)
      throw error
    }
  }
}
