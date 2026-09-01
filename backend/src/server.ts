import dotenv from 'dotenv';
import app from './app';
import pool from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
  } else {
    console.log('✅ PostgreSQL Database connected successfully at:', res.rows[0].now);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SkillBridge Backend Server listening on http://localhost:${PORT}`);
});
