const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')
require('dotenv').config()

const app = express()
const PORT = process.env.API_PORT || 3001

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for API
)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
})
app.use('/api/', limiter)

// API Key authentication middleware
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'MISSING_API_KEY'
    })
  }

  try {
    // Verify API key in database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, api_key')
      .eq('api_key', apiKey)
      .single()

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('API key authentication error:', error)
    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    })
  }
}

// Utility function to generate short codes
const generateShortCode = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Generate API key
app.post('/api/auth/generate-key', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password required',
      code: 'MISSING_CREDENTIALS'
    })
  }

  try {
    // Authenticate user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex')

    // Update user with API key
    const { error: updateError } = await supabase
      .from('users')
      .update({ api_key: apiKey })
      .eq('id', authData.user.id)

    if (updateError) {
      throw updateError
    }

    res.json({
      api_key: apiKey,
      message: 'API key generated successfully'
    })
  } catch (error) {
    console.error('API key generation error:', error)
    res.status(500).json({
      error: 'Failed to generate API key',
      code: 'GENERATION_ERROR'
    })
  }
})

// Create short link
app.post('/api/links', authenticateApiKey, async (req, res) => {
  const {
    url,
    custom_code,
    title,
    description,
    project_id,
    expires_at,
    click_limit,
    password
  } = req.body

  if (!url) {
    return res.status(400).json({
      error: 'URL is required',
      code: 'MISSING_URL'
    })
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    return res.status(400).json({
      error: 'Invalid URL format',
      code: 'INVALID_URL'
    })
  }

  try {
    let shortCode = custom_code

    // Generate short code if not provided
    if (!shortCode) {
      let attempts = 0
      do {
        shortCode = generateShortCode()
        const { data: existing } = await supabase
          .from('links')
          .select('id')
          .eq('short_code', shortCode)
          .single()
        
        if (!existing) break
        attempts++
      } while (attempts < 10)

      if (attempts >= 10) {
        return res.status(500).json({
          error: 'Failed to generate unique short code',
          code: 'CODE_GENERATION_ERROR'
        })
      }
    } else {
      // Check if custom code is available
      const { data: existing } = await supabase
        .from('links')
        .select('id')
        .eq('short_code', shortCode)
        .single()

      if (existing) {
        return res.status(409).json({
          error: 'Short code already exists',
          code: 'CODE_EXISTS'
        })
      }
    }

    // Create link
    const { data: link, error } = await supabase
      .from('links')
      .insert({
        user_id: req.user.id,
        url,
        short_code: shortCode,
        title: title || null,
        description: description || null,
        project_id: project_id || null,
        expires_at: expires_at || null,
        click_limit: click_limit || null,
        password: password || null,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      id: link.id,
      short_code: link.short_code,
      short_url: `${process.env.VITE_APP_URL || 'https://nanhi.link'}/${link.short_code}`,
      url: link.url,
      title: link.title,
      description: link.description,
      created_at: link.created_at,
      expires_at: link.expires_at,
      click_limit: link.click_limit,
      is_active: link.is_active
    })
  } catch (error) {
    console.error('Link creation error:', error)
    res.status(500).json({
      error: 'Failed to create link',
      code: 'CREATION_ERROR'
    })
  }
})

