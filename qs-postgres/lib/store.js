// QuickShop storage: local JSON for zero-configuration development; PostgreSQL for Vercel.
// PostgreSQL uses a transactional JSONB document so checkout and stock updates stay atomic.
import postgres from 'postgres';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { seedProducts } from './catalog';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const hosted = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
const dataFile = path.join(process.cwd(), '.data', 'quickshop.json');
const initialData = () => ({
  products: seedProducts.map(p => ({ ...p, _id: randomUUID(), isActive: true })),
  users: [], orders: [], subscribers: [],
  stores: [{ _id: randomUUID(), name: 'QuickShop Kolkata Central', storeCode: 'KOL-001', location: { coordinates: [88.3639, 22.5726] }, isActive: true }]
});
let pool;
let ready;
let queue = Promise.resolve();

export function storeMode() { return connectionString ? 'postgresql' : (hosted ? 'unconfigured' : 'local-json'); }

function database() {
  if (!connectionString) {
    if (hosted) throw new Error('DATABASE_URL is required for persistent accounts and orders on Vercel. Connect a Neon Postgres database.');
    return null;
  }
  if (!pool) pool = postgres(connectionString, { max: 5, idle_timeout: 15, connect_timeout: 10, prepare: false });
  return pool;
}

async function ensureDatabase() {
  const sql = database();
  if (!sql) return null;
  if (!ready) {
    ready = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS quickshop_store (id INTEGER PRIMARY KEY, payload JSONB NOT NULL)`;
      const seed = JSON.stringify(initialData());
      await sql`INSERT INTO quickshop_store (id, payload) VALUES (1, ${seed}::jsonb) ON CONFLICT (id) DO NOTHING`;
    })().catch(err => { ready = null; throw err; });
  }
  await ready;
  return sql;
}

async function readJson() {
  try { return JSON.parse(await fs.readFile(dataFile, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const initial = initialData();
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(initial, null, 2));
    return initial;
  }
}
export async function readStore() {
  const sql = await ensureDatabase();
  if (sql) {
    const rows = await sql`SELECT payload FROM quickshop_store WHERE id = 1`;
    return rows[0].payload;
  }
  return readJson();
}
export async function mutateStore(fn) {
  const sql = await ensureDatabase();
  if (sql) {
    return sql.begin(async tx => {
      const rows = await tx`SELECT payload FROM quickshop_store WHERE id = 1 FOR UPDATE`;
      const data = rows[0].payload;
      const result = await fn(data);
      const payload = JSON.stringify(data);
      await tx`UPDATE quickshop_store SET payload = ${payload}::jsonb WHERE id = 1`;
      return result;
    });
  }
  const next = queue.then(async () => {
    const data = await readJson();
    const result = await fn(data);
    const file = dataFile + '.tmp';
    await fs.writeFile(file, JSON.stringify(data, null, 2));
    await fs.rename(file, dataFile);
    return result;
  });
  queue = next.catch(() => {});
  return next;
}
export async function list(collection, filter = {}) {
  const data = await readStore();
  return (data[collection] || []).filter(row => Object.entries(filter).every(([key, value]) => String(row[key]) === String(value)));
}
export async function insert(collection, doc) {
  return mutateStore(data => {
    const row = { _id: randomUUID(), createdAt: new Date().toISOString(), ...doc };
    data[collection].push(row);
    return row;
  });
}
export async function update(collection, id, fn) {
  return mutateStore(data => {
    const index = (data[collection] || []).findIndex(row => String(row._id) === String(id));
    if (index < 0) return null;
    const result = fn(data[collection][index]);
    data[collection][index] = { ...data[collection][index], ...result };
    return data[collection][index];
  });
}
