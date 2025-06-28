const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3001

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bpbbrgsuuaxirkccteuu.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwYmJyZ3N1dWF4aXJrY2N0ZXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDc0MzYsImV4cCI6MjA2NjQyMzQzNn0.LPBOUkoCQ3k1xsxVpczYhaEy1VtFT6kvizTkfVqchc4'

const supabase = createClient(supabaseUrl, supabaseKey)

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for tracking
}))
app.use(cors())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})
app.use(limiter)

// Helper function to detect device info
function getDeviceInfo(userAgent) {
  const ua = userAgent || ''
  
  let device = 'Desktop'
  let browser = 'Unknown'
  let os = 'Unknown'

  // Device detection
  if (/Mobile|Android|iPhone|iPad/.test(ua)) {
    device = /iPad/.test(ua) ? 'Tablet' : 'Mobile'
  }

  // Browser detection
  if (/Chrome/.test(ua)) browser = 'Chrome'
  else if (/Firefox/.test(ua)) browser = 'Firefox'
  else if (/Safari/.test(ua)) browser = 'Safari'
  else if (/Edge/.test(ua)) browser = 'Edge'

  // OS detection
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad/.test(ua)) os = 'iOS'

  return { device, browser, os }
}

// Helper function to get location from IP (mock implementation)
function getLocationFromIP(ip) {
  // In production, use a service like ipapi.co, ipgeolocation.io, etc.
  return {
    country: 'Unknown',
    city: 'Unknown'
  }
}

// Generate tracking scripts for integrations
async function generateTrackingScripts(linkId, userId) {
  try {
    // Get active integrations for the user
    const { data: integrations, error } = await supabase
      .from('user_integrations')
      .select('integration_type, config')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error

    let scripts = ''

    for (const integration of integrations || []) {
      switch (integration.integration_type) {
        case 'google_analytics':
          if (integration.config?.measurement_id) {
            scripts += `
              <!-- Google Analytics 4 -->
              <script async src="https://www.googletagmanager.com/gtag/js?id=${integration.config.measurement_id}"></script>
              <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${integration.config.measurement_id}');
                
                gtag('event', 'link_click', {
                  'custom_parameter': 'nanhi_link',
                  'link_id': '${linkId}',
                  'event_category': 'engagement',
                  'event_label': 'short_link_redirect'
                });
              </script>
            `
          }
          break
        
        case 'facebook_pixel':
          if (integration.config?.pixel_id) {
            scripts += `
              <!-- Facebook Pixel -->
              <script>
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                
                fbq('init', '${integration.config.pixel_id}');
                fbq('track', 'PageView');
                
                fbq('trackCustom', 'LinkClick', {
                  link_id: '${linkId}',
                  source: 'nanhi_link'
                });
              </script>
              <noscript>
                <img height="1" width="1" style="display:none" 
                     src="https://www.facebook.com/tr?id=${integration.config.pixel_id}&ev=PageView&noscript=1" />
              </noscript>
            `
          }
          break
      }
    }

    return scripts
  } catch (error) {
    console.error('Error generating tracking scripts:', error)
    return ''
  }
}

// Send webhook notifications
async function sendWebhookNotifications(linkId, userId, clickData) {
  try {
    // Get webhook integrations
    const { data: integrations, error } = await supabase
      .from('user_integrations')
      .select('config')
      .eq('user_id', userId)
      .eq('integration_type', 'webhooks')
      .eq('is_active', true)

    if (error) throw error

    for (const integration of integrations || []) {
      const { webhook_url, secret } = integration.config || {}
      if (!webhook_url) continue

      const payload = {
        event: 'link_click',
        link_id: linkId,
        timestamp: new Date().toISOString(),
        data: clickData
      }

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Nanhi.Link-Webhook/1.0'
      }

      if (secret) {
        // Add signature for webhook verification
        const crypto = require('crypto')
        const signature = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(payload))
          .digest('hex')
        headers['X-Nanhi-Signature'] = `sha256=${signature}`
      }

      try {
        const fetch = (await import('node-fetch')).default
        await fetch(webhook_url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        })
      } catch (webhookError) {
        console.error('Webhook delivery failed:', webhookError)
      }
    }
  } catch (error) {
    console.error('Error sending webhook notifications:', error)
  }
}

