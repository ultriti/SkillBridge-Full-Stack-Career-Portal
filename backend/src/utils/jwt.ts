import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  type: 'refresh';
}

/**
 * Generate an access token
 * @param userId - User ID to include in token
 * @param role - User role to include in token
 * @returns The signed access token
 */
export function generateAccessToken(userId: string, role: string): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET environment variable is not set');
  }

  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

  const options: SignOptions = { expiresIn: expiresIn as any };

  return jwt.sign(
    {
      sub: userId,
      role,
      type: 'access',
    } as AccessTokenPayload,
    secret,
    options
  );
}

/**
 * Generate a refresh token
 * @param userId - User ID to include in token
 * @returns The signed refresh token
 */
export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  const options: SignOptions = { expiresIn: expiresIn as any };

  return jwt.sign(
    {
      sub: userId,
      type: 'refresh',
    } as RefreshTokenPayload,
    secret,
    options
  );
}

/**
 * Verify an access token
 * @param token - The token to verify
 * @returns The decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET environment variable is not set');
  }

  try {
    const payload = jwt.verify(token, secret) as AccessTokenPayload;
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    }
    throw new Error('Invalid access token');
  }
}

/**
 * Verify a refresh token
 * @param token - The token to verify
 * @returns The decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }

  try {
    const payload = jwt.verify(token, secret) as RefreshTokenPayload;
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    throw new Error('Invalid refresh token');
  }
}
