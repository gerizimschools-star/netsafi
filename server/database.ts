import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'php_radius_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database connection helper
export const connectDB = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Query helper function
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Initialize database (create tables if they don't exist)
export const initializeDatabase = async () => {
  try {
    // Check if main tables exist
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'admin_users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('🗄️  Database tables not found. Please run the complete functional schema to set up the database.');
      console.log('📋 Run: psql -d your_database_name -f database/complete_functional_schema.sql');
      console.log('🔧 Or use the Docker setup: docker-compose up -d');
    } else {
      console.log('✅ Database tables found. NetSafi ISP database is ready.');

      // Check if admin user exists
      const adminCheck = await query(`
        SELECT COUNT(*) as count FROM admin_users WHERE username = 'admin'
      `);

      if (parseInt(adminCheck.rows[0].count) === 0) {
        console.log('⚠️  No admin user found. Creating default admin user...');
        // Create default admin user (password: admin123)
        await query(`
          INSERT INTO admin_users (username, password_hash, email, first_name, last_name, role, permissions)
          VALUES ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye.fUk8Q.j4Zl.E/cPUvWZLIdjklQnzuy', 'admin@netsafi.com', 'System', 'Administrator', 'super_admin',
                  ARRAY['user_management', 'reseller_management', 'router_management', 'plan_management', 'financial_management', 'system_settings', 'audit_logs'])
        `);
        console.log('👤 Default admin user created (username: admin, password: admin123)');
      }

      console.log('🚀 NetSafi ISP Billing System ready for use!');
    }
  } catch (error) {
    console.warn('⚠️  PostgreSQL database not available or not properly configured.');
    console.log('📖 To set up PostgreSQL:');
    console.log('   1. Install PostgreSQL');
    console.log('   2. Create database: createdb netsafi_billing');
    console.log('   3. Run schema: psql -d netsafi_billing -f database/complete_functional_schema.sql');
    console.log('   4. Update .env with correct database credentials');
    console.log('');
    console.log('🐳 Or use Docker: docker-compose up -d');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

export default pool;
