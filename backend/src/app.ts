import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Express = express();

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

export default app;
