import pool from '../config/db';
import { ExtendedResume, ResumeProcessingStatus } from '../types/resume-intelligence.types';

export class ResumeRepository {
  /**
   * Find resume by ID
   */
  async findById(id: string): Promise<ExtendedResume | null> {
    const query = 'SELECT * FROM resumes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find all resumes for student (ordered by version DESC)
   */
  async findByStudentId(studentId: string): Promise<ExtendedResume[]> {
    const query = 'SELECT * FROM resumes WHERE student_id = $1 ORDER BY is_default DESC, version DESC, created_at DESC';
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  /**
   * Find default/primary resume for student
   */
  async findDefaultByStudentId(studentId: string): Promise<ExtendedResume | null> {
    const query = 'SELECT * FROM resumes WHERE student_id = $1 AND is_default = TRUE LIMIT 1';
    const result = await pool.query(query, [studentId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get highest version number for student's resumes
   */
  async getNextVersionNumber(studentId: string): Promise<number> {
    const query = 'SELECT COALESCE(MAX(version), 0) + 1 AS next_ver FROM resumes WHERE student_id = $1';
    const result = await pool.query(query, [studentId]);
    return parseInt(result.rows[0].next_ver, 10);
  }

  /**
   * Create new resume record
   */
  async createResume(data: {
    student_id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    storage_key?: string;
    is_default?: boolean;
    version: number;
  }): Promise<ExtendedResume> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If set as default, reset existing defaults
      if (data.is_default) {
        await client.query('UPDATE resumes SET is_default = FALSE WHERE student_id = $1', [data.student_id]);
      }

      const query = `
        INSERT INTO resumes (
          student_id, file_name, file_url, file_type, file_size, storage_key,
          is_default, version, processing_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
        RETURNING *
      `;
      const values = [
        data.student_id,
        data.file_name,
        data.file_url,
        data.file_type || 'application/pdf',
        data.file_size || 0,
        data.storage_key || null,
        data.is_default ?? false,
        data.version,
      ];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update resume processing status and extracted content
   */
  async updateProcessingResult(
    id: string,
    status: ResumeProcessingStatus,
    extractedText?: string | null,
    wordCount?: number,
    error?: string | null
  ): Promise<ExtendedResume | null> {
    const query = `
      UPDATE resumes
      SET 
        processing_status = $1,
        extracted_text = COALESCE($2, extracted_text),
        word_count = COALESCE($3, word_count),
        processing_error = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [status, extractedText || null, wordCount || 0, error || null, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Set primary/default resume for student (transaction safe)
   */
  async setPrimaryResume(id: string, studentId: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Unset existing defaults
      await client.query('UPDATE resumes SET is_default = FALSE WHERE student_id = $1', [studentId]);

      // Set target resume as default
      const result = await client.query(
        'UPDATE resumes SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND student_id = $2 RETURNING id',
        [id, studentId]
      );

      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete resume record
   */
  async deleteResume(id: string, studentId: string): Promise<boolean> {
    const query = 'DELETE FROM resumes WHERE id = $1 AND student_id = $2';
    const result = await pool.query(query, [id, studentId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new ResumeRepository();
