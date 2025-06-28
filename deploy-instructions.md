# DEPLOYMENT INSTRUCTIONS

## 1. DEPLOY MAIN APP TO VERCEL

```bash
# Build the app
npm run build

# Deploy to Vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 2. DEPLOY REDIRECT SERVICE TO VPS

```bash
# Copy redirect-service folder to your VPS
scp -r redirect-service/ user@your-vps-ip:/home/user/

# SSH into VPS
ssh user@your-vps-ip

# Install dependencies
cd redirect-service
npm install

# Install PM2 for process management
npm install -g pm2

# Start the service
pm2 start server.js --name "sureto-redirect"
pm2 startup
pm2 save
```

## 3. NGINX CONFIGURATION (VPS)

Create `/etc/nginx/sites-available/sureto.click`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
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
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/sureto.click /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. SSL CERTIFICATE

```bash
sudo certbot --nginx -d yourdomain.com
```

## 5. DNS CONFIGURATION

Point your domain to your VPS:
- A record: `yourdomain.com` → `YOUR_VPS_IP`
- CNAME record: `app.yourdomain.com` → `your-vercel-app.vercel.app`

## FINAL RESULT

- `yourdomain.com/abc123` → Redirects via VPS
- `app.yourdomain.com` → Main dashboard via Vercel
