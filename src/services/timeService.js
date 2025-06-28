// Time-based targeting service
export const timeService = {
  // Check if current time matches targeting rules
  checkTimeTargeting(timeRules) {
    if (!timeRules) return true

    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentDate = now.toISOString().split('T')[0]

    // Check if link has expired
    if (timeRules.expiresAt) {
      const expiryDate = new Date(timeRules.expiresAt)
      if (now > expiryDate) {
        return false
      }
    }

    // Check if link is not yet active
    if (timeRules.startsAt) {
      const startDate = new Date(timeRules.startsAt)
      if (now < startDate) {
        return false
      }
    }

    // Check day of week restrictions
    if (timeRules.allowedDays && timeRules.allowedDays.length > 0) {
      if (!timeRules.allowedDays.includes(currentDay)) {
        return false
      }
    }

    // Check time of day restrictions
    if (timeRules.allowedHours) {
      const { start, end } = timeRules.allowedHours
      if (start !== undefined && end !== undefined) {
        if (start <= end) {
          // Same day range (e.g., 9 AM to 5 PM)
          if (currentHour < start || currentHour > end) {
            return false
          }
        } else {
          // Overnight range (e.g., 10 PM to 6 AM)
          if (currentHour < start && currentHour > end) {
            return false
          }
        }
      }
    }

    // Check timezone-specific rules
    if (timeRules.timezone) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const targetTime = new Date().toLocaleString('en-US', { timeZone: timeRules.timezone })
      const targetHour = new Date(targetTime).getHours()
      
      if (timeRules.timezoneHours) {
        const { start, end } = timeRules.timezoneHours
        if (start !== undefined && end !== undefined) {
          if (start <= end) {
            if (targetHour < start || targetHour > end) {
              return false
            }
          } else {
            if (targetHour < start && targetHour > end) {
              return false
            }
          }
        }
      }
    }

    return true
  },

  // Get time-based redirect URL
  getTimeRedirectUrl(timeRules, defaultUrl) {
    if (!timeRules || !timeRules.timeBasedRedirects) {
      return defaultUrl
    }

    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()

    // Check for day-specific redirects
    if (timeRules.timeBasedRedirects.byDay && timeRules.timeBasedRedirects.byDay[currentDay]) {
      return timeRules.timeBasedRedirects.byDay[currentDay]
    }

    // Check for hour-specific redirects
    if (timeRules.timeBasedRedirects.byHour && timeRules.timeBasedRedirects.byHour[currentHour]) {
      return timeRules.timeBasedRedirects.byHour[currentHour]
    }

    return defaultUrl
  },

  // Generate time targeting options
  generateTimeOptions() {
    return {
      days: [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' }
      ],
      hours: Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: `${i.toString().padStart(2, '0')}:00`
      })),
      timezones: [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney'
      ]
    }
  },

  // Validate time targeting rules
  validateTimeRules(timeRules) {
    const errors = []

    if (timeRules.expiresAt) {
      const expiryDate = new Date(timeRules.expiresAt)
      if (isNaN(expiryDate.getTime())) {
        errors.push('Invalid expiry date format')
      } else if (expiryDate <= new Date()) {
        errors.push('Expiry date must be in the future')
      }
    }

    if (timeRules.startsAt) {
      const startDate = new Date(timeRules.startsAt)
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date format')
      }
    }

    if (timeRules.allowedHours) {
      const { start, end } = timeRules.allowedHours
      if (start < 0 || start > 23 || end < 0 || end > 23) {
        errors.push('Hours must be between 0 and 23')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
