import jobRepository, { PublicJobFilterDTO, JobWithCompany, AdminJobWithDetails } from '../repositories/job.repository';
import companyRepository from '../repositories/company.repository';
import savedJobRepository from '../repositories/saved-job.repository';
import { JobStatus, JobType, WorkMode } from '../types/database';

export interface CreateJobInput {
  title: string;
  description: string;
  jobType: JobType;
  workMode: WorkMode;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  experienceLevel?: string | null;
  applicationDeadline?: string | null;
  status?: JobStatus;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  jobType?: JobType;
  workMode?: WorkMode;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  experienceLevel?: string | null;
  applicationDeadline?: string | null;
}

export class JobService {
  /**
   * Create a new job posting for recruiter
   */
  async createJob(recruiterId: string, input: CreateJobInput) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      const error: any = new Error('Please create your company profile before creating a job.');
      error.statusCode = 400;
      throw error;
    }

    const job = await jobRepository.createJob({
      company_id: company.id,
      recruiter_id: recruiterId,
      title: input.title,
      description: input.description,
      job_type: input.jobType,
      work_mode: input.workMode,
      location: input.location,
      salary_min: input.salaryMin,
      salary_max: input.salaryMax,
      experience_level: input.experienceLevel,
      application_deadline: input.applicationDeadline,
      status: input.status || 'DRAFT',
    });

    return jobRepository.findJobWithCompany(job.id);
  }

  /**
   * Get jobs owned by recruiter
   */
  async getRecruiterJobs(recruiterId: string, query: { status?: JobStatus; page: number; limit: number }) {
    const { status, page, limit } = query;
    const jobs = await jobRepository.findJobsByRecruiter(recruiterId, status, page, limit);
    const total = await jobRepository.countJobsByRecruiter(recruiterId, status);
    const totalPages = Math.ceil(total / limit);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get specific job owned by recruiter
   */
  async getRecruiterJobById(recruiterId: string, jobId: string): Promise<JobWithCompany> {
    const job = await jobRepository.findJobWithCompany(jobId);
    if (!job || job.recruiter_id !== recruiterId) {
      const error: any = new Error('Job posting not found');
      error.statusCode = 404;
      throw error;
    }
    return job;
  }

  /**
   * Update recruiter's job posting
   */
  async updateJob(recruiterId: string, jobId: string, updates: UpdateJobInput) {
    const existingJob = await jobRepository.findById(jobId);
    if (!existingJob || existingJob.recruiter_id !== recruiterId) {
      const error: any = new Error('Job posting not found');
      error.statusCode = 404;
      throw error;
    }

    await jobRepository.updateJob(jobId, updates);
    return jobRepository.findJobWithCompany(jobId);
  }

  /**
   * Publish job posting (DRAFT -> ACTIVE)
   */
  async publishJob(recruiterId: string, jobId: string) {
    const existingJob = await jobRepository.findById(jobId);
    if (!existingJob || existingJob.recruiter_id !== recruiterId) {
      const error: any = new Error('Job posting not found');
      error.statusCode = 404;
      throw error;
    }

    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company || company.id !== existingJob.company_id) {
      const error: any = new Error('Company ownership verification failed');
      error.statusCode = 403;
      throw error;
    }

    await jobRepository.updateStatus(jobId, 'ACTIVE');
    return jobRepository.findJobWithCompany(jobId);
  }

  /**
   * Close job posting (ACTIVE -> CLOSED)
   */
  async closeJob(recruiterId: string, jobId: string) {
    const existingJob = await jobRepository.findById(jobId);
    if (!existingJob || existingJob.recruiter_id !== recruiterId) {
      const error: any = new Error('Job posting not found');
      error.statusCode = 404;
      throw error;
    }

    await jobRepository.updateStatus(jobId, 'CLOSED');
    return jobRepository.findJobWithCompany(jobId);
  }

  /**
   * Delete job posting
   */
  async deleteJob(recruiterId: string, jobId: string) {
    const existingJob = await jobRepository.findById(jobId);
    if (!existingJob || existingJob.recruiter_id !== recruiterId) {
      const error: any = new Error('Job posting not found');
      error.statusCode = 404;
      throw error;
    }

    await jobRepository.deleteJob(jobId);
    return { success: true, message: 'Job posting deleted successfully' };
  }

  /**
   * Get public active job listings with optional student saved status
   */
  async getPublicJobs(filters: PublicJobFilterDTO, studentId?: string) {
    const jobs = await jobRepository.findPublicJobs(filters);
    const total = await jobRepository.countPublicJobs(filters);
    const totalPages = Math.ceil(total / filters.limit);

    let savedJobIds = new Set<string>();
    if (studentId && jobs.length > 0) {
      const jobIds = jobs.map((j) => j.id);
      savedJobIds = await savedJobRepository.findSavedJobIds(studentId, jobIds);
    }

    const formattedJobs = jobs.map((job) => ({
      ...job,
      isSaved: savedJobIds.has(job.id),
    }));

    return {
      jobs: formattedJobs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get single public active job details
   */
  async getPublicJobById(jobId: string, studentId?: string) {
    const job = await jobRepository.findPublicJobById(jobId);
    if (!job) {
      const error: any = new Error('Job posting not found');
      error.statusCode = 404;
      throw error;
    }

    let isSaved = false;
    if (studentId) {
      isSaved = await savedJobRepository.isJobSaved(studentId, jobId);
    }

    return {
      ...job,
      isSaved,
    };
  }

  /**
   * Admin: Get all jobs with filters and search
   */
  async getAdminJobs(query: { status?: JobStatus; search?: string; page: number; limit: number }) {
    const { status, search, page, limit } = query;
    const jobs = await jobRepository.findAllAdminJobs(status, search, page, limit);
    const total = await jobRepository.countAllAdminJobs(status, search);
    const totalPages = Math.ceil(total / limit);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Admin: Get specific job details
   */
  async getAdminJobById(jobId: string): Promise<AdminJobWithDetails> {
    const job = await jobRepository.findAdminJobById(jobId);
    if (!job) {
      const error: any = new Error('Job posting not found');
      error.statusCode = 404;
      throw error;
    }
    return job;
  }
}

export default new JobService();
