import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_DIR = path.join(__dirname, 'sql');

async function run() {
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(`
      create table if not exists _migrations (
        name        text primary key,
        applied_at  timestamptz not null default now()
      );
    `);

    const files = fs
      .readdirSync(SQL_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows: applied } = await client.query<{ name: string }>('select name from _migrations');
    const appliedNames = new Set(applied.map((r) => r.name));

    for (const file of files) {
      if (appliedNames.has(file)) {
        console.log(`skip (already applied): ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(SQL_DIR, file), 'utf8');
      console.log(`applying: ${file}`);

      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into _migrations (name) values ($1)', [file]);
        await client.query('commit');
        console.log(`applied: ${file}`);
      } catch (err) {
        await client.query('rollback');
        throw err;
      }
    }

    console.log('Migrations complete.');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
