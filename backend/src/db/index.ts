import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ROLE_SEED } from '../constants/roles.js';
import { applySchema } from './schema.js';
import { applyMigrations } from './migrations.js';
import { seedUsers } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../../data');
export const DB_FILE = path.join(DATA_DIR, 'mrc.sqlite');
export const WAR_ROOM_SEED_FILE = path.resolve(__dirname, '../../../config/seed/war-room.seed.json');
export const WAR_ROOM_RUNTIME_FILE = path.join(DATA_DIR, 'war-room.json');
export const TERRITORY_SEED_FILE = path.resolve(__dirname, '../../../config/seed/territory.seed.json');
export const TERRITORY_RUNTIME_FILE = path.join(DATA_DIR, 'territory.json');
export const USERS_SEED_FILE = path.resolve(__dirname, '../../../config/seed/users.seed.json');
export const SYSTEM_SETTINGS_FILE = path.join(DATA_DIR, 'system-settings.json');
export const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

export function readJsonFile<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

export function writeJsonFile(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function ensureRuntimeJsonFile(runtimeFile: string, seedFile: string): void {
  if (!fs.existsSync(runtimeFile)) {
    const seed = readJsonFile(seedFile);
    if (seed) {
      writeJsonFile(runtimeFile, seed);
    }
  }
}

function initDatabase(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const database = new Database(DB_FILE);
  database.pragma('journal_mode = WAL');

  applySchema(database, ROLE_SEED);
  applyMigrations(database);
  seedUsers(database, USERS_SEED_FILE);

  database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  return database;
}

export const db = initDatabase();
ensureRuntimeJsonFile(WAR_ROOM_RUNTIME_FILE, WAR_ROOM_SEED_FILE);
ensureRuntimeJsonFile(TERRITORY_RUNTIME_FILE, TERRITORY_SEED_FILE);
