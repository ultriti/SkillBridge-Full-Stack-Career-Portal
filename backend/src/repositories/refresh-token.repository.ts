import crypto from 'crypto';
import pool from '../config/db';
import { RefreshTokenRecord } from '../types/auth.types';

export class RefreshTokenRepository {
  /**
   * Hash a token for secure storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Create a new refresh token record
   */
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenRecord> {
    const tokenHash = this.hashToken(token);
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, tokenHash, expiresAt]);
    return result.rows[0];
  }

  /**
   * Find a refresh token record by token hash
   */
  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const query = `
      SELECT * FROM refresh_tokens
      WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await pool.query(query, [tokenHash]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeUserTokens(userId: string): Promise<void> {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND revoked_at IS NULL
    `;
    await pool.query(query, [userId]);
  }

  /**
   * Revoke a specific refresh token
   */
  async revokeToken(tokenHash: string): Promise<void> {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = $1
    `;
    await pool.query(query, [tokenHash]);
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    const query = `
      DELETE FROM refresh_tokens
      WHERE expires_at < CURRENT_TIMESTAMP OR (revoked_at IS NOT NULL AND revoked_at < CURRENT_TIMESTAMP - INTERVAL '7 days')
    `;
    await pool.query(query);
  }

  /**
   * Get token hash for verification
   */
  getTokenHash(token: string): string {
    return this.hashToken(token);
  }
}

export default new RefreshTokenRepository();