// Get user links
app.get('/api/links', authenticateApiKey, async (req, res) => {
  const { page = 1, limit = 50, project_id, search } = req.query

  try {
    let query = supabase
      .from('links')
      .select(`
        id,
        short_code,
        url,
        title,
        description,
        created_at,
        expires_at,
        click_limit,
        is_active,
        projects (
          id,
          name,
          color
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (project_id) {
      query = query.eq('project_id', project_id)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,url.ilike.%${search}%`)
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: links, error, count } = await query

    if (error) {
      throw error
    }

    // Get click counts for each link
    const linksWithStats = await Promise.all(
      links.map(async (link) => {
        const { count: clickCount } = await supabase
          .from('clicks')
          .select('*', { count: 'exact', head: true })
          .eq('link_id', link.id)

        return {
          ...link,
          short_url: `${process.env.VITE_APP_URL || 'https://nanhi.link'}/${link.short_code}`,
          click_count: clickCount || 0
        }
      })
    )

    res.json({
      links: linksWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Links retrieval error:', error)
    res.status(500).json({
      error: 'Failed to retrieve links',
      code: 'RETRIEVAL_ERROR'
    })
  }
})

// Get specific link
app.get('/api/links/:id', authenticateApiKey, async (req, res) => {
  const { id } = req.params

  try {
    const { data: link, error } = await supabase
      .from('links')
      .select(`
        id,
        short_code,
        url,
        title,
        description,
        created_at,
        expires_at,
        click_limit,
        is_active,
        projects (
          id,
          name,
          color
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (error || !link) {
      return res.status(404).json({
        error: 'Link not found',
        code: 'LINK_NOT_FOUND'
      })
    }

    // Get click count
    const { count: clickCount } = await supabase
      .from('clicks')
      .select('*', { count: 'exact', head: true })
      .eq('link_id', link.id)

    res.json({
      ...link,
      short_url: `${process.env.VITE_APP_URL || 'https://nanhi.link'}/${link.short_code}`,
      click_count: clickCount || 0
    })
  } catch (error) {
    console.error('Link retrieval error:', error)
    res.status(500).json({
      error: 'Failed to retrieve link',
      code: 'RETRIEVAL_ERROR'
    })
  }
})

// Update link
app.put('/api/links/:id', authenticateApiKey, async (req, res) => {
  const { id } = req.params
  const {
    url,
    title,
    description,
    expires_at,
    click_limit,
    password,
    is_active
  } = req.body

  try {
    // Verify link ownership
    const { data: existingLink, error: fetchError } = await supabase
      .from('links')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (fetchError || !existingLink) {
      return res.status(404).json({
        error: 'Link not found',
        code: 'LINK_NOT_FOUND'
      })
    }

    // Validate URL if provided
    if (url) {
      try {
        new URL(url)
      } catch {
        return res.status(400).json({
          error: 'Invalid URL format',
          code: 'INVALID_URL'
        })
      }
    }

    const updateData = {}
    if (url !== undefined) updateData.url = url
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (expires_at !== undefined) updateData.expires_at = expires_at
    if (click_limit !== undefined) updateData.click_limit = click_limit
    if (password !== undefined) updateData.password = password
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: link, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      id: link.id,
      short_code: link.short_code,
      short_url: `${process.env.VITE_APP_URL || 'https://nanhi.link'}/${link.short_code}`,
      url: link.url,
      title: link.title,
      description: link.description,
      created_at: link.created_at,
      expires_at: link.expires_at,
      click_limit: link.click_limit,
      is_active: link.is_active
    })
  } catch (error) {
    console.error('Link update error:', error)
    res.status(500).json({
      error: 'Failed to update link',
      code: 'UPDATE_ERROR'
    })
  }
})

// Delete link
app.delete('/api/links/:id', authenticateApiKey, async (req, res) => {
  const { id } = req.params

  try {
    // Verify link ownership
    const { data: existingLink, error: fetchError } = await supabase
      .from('links')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (fetchError || !existingLink) {
      return res.status(404).json({
        error: 'Link not found',
        code: 'LINK_NOT_FOUND'
      })
    }

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    res.json({
      message: 'Link deleted successfully'
    })
  } catch (error) {
    console.error('Link deletion error:', error)
    res.status(500).json({
      error: 'Failed to delete link',
      code: 'DELETION_ERROR'
    })
  }
})

// Get link analytics
app.get('/api/links/:id/analytics', authenticateApiKey, async (req, res) => {
  const { id } = req.params
  const { period = '7d' } = req.query

  try {
    // Verify link ownership
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id, short_code, title')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (linkError || !link) {
      return res.status(404).json({
        error: 'Link not found',
        code: 'LINK_NOT_FOUND'
      })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
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

    // Get clicks data
    const { data: clicks, error: clicksError } = await supabase
      .from('clicks')
      .select('*')
      .eq('link_id', id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (clicksError) {
      throw clicksError
    }

    // Process analytics data
    const totalClicks = clicks.length
    
    // Group by date
    const clicksByDate = clicks.reduce((acc, click) => {
      const date = new Date(click.created_at).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Group by country
    const clicksByCountry = clicks.reduce((acc, click) => {
      const country = click.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})

    // Group by device
    const clicksByDevice = clicks.reduce((acc, click) => {
      const device = click.device || 'Unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    // Group by referrer
    const clicksByReferrer = clicks.reduce((acc, click) => {
      const referrer = click.referrer || 'Direct'
      acc[referrer] = (acc[referrer] || 0) + 1
      return acc
    }, {})

    res.json({
      link: {
        id: link.id,
        short_code: link.short_code,
        title: link.title
      },
      period,
      total_clicks: totalClicks,
      clicks_by_date: clicksByDate,
      clicks_by_country: clicksByCountry,
      clicks_by_device: clicksByDevice,
      clicks_by_referrer: clicksByReferrer,
      recent_clicks: clicks.slice(-10).map(click => ({
        timestamp: click.created_at,
        country: click.country,
        device: click.device,
        referrer: click.referrer,
        ip: click.ip_address ? click.ip_address.substring(0, 8) + '...' : null
      }))
    })
  } catch (error) {
    console.error('Analytics retrieval error:', error)
    res.status(500).json({
      error: 'Failed to retrieve analytics',
      code: 'ANALYTICS_ERROR'
    })
  }
})

// Get user projects
app.get('/api/projects', authenticateApiKey, async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, color, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get link counts for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const { count: linkCount } = await supabase
          .from('links')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)

        return {
          ...project,
          link_count: linkCount || 0
        }
      })
    )

    res.json({
      projects: projectsWithStats
    })
  } catch (error) {
    console.error('Projects retrieval error:', error)
    res.status(500).json({
      error: 'Failed to retrieve projects',
      code: 'RETRIEVAL_ERROR'
    })
  }
})

// Create project
app.post('/api/projects', authenticateApiKey, async (req, res) => {
  const { name, description, color, destination_url } = req.body

  if (!name || !destination_url) {
    return res.status(400).json({
      error: 'Name and destination URL are required',
      code: 'MISSING_REQUIRED_FIELDS'
    })
  }

  // Validate destination URL
  try {
    new URL(destination_url)
  } catch {
    return res.status(400).json({
      error: 'Invalid destination URL format',
      code: 'INVALID_URL'
    })
  }

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: req.user.id,
        name,
        description: description || null,
        color: color || '#8B5CF6',
        destination_url
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      destination_url: project.destination_url,
      created_at: project.created_at,
      link_count: 0
    })
  } catch (error) {
    console.error('Project creation error:', error)
    res.status(500).json({
      error: 'Failed to create project',
      code: 'CREATION_ERROR'
    })
  }
})

// Bulk create links
app.post('/api/links/bulk', authenticateApiKey, async (req, res) => {
  const { links } = req.body

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({
      error: 'Links array is required',
      code: 'MISSING_LINKS'
    })
  }

  if (links.length > 100) {
    return res.status(400).json({
      error: 'Maximum 100 links per bulk request',
      code: 'TOO_MANY_LINKS'
    })
  }

  try {
    const results = []
    const errors = []

    for (let i = 0; i < links.length; i++) {
      const linkData = links[i]
      
      try {
        // Validate URL
        new URL(linkData.url)

        // Generate short code
        let shortCode = linkData.custom_code
        if (!shortCode) {
          let attempts = 0
          do {
            shortCode = generateShortCode()
            const { data: existing } = await supabase
              .from('links')
              .select('id')
              .eq('short_code', shortCode)
              .single()
            
            if (!existing) break
            attempts++
          } while (attempts < 10)

          if (attempts >= 10) {
            throw new Error('Failed to generate unique short code')
          }
        }

        // Create link
        const { data: link, error } = await supabase
          .from('links')
          .insert({
            user_id: req.user.id,
            url: linkData.url,
            short_code: shortCode,
            title: linkData.title || null,
            description: linkData.description || null,
            project_id: linkData.project_id || null,
            expires_at: linkData.expires_at || null,
            click_limit: linkData.click_limit || null,
            password: linkData.password || null,
            is_active: true
          })
          .select()
          .single()

        if (error) {
          throw error
        }

        results.push({
          index: i,
          success: true,
          link: {
            id: link.id,
            short_code: link.short_code,
            short_url: `${process.env.VITE_APP_URL || 'https://nanhi.link'}/${link.short_code}`,
            url: link.url,
            title: link.title
          }
        })
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
          url: linkData.url
        })
      }
    }

    res.json({
      success_count: results.length,
      error_count: errors.length,
      results,
      errors
    })
  } catch (error) {
    console.error('Bulk creation error:', error)
    res.status(500).json({
      error: 'Failed to process bulk request',
      code: 'BULK_ERROR'
    })
  }
})

// Get user statistics
app.get('/api/stats', authenticateApiKey, async (req, res) => {
  try {
    // Get total links
    const { count: totalLinks } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)

    // Get active links
    const { count: activeLinks } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_active', true)

    // Get total clicks
    const { count: totalClicks } = await supabase
      .from('clicks')
      .select('*', { count: 'exact', head: true })
      .in('link_id', 
        supabase
          .from('links')
          .select('id')
          .eq('user_id', req.user.id)
      )

    // Get total projects
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)

    // Get clicks today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: clicksToday } = await supabase
      .from('clicks')
      .select('*', { count: 'exact', head: true })
      .in('link_id', 
        supabase
          .from('links')
          .select('id')
          .eq('user_id', req.user.id)
      )
      .gte('created_at', today.toISOString())

    res.json({
      total_links: totalLinks || 0,
      active_links: activeLinks || 0,
      total_clicks: totalClicks || 0,
      total_projects: totalProjects || 0,
      clicks_today: clicksToday || 0
    })
  } catch (error) {
    console.error('Stats retrieval error:', error)
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      code: 'STATS_ERROR'
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nanhi.Links API server running on port ${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`)
})

module.exports = app
