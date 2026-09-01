import pool from '../config/db';
import { SearchHistoryRecord } from '../types/job-search.types';

export class SearchHistoryRepository {
  /**
   * Add search history entry and maintain top 20 limit per user
   */
  async addSearchHistory(
    userId: string,
    query?: string | null,
    filters?: Record<string, any>
  ): Promise<SearchHistoryRecord> {
    const jsonFilters = filters ? JSON.stringify(filters) : '{}';

    // Insert search record
    const insertQuery = `
      INSERT INTO search_history (user_id, query, filters)
      VALUES ($1, $2, $3::jsonb)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [userId, query || null, jsonFilters]);
    const created = result.rows[0];

    // Maintain max 20 records per user (prune older entries)
    const cleanupQuery = `
      DELETE FROM search_history
      WHERE user_id = $1 AND id NOT IN (
        SELECT id FROM search_history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 20
      )
    `;
    await pool.query(cleanupQuery, [userId]);

    return created;
  }

  /**
   * Get authenticated user's search history
   */
  async findUserSearchHistory(userId: string, limit: number = 10): Promise<SearchHistoryRecord[]> {
    const query = `
      SELECT * FROM search_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * Delete single search history entry owned by user
   */
  async deleteSearchHistory(id: string, userId: string): Promise<boolean> {
    const query = 'DELETE FROM search_history WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Clear all search history for user
   */
  async clearUserSearchHistory(userId: string): Promise<number> {
    const query = 'DELETE FROM search_history WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount ?? 0;
  }
}

export default new SearchHistoryRepository();
