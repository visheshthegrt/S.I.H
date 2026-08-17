import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'dev.db');
const db = new DatabaseSync(dbPath);

console.log('🚀 Pushing schema to SQLite database at:', dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS Satellite (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tleLine1 TEXT NOT NULL,
    tleLine2 TEXT NOT NULL,
    type TEXT NOT NULL,
    launchDate TEXT,
    updatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  );
`);

console.log('✅ Schema pushed successfully! Table "Satellite" is ready.');
