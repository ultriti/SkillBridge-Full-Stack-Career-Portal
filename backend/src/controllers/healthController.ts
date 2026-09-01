import { Request, Response } from 'express';
import pool from '../config/db';

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'UP',
    service: 'SkillBridge Backend API',
    timestamp: new Date().toISOString(),
  });
};

export const getDbHealth = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time, current_database() AS database_name;');
    res.status(200).json({
      status: 'UP',
      database: result.rows[0].database_name,
      timestamp: result.rows[0].current_time,
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      error: error instanceof Error ? error.message : 'Database connection error',
    });
  }
};
