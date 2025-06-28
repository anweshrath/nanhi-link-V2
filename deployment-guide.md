# 🚀 DEPLOYMENT GUIDE - How to Make Short URLs Work

## The Problem
Right now you're seeing `localhost:5173/abc123` instead of `yourdomain.com/abc123`

## The Solution: Two-Service Architecture

### 🏗️ Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │  Redirect API   │
│ app.domain.com  │    │   domain.com    │
│    (Vercel)     │    │     (VPS)       │
└─────────────────┘    └─────────────────┘
```

## 📋 Step-by-Step Deployment

### 1. Deploy Dashboard to Vercel
```bash
# Build and deploy
npm run build
vercel --prod

# Set environment variables in Vercel:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SHORT_DOMAIN=yourdomain.com
```

### 2. Deploy Redirect Service to VPS

#### Option A: DigitalOcean Droplet ($6/month)
```bash
# Create droplet, then:
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Upload redirect service
scp -r redirect.js package.json root@your-server-ip:/root/

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start service
pm2 start redirect.js --name "redirect-service"
pm2 startup
pm2 save
```

#### Option B: Railway ($5/month)
```bash
# Push redirect service to GitHub
# Connect Railway to your repo
# Deploy automatically
```

### 3. Configure DNS

#### For yourdomain.com:
```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 300
```

#### For app.yourdomain.com:
```
Type: CNAME  
Name: app
Value: your-vercel-app.vercel.app
TTL: 300
```

### 4. Setup SSL (VPS)
```bash
# Install Nginx
apt update && apt install nginx

# Install Certbot
apt install certbot python3-certbot-nginx

# Configure Nginx
nano /etc/nginx/sites-available/yourdomain.com
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
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
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com
```

## 🎯 Final Result

✅ **Dashboard**: `https://app.yourdomain.com` (Vercel)  
✅ **Short Links**: `https://yourdomain.com/abc123` (VPS)  
✅ **SSL Certificates**: Automatic renewal  
✅ **Analytics**: Full tracking working  

## 💰 Cost Breakdown

- **Vercel**: Free (hobby plan)
- **VPS**: $5-6/month (DigitalOcean/Railway)
- **Domain**: $10-15/year
- **Total**: ~$6/month + domain

## 🔧 Alternative: Subdomain Setup

If you want everything on one domain:

- **Dashboard**: `yourdomain.com` (Vercel)
- **Short Links**: `go.yourdomain.com` (VPS)

Just change DNS:
```
A record: go.yourdomain.com → YOUR_VPS_IP
CNAME: yourdomain.com → your-vercel-app.vercel.app
```

## ⚡ Quick Test

After deployment, test with:
```bash
curl -I https://yourdomain.com/test123
# Should return 302 redirect or 404 (not connection error)
```

## 🚨 Important Notes

1. **The redirect service MUST run on port 80/443** (or behind Nginx proxy)
2. **Environment variables** must be set correctly on both services
3. **DNS propagation** can take up to 24 hours
4. **SSL certificates** are required for HTTPS short links

---

**Bottom Line**: You need TWO separate deployments - one for the dashboard (Vercel) and one for the redirect service (VPS). The short URLs will only work once the redirect service is deployed to your actual domain! 🎯
