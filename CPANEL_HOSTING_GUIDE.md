# cPanel Hosting Guide for NetSafi ISP Billing

This guide provides step-by-step instructions to deploy the NetSafi ISP Billing system on shared hosting providers that use cPanel.

## 🎯 Overview

Shared hosting with cPanel has specific limitations and requirements:
- ✅ Static file hosting (HTML, CSS, JS)
- ✅ SQLite database support (file-based)
- ⚠️ Limited Node.js support (varies by provider)
- ❌ No PostgreSQL (usually)
- ❌ No custom server processes (usually)

## 📋 Prerequisites

Before starting, ensure your hosting provider supports:
- Node.js (version 18+)
- File uploads and management
- SQLite or MySQL databases
- .htaccess files

## 🚀 Deployment Steps

### Step 1: Prepare Your Project

1. **Build for Production**
   ```bash
   npm run build:production:cpanel
   ```
   This creates a `cpanel-deploy` folder with all necessary files.

2. **Files Generated:**
   - `public_html/` - Static frontend files
   - `api/` - Backend API files
   - `database/` - SQLite database files
   - `.htaccess` - Server configuration

### Step 2: Upload Files

1. **Access cPanel File Manager**
   - Login to your cPanel account
   - Open "File Manager"
   - Navigate to your domain's root directory

2. **Upload Files**
   - Upload the entire `cpanel-deploy` folder contents
   - Ensure `public_html` files go to your domain root
   - Upload `api/` folder to your domain root

3. **Set Permissions**
   - Set `api/` folder permissions to 755
   - Set database files permissions to 644
   - Set .htaccess files permissions to 644

### Step 3: Database Setup

#### Option A: SQLite (Recommended for Shared Hosting)
SQLite database is automatically created when you first access the API.

#### Option B: MySQL (If Available)
1. **Create MySQL Database in cPanel**
   - Go to "MySQL Databases"
   - Create a new database: `username_netsafi`
   - Create a user with full privileges

2. **Import Schema**
   - Use cPanel's phpMyAdmin
   - Import the MySQL schema: `database/cpanel_mysql_schema.sql`

### Step 4: Configuration

1. **Environment Variables**
   Create `.env` file in your domain root:
   ```env
   NODE_ENV=production
   DB_TYPE=sqlite
   DB_PATH=./database/netsafi.db
   
   # OR for MySQL
   # DB_TYPE=mysql
   # DB_HOST=localhost
   # DB_NAME=username_netsafi
   # DB_USER=username_dbuser
   # DB_PASSWORD=your_password
   
   JWT_SECRET=your-super-secure-jwt-secret
   APP_URL=https://yourdomain.com
   ```

2. **Verify Setup**
   Visit: `https://yourdomain.com/api/health`
   You should see a health check response.

## 📁 File Structure After Deployment

```
yourdomain.com/
├── public_html/
│   ├── index.html
│   ├── assets/
│   └── ... (frontend files)
├── api/
│   ├── index.js
│   ├── routes/
│   └── ... (backend files)
├── database/
│   ├── netsafi.db (SQLite)
│   └── schema.sql
├── .htaccess
└── .env
```

## 🔧 Troubleshooting

### Common Issues:

1. **API Not Working**
   - Check if Node.js is enabled in cPanel
   - Verify .htaccess file is uploaded
   - Check file permissions (755 for folders, 644 for files)

2. **Database Errors**
   - Ensure database directory has write permissions
   - Check .env file configuration
   - Verify database file path is correct

3. **Frontend Not Loading**
   - Ensure all files are in public_html
   - Check .htaccess for proper routing
   - Verify domain DNS settings

### Performance Optimization:

1. **Enable Gzip Compression**
   Add to .htaccess:
   ```apache
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

2. **Browser Caching**
   Add to .htaccess:
   ```apache
   <IfModule mod_expires.c>
       ExpiresActive on
       ExpiresByType text/css "access plus 1 year"
       ExpiresByType application/javascript "access plus 1 year"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
   </IfModule>
   ```

## 🔐 Security Considerations

1. **Database Security**
   - SQLite file should be outside public_html if possible
   - Use strong JWT secrets
   - Regular backups via cPanel

2. **API Security**
   - Enable HTTPS (usually free with cPanel)
   - Use environment variables for secrets
   - Regular security updates

## 📞 Support

For cPanel-specific issues:
1. Contact your hosting provider support
2. Check cPanel documentation
3. Verify Node.js availability and version

Your NetSafi ISP Billing system is now ready for cPanel hosting! 🎉

## 🔄 Updates and Maintenance

### Updating Your Application:
1. Build new version locally
2. Upload updated files via cPanel File Manager
3. Test API endpoints
4. Clear any caches

### Database Backups:
1. Download SQLite file via File Manager
2. Store backups securely
3. Set up automated backups if available

### Monitoring:
- Use cPanel's built-in monitoring tools
- Monitor disk space usage
- Check error logs regularly
