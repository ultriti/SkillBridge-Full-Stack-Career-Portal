import pool from '../config/db';
import { Job, JobType, WorkMode, JobStatus } from '../types/database';

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
   * Find job with company details by ID
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
        ) AS company
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
        ) AS company
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1 AND j.status = 'ACTIVE'
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find jobs owned by a recruiter with pagination and status filter
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
        ) AS company
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
   * Count total jobs owned by a recruiter
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
   * Find public ACTIVE jobs with search, filtering, pagination, and sorting
   */
  async findPublicJobs(filters: PublicJobFilterDTO): Promise<JobWithCompany[]> {
    const { whereClause, values } = this.buildPublicWhereClause(filters);

    // Allowlist mapping for safe sorting
    const sortColumns: Record<string, string> = {
      createdAt: 'j.created_at',
      salaryMin: 'j.salary_min',
      salaryMax: 'j.salary_max',
      applicationDeadline: 'j.application_deadline',
    };

    const sortColumn = sortColumns[filters.sortBy] || 'j.created_at';
    const sortOrder = filters.sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (filters.page - 1) * filters.limit;
    values.push(filters.limit, offset);

    const query = `
      SELECT 
        j.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'logo', c.logo,
          'industry', c.industry,
          'location', c.location
        ) AS company
      FROM jobs j
      INNER JOIN companies c ON j.company_id = c.id
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder} NULLS LAST
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count total public ACTIVE jobs matching search and filters
   */
  async countPublicJobs(filters: PublicJobFilterDTO): Promise<number> {
    const { whereClause, values } = this.buildPublicWhereClause(filters);

    const query = `
      SELECT COUNT(*)
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
   * Helper method to construct parameterized SQL WHERE clause for public job search
   */
  private buildPublicWhereClause(filters: PublicJobFilterDTO) {
    const conditions: string[] = ["j.status = 'ACTIVE'"];
    const values: any[] = [];

    if (filters.search) {
      values.push(`%${filters.search}%`);
      const p = values.length;
      conditions.push(`(
        j.title ILIKE $${p} 
        OR j.description ILIKE $${p} 
        OR j.location ILIKE $${p} 
        OR j.experience_level ILIKE $${p}
        OR c.name ILIKE $${p}
      )`);
    }

    if (filters.jobType) {
      values.push(filters.jobType);
      conditions.push(`j.job_type = $${values.length}`);
    }

    if (filters.workMode) {
      values.push(filters.workMode);
      conditions.push(`j.work_mode = $${values.length}`);
    }

    if (filters.location) {
      values.push(`%${filters.location}%`);
      conditions.push(`j.location ILIKE $${values.length}`);
    }

    if (filters.experienceLevel) {
      values.push(`%${filters.experienceLevel}%`);
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

    return {
      whereClause: conditions.join(' AND '),
      values,
    };
  }
}

export default new JobRepository();
