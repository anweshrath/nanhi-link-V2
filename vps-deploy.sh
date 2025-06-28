#!/bin/bash

# VPS Deployment Script for nanhi.link
echo "🚀 Deploying Nanhi.Link Redirect Service..."

# Create project directory
mkdir -p /var/www/nanhi-redirect
cd /var/www/nanhi-redirect

# Create package.json
cat > package.json << 'EOF'
{
  "name": "nanhi-redirect-service",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "ua-parser-js": "^1.0.37"
  }
}
EOF

# Create .env file
cat > .env << 'EOF'
SUPABASE_URL=https://bpbbrgsuuaxirkccteuu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwYmJyZ3N1dWF4aXJrY2N0ZXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDc0MzYsImV4cCI6MjA2NjQyMzQzNn0.LPBOUkoCQ3k1xsxVpczYhaEy1VtFT6kvizTkfVqchc4
PORT=3000
EOF

# Create server.js
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';
import UAParser from 'ua-parser-js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for tracking
}));
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate script injection page
function generateScriptInjectionPage(link, destinationUrl) {
  const scripts = link.tracking_scripts
    .filter(script => script.enabled)
    .map(script => {
      let code = script.script || script.code || '';
      
      // Replace dynamic variables
      code = code.replace(/{{DESTINATION_URL}}/g, destinationUrl);
      code = code.replace(/{{SHORT_CODE}}/g, link.short_code);
      code = code.replace(/{{LINK_ID}}/g, link.id);
      
      return code;
    })
    .join('\n');

  const delay = (link.script_delay || 2) * 1000;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${link.cloaking_page_title || 'Redirecting...'}</title>
    <meta name="description" content="${link.cloaking_page_description || 'Please wait while we redirect you...'}">
    <meta name="robots" content="noindex, nofollow">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
        }
        .container {
            max-width: 400px;
        }
        .logo {
            margin-bottom: 20px;
        }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
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
        h1 { margin-bottom: 10px; font-size: 24px; }
        p { opacity: 0.9; }
        .powered-by {
            margin-top: 30px;
            font-size: 12px;
            opacity: 0.7;
        }
        .destination-url {
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
        }
    </style>
    ${link.script_position === 'head' ? `<script>${scripts}</script>` : ''}
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg width="60" height="60" viewBox="0 0 500 500">
                <defs>
                  <path id="topCurve" d="M 80 180 A 170 170 0 0 1 420 180" fill="none"/>
                </defs>
                
                <path d="M 100 250 A 150 150 0 0 1 400 250" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round"/>
                <path d="M 130 250 A 120 120 0 0 1 370 250" fill="none" stroke="#67e8f9" stroke-width="8" stroke-linecap="round"/>
                
                <circle cx="100" cy="250" r="12" fill="#e2e8f0"/>
                <circle cx="200" cy="250" r="8" fill="#22d3ee"/>
                <circle cx="300" cy="250" r="8" fill="#e2e8f0"/>
                <circle cx="400" cy="250" r="12" fill="#22d3ee"/>
                
                <text font-size="48" font-weight="bold" fill="#e2e8f0" font-family="Arial, sans-serif">
                  <textPath href="#topCurve" startOffset="50%" text-anchor="middle">NANHI</textPath>
                </text>
                
                <text x="250" y="380" font-size="36" font-weight="bold" fill="#fbbf24" text-anchor="middle" font-family="Arial, sans-serif">LINK</text>
            </svg>
        </div>
        <div class="spinner"></div>
        <h1>${link.cloaking_page_title || 'Redirecting...'}</h1>
        <p>${link.cloaking_page_description || 'Please wait while we redirect you...'}</p>
        <div class="destination-url">${destinationUrl}</div>
        <div class="powered-by">Powered by Nanhi.Link</div>
    </div>
    
    ${link.script_position === 'body' ? `<script>${scripts}</script>` : ''}
    
    <script>
        // Redirect after delay
        setTimeout(() => {
            window.location.href = '${destinationUrl}';
        }, ${delay});
        
        // Fallback redirect on click
        document.addEventListener('click', () => {
            window.location.href = '${destinationUrl}';
        });
        
        // Track page view
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: '${link.cloaking_page_title || 'Redirecting...'}',
                page_location: window.location.href
            });
        }
        
        // Track Facebook Pixel page view
        if (typeof fbq !== 'undefined') {
            fbq('track', 'PageView');
        }
    </script>
    
    ${link.script_position === 'footer' ? `<script>${scripts}</script>` : ''}
