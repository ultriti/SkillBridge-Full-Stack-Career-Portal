import dotenv from 'dotenv';
import app from './app';
import pool from './config/db';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
  process.exit(1);
}

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
