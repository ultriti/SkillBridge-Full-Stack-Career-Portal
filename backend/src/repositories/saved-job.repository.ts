import pool from '../config/db';
import { SavedJob } from '../types/database';
import { JobWithCompany } from './job.repository';

export interface SavedJobWithDetails extends SavedJob {
  job: JobWithCompany;
}

export class SavedJobRepository {
  /**
   * Bookmark a job for a student
   */
  async saveJob(studentId: string, jobId: string): Promise<SavedJob> {
    const query = `
      INSERT INTO saved_jobs (student_id, job_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [studentId, jobId]);
    return result.rows[0];
  }

  /**
   * Remove a saved job bookmark for a student
   */
  async unsaveJob(studentId: string, jobId: string): Promise<boolean> {
    const query = 'DELETE FROM saved_jobs WHERE student_id = $1 AND job_id = $2';
    const result = await pool.query(query, [studentId, jobId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Check if job is saved by student
   */
  async isJobSaved(studentId: string, jobId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM saved_jobs WHERE student_id = $1 AND job_id = $2 LIMIT 1';
    const result = await pool.query(query, [studentId, jobId]);
    return result.rows.length > 0;
  }

  /**
   * Find all active saved jobs for student with pagination
   */
  async findSavedJobs(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc'
  ): Promise<SavedJobWithDetails[]> {
    const offset = (page - 1) * limit;

    const sortColumns: Record<string, string> = {
      createdAt: 'sj.created_at',
      salaryMin: 'j.salary_min',
      salaryMax: 'j.salary_max',
      applicationDeadline: 'j.application_deadline',
    };

    const sortColumn = sortColumns[sortBy] || 'sj.created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        sj.*,
        json_build_object(
          'id', j.id,
          'company_id', j.company_id,
          'recruiter_id', j.recruiter_id,
          'title', j.title,
          'description', j.description,
          'job_type', j.job_type,
          'work_mode', j.work_mode,
          'location', j.location,
          'salary_min', j.salary_min,
          'salary_max', j.salary_max,
          'experience_level', j.experience_level,
          'application_deadline', j.application_deadline,
          'status', j.status,
          'created_at', j.created_at,
          'updated_at', j.updated_at,
          'company', json_build_object(
            'id', c.id,
            'name', c.name,
            'logo', c.logo,
            'industry', c.industry,
            'location', c.location
          )
        ) AS job
      FROM saved_jobs sj
      INNER JOIN jobs j ON sj.job_id = j.id
      INNER JOIN companies c ON j.company_id = c.id
      WHERE sj.student_id = $1 AND j.status = 'ACTIVE'
      ORDER BY ${sortColumn} ${order} NULLS LAST
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [studentId, limit, offset]);
    return result.rows;
  }

  /**
   * Count total active saved jobs for student
   */
  async countSavedJobs(studentId: string): Promise<number> {
    const query = `
      SELECT COUNT(*)
      FROM saved_jobs sj
      INNER JOIN jobs j ON sj.job_id = j.id
      WHERE sj.student_id = $1 AND j.status = 'ACTIVE'
    `;
    const result = await pool.query(query, [studentId]);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get set of saved job IDs for student given an array of job IDs
   */
  async findSavedJobIds(studentId: string, jobIds: string[]): Promise<Set<string>> {
    if (jobIds.length === 0) return new Set();
    const query = `
      SELECT job_id
      FROM saved_jobs
      WHERE student_id = $1 AND job_id = ANY($2::uuid[])
    `;
    const result = await pool.query(query, [studentId, jobIds]);
    return new Set(result.rows.map((row) => row.job_id));
  }
}

export default new SavedJobRepository();
