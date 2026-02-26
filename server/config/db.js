import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path - always relative to server directory
const dbPath = path.join(__dirname, '../database/ruralcare.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('📁 Database path:', dbPath);
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
    db.run('PRAGMA foreign_keys = ON'); // Enable foreign key support
  }
});

export const initDB = () => {
  // Schema path - relative to __dirname (config/db.js location)
  let schemaPath = path.join(__dirname, '../database/schema.sql');
  
  console.log('📖 Looking for schema at:', schemaPath);
  console.log('📖 File exists:', fs.existsSync(schemaPath));

  // If not found, try with /src prefix removal (Render quirk)
  if (!fs.existsSync(schemaPath) && __dirname.includes('/src/')) {
    const correctedDir = __dirname.replace(/\/src\//, '/');
    schemaPath = path.join(correctedDir, '../database/schema.sql');
    console.log('📖 Trying alternate path (src fix):', schemaPath);
    console.log('📖 File exists with alternate:', fs.existsSync(schemaPath));
  }

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found at:', schemaPath);
    const dbDir = path.dirname(schemaPath);
    try {
      console.error('❌ Contents of database dir:', fs.readdirSync(dbDir));
    } catch (e) {
      console.error('❌ Cannot read database dir:', dbDir);
    }
    return Promise.reject(new Error(`Schema file not found at ${schemaPath}`));
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('📖 Schema loaded, size:', schema.length, 'bytes');

  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Error initializing database:', err.message);
        reject(err);
      } else {
        console.log('✅ Database tables initialized successfully.');
        resolve();
      }
    });
  });
};

// Promisified query helper
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Promisified get helper (single row)
export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promisified run helper (insert/update/delete)
export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export default db;
