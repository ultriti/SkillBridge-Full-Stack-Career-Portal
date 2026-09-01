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
      if (error.message && error.message.includes('expired')) {
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
 * Optional authentication middleware - attaches user if token is provided and valid,
 * but proceeds anyway if token is missing or invalid.
 */
export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = verifyAccessToken(token);
        const user = await userRepository.findById(payload.sub);
        if (user) {
          req.user = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
          };
        }
      } catch (err) {
        // Ignore invalid token on optional auth
      }
    }
  } catch (err) {
    // Ignore error
  }
  next();
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
