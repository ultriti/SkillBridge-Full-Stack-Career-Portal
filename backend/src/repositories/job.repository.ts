import pool from '../config/db';
import { Job, JobType, WorkMode, JobStatus } from '../types/database';
import { AdvancedJobSearchFilters, JobSearchSort } from '../types/job-search.types';

export interface CreateJobDTO {
  company_id: string;
  recruiter_id: string;
  title: string;
  description: string;
  job_type: JobType;
  work_mode: WorkMode;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  experience_level?: string | null;
  application_deadline?: string | null;
  status: JobStatus;
}

export interface PublicJobFilterDTO {
  search?: string;
  jobType?: JobType;
  workMode?: WorkMode;
  location?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
}

export interface JobWithCompany extends Job {
  company: {
    id: string;
    name: string;
    logo?: string | null;
    industry?: string | null;
    location?: string | null;
  };
  skills?: Array<{ id: string; name: string }>;
}

export interface AdminJobWithDetails extends JobWithCompany {
  recruiter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
  };
}

export class JobRepository {
  /**
   * Create a new job posting
   */
  async createJob(dto: CreateJobDTO): Promise<Job> {
    const query = `
      INSERT INTO jobs (
        company_id, recruiter_id, title, description, job_type, work_mode,
        location, salary_min, salary_max, experience_level, application_deadline, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      dto.company_id,
      dto.recruiter_id,
      dto.title,
      dto.description,
      dto.job_type,
      dto.work_mode,
      dto.location || null,
      dto.salary_min != null ? dto.salary_min : null,
      dto.salary_max != null ? dto.salary_max : null,
      dto.experience_level || null,
      dto.application_deadline || null,
      dto.status,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find job by ID
   */
  async findById(id: string): Promise<Job | null> {
    const query = 'SELECT * FROM jobs WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find job with company details and skills by ID
   */
  async findJobWithCompany(id: string): Promise<JobWithCompany | null> {
    const query = `
      SELECT 
        j.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'logo', c.logo,
          'industry', c.industry,
          'location', c.location
        ) AS company,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', s.id, 'name', s.name))
            FROM job_skills js
            JOIN skills s ON js.skill_id = s.id
            WHERE js.job_id = j.id
          ),
          '[]'::json
        ) AS skills
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find public ACTIVE job by ID
   */
  async findPublicJobById(id: string): Promise<JobWithCompany | null> {
    const query = `
      SELECT 
        j.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'logo', c.logo,
          'industry', c.industry,
          'location', c.location
        ) AS company,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', s.id, 'name', s.name))
            FROM job_skills js
            JOIN skills s ON js.skill_id = s.id
            WHERE js.job_id = j.id
          ),
          '[]'::json
        ) AS skills
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1 AND j.status = 'ACTIVE'
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find jobs owned by a recruiter
   */
  async findJobsByRecruiter(
    recruiterId: string,
    status?: JobStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<JobWithCompany[]> {
    const offset = (page - 1) * limit;
    const values: any[] = [recruiterId];
    let whereClause = 'j.recruiter_id = $1';

    if (status) {
      values.push(status);
      whereClause += ` AND j.status = $${values.length}`;
    }

    values.push(limit, offset);
    const query = `
      SELECT 
        j.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'logo', c.logo,
          'industry', c.industry,
          'location', c.location
        ) AS company,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', s.id, 'name', s.name))
            FROM job_skills js
            JOIN skills s ON js.skill_id = s.id
            WHERE js.job_id = j.id
          ),
          '[]'::json
        ) AS skills
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count total jobs owned by recruiter
   */
  async countJobsByRecruiter(recruiterId: string, status?: JobStatus): Promise<number> {
    const values: any[] = [recruiterId];
    let whereClause = 'recruiter_id = $1';

    if (status) {
      values.push(status);
      whereClause += ` AND status = $${values.length}`;
    }

    const query = `SELECT COUNT(*) FROM jobs WHERE ${whereClause}`;
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Update job details
   */
  async updateJob(id: string, updates: Record<string, any>): Promise<Job | null> {
    const allowedFields: Record<string, string> = {
      title: 'title',
      description: 'description',
      jobType: 'job_type',
      workMode: 'work_mode',
      location: 'location',
      salaryMin: 'salary_min',
      salaryMax: 'salary_max',
      experienceLevel: 'experience_level',
      applicationDeadline: 'application_deadline',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      const dbColumn = allowedFields[key];
      if (dbColumn && value !== undefined) {
        setClauses.push(`${dbColumn} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE jobs
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update job status
   */
  async updateStatus(id: string, status: JobStatus): Promise<Job | null> {
    const query = `
      UPDATE jobs
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Delete job
   */
  async deleteJob(id: string): Promise<boolean> {
    const query = 'DELETE FROM jobs WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Advanced PostgreSQL Full-Text Search and Multi-Criteria Filtering
   */
  async findAdvancedPublicJobs(filters: AdvancedJobSearchFilters): Promise<JobWithCompany[]> {
    const { whereClause, values, rankColumn } = this.buildAdvancedWhereClause(filters);

    let sortExpression = 'j.created_at DESC, j.id DESC';
    const sortBy = filters.sortBy || (filters.q ? 'relevance' : 'newest');

    switch (sortBy) {
      case 'relevance':
        if (filters.q && rankColumn) {
          sortExpression = `${rankColumn} DESC, j.created_at DESC, j.id DESC`;
        } else {
          sortExpression = 'j.created_at DESC, j.id DESC';
        }
        break;
      case 'oldest':
        sortExpression = 'j.created_at ASC, j.id ASC';
        break;
      case 'salary_high':
        sortExpression = 'j.salary_max DESC NULLS LAST, j.salary_min DESC NULLS LAST, j.id DESC';
        break;
      case 'salary_low':
        sortExpression = 'j.salary_min ASC NULLS LAST, j.salary_max ASC NULLS LAST, j.id DESC';
        break;
      case 'newest':
      default:
        sortExpression = 'j.created_at DESC, j.id DESC';
        break;
    }

    const page = filters.page && filters.page >= 1 ? filters.page : 1;
    const limit = filters.limit && filters.limit >= 1 ? Math.min(filters.limit, 50) : 20;
    const offset = (page - 1) * limit;

    values.push(limit, offset);

    const query = `
      SELECT 
        j.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'logo', c.logo,
          'industry', c.industry,
          'location', c.location
        ) AS company,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', s.id, 'name', s.name))
            FROM job_skills js
            JOIN skills s ON js.skill_id = s.id
            WHERE js.job_id = j.id
          ),
          '[]'::json
        ) AS skills
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE ${whereClause}
      ORDER BY ${sortExpression}
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count total public jobs matching advanced search filters
   */
  async countAdvancedPublicJobs(filters: AdvancedJobSearchFilters): Promise<number> {
    const { whereClause, values } = this.buildAdvancedWhereClause(filters);

    const query = `
      SELECT COUNT(DISTINCT j.id)
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE ${whereClause}
    `;

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Admin: Find all jobs across platform
   */
  async findAllAdminJobs(
    status?: JobStatus,
    search?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<AdminJobWithDetails[]> {
    const values: any[] = [];
    const conditions: string[] = [];

    if (status) {
      values.push(status);
      conditions.push(`j.status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const p = values.length;
      conditions.push(`(j.title ILIKE $${p} OR j.description ILIKE $${p} OR c.name ILIKE $${p} OR u.email ILIKE $${p})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const query = `
      SELECT 
        j.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'logo', c.logo,
          'industry', c.industry,
          'location', c.location
        ) AS company,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'phone', u.phone
        ) AS recruiter
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      INNER JOIN users u ON j.recruiter_id = u.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Admin: Count all jobs
   */
  async countAllAdminJobs(status?: JobStatus, search?: string): Promise<number> {
    const values: any[] = [];
    const conditions: string[] = [];

    if (status) {
      values.push(status);
      conditions.push(`j.status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const p = values.length;
      conditions.push(`(j.title ILIKE $${p} OR j.description ILIKE $${p} OR c.name ILIKE $${p} OR u.email ILIKE $${p})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT COUNT(*)
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      INNER JOIN users u ON j.recruiter_id = u.id
      ${whereClause}
    `;

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Admin: Find job details by ID
   */
  async findAdminJobById(id: string): Promise<AdminJobWithDetails | null> {
    const query = `
      SELECT 
        j.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'logo', c.logo,
          'industry', c.industry,
          'location', c.location
        ) AS company,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'phone', u.phone
        ) AS recruiter
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      INNER JOIN users u ON j.recruiter_id = u.id
      WHERE j.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Build PostgreSQL Full-Text Search and filtering WHERE clause
   */
  private buildAdvancedWhereClause(filters: AdvancedJobSearchFilters) {
    const conditions: string[] = ["j.status = 'ACTIVE'"];
    const values: any[] = [];
    let rankColumn: string | undefined = undefined;

    // Full-Text Search using websearch_to_tsquery
    if (filters.q && filters.q.trim().length > 0) {
      values.push(filters.q.trim());
      const queryParamIdx = values.length;
      values.push(`%${filters.q.trim()}%`);
      const ilikeParamIdx = values.length;

      rankColumn = `ts_rank(j.search_vector, websearch_to_tsquery('english', $${queryParamIdx}))`;

      conditions.push(`(
        j.search_vector @@ websearch_to_tsquery('english', $${queryParamIdx})
        OR j.title ILIKE $${ilikeParamIdx}
        OR c.name ILIKE $${ilikeParamIdx}
      )`);
    }

    if (filters.location && filters.location.trim().length > 0) {
      values.push(`%${filters.location.trim()}%`);
      conditions.push(`j.location ILIKE $${values.length}`);
    }

    if (filters.jobType) {
      values.push(filters.jobType);
      conditions.push(`j.job_type = $${values.length}`);
    }

    if (filters.workMode) {
      values.push(filters.workMode);
      conditions.push(`j.work_mode = $${values.length}`);
    }

    if (filters.experienceLevel && filters.experienceLevel.trim().length > 0) {
      values.push(`%${filters.experienceLevel.trim()}%`);
      conditions.push(`j.experience_level ILIKE $${values.length}`);
    }

    if (filters.salaryMin != null) {
      values.push(filters.salaryMin);
      const p = values.length;
      conditions.push(`(j.salary_max >= $${p} OR (j.salary_min >= $${p} AND j.salary_max IS NULL))`);
    }

    if (filters.salaryMax != null) {
      values.push(filters.salaryMax);
      const p = values.length;
      conditions.push(`(j.salary_min <= $${p} OR j.salary_min IS NULL)`);
    }

    if (filters.companyId) {
      values.push(filters.companyId);
      conditions.push(`j.company_id = $${values.length}`);
    }

    // Skills filtering (Relational via job_skills & skills tables)
    if (filters.skills && filters.skills.length > 0) {
      const mode = filters.skillMatch === 'all' ? 'ALL' : 'ANY';
      const skillList = filters.skills.map((s) => s.trim()).filter((s) => s.length > 0);

      if (skillList.length > 0) {
        if (mode === 'ALL') {
          // Job must contain ALL specified skills
          for (const skillName of skillList) {
            values.push(`%${skillName}%`);
            const p = values.length;
            conditions.push(`EXISTS (
              SELECT 1 FROM job_skills js_sub 
              JOIN skills s_sub ON js_sub.skill_id = s_sub.id 
              WHERE js_sub.job_id = j.id AND s_sub.name ILIKE $${p}
            )`);
          }
        } else {
          // Job can contain ANY specified skill
          const skillPlaceholders: string[] = [];
          for (const skillName of skillList) {
            values.push(`%${skillName}%`);
            skillPlaceholders.push(`s_sub.name ILIKE $${values.length}`);
          }
          conditions.push(`EXISTS (
            SELECT 1 FROM job_skills js_sub 
            JOIN skills s_sub ON js_sub.skill_id = s_sub.id 
            WHERE js_sub.job_id = j.id AND (${skillPlaceholders.join(' OR ')})
          )`);
        }
      }
    }

    return {
      whereClause: conditions.join(' AND '),
      values,
      rankColumn,
    };
  }
}

export default new JobRepository();
