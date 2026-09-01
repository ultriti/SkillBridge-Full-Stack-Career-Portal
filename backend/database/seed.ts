import fs from 'fs';
import path from 'path';
import pool from '../src/config/db';

async function runSeed() {
  console.log('🌱 Running database seed: 001_initial_seed.sql...');
  try {
    const seedPath = path.join(__dirname, 'seeds', '001_initial_seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');

    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log('✅ Seed completed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
