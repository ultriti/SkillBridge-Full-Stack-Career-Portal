import pool from '../config/db';
import { Application, ApplicationStatus } from '../types/database';

export interface ApplicationJobSummary {
  id: string;
  title: string;
  job_type: string;
  work_mode: string;
  location?: string | null;
  status: string;
  company: {
    id: string;
    name: string;
    logo?: string | null;
    industry?: string | null;
    location?: string | null;
  };
}

export interface ApplicationCandidateSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  profile_image?: string | null;
  bio?: string | null;
  location?: string | null;
  skills: Array<{ id: string; name: string }>;
}

export interface StudentApplicationDetails extends Application {
  job: ApplicationJobSummary;
  resume?: {
    id: string;
    file_name: string;
    file_url: string;
  } | null;
}

export interface RecruiterApplicationDetails extends Application {
  job: ApplicationJobSummary;
  candidate: ApplicationCandidateSummary;
  resume?: {
    id: string;
    file_name: string;
    file_url: string;
  } | null;
}

export interface AdminApplicationDetails extends Application {
  job: ApplicationJobSummary;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  recruiter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  resume?: {
    id: string;
    file_name: string;
    file_url: string;
  } | null;
}

export class ApplicationRepository {
  /**
   * Create a new job application
   */
  async createApplication(
    jobId: string,
    studentId: string,
    resumeId?: string | null,
    coverLetter?: string | null
  ): Promise<Application> {
    const query = `
      INSERT INTO applications (job_id, student_id, resume_id, cover_letter, status)
      VALUES ($1, $2, $3, $4, 'APPLIED')
      RETURNING *
    `;
    const result = await pool.query(query, [
      jobId,
      studentId,
      resumeId || null,
      coverLetter || null,
    ]);
    return result.rows[0];
  }

