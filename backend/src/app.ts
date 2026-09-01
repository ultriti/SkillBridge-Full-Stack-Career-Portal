import express, { Express } from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Health Check Routes
app.use('/api/health', healthRoutes);

export default app;
