import pool from '../config/db';
import { ShortlistRecord, CandidateProfileSummary } from '../types/resume-intelligence.types';

export class ShortlistRepository {
  /**
   * Add candidate to recruiter shortlist
   */
  async addShortlist(recruiterId: string, candidateId: string): Promise<ShortlistRecord> {
    const query = `
      INSERT INTO recruiter_candidate_shortlists (recruiter_id, candidate_id)
      VALUES ($1, $2)
      ON CONFLICT (recruiter_id, candidate_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [recruiterId, candidateId]);
    if (result.rows.length > 0) return result.rows[0];

    const findQuery = 'SELECT * FROM recruiter_candidate_shortlists WHERE recruiter_id = $1 AND candidate_id = $2';
    const findResult = await pool.query(findQuery, [recruiterId, candidateId]);
    return findResult.rows[0];
  }

  /**
   * Remove candidate from recruiter shortlist
   */
  async removeShortlist(recruiterId: string, candidateId: string): Promise<boolean> {
    const query = 'DELETE FROM recruiter_candidate_shortlists WHERE recruiter_id = $1 AND candidate_id = $2';
    const result = await pool.query(query, [recruiterId, candidateId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Find all shortlisted candidate profiles for recruiter
   */
  async findShortlistedCandidates(recruiterId: string): Promise<CandidateProfileSummary[]> {
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
        TRUE AS is_shortlisted,
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
      FROM recruiter_candidate_shortlists rcs
      JOIN users u ON rcs.candidate_id = u.id
      WHERE rcs.recruiter_id = $1
      ORDER BY rcs.created_at DESC
    `;

    const result = await pool.query(query, [recruiterId]);
    return result.rows;
  }
}

export default new ShortlistRepository();
