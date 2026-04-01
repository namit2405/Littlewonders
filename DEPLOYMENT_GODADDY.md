# Deployment Guide – Little Wonders on GoDaddy

## Overview

This project now has two parts:
- **Frontend** – static HTML/CSS/JS files (served from GoDaddy hosting)
- **Backend** – Node.js/Express/MongoDB API (needs a Node.js-capable host)

> GoDaddy shared hosting does NOT support Node.js. You have two options below.

---

## Option A – GoDaddy VPS / Dedicated Server (Recommended)

GoDaddy VPS gives you full control to run Node.js.

### 1. Purchase a GoDaddy VPS
- Go to godaddy.com → Hosting → VPS Hosting
- Choose a Linux VPS (Ubuntu 22.04 recommended)
- Minimum: 1 vCPU, 2GB RAM

### 2. Connect to your VPS
```bash
ssh root@YOUR_VPS_IP
```

### 3. Install Node.js & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### 4. Install MongoDB (or use MongoDB Atlas – easier)
**Recommended: Use MongoDB Atlas (free tier)**
- Sign up at https://cloud.mongodb.com
- Create a free M0 cluster
- Whitelist your VPS IP under Network Access
- Copy the connection string into your `.env` as `MONGODB_URI`

### 5. Upload your project
```bash
# On your local machine
scp -r . root@YOUR_VPS_IP:/var/www/little-wonders
```
Or use FileZilla / rsync.

### 6. Set up the backend
```bash
cd /var/www/little-wonders/backend
cp .env.example .env
nano .env          # fill in all values
npm install
```

### 7. Create the admin account (run once)
```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Admin.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  console.log('Admin created');
  process.exit();
});
"
```

### 8. Start the backend with PM2
```bash
pm2 start server.js --name little-wonders-api
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

### 9. Install Nginx as reverse proxy
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/little-wonders
```

Paste this config (replace `yourdomain.com`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve frontend static files
    root /var/www/little-wonders;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # Proxy API requests to Node.js
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve admin portal
    location /admin/ {
        proxy_pass http://localhost:5000/admin/;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/little-wonders /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. Add SSL (free with Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 11. Point your GoDaddy domain to the VPS
- GoDaddy Dashboard → DNS → Edit A Record
- Set `@` and `www` to your VPS IP address
- Wait up to 24 hours for DNS propagation

---

## Option B – GoDaddy Shared Hosting (Frontend) + Render/Railway (Backend)

If you want to keep GoDaddy shared hosting for the HTML files:

### Frontend on GoDaddy Shared Hosting
1. Log in to GoDaddy → cPanel → File Manager
2. Upload all HTML, CSS, JS, and image files to `public_html/`
3. Do NOT upload the `backend/` folder

### Backend on Render (free tier available)
1. Push your project to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set root directory to `backend/`
4. Set environment variables (same as `.env`)
5. Deploy — Render gives you a URL like `https://little-wonders-api.onrender.com`

### Update API URL in frontend
In `enrol-now.html` and `get-in-touch.html`, change:
```js
fetch("/api/enrolments", ...)
fetch("/api/contact", ...)
```
to:
```js
fetch("https://little-wonders-api.onrender.com/api/enrolments", ...)
fetch("https://little-wonders-api.onrender.com/api/contact", ...)
```

And update `FRONTEND_URL` in your `.env` to your GoDaddy domain for CORS.

---

## Cloudinary Setup

1. Sign up at https://cloudinary.com (free tier: 25GB storage)
2. Dashboard → Settings → API Keys → Copy Cloud Name, API Key, API Secret
3. Add to your `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Admin Portal

Once deployed, access the admin portal at:
```
https://yourdomain.com/admin/login.html
```

Use the email/password you set in `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

From the admin portal you can:
- View and manage enrolment submissions (change status: new → contacted → enrolled)
- Read and delete contact messages
- Upload gallery images to Cloudinary by category
- Delete gallery images (removes from Cloudinary too)

---

## Quick Checklist Before Going Live

- [ ] `.env` file filled in with real values (never commit this to git)
- [ ] Admin account created via seed script
- [ ] MongoDB Atlas IP whitelist includes your server IP
- [ ] Cloudinary credentials working (test an upload)
- [ ] SSL certificate installed
- [ ] Domain DNS pointing to server
- [ ] PM2 running and set to auto-start
- [ ] Test both forms on the live site
- [ ] Test admin login and portal
