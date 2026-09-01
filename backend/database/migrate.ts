import fs from 'fs';
import path from 'path';
import pool from '../src/config/db';

async function runMigration() {
  console.log('🚀 Running database migration: 001_initial_schema.sql...');
  try {
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log('✅ Migration completed successfully!');
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

runMigration();
