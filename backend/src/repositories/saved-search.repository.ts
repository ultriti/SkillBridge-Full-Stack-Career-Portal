import pool from '../config/db';
import { SavedSearchRecord, CreateSavedSearchDTO, UpdateSavedSearchDTO } from '../types/job-search.types';

export class SavedSearchRepository {
  /**
   * Create a new saved search for user
   */
  async createSavedSearch(userId: string, dto: CreateSavedSearchDTO): Promise<SavedSearchRecord> {
    const jsonFilters = dto.filters ? JSON.stringify(dto.filters) : '{}';
    const query = `
      INSERT INTO saved_searches (user_id, name, query, filters, alert_enabled)
      VALUES ($1, $2, $3, $4::jsonb, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      dto.name,
      dto.query || null,
      jsonFilters,
      dto.alertEnabled ?? false,
    ]);
    return result.rows[0];
  }

  /**
   * Find saved search by ID
   */
  async findById(id: string): Promise<SavedSearchRecord | null> {
    const query = 'SELECT * FROM saved_searches WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find all saved searches for user
   */
  async findUserSavedSearches(userId: string): Promise<SavedSearchRecord[]> {
    const query = `
      SELECT * FROM saved_searches
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Count saved searches for user
   */
  async countUserSavedSearches(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM saved_searches WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Update saved search owned by user
   */
  async updateSavedSearch(
    id: string,
    userId: string,
    dto: UpdateSavedSearchDTO
  ): Promise<SavedSearchRecord | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.query !== undefined) {
      fields.push(`query = $${idx++}`);
      values.push(dto.query || null);
    }
    if (dto.filters !== undefined) {
      fields.push(`filters = $${idx++}::jsonb`);
      values.push(JSON.stringify(dto.filters));
    }
    if (dto.alertEnabled !== undefined) {
      fields.push(`alert_enabled = $${idx++}`);
      values.push(dto.alertEnabled);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const query = `
      UPDATE saved_searches
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND user_id = $${idx}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(id: string, userId: string): Promise<boolean> {
    const query = 'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Find all active alert saved searches across system
   */
  async findActiveAlertSearches(): Promise<SavedSearchRecord[]> {
    const query = 'SELECT * FROM saved_searches WHERE alert_enabled = TRUE';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Record job alert delivery for idempotency
   */
  async recordJobAlertDelivery(
    savedSearchId: string,
    jobId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const query = `
        INSERT INTO job_alert_deliveries (saved_search_id, job_id, user_id)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
        RETURNING id
      `;
      const result = await pool.query(query, [savedSearchId, jobId, userId]);
      return result.rows.length > 0;
    } catch (err) {
      return false;
    }
  }
}

export default new SavedSearchRepository();
