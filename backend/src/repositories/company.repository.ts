import pool from '../config/db';
import { Company } from '../types/database';

export class CompanyRepository {
  /**
   * Find company by recruiter ID
   */
  async findByRecruiterId(recruiterId: string): Promise<Company | null> {
    const query = 'SELECT * FROM companies WHERE recruiter_id = $1 LIMIT 1';
    const result = await pool.query(query, [recruiterId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find company by ID
   */
  async findById(id: string): Promise<Company | null> {
    const query = 'SELECT * FROM companies WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export default new CompanyRepository();
