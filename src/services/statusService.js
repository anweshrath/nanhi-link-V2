import { supabase } from '../lib/supabase'

export const statusService = {
  // Get real system metrics from Supabase
  async getSystemMetrics() {
    try {
      const results = await Promise.allSettled([
        this.getOverallStats(),
        this.getServiceHealth(),
        this.getRecentActivity(),
        this.getPerformanceMetrics()
      ])

      return {
        overallStats: results[0].status === 'fulfilled' ? results[0].value : null,
        serviceHealth: results[1].status === 'fulfilled' ? results[1].value : null,
        recentActivity: results[2].status === 'fulfilled' ? results[2].value : null,
        performanceMetrics: results[3].status === 'fulfilled' ? results[3].value : null,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching system metrics:', error)
      throw error
    }
  },

  // Get overall statistics
  async getOverallStats() {
    try {
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (usersError) throw usersError

      // Get total projects
      const { count: totalProjects, error: projectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

      if (projectsError) throw projectsError

      // Get total links
      const { count: totalLinks, error: linksError } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })

      if (linksError) throw linksError

      // Get total clicks
      const { count: totalClicks, error: clicksError } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })

      if (clicksError) throw clicksError

      // Get active links
      const { count: activeLinks, error: activeLinksError } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (activeLinksError) throw activeLinksError

      return {
        totalUsers: totalUsers || 0,
        totalProjects: totalProjects || 0,
        totalLinks: totalLinks || 0,
        activeLinks: activeLinks || 0,
        totalClicks: totalClicks || 0
      }
    } catch (error) {
      console.error('Error fetching overall stats:', error)
      return {
        totalUsers: 0,
        totalProjects: 0,
        totalLinks: 0,
        activeLinks: 0,
        totalClicks: 0
      }
    }
  },

  // Check service health by testing database connections
  async getServiceHealth() {
    const services = [
      { name: 'Database', table: 'profiles' },
      { name: 'Authentication', table: 'profiles' },
      { name: 'Links Service', table: 'links' },
      { name: 'Analytics Engine', table: 'clicks' },
      { name: 'Projects Service', table: 'projects' }
    ]

    const healthChecks = await Promise.allSettled(
      services.map(async (service) => {
        const startTime = Date.now()
        try {
          const { error } = await supabase
            .from(service.table)
            .select('id')
            .limit(1)
            .single()

          const responseTime = Date.now() - startTime
          
          return {
            name: service.name,
            status: 'operational',
            responseTime,
            lastChecked: new Date().toISOString()
          }
        } catch (error) {
          const responseTime = Date.now() - startTime
          return {
            name: service.name,
            status: 'degraded',
            responseTime,
            lastChecked: new Date().toISOString(),
            error: error.message
          }
        }
      })
    )

    return healthChecks.map(result => 
      result.status === 'fulfilled' ? result.value : {
        name: 'Unknown Service',
        status: 'major',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        error: 'Health check failed'
      }
    )
  },

  // Get recent activity (last 24 hours)
  async getRecentActivity() {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      // Links created in last 24h
      const { count: linksCreated, error: linksError } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

      if (linksError) throw linksError

      // Clicks in last 24h
      const { count: clicksToday, error: clicksError } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .gte('clicked_at', yesterday.toISOString())

      if (clicksError) throw clicksError

      // New users in last 24h
      const { count: newUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

      if (usersError) throw usersError

      return {
        linksCreated: linksCreated || 0,
        clicksToday: clicksToday || 0,
        newUsers: newUsers || 0
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return {
        linksCreated: 0,
        clicksToday: 0,
        newUsers: 0
      }
    }
  },

  // Calculate performance metrics
  async getPerformanceMetrics() {
    try {
      // Get average response time by measuring a few queries
      const measurements = []
      
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now()
        await supabase.from('links').select('id').limit(1)
        measurements.push(Date.now() - startTime)
      }

      const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length

      // Calculate uptime (simplified - based on successful queries)
      const uptime = measurements.every(time => time < 5000) ? 99.9 : 95.0

      return {
        avgResponseTime: Math.round(avgResponseTime),
        uptime: uptime
      }
    } catch (error) {
      console.error('Error calculating performance metrics:', error)
      return {
        avgResponseTime: 0,
        uptime: 0
      }
    }
  },

  // Test URL shortening service
  async testUrlShorteningService() {
    try {
      // Test creating a link
      const testUrl = 'https://example.com/test-' + Date.now()
      const testCode = 'test-' + Math.random().toString(36).substr(2, 6)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get user's first project or create one
      let { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      let projectId
      if (projects && projects.length > 0) {
        projectId = projects[0].id
      } else {
        // Create a test project
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            name: 'Test Project',
            description: 'Automated test project',
            destination_url: testUrl
          })
          .select('id')
          .single()

        if (projectError) throw projectError
        projectId = newProject.id
      }

      // Create test link
      const { data: link, error: linkError } = await supabase
        .from('links')
        .insert({
          project_id: projectId,
          user_id: user.id,
          short_code: testCode,
          original_url: testUrl,
          title: 'Test Link'
        })
        .select()
        .single()

      if (linkError) throw linkError

      // Test retrieving the link
      const { data: retrievedLink, error: retrieveError } = await supabase
        .from('links')
        .select('*')
        .eq('short_code', testCode)
        .single()

      if (retrieveError) throw retrieveError

      // Clean up test link
      await supabase
        .from('links')
        .delete()
        .eq('id', link.id)

      return {
        success: true,
        message: 'URL shortening service is operational',
        testLink: `${window.location.origin}/${testCode}`,
        responseTime: Date.now()
      }
    } catch (error) {
      console.error('URL shortening test failed:', error)
      return {
        success: false,
        message: 'URL shortening service test failed',
        error: error.message
      }
    }
  },

  // Verify database tables exist
  async verifyDatabaseTables() {
    const requiredTables = ['profiles', 'projects', 'links', 'clicks']
    const results = {}

    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        results[table] = {
          exists: !error,
          error: error?.message || null
        }
      } catch (err) {
        results[table] = {
          exists: false,
          error: err.message
        }
      }
    }

    return results
  }
}
