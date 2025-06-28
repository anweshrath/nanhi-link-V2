# Nanhi.Links API Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 16+ 
- Supabase project with service role key
- Domain/subdomain for API (e.g., api.nanhi.link)

### Environment Setup

1. **Copy environment file:**
```bash
cp api/.env.example api/.env
```

2. **Configure environment variables:**
```env
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_PORT=3001
VITE_APP_URL=https://nanhi.link
ALLOWED_ORIGINS=https://nanhi.link,https://www.nanhi.link
```

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy API
cd api
vercel --prod
```

#### Option 2: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd api
railway login
railway deploy
```

#### Option 3: DigitalOcean App Platform
1. Connect GitHub repository
2. Set build command: `cd api && npm install`
3. Set run command: `cd api && npm start`
4. Configure environment variables

### Database Migration

Add API key column to users table:

```sql
-- Add API key column
ALTER TABLE users ADD COLUMN api_key VARCHAR(255) UNIQUE;

-- Create index for performance
CREATE INDEX idx_users_api_key ON users(api_key);
```

### Testing Deployment

```bash
# Test health endpoint
curl https://your-api-domain.com/api/health

# Test with API key
curl -X POST https://your-api-domain.com/api/links \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 📚 WordPress Plugin Installation

### From WordPress Admin
1. Upload `wordpress-plugin` folder to `/wp-content/plugins/`
2. Rename to `nanhi-links`
3. Activate in WordPress admin
4. Configure API key in settings

### Manual Installation
```bash
# Copy plugin files
cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/nanhi-links

# Set permissions
chmod -R 755 /path/to/wordpress/wp-content/plugins/nanhi-links
```

### Plugin Configuration
1. Go to **Nanhi.Links → Settings**
2. Enter your API key
3. Test connection
4. Configure auto-shortening preferences

## 🔧 Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.nanhi.link/api',
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});

// Create short link
const link = await client.post('/links', {
  url: 'https://example.com/very-long-url',
  title: 'My Example Link'
});

console.log(link.data.short_url);
```

### PHP
```php
<?php
$api_key = 'your_api_key_here';
$url = 'https://api.nanhi.link/api/links';

$data = json_encode([
    'url' => 'https://example.com/very-long-url',
    'title' => 'My Example Link'
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'X-API-Key: ' . $api_key
        ],
        'content' => $data
    ]
]);

$response = file_get_contents($url, false, $context);
$result = json_decode($response, true);

echo $result['short_url'];
?>
```

### Python
```python
import requests

headers = {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
}

data = {
    'url': 'https://example.com/very-long-url',
    'title': 'My Example Link'
}

response = requests.post(
    'https://api.nanhi.link/api/links',
    headers=headers,
    json=data
)

result = response.json()
print(result['short_url'])
```

## 🔒 Security Considerations

### API Security
- Use HTTPS only in production
- Implement rate limiting (included)
- Validate all inputs (included)
- Use environment variables for secrets
- Regular security audits

### WordPress Security
- Keep plugin updated
- Use strong API keys
- Limit user permissions
- Regular backups
- Monitor for suspicious activity

## 📊 Monitoring & Analytics

### API Monitoring
```javascript
// Health check endpoint
GET /api/health

// Monitor response times
// Set up alerts for 4xx/5xx errors
// Track API usage patterns
```

### WordPress Monitoring
- Monitor plugin performance
- Track link creation rates
- Monitor API call frequency
- Set up error logging

## 🚀 Performance Optimization

### API Performance
- Enable gzip compression
- Use CDN for static assets
- Implement caching headers
- Database query optimization
- Connection pooling

### WordPress Performance
- Cache API responses locally
- Optimize database queries
- Use WordPress object cache
- Minimize API calls

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- Redis for session storage
- Microservices architecture

### Vertical Scaling
- Increase server resources
- Database optimization
- Memory management
- CPU optimization

## 🔄 Backup & Recovery

### API Backup
- Database backups (Supabase handles this)
- Environment configuration backup
- Code repository backup
- Monitoring data backup

### WordPress Backup
- Plugin configuration backup
- Local cache backup
- WordPress database backup
- File system backup

## 📞 Support & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Security patches immediately
- Performance monitoring weekly
- Backup verification monthly

### Support Channels
- GitHub Issues for bugs
- Email support for users
- Documentation updates
- Community forum

## 🎯 Success Metrics

### API Metrics
- Response time < 200ms
- Uptime > 99.9%
- Error rate < 0.1%
- Throughput capacity

### WordPress Metrics
- Plugin activation rate
- User engagement
- Feature usage
- Support ticket volume

---

**🎉 Congratulations!** Your Nanhi.Links API and WordPress plugin are now ready for production use!
