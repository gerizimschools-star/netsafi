import "dotenv/config";
import { Pool } from "pg";
import { getDatabaseInstance, initializeSQLiteDatabase, checkSQLiteDatabaseHealth } from "./database-sqlite";

// Database type detection
const DB_TYPE = process.env.DB_TYPE || 'postgresql';

// PostgreSQL configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'netsafi_billing',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Unified database interface
export interface DatabaseInterface {
  query(text: string, params?: any[]): Promise<any[]>;
  get(text: string, params?: any[]): Promise<any>;
  run(text: string, params?: any[]): Promise<{ lastID?: number; changes?: number }>;
  healthCheck(): Promise<boolean>;
}

class PostgreSQLAdapter implements DatabaseInterface {
  async query(text: string, params: any[] = []): Promise<any[]> {
    try {
      const result = await pool.query(text, params);
      return result.rows;
    } catch (error) {
      console.error('PostgreSQL query error:', error, 'SQL:', text, 'Params:', params);
      throw error;
    }
  }

  async get(text: string, params: any[] = []): Promise<any> {
    const rows = await this.query(text, params);
    return rows[0] || null;
  }

  async run(text: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    try {
      const result = await pool.query(text, params);
      return { changes: result.rowCount || 0 };
    } catch (error) {
      console.error('PostgreSQL run error:', error, 'SQL:', text, 'Params:', params);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
      return false;
    }
  }
}

class SQLiteAdapter implements DatabaseInterface {
  private db = getDatabaseInstance();

  async query(text: string, params: any[] = []): Promise<any[]> {
    return await this.db.query(text, params);
  }

  async get(text: string, params: any[] = []): Promise<any> {
    return await this.db.get(text, params);
  }

  async run(text: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    const result = await this.db.run(text, params);
    return { lastID: result.lastID, changes: result.changes };
  }

  async healthCheck(): Promise<boolean> {
    return await this.db.healthCheck();
  }
}

// Database instance
let dbAdapter: DatabaseInterface;

if (DB_TYPE === 'sqlite') {
  dbAdapter = new SQLiteAdapter();
} else {
  dbAdapter = new PostgreSQLAdapter();
}

// Export unified interface
export async function query(text: string, params: any[] = []): Promise<any[]> {
  return await dbAdapter.query(text, params);
}

export async function get(text: string, params: any[] = []): Promise<any> {
  return await dbAdapter.get(text, params);
}

export async function run(text: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
  return await dbAdapter.run(text, params);
}

export async function initializeDatabase(): Promise<void> {
  try {
    console.log(`Initializing ${DB_TYPE} database...`);
    
    if (DB_TYPE === 'sqlite') {
      await initializeSQLiteDatabase();
    } else {
      // For PostgreSQL, run the existing schema
      const fs = await import('fs');
      const path = await import('path');
      
      const schemaPath = path.join(process.cwd(), 'database', 'complete_functional_schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        console.log('Running PostgreSQL schema...');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split and execute schema statements
        const statements = schema
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await query(statement);
            } catch (error) {
              // Ignore errors for existing tables/data
              if (!error.message.includes('already exists') && 
                  !error.message.includes('duplicate key')) {
                console.warn('Schema statement warning:', error.message);
              }
            }
          }
        }
      }
    }
    
    console.log(`${DB_TYPE} database initialized successfully`);
  } catch (error) {
    console.error(`Failed to initialize ${DB_TYPE} database:`, error);
    throw error;
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (DB_TYPE === 'sqlite') {
      return await checkSQLiteDatabaseHealth();
    } else {
      return await dbAdapter.healthCheck();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Utility functions for common database operations
export async function findById(table: string, id: string): Promise<any> {
  const sql = `SELECT * FROM ${table} WHERE id = $1`;
  return await get(sql, [id]);
}

export async function findAll(
  table: string, 
  conditions: Record<string, any> = {}, 
  orderBy?: string, 
  limit?: number
): Promise<any[]> {
  let sql = `SELECT * FROM ${table}`;
  const values: any[] = [];
  let paramIndex = 1;

  if (Object.keys(conditions).length > 0) {
    const whereClause = Object.keys(conditions)
      .map(key => `${key} = $${paramIndex++}`)
      .join(' AND ');
    sql += ` WHERE ${whereClause}`;
    values.push(...Object.values(conditions));
  }

  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`;
  }

  if (limit) {
    sql += ` LIMIT ${limit}`;
  }

  return await query(sql, values);
}

export async function insertRecord(table: string, data: Record<string, any>): Promise<string> {
  const columns = Object.keys(data);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const values = Object.values(data);

  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`;
  const result = await get(sql, values);
  return result?.id;
}

export async function updateRecord(
  table: string, 
  id: string, 
  data: Record<string, any>
): Promise<number> {
  const columns = Object.keys(data);
  const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
  const values = [...Object.values(data), id];

  const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length}`;
  const result = await run(sql, values);
  return result.changes || 0;
}

export async function deleteRecord(table: string, id: string): Promise<number> {
  const sql = `DELETE FROM ${table} WHERE id = $1`;
  const result = await run(sql, [id]);
  return result.changes || 0;
}

export async function countRecords(
  table: string, 
  conditions: Record<string, any> = {}
): Promise<number> {
  let sql = `SELECT COUNT(*) as count FROM ${table}`;
  const values: any[] = [];
  let paramIndex = 1;

  if (Object.keys(conditions).length > 0) {
    const whereClause = Object.keys(conditions)
      .map(key => `${key} = $${paramIndex++}`)
      .join(' AND ');
    sql += ` WHERE ${whereClause}`;
    values.push(...Object.values(conditions));
  }

  const result = await get(sql, values);
  return parseInt(result?.count || '0');
}

// Close database connections
export async function closeDatabase(): Promise<void> {
  try {
    if (DB_TYPE === 'sqlite') {
      const db = getDatabaseInstance();
      await db.disconnect();
    } else {
      await pool.end();
    }
    console.log(`${DB_TYPE} database connections closed`);
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Export database type info
export function getDatabaseType(): string {
  return DB_TYPE;
}

export function getDatabaseInfo(): { type: string; config: any } {
  if (DB_TYPE === 'sqlite') {
    return {
      type: 'sqlite',
      config: {
        path: process.env.DB_PATH || './database/netsafi.db'
      }
    };
  } else {
    return {
      type: 'postgresql',
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'netsafi_billing',
        user: process.env.DB_USER || 'postgres'
      }
    };
  }
}
