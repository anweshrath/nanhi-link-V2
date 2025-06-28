import { supabase } from '../lib/supabase'

export const trackingService = {
  // Generate tracking scripts for a link based on active integrations
  async generateTrackingScripts(linkId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return ''

      // Get active integrations for the user
      const { data: integrations, error } = await supabase
        .from('user_integrations')
        .select('integration_type, config')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) throw error

      let scripts = ''

      for (const integration of integrations || []) {
        switch (integration.integration_type) {
          case 'google_analytics':
            if (integration.config?.measurement_id) {
              scripts += this.generateGAScript(integration.config.measurement_id, linkId)
            }
            break
          
          case 'facebook_pixel':
            if (integration.config?.pixel_id) {
              scripts += this.generateFBPixelScript(integration.config.pixel_id, linkId)
            }
            break
        }
      }

      return scripts
    } catch (error) {
      console.error('Error generating tracking scripts:', error)
      return ''
    }
  },

  // Generate Google Analytics 4 tracking script
  generateGAScript(measurementId, linkId) {
    return `
      <!-- Google Analytics 4 -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}');
        
        // Track link click event
        gtag('event', 'link_click', {
          'custom_parameter': 'nanhi_link',
          'link_id': '${linkId}',
          'event_category': 'engagement',
          'event_label': 'short_link_redirect'
        });
      </script>
    `
  },

  // Generate Facebook Pixel tracking script
  generateFBPixelScript(pixelId, linkId) {
    return `
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
        
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
        
        // Track custom event for link click
        fbq('trackCustom', 'LinkClick', {
          link_id: '${linkId}',
          source: 'nanhi_link'
        });
      </script>
      <noscript>
        <img height="1" width="1" style="display:none" 
             src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />
      </noscript>
    `
  },

  // Send webhook notification
  async sendWebhookNotification(linkId, clickData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get webhook integrations
      const { data: integrations, error } = await supabase
        .from('user_integrations')
        .select('config')
        .eq('user_id', user.id)
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
          const signature = await this.generateWebhookSignature(JSON.stringify(payload), secret)
          headers['X-Nanhi-Signature'] = signature
        }

        try {
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
  },

  // Generate webhook signature for verification
  async generateWebhookSignature(payload, secret) {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    return 'sha256=' + Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}
