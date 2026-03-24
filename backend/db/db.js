import '../../config/loadEnv.js';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbDir = path.join(process.cwd(), 'backend', 'db');
const dbPath = path.join(dbDir, 'banking_app.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath, {
  verbose: process.env.DB_VERBOSE === 'true' ? console.log : undefined,
});

export default db;
