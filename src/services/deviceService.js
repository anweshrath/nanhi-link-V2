import UAParser from 'ua-parser-js'

// Device and browser detection service
export const deviceService = {
  // Parse user agent string
  parseUserAgent(userAgent) {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    return {
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || '',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || '',
      device: result.device.type || 'desktop',
      deviceModel: result.device.model || '',
      deviceVendor: result.device.vendor || ''
    }
  },

  // Detect if device is mobile
  isMobile(userAgent) {
    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    return device.type === 'mobile' || device.type === 'tablet'
  },

  // Get device type for analytics
  getDeviceType(userAgent) {
    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    
    if (device.type === 'mobile') return 'mobile'
    if (device.type === 'tablet') return 'tablet'
    return 'desktop'
  },

  // Check if device supports deep links
  supportsDeepLinks(userAgent) {
    const deviceInfo = this.parseUserAgent(userAgent)
    return deviceInfo.os === 'iOS' || deviceInfo.os === 'Android'
  },

  // Generate deep link URL
  generateDeepLink(appScheme, fallbackUrl, userAgent) {
    const deviceInfo = this.parseUserAgent(userAgent)
    
    if (deviceInfo.os === 'iOS') {
      return {
        deepLink: `${appScheme}://`,
        fallback: fallbackUrl,
        storeUrl: 'https://apps.apple.com/app/your-app'
      }
    } else if (deviceInfo.os === 'Android') {
      return {
        deepLink: `${appScheme}://`,
        fallback: fallbackUrl,
        storeUrl: 'https://play.google.com/store/apps/details?id=your.app'
      }
    }

    return {
      deepLink: null,
      fallback: fallbackUrl,
      storeUrl: null
    }
  }
}
