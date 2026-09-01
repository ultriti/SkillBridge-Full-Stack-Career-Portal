import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import userRepository from '../repositories/user.repository';

/**
 * Middleware to authenticate requests using JWT access token
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    try {
      const payload = verifyAccessToken(token);

      // Verify user still exists
      const user = await userRepository.findById(payload.sub);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Attach user to request
      req.user = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error: any) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          success: false,
          message: 'Access token has expired. Please refresh your token.',
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid access token',
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Middleware to authorize requests based on user roles
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}
