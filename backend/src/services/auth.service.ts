import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthUser, RegisterRequest, LoginRequest } from '../types/auth.types';
import userRepository from '../repositories/user.repository';
import refreshTokenRepository from '../repositories/refresh-token.repository';
import { User } from '../types/database';

export class AuthService {
  /**
   * Register a new user
   */
  async registerUser(input: RegisterRequest): Promise<AuthUser> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      const error = new Error('Email already exists');
      (error as any).statusCode = 409;
      throw error;
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await userRepository.createUser(
      input.firstName,
      input.lastName,
      input.email,
      passwordHash,
      input.role
    );

    return this.userToAuthUser(user);
  }

  /**
   * Authenticate user with email and password
   */
  async loginUser(input: LoginRequest): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    const user = await userRepository.findByEmail(input.email);

    // Don't reveal whether email exists or password is wrong
    if (!user || !(await comparePassword(input.password, user.password_hash))) {
      const error = new Error('Invalid email or password');
      (error as any).statusCode = 401;
      throw error;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token (hashed)
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const expiresAtMs = this.parseExpiresDuration(expiresIn);
    const expiresAt = new Date(Date.now() + expiresAtMs);

    await refreshTokenRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: this.userToAuthUser(user),
    };
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 401;
      throw error;
    }
    return this.userToAuthUser(user);
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokenHash = refreshTokenRepository.getTokenHash(refreshToken);

      // Check if token is stored and not revoked
      const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);
      if (!storedToken) {
        const error = new Error('Refresh token is invalid or has been revoked');
        (error as any).statusCode = 401;
        throw error;
      }

      // Get user to ensure they still exist
      const user = await userRepository.findById(payload.sub);
      if (!user) {
        const error = new Error('User not found');
        (error as any).statusCode = 401;
        throw error;
      }

      // Generate new access token
      const accessToken = generateAccessToken(user.id, user.role);

      return { accessToken };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      const err = new Error('Invalid refresh token');
      (err as any).statusCode = 401;
      throw err;
    }
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logoutUser(refreshToken: string): Promise<void> {
    const tokenHash = refreshTokenRepository.getTokenHash(refreshToken);
    await refreshTokenRepository.revokeToken(tokenHash);
  }

  /**
   * Convert User DB model to AuthUser response model
   */
  private userToAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Parse expiration duration string (e.g., "7d", "15m") to milliseconds
   */
  private parseExpiresDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
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

export default new AuthService();
