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

// Trust proxy for correct IP detection
app.set('trust proxy', true);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nanhi-link-redirect',
    version: '1.0.0'
  });
});

// Generate script injection page
function generateScriptInjectionPage(link, destinationUrl) {
  const scripts = (link.tracking_scripts || [])
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

// Get client IP address
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         '127.0.0.1';
}

// Main redirect handler
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    console.log(`Processing redirect for short code: ${shortCode}`);
    
    // Get link from database
    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(404).send(generateErrorPage('Link Not Found', 'The short link you\'re looking for doesn\'t exist or has expired.'));
    }

    if (!link) {
      console.log('Link not found for short code:', shortCode);
      return res.status(404).send(generateErrorPage('Link Not Found', 'The short link you\'re looking for doesn\'t exist or has expired.'));
    }

    console.log('Link found:', { id: link.id, destination: link.destination_url });

    // Check if link has expired
    if (link.expiration_enabled && link.expiration_date && new Date(link.expiration_date) < new Date()) {
      console.log('Link expired:', link.expiration_date);
      return res.status(410).send(generateErrorPage('Link Expired', 'This short link has expired and is no longer available.'));
    }

    // Check click limit
    if (link.click_limit_enabled && link.click_limit && link.total_clicks >= link.click_limit) {
      console.log('Click limit reached:', link.total_clicks, '>=', link.click_limit);
      return res.status(410).send(generateErrorPage('Click Limit Reached', 'This short link has reached its maximum number of clicks.'));
    }

    // Parse user agent and get IP
    const userAgent = req.get('User-Agent') || '';
    const parser = new UAParser(userAgent);
    const clientIP = getClientIP(req);
    const referrer = req.get('Referer') || '';

    console.log('Client info:', { ip: clientIP, userAgent: userAgent.substring(0, 50) });

    // Track the click (fire and forget)
    const clickData = {
      link_id: link.id,
      user_agent: userAgent,
      ip_address: clientIP,
      referrer: referrer,
      clicked_at: new Date().toISOString()
    };

    // Insert click record
    supabase
      .from('clicks')
      .insert(clickData)
      .then(({ error: clickError }) => {
        if (clickError) {
          console.error('Click tracking error:', clickError);
        } else {
          console.log('Click tracked successfully');
        }
      });

    // Handle password protection
    if (link.password_protection && link.password) {
      const password = req.query.p;
      if (!password || password !== link.password) {
        console.log('Password protection triggered');
        return res.status(401).send(generatePasswordPage(shortCode));
      }
    }

    // Determine final destination URL
    let destinationUrl = link.destination_url || link.original_url;
    
    if (!destinationUrl) {
      console.error('No destination URL found for link:', link.id);
      return res.status(500).send(generateErrorPage('Configuration Error', 'This link is not properly configured.'));
    }

    // Add UTM parameters if enabled
    if (link.utm_enabled) {
      try {
        const url = new URL(destinationUrl);
        if (link.utm_source) url.searchParams.set('utm_source', link.utm_source);
        if (link.utm_medium) url.searchParams.set('utm_medium', link.utm_medium);
        if (link.utm_campaign) url.searchParams.set('utm_campaign', link.utm_campaign);
        if (link.utm_term) url.searchParams.set('utm_term', link.utm_term);
        if (link.utm_content) url.searchParams.set('utm_content', link.utm_content);
        destinationUrl = url.toString();
        console.log('UTM parameters added');
      } catch (urlError) {
        console.error('Error adding UTM parameters:', urlError);
      }
    }

    console.log('Final destination URL:', destinationUrl);

    // Handle script injection or cloaking
    if (link.script_injection_enabled && link.tracking_scripts && link.tracking_scripts.length > 0) {
      console.log('Generating script injection page');
      const scriptPage = generateScriptInjectionPage(link, destinationUrl);
      return res.send(scriptPage);
    } else if (link.cloaking_enabled) {
      console.log('Generating cloaking page');
      const cloakingPage = generateScriptInjectionPage(link, destinationUrl);
      return res.send(cloakingPage);
    }

    // Direct redirect
    console.log('Performing direct redirect to:', destinationUrl);
    res.redirect(301, destinationUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send(generateErrorPage('Server Error', 'Something went wrong. Please try again later.'));
  }
});

// Generate error page
function generateErrorPage(title, message) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - Nanhi.Link</title>
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
        <h1>${title}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}

// Generate password page
function generatePasswordPage(shortCode) {
  return `
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
  `;
}

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

// Debug endpoint to test database connection
app.get('/debug/db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      return res.json({ 
        status: 'error', 
        error: error.message,
        supabase_url: process.env.SUPABASE_URL ? 'configured' : 'missing',
        supabase_key: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing'
      });
    }
    
    res.json({ 
      status: 'ok', 
      database: 'connected',
      supabase_url: process.env.SUPABASE_URL ? 'configured' : 'missing',
      supabase_key: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing'
    });
  } catch (error) {
    res.json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Nanhi.Link redirect service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database debug: http://localhost:${PORT}/debug/db`);
});
