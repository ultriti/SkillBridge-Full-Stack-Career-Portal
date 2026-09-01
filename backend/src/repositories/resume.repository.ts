import pool from '../config/db';
import { Resume } from '../types/database';

export class ResumeRepository {
  /**
   * Find resume by ID
   */
  async findById(id: string): Promise<Resume | null> {
    const query = 'SELECT * FROM resumes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find all resumes for student
   */
  async findByStudentId(studentId: string): Promise<Resume[]> {
    const query = 'SELECT * FROM resumes WHERE student_id = $1 ORDER BY is_default DESC, created_at DESC';
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  /**
   * Find default resume for student
   */
  async findDefaultByStudentId(studentId: string): Promise<Resume | null> {
    const query = 'SELECT * FROM resumes WHERE student_id = $1 AND is_default = TRUE LIMIT 1';
    const result = await pool.query(query, [studentId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export default new ResumeRepository();
