import pool from '../config/db';
import { CandidateSearchFilters, CandidateProfileSummary } from '../types/resume-intelligence.types';

export class CandidateSearchRepository {
  /**
   * Search candidates with full-text search & filters
   */
  async searchCandidates(
    filters: CandidateSearchFilters,
    recruiterId?: string
  ): Promise<CandidateProfileSummary[]> {
    const { whereClause, values } = this.buildWhereClause(filters);

    const page = filters.page && filters.page >= 1 ? filters.page : 1;
    const limit = filters.limit && filters.limit >= 1 ? Math.min(filters.limit, 50) : 20;
    const offset = (page - 1) * limit;

    let sortSql = 'u.created_at DESC, u.id DESC';
    if (filters.sortBy === 'relevance' && filters.q) {
      sortSql = 'u.created_at DESC, u.id DESC';
    } else if (filters.sortBy === 'experience') {
      sortSql = 'u.created_at ASC, u.id ASC';
    }

    values.push(limit, offset);
    let shortlistSelect = 'FALSE AS is_shortlisted';
    if (recruiterId) {
      values.push(recruiterId);
      shortlistSelect = `EXISTS (
        SELECT 1 FROM recruiter_candidate_shortlists rcs
        WHERE rcs.candidate_id = u.id AND rcs.recruiter_id = $${values.length}
      ) AS is_shortlisted`;
    }

    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.bio,
        u.location,
        u.profile_image,
        ${shortlistSelect},
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'source', COALESCE(us.source, 'MANUAL'),
                'confidence', COALESCE(us.confidence, 1.0)
              )
            )
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = u.id
          ),
          '[]'::json
        ) AS skills,
        (
          SELECT row_to_json(r_sub)
          FROM (
            SELECT id, student_id, file_name, file_url, file_type, file_size, is_default, version, processing_status
            FROM resumes
            WHERE student_id = u.id AND is_default = TRUE
            LIMIT 1
          ) r_sub
        ) AS "primaryResume"
      FROM users u
      WHERE u.role = 'student' ${whereClause ? `AND ${whereClause}` : ''}
      ORDER BY ${sortSql}
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count total candidate matches
   */
  async countCandidates(filters: CandidateSearchFilters): Promise<number> {
    const { whereClause, values } = this.buildWhereClause(filters);
    const query = `
      SELECT COUNT(DISTINCT u.id)
      FROM users u
      WHERE u.role = 'student' ${whereClause ? `AND ${whereClause}` : ''}
    `;
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get single candidate profile by ID
   */
  async findCandidateById(candidateId: string, recruiterId?: string): Promise<CandidateProfileSummary | null> {
    const values: any[] = [candidateId];
    let shortlistSelect = 'FALSE AS is_shortlisted';
    if (recruiterId) {
      values.push(recruiterId);
      shortlistSelect = `EXISTS (
        SELECT 1 FROM recruiter_candidate_shortlists rcs
        WHERE rcs.candidate_id = u.id AND rcs.recruiter_id = $2
      ) AS is_shortlisted`;
    }

    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.bio,
        u.location,
        u.profile_image,
        ${shortlistSelect},
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'source', COALESCE(us.source, 'MANUAL'),
                'confidence', COALESCE(us.confidence, 1.0)
              )
            )
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = u.id
          ),
          '[]'::json
        ) AS skills,
        (
          SELECT row_to_json(r_sub)
          FROM (
            SELECT id, student_id, file_name, file_url, file_type, file_size, is_default, version, processing_status, extracted_text
            FROM resumes
            WHERE student_id = u.id AND is_default = TRUE
            LIMIT 1
          ) r_sub
        ) AS "primaryResume"
      FROM users u
      WHERE u.id = $1 AND u.role = 'student'
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  private buildWhereClause(filters: CandidateSearchFilters) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.q && filters.q.trim().length > 0) {
      values.push(`%${filters.q.trim()}%`);
      const p = values.length;
      conditions.push(`(
        u.first_name ILIKE $${p}
        OR u.last_name ILIKE $${p}
        OR u.bio ILIKE $${p}
        OR u.location ILIKE $${p}
        OR EXISTS (
          SELECT 1 FROM user_skills us_q JOIN skills s_q ON us_q.skill_id = s_q.id
          WHERE us_q.user_id = u.id AND s_q.name ILIKE $${p}
        )
      )`);
    }

    if (filters.location && filters.location.trim().length > 0) {
      values.push(`%${filters.location.trim()}%`);
      conditions.push(`u.location ILIKE $${values.length}`);
    }

    if (filters.skills && filters.skills.length > 0) {
      const mode = filters.skillMatch === 'all' ? 'ALL' : 'ANY';
      const cleanSkills = filters.skills.map((s) => s.trim()).filter((s) => s.length > 0);

      if (cleanSkills.length > 0) {
        if (mode === 'ALL') {
          for (const skillName of cleanSkills) {
            values.push(`%${skillName}%`);
            const p = values.length;
            conditions.push(`EXISTS (
              SELECT 1 FROM user_skills us_sub JOIN skills s_sub ON us_sub.skill_id = s_sub.id
              WHERE us_sub.user_id = u.id AND s_sub.name ILIKE $${p}
            )`);
          }
        } else {
          const skillPlaceholders: string[] = [];
          for (const skillName of cleanSkills) {
            values.push(`%${skillName}%`);
            skillPlaceholders.push(`s_sub.name ILIKE $${values.length}`);
          }
          conditions.push(`EXISTS (
            SELECT 1 FROM user_skills us_sub JOIN skills s_sub ON us_sub.skill_id = s_sub.id
            WHERE us_sub.user_id = u.id AND (${skillPlaceholders.join(' OR ')})
          )`);
        }
      }
    }

    return {
      whereClause: conditions.length > 0 ? conditions.join(' AND ') : '',
      values,
    };
  }
}

export default new CandidateSearchRepository();
