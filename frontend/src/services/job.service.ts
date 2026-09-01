import api from './api';
import type {
  Job,
  JobFilters,
  JobPagination,
  CreateJobRequest,
  UpdateJobRequest,
  JobStatus,
  AdminJobDetails,
} from '../types/job.types';

export interface GetJobsResponse {
  jobs: Job[];
  pagination: JobPagination;
}

export const jobService = {
  /**
   * Get public active jobs with search, filter, pagination, and sorting
   */
  async getPublicJobs(filters: JobFilters = {}): Promise<GetJobsResponse> {
    const params: Record<string, any> = {};
    if (filters.search) params.search = filters.search;
    if (filters.jobType) params.jobType = filters.jobType;
    if (filters.workMode) params.workMode = filters.workMode;
    if (filters.location) params.location = filters.location;
    if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
    if (filters.salaryMin != null && filters.salaryMin !== '') params.salaryMin = filters.salaryMin;
    if (filters.salaryMax != null && filters.salaryMax !== '') params.salaryMax = filters.salaryMax;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get<{ success: boolean; data: GetJobsResponse }>('/jobs', { params });
    return response.data.data;
  },

  /**
   * Get public active job details by ID
   */
  async getPublicJobById(jobId: string): Promise<Job> {
    const response = await api.get<{ success: boolean; data: Job }>(`/jobs/${jobId}`);
    return response.data.data;
  },

  /**
   * Recruiter: Get owned jobs
   */
  async getRecruiterJobs(
    status?: JobStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<GetJobsResponse> {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;

    const response = await api.get<{ success: boolean; data: GetJobsResponse }>('/recruiter/jobs', {
      params,
    });
    return response.data.data;
  },

  /**
   * Recruiter: Get job details by ID
   */
  async getRecruiterJobById(jobId: string): Promise<Job> {
    const response = await api.get<{ success: boolean; data: Job }>(`/recruiter/jobs/${jobId}`);
    return response.data.data;
  },

  /**
   * Recruiter: Create job
   */
  async createJob(data: CreateJobRequest): Promise<Job> {
    const response = await api.post<{ success: boolean; data: Job }>('/recruiter/jobs', data);
    return response.data.data;
  },

  /**
   * Recruiter: Update job
   */
  async updateJob(jobId: string, data: UpdateJobRequest): Promise<Job> {
    const response = await api.patch<{ success: boolean; data: Job }>(
      `/recruiter/jobs/${jobId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Recruiter: Publish job (DRAFT -> ACTIVE)
   */
  async publishJob(jobId: string): Promise<Job> {
    const response = await api.patch<{ success: boolean; data: Job }>(
      `/recruiter/jobs/${jobId}/publish`
    );
    return response.data.data;
  },

  /**
   * Recruiter: Close job (ACTIVE -> CLOSED)
   */
  async closeJob(jobId: string): Promise<Job> {
    const response = await api.patch<{ success: boolean; data: Job }>(
      `/recruiter/jobs/${jobId}/close`
    );
    return response.data.data;
  },

  /**
   * Recruiter: Delete job
   */
  async deleteJob(jobId: string): Promise<void> {
    await api.delete(`/recruiter/jobs/${jobId}`);
  },

  /**
   * Admin: Get all jobs
   */
  async getAdminJobs(
    status?: JobStatus,
    search?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ jobs: AdminJobDetails[]; pagination: JobPagination }> {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;

    const response = await api.get<{
      success: boolean;
      data: { jobs: AdminJobDetails[]; pagination: JobPagination };
    }>('/admin/jobs', { params });
    return response.data.data;
  },

  /**
   * Admin: Get job details
   */
  async getAdminJobById(jobId: string): Promise<AdminJobDetails> {
    const response = await api.get<{ success: boolean; data: AdminJobDetails }>(
      `/admin/jobs/${jobId}`
    );
    return response.data.data;
  },
};