// Main redirect route
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params
    
    // Get link from database
    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .single()

    if (error || !link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Found - Nanhi.Link</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                   text-align: center; padding: 50px; background: #f8fafc; }
            .container { max-width: 500px; margin: 0 auto; background: white; 
                        padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #e53e3e; margin-bottom: 20px; }
            p { color: #718096; margin-bottom: 30px; }
            a { color: #805ad5; text-decoration: none; font-weight: 500; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔗 Link Not Found</h1>
            <p>The short link you're looking for doesn't exist or has been removed.</p>
            <a href="https://nanhi.link">Create your own short links →</a>
          </div>
        </body>
        </html>
      `)
    }

    // Check if link is expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired - Nanhi.Link</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                   text-align: center; padding: 50px; background: #f8fafc; }
            .container { max-width: 500px; margin: 0 auto; background: white; 
                        padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #d69e2e; margin-bottom: 20px; }
            p { color: #718096; margin-bottom: 30px; }
            a { color: #805ad5; text-decoration: none; font-weight: 500; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⏰ Link Expired</h1>
            <p>This short link has expired and is no longer available.</p>
            <a href="https://nanhi.link">Create your own short links →</a>
          </div>
        </body>
        </html>
      `)
    }

    // Get client info
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown'
    const userAgent = req.get('User-Agent') || ''
    const referer = req.get('Referer') || null
    const deviceInfo = getDeviceInfo(userAgent)
    const locationInfo = getLocationFromIP(clientIP)

    // Record click
    const clickData = {
      link_id: link.id,
      ip_address: clientIP,
      user_agent: userAgent,
      referer: referer,
      country: locationInfo.country,
      city: locationInfo.city,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os
    }

    const { data: clickRecord, error: clickError } = await supabase
      .from('clicks')
      .insert(clickData)
      .select()
      .single()

    if (clickError) {
      console.error('Error recording click:', clickError)
    }

    // Send webhook notifications asynchronously
    sendWebhookNotifications(link.id, link.user_id, {
      ...clickData,
      click_id: clickRecord?.id,
      timestamp: clickRecord?.created_at
    }).catch(error => {
      console.error('Webhook notification failed:', error)
    })

    // Generate tracking scripts
    const trackingScripts = await generateTrackingScripts(link.id, link.user_id)

    // Get link-level tracking scripts
    let linkTrackingScripts = ''
    if (link.script_injection_enabled && link.tracking_scripts && Array.isArray(link.tracking_scripts)) {
      linkTrackingScripts = link.tracking_scripts
        .filter(script => script.enabled !== false)
        .map(script => script.script || script.code || '')
        .join('\n')
    }

    // Combine all scripts
    const allScripts = [trackingScripts, linkTrackingScripts].filter(Boolean).join('\n')

    // If no tracking scripts, redirect immediately
    if (!allScripts.trim()) {
      return res.redirect(302, link.original_url)
    }

    // Return intermediate page with tracking
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting... - Nanhi.Link</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="refresh" content="${link.script_delay || 2};url=${link.original_url}">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            text-align: center; padding: 50px; background: #f8fafc; margin: 0;
          }
          .container { 
            max-width: 500px; margin: 0 auto; background: white; 
            padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          }
          .spinner { 
            border: 3px solid #e2e8f0; border-top: 3px solid #805ad5; 
            border-radius: 50%; width: 40px; height: 40px; 
            animation: spin 1s linear infinite; margin: 20px auto; 
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h1 { color: #2d3748; margin-bottom: 10px; }
          p { color: #718096; margin-bottom: 20px; }
          .url { color: #805ad5; font-weight: 500; word-break: break-all; }
        </style>
        ${link.script_position === 'head' ? allScripts : ''}
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h1>🔗 Redirecting...</h1>
          <p>Taking you to:</p>
          <p class="url">${link.original_url}</p>
          <p><small>Powered by <a href="https://nanhi.link" style="color: #805ad5; text-decoration: none;">Nanhi.Link</a></small></p>
        </div>
        ${link.script_position === 'body' ? `<script>${allScripts}</script>` : ''}
        <script>
          // Fallback redirect after delay
          setTimeout(function() {
            window.location.href = '${link.original_url}';
          }, ${(link.script_delay || 2) * 1000});
        </script>
        ${link.script_position === 'footer' ? `<script>${allScripts}</script>` : ''}
      </body>
      </html>
    `)

  } catch (error) {
    console.error('Redirect error:', error)
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Nanhi.Link</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                 text-align: center; padding: 50px; background: #f8fafc; }
          .container { max-width: 500px; margin: 0 auto; background: white; 
                      padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #e53e3e; margin-bottom: 20px; }
          p { color: #718096; margin-bottom: 30px; }
          a { color: #805ad5; text-decoration: none; font-weight: 500; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Something went wrong</h1>
          <p>We encountered an error while processing your request.</p>
          <a href="https://nanhi.link">Go to Nanhi.Link →</a>
        </div>
      </body>
      </html>
    `)
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(port, () => {
  console.log(`🔗 Nanhi.Link redirect server running on port ${port}`)
})