  /**
   * Find application by ID
   */
  async findById(id: string): Promise<Application | null> {
    const query = 'SELECT * FROM applications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find application by student and job
   */
  async findByStudentAndJob(studentId: string, jobId: string): Promise<Application | null> {
    const query = 'SELECT * FROM applications WHERE student_id = $1 AND job_id = $2 LIMIT 1';
    const result = await pool.query(query, [studentId, jobId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find student's applications with job and company information
   */
  async findStudentApplications(
    studentId: string,
    status?: ApplicationStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<StudentApplicationDetails[]> {
    const offset = (page - 1) * limit;
    const values: any[] = [studentId];
    let whereClause = 'a.student_id = $1';

    if (status) {
      values.push(status);
      whereClause += ` AND a.status = $${values.length}`;
    }

    values.push(limit, offset);
    const query = `
      SELECT 
        a.*,
        json_build_object(
          'id', j.id,
          'title', j.title,
          'job_type', j.job_type,
          'work_mode', j.work_mode,
          'location', j.location,
          'status', j.status,
          'company', json_build_object(
            'id', c.id,
            'name', c.name,
            'logo', c.logo,
            'industry', c.industry,
            'location', c.location
          )
        ) AS job,
        CASE WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'file_name', r.file_name,
          'file_url', r.file_url
        ) ELSE NULL END AS resume
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN companies c ON j.company_id = c.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE ${whereClause}
      ORDER BY a.applied_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count total student applications
   */
  async countStudentApplications(studentId: string, status?: ApplicationStatus): Promise<number> {
    const values: any[] = [studentId];
    let whereClause = 'student_id = $1';

    if (status) {
      values.push(status);
      whereClause += ` AND status = $${values.length}`;
    }

    const query = `SELECT COUNT(*) FROM applications WHERE ${whereClause}`;
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get single student application details
   */
  async findStudentApplicationById(
    studentId: string,
    applicationId: string
  ): Promise<StudentApplicationDetails | null> {
    const query = `
      SELECT 
        a.*,
        json_build_object(
          'id', j.id,
          'title', j.title,
          'job_type', j.job_type,
          'work_mode', j.work_mode,
          'location', j.location,
          'status', j.status,
          'company', json_build_object(
            'id', c.id,
            'name', c.name,
            'logo', c.logo,
            'industry', c.industry,
            'location', c.location
          )
        ) AS job,
        CASE WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'file_name', r.file_name,
          'file_url', r.file_url
        ) ELSE NULL END AS resume
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN companies c ON j.company_id = c.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.id = $1 AND a.student_id = $2
    `;
    const result = await pool.query(query, [applicationId, studentId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find applications for recruiter's jobs
   */
  async findRecruiterApplications(
    recruiterId: string,
    filters: { status?: ApplicationStatus; jobId?: string; search?: string; page: number; limit: number }
  ): Promise<RecruiterApplicationDetails[]> {
    const values: any[] = [recruiterId];
    const conditions: string[] = ['j.recruiter_id = $1'];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`a.status = $${values.length}`);
    }

    if (filters.jobId) {
      values.push(filters.jobId);
      conditions.push(`a.job_id = $${values.length}`);
    }

    if (filters.search) {
      values.push(`%${filters.search}%`);
      const p = values.length;
      conditions.push(`(u.first_name ILIKE $${p} OR u.last_name ILIKE $${p} OR u.email ILIKE $${p} OR j.title ILIKE $${p})`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (filters.page - 1) * filters.limit;
    values.push(filters.limit, offset);

    const query = `
      SELECT 
        a.*,
        json_build_object(
          'id', j.id,
          'title', j.title,
          'job_type', j.job_type,
          'work_mode', j.work_mode,
          'location', j.location,
          'status', j.status,
          'company', json_build_object(
            'id', c.id,
            'name', c.name,
            'logo', c.logo,
            'industry', c.industry,
            'location', c.location
          )
        ) AS job,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'phone', u.phone,
          'profile_image', u.profile_image,
          'bio', u.bio,
          'location', u.location,
          'skills', COALESCE(
            (
              SELECT json_agg(json_build_object('id', s.id, 'name', s.name))
              FROM user_skills us
              INNER JOIN skills s ON us.skill_id = s.id
              WHERE us.user_id = u.id
            ), '[]'::json
          )
        ) AS candidate,
        CASE WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'file_name', r.file_name,
          'file_url', r.file_url
        ) ELSE NULL END AS resume
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN companies c ON j.company_id = c.id
      INNER JOIN users u ON a.student_id = u.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE ${whereClause}
      ORDER BY a.applied_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count applications for recruiter's jobs
   */
  async countRecruiterApplications(
    recruiterId: string,
    filters: { status?: ApplicationStatus; jobId?: string; search?: string }
  ): Promise<number> {
    const values: any[] = [recruiterId];
    const conditions: string[] = ['j.recruiter_id = $1'];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`a.status = $${values.length}`);
    }

    if (filters.jobId) {
      values.push(filters.jobId);
      conditions.push(`a.job_id = $${values.length}`);
    }

    if (filters.search) {
      values.push(`%${filters.search}%`);
      const p = values.length;
      conditions.push(`(u.first_name ILIKE $${p} OR u.last_name ILIKE $${p} OR u.email ILIKE $${p} OR j.title ILIKE $${p})`);
    }

    const whereClause = conditions.join(' AND ');

    const query = `
      SELECT COUNT(*)
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN users u ON a.student_id = u.id
      WHERE ${whereClause}
    `;

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get single application for recruiter with candidate details
   */
  async findRecruiterApplicationById(
    recruiterId: string,
    applicationId: string
  ): Promise<RecruiterApplicationDetails | null> {
    const query = `
      SELECT 
        a.*,
        json_build_object(
          'id', j.id,
          'title', j.title,
          'job_type', j.job_type,
          'work_mode', j.work_mode,
          'location', j.location,
          'status', j.status,
          'company', json_build_object(
            'id', c.id,
            'name', c.name,
            'logo', c.logo,
            'industry', c.industry,
            'location', c.location
          )
        ) AS job,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'phone', u.phone,
          'profile_image', u.profile_image,
          'bio', u.bio,
          'location', u.location,
          'skills', COALESCE(
            (
              SELECT json_agg(json_build_object('id', s.id, 'name', s.name))
              FROM user_skills us
              INNER JOIN skills s ON us.skill_id = s.id
              WHERE us.user_id = u.id
            ), '[]'::json
          )
        ) AS candidate,
        CASE WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'file_name', r.file_name,
          'file_url', r.file_url
        ) ELSE NULL END AS resume
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN companies c ON j.company_id = c.id
      INNER JOIN users u ON a.student_id = u.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.id = $1 AND j.recruiter_id = $2
    `;
    const result = await pool.query(query, [applicationId, recruiterId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update application status
   */
  async updateStatus(applicationId: string, status: ApplicationStatus): Promise<Application | null> {
    const query = `
      UPDATE applications
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, applicationId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Admin: List all applications across platform
   */
  async findAdminApplications(filters: {
    status?: ApplicationStatus;
    jobId?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<AdminApplicationDetails[]> {
    const values: any[] = [];
    const conditions: string[] = [];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`a.status = $${values.length}`);
    }

    if (filters.jobId) {
      values.push(filters.jobId);
      conditions.push(`a.job_id = $${values.length}`);
    }

    if (filters.search) {
      values.push(`%${filters.search}%`);
      const p = values.length;
      conditions.push(`(u.first_name ILIKE $${p} OR u.last_name ILIKE $${p} OR u.email ILIKE $${p} OR j.title ILIKE $${p} OR c.name ILIKE $${p})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (filters.page - 1) * filters.limit;
    values.push(filters.limit, offset);

    const query = `
      SELECT 
        a.*,
        json_build_object(
          'id', j.id,
          'title', j.title,
          'job_type', j.job_type,
          'work_mode', j.work_mode,
          'location', j.location,
          'status', j.status,
          'company', json_build_object(
            'id', c.id,
            'name', c.name,
            'logo', c.logo,
            'industry', c.industry,
            'location', c.location
          )
        ) AS job,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email
        ) AS candidate,
        json_build_object(
          'id', rec.id,
          'first_name', rec.first_name,
          'last_name', rec.last_name,
          'email', rec.email
        ) AS recruiter,
        CASE WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'file_name', r.file_name,
          'file_url', r.file_url
        ) ELSE NULL END AS resume
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN companies c ON j.company_id = c.id
      INNER JOIN users u ON a.student_id = u.id
      INNER JOIN users rec ON j.recruiter_id = rec.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      ${whereClause}
      ORDER BY a.applied_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Admin: Count all applications
   */
  async countAdminApplications(filters: {
    status?: ApplicationStatus;
    jobId?: string;
    search?: string;
  }): Promise<number> {
    const values: any[] = [];
    const conditions: string[] = [];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`a.status = $${values.length}`);
    }

    if (filters.jobId) {
      values.push(filters.jobId);
      conditions.push(`a.job_id = $${values.length}`);
    }

    if (filters.search) {
      values.push(`%${filters.search}%`);
      const p = values.length;
      conditions.push(`(u.first_name ILIKE $${p} OR u.last_name ILIKE $${p} OR u.email ILIKE $${p} OR j.title ILIKE $${p} OR c.name ILIKE $${p})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT COUNT(*)
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN companies c ON j.company_id = c.id
      INNER JOIN users u ON a.student_id = u.id
      ${whereClause}
    `;

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Admin: Find application by ID
   */
  async findAdminApplicationById(applicationId: string): Promise<AdminApplicationDetails | null> {
    const query = `
      SELECT 
        a.*,
        json_build_object(
          'id', j.id,
          'title', j.title,
          'job_type', j.job_type,
          'work_mode', j.work_mode,
          'location', j.location,
          'status', j.status,
          'company', json_build_object(
            'id', c.id,
            'name', c.name,
            'logo', c.logo,
            'industry', c.industry,
            'location', c.location
          )
        ) AS job,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email
        ) AS candidate,
        json_build_object(
          'id', rec.id,
          'first_name', rec.first_name,
          'last_name', rec.last_name,
          'email', rec.email
        ) AS recruiter,
        CASE WHEN r.id IS NOT NULL THEN json_build_object(
          'id', r.id,
          'file_name', r.file_name,
          'file_url', r.file_url
        ) ELSE NULL END AS resume
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN companies c ON j.company_id = c.id
      INNER JOIN users u ON a.student_id = u.id
      INNER JOIN users rec ON j.recruiter_id = rec.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export default new ApplicationRepository();
