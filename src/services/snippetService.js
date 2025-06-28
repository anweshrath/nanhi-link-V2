export const snippetService = {
  // Pre-built tracking templates
  templates: {
    google_analytics: {
      name: 'Google Analytics 4',
      code: `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id={{GA_MEASUREMENT_ID}}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{GA_MEASUREMENT_ID}}');
  
  // Track the redirect
  gtag('event', 'redirect_click', {
    'event_category': 'short_link',
    'event_label': '{{DESTINATION_URL}}',
    'custom_parameter': 'nanhi_link_redirect'
  });
</script>`,
      variables: ['GA_MEASUREMENT_ID']
    },
    
    facebook_pixel: {
      name: 'Facebook Pixel',
      code: `<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '{{PIXEL_ID}}');
fbq('track', 'PageView');

// Track custom event for redirect
fbq('trackCustom', 'ShortLinkRedirect', {
  destination_url: '{{DESTINATION_URL}}',
  short_code: '{{SHORT_CODE}}',
  source: 'nanhi_link'
});
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
       src="https://www.facebook.com/tr?id={{PIXEL_ID}}&ev=PageView&noscript=1" />
</noscript>`,
      variables: ['PIXEL_ID']
    },
    
    google_tag_manager: {
      name: 'Google Tag Manager',
      code: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','{{GTM_ID}}');</script>

<script>
// Push redirect event to dataLayer
dataLayer.push({
  'event': 'short_link_redirect',
  'destination_url': '{{DESTINATION_URL}}',
  'short_code': '{{SHORT_CODE}}',
  'redirect_timestamp': new Date().toISOString()
});
</script>`,
      variables: ['GTM_ID']
    },
    
    hotjar: {
      name: 'Hotjar Tracking',
      code: `<!-- Hotjar Tracking -->
<script>
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:{{HOTJAR_ID}},hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

// Track redirect event
hj('event', 'short_link_redirect');
</script>`,
      variables: ['HOTJAR_ID']
    },
    
    custom_retargeting: {
      name: 'Custom Retargeting Pixel',
      code: `<!-- Custom Retargeting Pixel -->
<script>
// Custom retargeting logic
(function() {
  var pixel = new Image();
  pixel.src = '{{PIXEL_URL}}?event=redirect&url=' + encodeURIComponent('{{DESTINATION_URL}}') + 
              '&short_code={{SHORT_CODE}}&timestamp=' + Date.now() + 
              '&referrer=' + encodeURIComponent(document.referrer);
  
  // Track in localStorage for retargeting
  var visits = JSON.parse(localStorage.getItem('nanhi_visits') || '[]');
  visits.push({
    url: '{{DESTINATION_URL}}',
    timestamp: Date.now(),
    short_code: '{{SHORT_CODE}}'
  });
  localStorage.setItem('nanhi_visits', JSON.stringify(visits.slice(-50))); // Keep last 50
})();
</script>`,
      variables: ['PIXEL_URL']
    },
    
    lead_capture: {
      name: 'Lead Capture Popup',
      code: `<!-- Lead Capture Popup -->
<style>
#nanhi-popup {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8); z-index: 999999; display: flex;
  align-items: center; justify-content: center; font-family: Arial, sans-serif;
}
#nanhi-popup-content {
  background: white; padding: 30px; border-radius: 15px; max-width: 400px;
  text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}
#nanhi-popup input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px; }
#nanhi-popup button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; }
</style>

<div id="nanhi-popup">
  <div id="nanhi-popup-content">
    <h3>{{POPUP_TITLE}}</h3>
    <p>{{POPUP_MESSAGE}}</p>
    <form id="nanhi-lead-form">
      <input type="email" placeholder="Enter your email" required>
      <button type="submit">{{BUTTON_TEXT}}</button>
    </form>
    <p><small><a href="#" onclick="closePopup()">Continue without subscribing</a></small></p>
  </div>
</div>

<script>
function closePopup() {
  document.getElementById('nanhi-popup').style.display = 'none';
  setTimeout(() => window.location.href = '{{DESTINATION_URL}}', 500);
}

document.getElementById('nanhi-lead-form').onsubmit = function(e) {
  e.preventDefault();
  var email = this.querySelector('input[type="email"]').value;
  
  // Send to your webhook/API
  fetch('{{WEBHOOK_URL}}', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: email,
      source: 'nanhi_link',
      short_code: '{{SHORT_CODE}}',
      destination: '{{DESTINATION_URL}}'
    })
  });
  
  closePopup();
};

// Auto-close after 10 seconds
setTimeout(closePopup, 10000);
</script>`,
      variables: ['POPUP_TITLE', 'POPUP_MESSAGE', 'BUTTON_TEXT', 'WEBHOOK_URL']
    }
  },

  // Process template with variables
  processSnippet(template, variables) {
    let code = template.code
    
    // Replace all variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      code = code.replace(regex, value || '')
    })
    
    return code
  },

  // Generate complete cloaking page with scripts
  generateCloakingPage(snippets, destinationUrl, pageTitle = 'Redirecting...') {
    const processedSnippets = snippets.map(snippet => {
      if (snippet.type === 'custom') {
        return snippet.code
      } else {
        const template = this.templates[snippet.type]
        if (!template) return ''
        
        // Add dynamic variables
        const allVariables = {
          ...snippet.variables,
          DESTINATION_URL: destinationUrl,
          SHORT_CODE: window.location.pathname.slice(1) || 'unknown'
        }
        
        return this.processSnippet(template, allVariables)
      }
    }).filter(Boolean)

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="robots" content="noindex, nofollow">
    <style>
        body {
            margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            color: white; text-align: center;
        }
        .container { max-width: 500px; padding: 40px; }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white;
            border-radius: 50%; width: 50px; height: 50px; margin: 0 auto 30px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        h1 { font-size: 28px; margin-bottom: 15px; }
        p { font-size: 16px; opacity: 0.9; margin-bottom: 20px; }
        .url { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; 
               word-break: break-all; font-family: monospace; }
    </style>
    
    ${processedSnippets.join('\n')}
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>🔗 Redirecting...</h1>
        <p>Taking you to your destination</p>
        <div class="url">${destinationUrl}</div>
        <p><small>Powered by Nanhi.Link</small></p>
    </div>
    
    <script>
        // Redirect after 3 seconds (allows tracking scripts to fire)
        setTimeout(function() {
            window.location.href = '${destinationUrl}';
        }, 3000);
        
        // Immediate redirect on click
        document.addEventListener('click', function() {
            window.location.href = '${destinationUrl}';
        });
    </script>
</body>
</html>`
  }
}
