import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'dev.db');
const db = new DatabaseSync(dbPath);

// Read and extract TLE database from src/services/tleDatabase.ts
const tleFileContent = fs.readFileSync(path.resolve(process.cwd(), 'src/services/tleDatabase.ts'), 'utf-8');

// Parse satellite catalog items from the file
const satMatches = [...tleFileContent.matchAll(/{\s*id:\s*['"]([^'"]+)['"][\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?category:\s*['"]([^'"]+)['"][\s\S]*?tle:\s*{\s*line1:\s*['"]([^'"]+)['"]\s*,\s*line2:\s*['"]([^'"]+)['"]/g)];

console.log(`🌱 Seeding ${satMatches.length} satellites into SQLite database...`);

const insertStmt = db.prepare(`
  INSERT INTO Satellite (id, name, tleLine1, tleLine2, type, launchDate, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    tleLine1 = excluded.tleLine1,
    tleLine2 = excluded.tleLine2,
    type = excluded.type,
    updatedAt = datetime('now')
`);

let count = 0;
for (const match of satMatches) {
  const [, id, name, category, line1, line2] = match;
  insertStmt.run(id, name, line1, line2, category, null);
  count++;
}

console.log(`✅ Seeding completed! ${count} satellite records inserted/upserted into "Satellite" table.`);