</body>
</html>`;
}

// Main redirect handler
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Get link from database
    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (error || !link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Found - Nanhi.Link</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container { max-width: 400px; }
            h1 { color: #fbbf24; margin-bottom: 20px; }
            .logo { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <svg width="80" height="80" viewBox="0 0 500 500">
                <defs>
                  <path id="topCurve" d="M 80 180 A 170 170 0 0 1 420 180" fill="none"/>
                </defs>
                <path d="M 100 250 A 150 150 0 0 1 400 250" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round"/>
                <path d="M 130 250 A 120 120 0 0 1 370 250" fill="none" stroke="#67e8f9" stroke-width="8" stroke-linecap="round"/>
                <circle cx="100" cy="250" r="12" fill="#e2e8f0"/>
                <circle cx="200" cy="250" r="8" fill="#22d3ee"/>
                <circle cx="300" cy="250" r="8" fill="#e2e8f0"/>
                <circle cx="400" cy="250" r="12" fill="#22d3ee"/>
                <text font-size="48" font-weight="bold" fill="#e2e8f0" font-family="Arial, sans-serif">
                  <textPath href="#topCurve" startOffset="50%" text-anchor="middle">NANHI</textPath>
                </text>
                <text x="250" y="380" font-size="36" font-weight="bold" fill="#fbbf24" text-anchor="middle" font-family="Arial, sans-serif">LINK</text>
              </svg>
            </div>
            <h1>404 - Link Not Found</h1>
            <p>The short link you're looking for doesn't exist or has expired.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Check if link has expired
    if (link.expiration_enabled && link.expiration_date && new Date(link.expiration_date) < new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired - Nanhi.Link</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container { max-width: 400px; }
            h1 { color: #fbbf24; margin-bottom: 20px; }
            .logo { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <svg width="80" height="80" viewBox="0 0 500 500">
                <defs>
                  <path id="topCurve" d="M 80 180 A 170 170 0 0 1 420 180" fill="none"/>
                </defs>
                <path d="M 100 250 A 150 150 0 0 1 400 250" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round"/>
                <path d="M 130 250 A 120 120 0 0 1 370 250" fill="none" stroke="#67e8f9" stroke-width="8" stroke-linecap="round"/>
                <circle cx="100" cy="250" r="12" fill="#e2e8f0"/>
                <circle cx="200" cy="250" r="8" fill="#22d3ee"/>
                <circle cx="300" cy="250" r="8" fill="#e2e8f0"/>
                <circle cx="400" cy="250" r="12" fill="#22d3ee"/>
                <text font-size="48" font-weight="bold" fill="#e2e8f0" font-family="Arial, sans-serif">
                  <textPath href="#topCurve" startOffset="50%" text-anchor="middle">NANHI</textPath>
                </text>
                <text x="250" y="380" font-size="36" font-weight="bold" fill="#fbbf24" text-anchor="middle" font-family="Arial, sans-serif">LINK</text>
              </svg>
            </div>
            <h1>Link Expired</h1>
            <p>This short link has expired and is no longer available.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Check click limit
    if (link.click_limit_enabled && link.click_limit && link.total_clicks >= link.click_limit) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Click Limit Reached - Nanhi.Link</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container { max-width: 400px; }
            h1 { color: #fbbf24; margin-bottom: 20px; }
            .logo { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <svg width="80" height="80" viewBox="0 0 500 500">
                <defs>
                  <path id="topCurve" d="M 80 180 A 170 170 0 0 1 420 180" fill="none"/>
                </defs>
                <path d="M 100 250 A 150 150 0 0 1 400 250" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round"/>
                <path d="M 130 250 A 120 120 0 0 1 370 250" fill="none" stroke="#67e8f9" stroke-width="8" stroke-linecap="round"/>
                <circle cx="100" cy="250" r="12" fill="#e2e8f0"/>
                <circle cx="200" cy="250" r="8" fill="#22d3ee"/>
                <circle cx="300" cy="250" r="8" fill="#e2e8f0"/>
                <circle cx="400" cy="250" r="12" fill="#22d3ee"/>
                <text font-size="48" font-weight="bold" fill="#e2e8f0" font-family="Arial, sans-serif">
                  <textPath href="#topCurve" startOffset="50%" text-anchor="middle">NANHI</textPath>
                </text>
                <text x="250" y="380" font-size="36" font-weight="bold" fill="#fbbf24" text-anchor="middle" font-family="Arial, sans-serif">LINK</text>
              </svg>
            </div>
            <h1>Click Limit Reached</h1>
            <p>This short link has reached its maximum number of clicks.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Parse user agent and get IP
    const userAgent = req.get('User-Agent') || '';
    const parser = new UAParser(userAgent);
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '';
    const referrer = req.get('Referer') || '';

    // Track the click (fire and forget)
    supabase
      .from('clicks')
      .insert({
        link_id: link.id,
        user_agent: userAgent,
        ip_address: clientIP,
        referrer: referrer,
        clicked_at: new Date().toISOString()
      })
      .then(() => {
        // Update click count
        return supabase
          .from('links')
          .update({ total_clicks: link.total_clicks + 1 })
          .eq('id', link.id);
      })
      .catch(err => console.error('Click tracking error:', err));

    // Handle password protection
    if (link.password_protection && link.password) {
      const password = req.query.p;
      if (!password || password !== link.password) {
        return res.status(401).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Password Required - Nanhi.Link</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
              }
              .container { max-width: 400px; }
              input, button { padding: 12px; margin: 8px; font-size: 16px; border-radius: 8px; border: none; }
              input { background: rgba(255,255,255,0.9); color: #1e293b; }
              button { background: #fbbf24; color: #1e293b; cursor: pointer; font-weight: bold; }
              button:hover { background: #f59e0b; }
              .logo { margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <svg width="80" height="80" viewBox="0 0 500 500">
                  <defs>
                    <path id="topCurve" d="M 80 180 A 170 170 0 0 1 420 180" fill="none"/>
                  </defs>
                  <path d="M 100 250 A 150 150 0 0 1 400 250" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round"/>
                  <path d="M 130 250 A 120 120 0 0 1 370 250" fill="none" stroke="#67e8f9" stroke-width="8" stroke-linecap="round"/>
                  <circle cx="100" cy="250" r="12" fill="#e2e8f0"/>
                  <circle cx="200" cy="250" r="8" fill="#22d3ee"/>
                  <circle cx="300" cy="250" r="8" fill="#e2e8f0"/>
                  <circle cx="400" cy="250" r="12" fill="#22d3ee"/>
                  <text font-size="48" font-weight="bold" fill="#e2e8f0" font-family="Arial, sans-serif">
                    <textPath href="#topCurve" startOffset="50%" text-anchor="middle">NANHI</textPath>
                  </text>
                  <text x="250" y="380" font-size="36" font-weight="bold" fill="#fbbf24" text-anchor="middle" font-family="Arial, sans-serif">LINK</text>
                </svg>
              </div>
              <h1>Password Required</h1>
              <p>This link is password protected.</p>
              <form method="GET">
                <input type="password" name="p" placeholder="Enter password" required>
                <br>
                <button type="submit">Access Link</button>
              </form>
            </div>
          </body>
          </html>
        `);
      }
    }

    // Determine final destination URL
    let destinationUrl = link.destination_url;

    // Add UTM parameters if enabled
    if (link.utm_enabled) {
      const url = new URL(destinationUrl);
      if (link.utm_source) url.searchParams.set('utm_source', link.utm_source);
      if (link.utm_medium) url.searchParams.set('utm_medium', link.utm_medium);
      if (link.utm_campaign) url.searchParams.set('utm_campaign', link.utm_campaign);
      if (link.utm_term) url.searchParams.set('utm_term', link.utm_term);
      if (link.utm_content) url.searchParams.set('utm_content', link.utm_content);
      destinationUrl = url.toString();
    }

    // Handle script injection or cloaking
    if (link.script_injection_enabled && link.tracking_scripts && link.tracking_scripts.length > 0) {
      // Generate script injection page
      const scriptPage = generateScriptInjectionPage(link, destinationUrl);
      return res.send(scriptPage);
    } else if (link.cloaking_enabled) {
      // Generate cloaking page without scripts
      const cloakingPage = generateScriptInjectionPage(link, destinationUrl);
      return res.send(cloakingPage);
    }

    // Direct redirect
    res.redirect(301, destinationUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error - Nanhi.Link</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
          }
          .container { max-width: 400px; }
          h1 { color: #ef4444; margin-bottom: 20px; }
          .logo { margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <svg width="80" height="80" viewBox="0 0 500 500">
              <defs>
                <path id="topCurve" d="M 80 180 A 170 170 0 0 1 420 180" fill="none"/>
              </defs>
              <path d="M 100 250 A 150 150 0 0 1 400 250" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round"/>
              <path d="M 130 250 A 120 120 0 0 1 370 250" fill="none" stroke="#67e8f9" stroke-width="8" stroke-linecap="round"/>
              <circle cx="100" cy="250" r="12" fill="#e2e8f0"/>
              <circle cx="200" cy="250" r="8" fill="#22d3ee"/>
              <circle cx="300" cy="250" r="8" fill="#e2e8f0"/>
              <circle cx="400" cy="250" r="12" fill="#22d3ee"/>
              <text font-size="48" font-weight="bold" fill="#e2e8f0" font-family="Arial, sans-serif">
                <textPath href="#topCurve" startOffset="50%" text-anchor="middle">NANHI</textPath>
              </text>
              <text x="250" y="380" font-size="36" font-weight="bold" fill="#fbbf24" text-anchor="middle" font-family="Arial, sans-serif">LINK</text>
            </svg>
          </div>
          <h1>Server Error</h1>
          <p>Something went wrong. Please try again later.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Catch all for root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nanhi.Link - Smart Link Management</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
        .container { max-width: 500px; }
        h1 { color: white; margin-bottom: 20px; font-size: 32px; }
        .logo { margin-bottom: 30px; }
        p { font-size: 18px; opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <svg width="120" height="120" viewBox="0 0 500 500">
            <defs>
              <path id="topCurve" d="M 80 180 A 170 170 0 0 1 420 180" fill="none"/>
            </defs>
            <path d="M 100 250 A 150 150 0 0 1 400 250" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round"/>
            <path d="M 130 250 A 120 120 0 0 1 370 250" fill="none" stroke="#67e8f9" stroke-width="8" stroke-linecap="round"/>
            <circle cx="100" cy="250" r="12" fill="#e2e8f0"/>
            <circle cx="200" cy="250" r="8" fill="#22d3ee"/>
            <circle cx="300" cy="250" r="8" fill="#e2e8f0"/>
            <circle cx="400" cy="250" r="12" fill="#22d3ee"/>
            <text font-size="48" font-weight="bold" fill="#e2e8f0" font-family="Arial, sans-serif">
              <textPath href="#topCurve" startOffset="50%" text-anchor="middle">NANHI</textPath>
            </text>
            <text x="250" y="380" font-size="36" font-weight="bold" fill="#fbbf24" text-anchor="middle" font-family="Arial, sans-serif">LINK</text>
          </svg>
        </div>
        <h1>Nanhi.Link</h1>
        <p>Smart Link Management Platform</p>
        <p>Powerful URL shortening with advanced tracking and analytics</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Nanhi.Link redirect service running on port ${PORT}`);
});
EOF

# Install dependencies
npm install

# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start server.js --name "nanhi-redirect"
pm2 startup
pm2 save

echo "✅ Node.js service deployed and running!"

# Install Nginx
apt install nginx -y

# Create Nginx configuration
cat > /etc/nginx/sites-available/nanhi.link << 'EOF'
server {
    listen 80;
    server_name nanhi.link www.nanhi.link;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/nanhi.link /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo "✅ Nginx configured!"

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

echo "🚀 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure DNS: Point nanhi.link to 194.238.19.150"
echo "2. Run: certbot --nginx -d nanhi.link -d www.nanhi.link"
echo "3. Test: curl http://nanhi.link/health"
EOF

# Make script executable
chmod +x vps-deploy.sh

echo "📋 VPS deployment script created!"
echo ""
echo "🚀 Run this on your VPS:"
echo "1. Copy this script to your VPS"
echo "2. Run: chmod +x vps-deploy.sh && ./vps-deploy.sh"
