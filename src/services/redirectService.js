import { geoService } from './geoService'
import { timeService } from './timeService'
import { deviceService } from './deviceService'
import { snippetService } from './snippetService'
import { linkService } from './linkService'

// Main redirect service that handles all targeting logic
export const redirectService = {
  // Process link redirect with all targeting rules
  async processRedirect(shortCode, requestData) {
    try {
      // Get link data
      const link = await linkService.getLinkByShortCode(shortCode)
      if (!link) {
        throw new Error('Link not found')
      }

      // Check if link is active
      if (!link.is_active) {
        throw new Error('Link is inactive')
      }

      // Check password protection
      if (link.password && requestData.password !== link.password) {
        return {
          requiresPassword: true,
          link: { title: link.title }
        }
      }

      // Check click limit
      if (link.click_limit && link.total_clicks >= link.click_limit) {
        throw new Error('Link has reached its click limit')
      }

      // Get user location for geo-targeting
      let userLocation = null
      if (link.geo_targeting || requestData.needsLocation) {
        userLocation = await geoService.getLocationFromIP(requestData.ipAddress)
      }

      // Check geo-targeting rules
      if (link.geo_targeting) {
        const geoAllowed = geoService.checkGeoTargeting(userLocation, link.geo_targeting)
        if (!geoAllowed) {
          throw new Error('Access denied from your location')
        }
      }

      // Check time-based targeting
      if (link.time_targeting) {
        const timeAllowed = timeService.checkTimeTargeting(link.time_targeting)
        if (!timeAllowed) {
          throw new Error('Link is not available at this time')
        }
      }

      // Parse user agent for device detection
      const deviceInfo = deviceService.parseUserAgent(requestData.userAgent)

      // Determine final destination URL
      let destinationUrl = link.original_url

      // Check for rotation URLs
      if (link.link_rotations && link.link_rotations.length > 0) {
        const rotationUrl = await this.getRotationUrl(link.id)
        if (rotationUrl) {
          destinationUrl = rotationUrl
        }
      }

      // Apply geo-based redirects
      if (link.geo_targeting && userLocation) {
        const geoUrl = geoService.getGeoRedirectUrl(userLocation, link.geo_targeting, destinationUrl)
        if (geoUrl !== destinationUrl) {
          destinationUrl = geoUrl
        }
      }

      // Apply time-based redirects
      if (link.time_targeting) {
        const timeUrl = timeService.getTimeRedirectUrl(link.time_targeting, destinationUrl)
        if (timeUrl !== destinationUrl) {
          destinationUrl = timeUrl
        }
      }

      // Handle deep links for mobile devices
      if (link.deep_link_config && deviceService.supportsDeepLinks(requestData.userAgent)) {
        const deepLinkInfo = deviceService.generateDeepLink(
          link.deep_link_config.scheme,
          destinationUrl,
          requestData.userAgent
        )
        
        if (deepLinkInfo.deepLink) {
          return {
            type: 'deep_link',
            deepLink: deepLinkInfo.deepLink,
            fallback: deepLinkInfo.fallback,
            storeUrl: deepLinkInfo.storeUrl
          }
        }
      }

      // Record click analytics
      await linkService.recordClick(link.id, {
        ipAddress: requestData.ipAddress,
        userAgent: requestData.userAgent,
        referer: requestData.referer,
        country: userLocation?.country,
        city: userLocation?.city,
        deviceType: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os
      })

      // Handle cloaking
      if (link.cloaking_enabled && link.tracking_snippets) {
        const cloakingPage = snippetService.generateCloakingPage(
          link.tracking_snippets,
          destinationUrl,
          link.title
        )
        
        return {
          type: 'cloaking',
          html: cloakingPage,
          finalUrl: destinationUrl
        }
      }

      // Standard redirect
      return {
        type: 'redirect',
        url: destinationUrl,
        link: {
          title: link.title,
          description: link.description
        }
      }

    } catch (error) {
      console.error('Error processing redirect:', error)
      throw error
    }
  },

  // Get rotation URL using database function
  async getRotationUrl(linkId) {
    try {
      const { data, error } = await supabase.rpc('get_rotation_url', { link_id: linkId })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting rotation URL:', error)
      return null
    }
  },

  // Generate redirect page for password protection
  generatePasswordPage(shortCode, title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Required - ${title}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5a6fd8;
        }
        .error {
            color: #e74c3c;
            text-align: center;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Password Required</h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
            This link is password protected. Please enter the password to continue.
        </p>
        <form id="passwordForm">
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Access Link</button>
        </form>
        <div id="error" class="error" style="display: none;"></div>
    </div>
    
    <script>
        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');
            
            try {
                const response = await fetch('/api/redirect/${shortCode}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    window.location.href = result.url;
                } else {
                    errorDiv.textContent = result.error || 'Invalid password';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                errorDiv.textContent = 'An error occurred. Please try again.';
                errorDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>`
  },

  // Generate deep link redirect page
  generateDeepLinkPage(deepLink, fallback, storeUrl, title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opening ${title}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .container {
            max-width: 400px;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .buttons {
            margin-top: 30px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 8px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s;
        }
        .btn-primary {
            background: #007bff;
            color: white;
        }
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h2>Opening in App...</h2>
        <p>If the app doesn't open automatically, you can:</p>
        <div class="buttons">
            <a href="${fallback}" class="btn btn-primary">Open in Browser</a>
            ${storeUrl ? `<a href="${storeUrl}" class="btn btn-secondary">Download App</a>` : ''}
        </div>
    </div>
    
    <script>
        // Try to open deep link
        window.location.href = '${deepLink}';
        
        // Fallback after 3 seconds
        setTimeout(() => {
            window.location.href = '${fallback}';
        }, 3000);
    </script>
</body>
</html>`
  }
}
