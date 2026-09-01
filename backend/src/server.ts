import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import pool from './config/db';
import { initNotificationSocket } from './sockets/notification.socket';

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
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: clientUrl,
    credentials: true,
  },
});

initNotificationSocket(io);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
  } else {
    console.log('✅ PostgreSQL Database connected successfully at:', res.rows[0].now);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 SkillBridge Backend Server listening on http://localhost:${PORT}`);
});
