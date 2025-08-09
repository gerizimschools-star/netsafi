import sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

interface DatabaseConfig {
  path: string;
  verbose?: boolean;
}

class SQLiteDatabase {
  private db: Database | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Ensure database directory exists
      const dbDir = path.dirname(this.config.path);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new Database(this.config.path, (err) => {
        if (err) {
          console.error('Error connecting to SQLite database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database:', this.config.path);
          resolve();
        }
      });

      // Enable foreign key constraints
      this.db.run('PRAGMA foreign_keys = ON');
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('SQLite query error:', err, 'SQL:', sql, 'Params:', params);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('SQLite run error:', err, 'SQL:', sql, 'Params:', params);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('SQLite get error:', err, 'SQL:', sql, 'Params:', params);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async initialize(): Promise<void> {
    try {
      // Check if tables exist
      const tables = await this.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      if (tables.length === 0) {
        console.log('Initializing database schema...');
        await this.runSchemaFile();
        console.log('Database schema initialized successfully');
      } else {
        console.log('Database already initialized with', tables.length, 'tables');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async runSchemaFile(): Promise<void> {
    try {
      const schemaPath = path.join(process.cwd(), 'database', 'sqlite_dev_schema.sql');
      console.log('Looking for schema file at:', schemaPath);

      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }

      const schema = fs.readFileSync(schemaPath, 'utf8');
      console.log('Schema file read, length:', schema.length);

      // Split schema into individual statements
      const rawStatements = schema.split(';');
      console.log('Raw statements count:', rawStatements.length);

      const statements = rawStatements
        .map(stmt => {
          // Remove comment lines but keep SQL lines
          const lines = stmt.split('\n');
          const sqlLines = lines
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('--'));
          return sqlLines.join('\n').trim();
        })
        .filter(stmt => {
          // Remove empty statements
          if (stmt.length === 0) return false;
          // Remove PRAGMA statements (they should be executed separately)
          if (stmt.startsWith('PRAGMA')) return false;
          // Must contain some SQL
          return stmt.length > 10;
        });

      console.log('Filtered statements count:', statements.length);

      // Debug: show first few statements (both raw and filtered)
      for (let i = 0; i < Math.min(3, rawStatements.length); i++) {
        const trimmed = rawStatements[i].trim();
        console.log(`Raw statement ${i + 1}:`, trimmed.substring(0, 100));
        console.log(`  - Starts with --? ${trimmed.startsWith('--')}`);
        console.log(`  - Starts with PRAGMA? ${trimmed.startsWith('PRAGMA')}`);
        console.log(`  - Length: ${trimmed.length}`);
      }

      for (let i = 0; i < Math.min(3, statements.length); i++) {
        console.log(`Filtered statement ${i + 1} preview:`, statements[i].substring(0, 100));
      }

      // Execute each statement with error handling
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            console.log(`Executing statement ${i + 1}/${statements.length}:`, statement.substring(0, 50) + '...');
            await this.run(statement);
            console.log(`✓ Statement ${i + 1} executed successfully`);
          } catch (error) {
            // Skip errors for already existing objects
            if (!error.message.includes('already exists') &&
                !error.message.includes('duplicate')) {
              console.warn('Schema statement warning:', error.message, 'Statement:', statement.substring(0, 100));
            }
          }
        }
      }

      console.log('Schema execution completed');
    } catch (error) {
      console.error('Error running schema file:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  async backup(backupPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.backup(backupPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Utility methods for common operations
  async insertAndGetId(table: string, data: Record<string, any>): Promise<string> {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    await this.run(sql, values);

    // For SQLite, we need to get the row ID differently
    const result = await this.get(`SELECT id FROM ${table} ORDER BY rowid DESC LIMIT 1`);
    return result?.id;
  }

  async updateById(table: string, id: string, data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    const result = await this.run(sql, values);
    return result.changes;
  }

  async deleteById(table: string, id: string): Promise<number> {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const result = await this.run(sql, [id]);
    return result.changes;
  }

  async findById(table: string, id: string): Promise<any> {
    const sql = `SELECT * FROM ${table} WHERE id = ?`;
    return await this.get(sql, [id]);
  }

  async findAll(table: string, conditions: Record<string, any> = {}, orderBy?: string, limit?: number): Promise<any[]> {
    let sql = `SELECT * FROM ${table}`;
    const values: any[] = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
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

    return await this.query(sql, values);
  }

  async count(table: string, conditions: Record<string, any> = {}): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    const values: any[] = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    const result = await this.get(sql, values);
    return result?.count || 0;
  }
}

// Database instance
let dbInstance: SQLiteDatabase | null = null;

export function getDatabaseInstance(): SQLiteDatabase {
  if (!dbInstance) {
    const dbPath = process.env.DB_PATH || './database/netsafi.db';
    dbInstance = new SQLiteDatabase({
      path: dbPath,
      verbose: process.env.NODE_ENV !== 'production'
    });
  }
  return dbInstance;
}

export async function initializeSQLiteDatabase(): Promise<void> {
  try {
    const db = getDatabaseInstance();
    await db.connect();
    await db.initialize();
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
    throw error;
  }
}

export async function checkSQLiteDatabaseHealth(): Promise<boolean> {
  try {
    const db = getDatabaseInstance();
    return await db.healthCheck();
  } catch (error) {
    return false;
  }
}

export { SQLiteDatabase };
