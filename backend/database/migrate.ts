import fs from 'fs';
import path from 'path';
import pool from '../src/config/db';

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    if (files.length === 0) {
      console.log('ℹ️  No migrations found');
      return;
    }

    const client = await pool.connect();
    try {
      for (const file of files) {
        console.log(`  Running: ${file}...`);
        const migrationPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await client.query(sql);
        console.log(`  ✅ ${file} completed`);
      }
      console.log('✅ All migrations completed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
