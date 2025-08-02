# PostgreSQL Database Setup for PHP Radius ISP Management

## Prerequisites

1. **Install PostgreSQL** on your system:
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **macOS**: `brew install postgresql` or download from official site
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service**:
   - **Windows**: Usually starts automatically
   - **macOS**: `brew services start postgresql`
   - **Linux**: `sudo systemctl start postgresql`

## Database Setup

### 1. Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database
CREATE DATABASE php_radius_db;

# Create user (optional - you can use postgres user)
CREATE USER radius_admin WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE php_radius_db TO radius_admin;

# Exit PostgreSQL
\q
```

### 2. Initialize Database Schema

```bash
# Navigate to your project directory
cd /path/to/your/project

# Run the schema file
psql -U postgres -d php_radius_db -f database/schema.sql

# Or if using custom user:
psql -U radius_admin -d php_radius_db -f database/schema.sql
```

### 3. Environment Configuration

Update your `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=php_radius_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## Database Schema Overview

### Tables Created:

1. **users** - Customer information and accounts
2. **plans** - Internet service plans and pricing
3. **invoices** - Billing and payment records
4. **network_locations** - Network infrastructure monitoring
5. **payment_methods** - Available payment options
6. **usage_logs** - Data usage tracking
7. **system_settings** - Application configuration
8. **admin_users** - Dashboard user accounts

### Sample Data Included:

- 7 sample users from different Kenyan locations
- 3 internet plans (Basic, Standard, Premium)
- 6 sample invoices with different statuses
- 5 network locations across Kenya
- 4 payment methods (M-Pesa, Airtel Money, T-Kash, Bank Transfer)
- System configuration settings
- 1 admin user (username: admin, password: admin123)

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create new invoice
- `PATCH /api/invoices/:id/status` - Update invoice status
- `PATCH /api/invoices/:id/payment` - Process payment
- `GET /api/invoices/stats` - Get invoice statistics
- `GET /api/invoices/revenue/monthly` - Get monthly revenue

### Network
- `GET /api/network` - Get all network locations
- `GET /api/network/:id` - Get single location
- `POST /api/network` - Add new location
- `PATCH /api/network/:id` - Update location status
- `POST /api/network/refresh` - Refresh network data
- `DELETE /api/network/:id` - Delete location
- `GET /api/network/stats` - Get network statistics

### Health Check
- `GET /api/health` - Check database connection
- `GET /api/ping` - Basic server health check

## Troubleshooting

### Common Issues:

1. **Connection refused**: Make sure PostgreSQL is running
2. **Authentication failed**: Check username/password in .env
3. **Database does not exist**: Create the database first
4. **Permission denied**: Grant proper privileges to the user

### Useful PostgreSQL Commands:

```sql
-- Check if database exists
\l

-- Connect to database
\c php_radius_db

-- List tables
\dt

-- Check table structure
\d users

-- View sample data
SELECT * FROM users LIMIT 5;

-- Check connection status
SELECT NOW();
```

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Enable SSL for production database connections
- Regularly backup your database
- Keep PostgreSQL updated

## Backup and Restore

### Backup:
```bash
pg_dump -U postgres php_radius_db > backup.sql
```

### Restore:
```bash
psql -U postgres php_radius_db < backup.sql
```
