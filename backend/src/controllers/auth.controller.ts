import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { COOKIE_NAME } from '../constants/auth.constants';
import { ZodError } from 'zod';

export class AuthController {
  /**
   * User registration
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await authService.registerUser(validatedData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }

      if (error.statusCode === 409) {
        res.status(409).json({
          success: false,
          message: 'Email already exists',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * User login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await authService.loginUser(validatedData);

      // Set refresh token in HttpOnly cookie
      const secure = process.env.COOKIE_SECURE === 'true';
      const sameSite = (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax';

      res.cookie(COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure,
        sameSite,
        maxAge: this.getRefreshTokenMaxAge(),
        path: '/api/auth',
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          user,
        },
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }

      if (error.statusCode === 401) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      if (error.statusCode === 401) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies[COOKIE_NAME];

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token missing',
        });
        return;
      }

      const { accessToken } = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Access token refreshed',
        data: { accessToken },
      });
    } catch (error: any) {
      if (error.statusCode === 401) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * User logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies[COOKIE_NAME];

      if (refreshToken) {
        await authService.logoutUser(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        path: '/api/auth',
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Calculate max age for refresh token cookie
   */
  private getRefreshTokenMaxAge(): number {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // Default 7 days in milliseconds
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 1000 * 60,
      h: 1000 * 60 * 60,
      d: 1000 * 60 * 60 * 24,
    };

    return numValue * (multipliers[unit] || 1);
  }
}

export default new AuthController();
