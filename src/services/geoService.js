// Geo-targeting service for IP-based location detection
export const geoService = {
  // Get user's location from IP
  async getLocationFromIP(ip) {
    try {
      // Using ipapi.co for IP geolocation (free tier)
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await response.json()
      
      return {
        country: data.country_name,
        countryCode: data.country_code,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone
      }
    } catch (error) {
      console.error('Error getting location from IP:', error)
      return null
    }
  },

  // Get user's IP address
  async getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error getting user IP:', error)
      return null
    }
  },

  // Check if user matches geo-targeting rules
  checkGeoTargeting(userLocation, geoRules) {
    if (!geoRules || !userLocation) return true

    const { allowedCountries, blockedCountries, allowedRegions, blockedRegions } = geoRules

    // Check blocked countries first
    if (blockedCountries && blockedCountries.includes(userLocation.countryCode)) {
      return false
    }

    // Check allowed countries
    if (allowedCountries && allowedCountries.length > 0) {
      if (!allowedCountries.includes(userLocation.countryCode)) {
        return false
      }
    }

    // Check blocked regions
    if (blockedRegions && blockedRegions.includes(userLocation.region)) {
      return false
    }

    // Check allowed regions
    if (allowedRegions && allowedRegions.length > 0) {
      if (!allowedRegions.includes(userLocation.region)) {
        return false
      }
    }

    return true
  },

  // Get redirect URL based on geo-targeting
  getGeoRedirectUrl(userLocation, geoRules, defaultUrl) {
    if (!geoRules || !userLocation) return defaultUrl

    const { redirectRules } = geoRules

    if (redirectRules) {
      // Check country-specific redirects
      if (redirectRules[userLocation.countryCode]) {
        return redirectRules[userLocation.countryCode]
      }

      // Check region-specific redirects
      if (redirectRules[userLocation.region]) {
        return redirectRules[userLocation.region]
      }
    }

    return defaultUrl
  }
}
