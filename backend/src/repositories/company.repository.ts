import pool from '../config/db';
import { Company } from '../types/database';

export interface CompanyData {
  name: string;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: string | null;
  location?: string | null;
}

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

  /**
   * Create new company for recruiter
   */
  async create(recruiterId: string, data: CompanyData): Promise<Company> {
    const query = `
      INSERT INTO companies (recruiter_id, name, description, website, logo, industry, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      recruiterId,
      data.name,
      data.description || null,
      data.website || null,
      data.logo || null,
      data.industry || null,
      data.location || null,
    ]);
    return result.rows[0];
  }

  /**
   * Update existing company for recruiter
   */
  async update(companyId: string, data: Partial<CompanyData>): Promise<Company> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description || null);
    }
    if (data.website !== undefined) {
      fields.push(`website = $${idx++}`);
      values.push(data.website || null);
    }
    if (data.logo !== undefined) {
      fields.push(`logo = $${idx++}`);
      values.push(data.logo || null);
    }
    if (data.industry !== undefined) {
      fields.push(`industry = $${idx++}`);
      values.push(data.industry || null);
    }
    if (data.location !== undefined) {
      fields.push(`location = $${idx++}`);
      values.push(data.location || null);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(companyId);

    const query = `
      UPDATE companies
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

export default new CompanyRepository();
