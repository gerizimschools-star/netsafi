# NetSafi ISP Billing - Deployment Guide

This guide will help you deploy the NetSafi ISP Billing system to various hosting platforms.

## 🚀 Quick Start

Your project is already configured for multiple hosting options:

### Option 1: cPanel Shared Hosting (Perfect for Budget Hosting)
### Option 2: Netlify (Recommended for Frontend + Serverless)
### Option 3: Vercel (Alternative Serverless)
### Option 4: Traditional Server (VPS/Cloud)
### Option 5: Docker Deployment

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] PostgreSQL database setup
- [ ] Environment variables configured
- [ ] Domain name (optional)
- [ ] SSL certificate (handled by hosting providers)

---

## 🌐 Option 1: Netlify Deployment (Recommended)

### Why Netlify?
- ✅ Already configured in your project
- ✅ Automatic deployments from Git
- ✅ Built-in CDN and SSL
- ✅ Serverless functions support
- ✅ Free tier available

### Steps:

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import from Git"
   - Select your repository
   - Build settings are already configured in `netlify.toml`

3. **Environment Variables**
   In Netlify dashboard, go to Site settings → Environment variables:
   ```
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=netsafi_billing
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   NODE_ENV=production
   ```

4. **Deploy**
   - Netlify will automatically build and deploy
   - Your site will be available at `https://your-site-name.netlify.app`

---

## ⚡ Option 2: Vercel Deployment

### Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Configure Environment Variables**
   In Vercel dashboard, add the same environment variables as above.

---

## 🖥️ Option 3: Traditional Server (VPS/Cloud)

### Requirements:
- Ubuntu/CentOS server
- Node.js 18+ installed
- PostgreSQL database
- Nginx (recommended)

### Steps:

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Clone and Setup**
   ```bash
   git clone your-repository
   cd netsafi-billing
   npm install
   npm run build
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Start with PM2**
   ```bash
   pm2 start dist/server/production.mjs --name "netsafi-billing"
   pm2 startup
   pm2 save
   ```

5. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

---

## 🐳 Option 4: Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_NAME=netsafi_billing
      - DB_USER=postgres
      - DB_PASSWORD=your_password
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: netsafi_billing
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

---

## 🗄️ Database Setup

### PostgreSQL Setup

1. **Create Database**
   ```sql
   CREATE DATABASE netsafi_billing;
   CREATE USER netsafi_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE netsafi_billing TO netsafi_user;
   ```

2. **Import Schema**
   ```bash
   psql -h your-host -U netsafi_user -d netsafi_billing -f database/enhanced_complete_schema.sql
   ```

### Managed Database Options:
- **Neon** (PostgreSQL): neon.tech
- **Supabase**: supabase.com
- **Amazon RDS**: aws.amazon.com/rds
- **Google Cloud SQL**: cloud.google.com/sql

---

## 🔒 Security Configuration

### Environment Variables (Production)
```bash
# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=netsafi_billing_prod
DB_USER=netsafi_prod_user
DB_PASSWORD=super_secure_password

# Server
NODE_ENV=production
PORT=8080

# JWT Secret (generate new)
JWT_SECRET=your-super-secure-jwt-secret-key

# API Keys (if using external services)
MPESA_CONSUMER_KEY=your-mpesa-key
MPESA_CONSUMER_SECRET=your-mpesa-secret
```

### Security Headers
Add to your server or reverse proxy:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📊 Monitoring & Maintenance

### Health Checks
Your app includes health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database connectivity

### Logging
- Production logs are available via PM2: `pm2 logs`
- For cloud deployments, check provider's logging dashboard

### Backups
```bash
# Database backup
pg_dump -h your-host -U your-user -d netsafi_billing > backup_$(date +%Y%m%d).sql

# Automated backup script (add to crontab)
0 2 * * * /path/to/backup-script.sh
```

---

## 🚨 Troubleshooting

### Common Issues:

1. **Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Database Connection**
   - Check environment variables
   - Verify database is running
   - Check firewall settings

3. **Performance Issues**
   - Enable gzip compression
   - Use CDN for static assets
   - Monitor database queries

### Support Resources:
- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL Docs](https://postgresql.org/docs)

---

## 📞 Support

For deployment issues or questions:
1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Review security settings

Your NetSafi ISP Billing system is production-ready! 🎉
