#!/bin/bash

# NetSafi ISP Billing - cPanel Hosting Build Script
# This script prepares the application for deployment on shared hosting with cPanel

set -e

echo "🚀 Building NetSafi ISP Billing for cPanel hosting..."

# Create deployment directory
DEPLOY_DIR="cpanel-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building client application..."
npm run build:client

echo "🔧 Building server application..."
npm run build:server

echo "📁 Creating cPanel directory structure..."

# Create directory structure
mkdir -p $DEPLOY_DIR/public_html
mkdir -p $DEPLOY_DIR/api
mkdir -p $DEPLOY_DIR/database
mkdir -p $DEPLOY_DIR/uploads
mkdir -p $DEPLOY_DIR/logs

echo "📋 Copying client files to public_html..."
cp -r dist/spa/* $DEPLOY_DIR/public_html/

echo "🔄 Copying server files to api..."
cp -r dist/server/* $DEPLOY_DIR/api/

# Copy necessary server files
cp package.json $DEPLOY_DIR/
cp -r node_modules $DEPLOY_DIR/ 2>/dev/null || echo "⚠️  Note: You'll need to run 'npm install' on the server"

echo "🗄️ Copying database files..."
cp database/sqlite_cpanel_schema.sql $DEPLOY_DIR/database/
cp database/README.md $DEPLOY_DIR/database/ 2>/dev/null || true

echo "📝 Creating .htaccess files..."

# Create main .htaccess for routing
cat > $DEPLOY_DIR/.htaccess << 'EOF'
# NetSafi ISP Billing - Main .htaccess
RewriteEngine On

# Enable compression
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

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# API routes
RewriteRule ^api/(.*)$ api/index.js [L,QSA]

# Frontend routing - send all non-API requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
EOF

# Create API .htaccess
cat > $DEPLOY_DIR/api/.htaccess << 'EOF'
# Protect API directory
<Files "*.js">
    # Allow execution of Node.js files (if supported)
    SetHandler nodejs-script
</Files>

# Deny access to sensitive files
<Files "*.env">
    Require all denied
</Files>

<Files "*.log">
    Require all denied
</Files>
EOF

# Create database .htaccess (protect database files)
cat > $DEPLOY_DIR/database/.htaccess << 'EOF'
# Protect database files
Require all denied
EOF

# Create uploads .htaccess
cat > $DEPLOY_DIR/uploads/.htaccess << 'EOF'
# Allow file uploads but prevent script execution
<Files "*">
    SetHandler default-handler
</Files>

# Deny execution of scripts
RemoveHandler .php .phtml .php3 .php4 .php5 .php6 .phps .cgi .pl .py .js .jsp .asp .sh

# Deny access to sensitive file types
<FilesMatch "\.(htaccess|htpasswd|ini|log|sh|sql|conf|fla|psd|log)$">
    Require all denied
</FilesMatch>
EOF

echo "⚙️ Creating environment configuration..."

# Create sample .env file
cat > $DEPLOY_DIR/.env.example << 'EOF'
# NetSafi ISP Billing - Production Environment Configuration

# Node Environment
NODE_ENV=production

# Database Configuration (SQLite for shared hosting)
DB_TYPE=sqlite
DB_PATH=./database/netsafi.db

# Alternative: MySQL (if available on your hosting)
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_NAME=username_netsafi
# DB_USER=username_dbuser
# DB_PASSWORD=your_secure_password

# Server Configuration
PORT=3000
APP_URL=https://yourdomain.com

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
SESSION_SECRET=your-session-secret-key

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Optional: Email Configuration (for notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password

# Optional: Payment Gateway Configuration
# MPESA_CONSUMER_KEY=your-mpesa-consumer-key
# MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
# MPESA_SHORTCODE=your-shortcode
# MPESA_PASSKEY=your-passkey
EOF

echo "📜 Creating deployment documentation..."

cat > $DEPLOY_DIR/INSTALL.md << 'EOF'
# NetSafi ISP Billing - cPanel Installation

## Prerequisites
- cPanel hosting with Node.js support
- File upload capability
- SQLite or MySQL database support

## Installation Steps

1. **Upload Files**
   - Upload all files to your domain directory
   - Ensure `public_html` contents go to your web root
   - Keep `api`, `database`, and other folders in the domain root

2. **Configuration**
   - Copy `.env.example` to `.env`
   - Edit `.env` with your production settings
   - Update database connection details

3. **Database Setup**
   - For SQLite: Database will be created automatically
   - For MySQL: Create database in cPanel and import schema

4. **Permissions**
   - Set `api` folder to 755
   - Set `database` folder to 755 (writable for SQLite)
   - Set `uploads` folder to 755
   - Set `logs` folder to 755

5. **Testing**
   - Visit: `https://yourdomain.com/api/health`
   - Should return database health status
   - Visit: `https://yourdomain.com`
   - Should load the application

## Troubleshooting

- **API not working**: Check if Node.js is enabled in cPanel
- **Database errors**: Verify folder permissions and .env configuration
- **File upload issues**: Check uploads folder permissions
- **Frontend not loading**: Verify .htaccess file is uploaded

## Support
For hosting-specific issues, contact your hosting provider support.
EOF

echo "📊 Creating startup script for cPanel..."

cat > $DEPLOY_DIR/api/startup.js << 'EOF'
#!/usr/bin/env node

// NetSafi ISP Billing - cPanel Startup Script
// This script initializes the application for cPanel hosting

const { createServer } = require('./node-build.mjs');
const app = createServer();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NetSafi ISP Billing server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_TYPE || 'sqlite'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
EOF

chmod +x $DEPLOY_DIR/api/startup.js

echo "📦 Creating package.json for production..."

cat > $DEPLOY_DIR/package-production.json << 'EOF'
{
  "name": "netsafi-billing-cpanel",
  "version": "1.0.0",
  "description": "NetSafi ISP Billing System - Production",
  "main": "api/startup.js",
  "scripts": {
    "start": "node api/startup.js",
    "health": "curl -f http://localhost:3000/api/health || exit 1"
  },
  "dependencies": {
    "sqlite3": "^5.1.6",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.0",
    "bcryptjs": "^3.0.2",
    "jsonwebtoken": "^9.0.2",
    "qrcode": "^1.5.3",
    "zod": "^3.23.8"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

echo "🔧 Creating database initialization script..."

cat > $DEPLOY_DIR/database/init.js << 'EOF'
#!/usr/bin/env node

// Database initialization script for cPanel hosting
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'netsafi.db');
const schemaPath = path.join(__dirname, 'sqlite_cpanel_schema.sql');

console.log('Initializing NetSafi database...');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
  console.log('Database created/connected successfully');
});

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');
const statements = schema
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

let executed = 0;
const total = statements.length;

statements.forEach((statement, index) => {
  if (statement.trim()) {
    db.run(statement, (err) => {
      if (err) {
        console.error(`Error executing statement ${index + 1}:`, err);
      }
      executed++;
      if (executed === total) {
        console.log('Database schema initialized successfully');
        db.close();
      }
    });
  } else {
    executed++;
    if (executed === total) {
      console.log('Database schema initialized successfully');
      db.close();
    }
  }
});
EOF

chmod +x $DEPLOY_DIR/database/init.js

echo "📋 Creating deployment checklist..."

cat > $DEPLOY_DIR/DEPLOYMENT_CHECKLIST.md << 'EOF'
# NetSafi ISP Billing - cPanel Deployment Checklist

## Before Upload
- [ ] Build completed successfully
- [ ] All files present in cpanel-deploy folder
- [ ] Environment variables configured
- [ ] Database credentials ready

## During Upload
- [ ] Upload all files to cPanel File Manager
- [ ] Place public_html contents in web root
- [ ] Keep other folders in domain root (not public_html)
- [ ] Upload .htaccess files
- [ ] Set correct folder permissions (755 for folders, 644 for files)

## After Upload
- [ ] Copy .env.example to .env and configure
- [ ] Test API health: /api/health
- [ ] Test frontend loading
- [ ] Create first admin user
- [ ] Configure company settings

## Optional Configuration
- [ ] Set up custom domain
- [ ] Configure SSL certificate
- [ ] Set up automated backups
- [ ] Configure email notifications
- [ ] Set up monitoring

## Troubleshooting
- Check cPanel error logs if issues occur
- Verify Node.js is enabled and correct version
- Ensure database folder is writable
- Contact hosting support for Node.js configuration
EOF

echo "✅ Build completed successfully!"
echo ""
echo "📁 Files ready for cPanel deployment in: $DEPLOY_DIR"
echo ""
echo "📋 Next steps:"
echo "1. Upload the contents of '$DEPLOY_DIR' to your cPanel hosting"
echo "2. Configure environment variables in .env file"
echo "3. Test the deployment by visiting /api/health"
echo "4. Follow the INSTALL.md guide for detailed setup"
echo ""
echo "🎉 Your NetSafi ISP Billing system is ready for cPanel hosting!"
