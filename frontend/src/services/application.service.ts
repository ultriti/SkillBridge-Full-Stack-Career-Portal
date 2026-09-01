import api from './api';
import type {
  StudentApplicationDetails,
  RecruiterApplicationDetails,
  AdminApplicationDetails,
  ApplicationPagination,
  ApplicationStatus,
  ApplyToJobRequest,
  UpdateApplicationStatusRequest,
} from '../types/application.types';

export const applicationService = {
  /**
   * Student: Apply to a job opportunity
   */
  async applyToJob(jobId: string, data: ApplyToJobRequest): Promise<StudentApplicationDetails> {
    const response = await api.post<{ success: boolean; data: StudentApplicationDetails }>(
      `/jobs/${jobId}/apply`,
      data
    );
    return response.data.data;
  },

  /**
   * Student: Get student's applications list
   */
  async getStudentApplications(
    status?: ApplicationStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<{ applications: StudentApplicationDetails[]; pagination: ApplicationPagination }> {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;

    const response = await api.get<{
      success: boolean;
      data: { applications: StudentApplicationDetails[]; pagination: ApplicationPagination };
    }>('/students/me/applications', { params });
    return response.data.data;
  },

  /**
   * Student: Get single application details
   */
  async getStudentApplication(applicationId: string): Promise<StudentApplicationDetails> {
    const response = await api.get<{ success: boolean; data: StudentApplicationDetails }>(
      `/students/me/applications/${applicationId}`
    );
    return response.data.data;
  },

  /**
   * Student: Withdraw application
   */
  async withdrawApplication(applicationId: string): Promise<StudentApplicationDetails> {
    const response = await api.patch<{ success: boolean; data: StudentApplicationDetails }>(
      `/students/me/applications/${applicationId}/withdraw`
    );
    return response.data.data;
  },

  /**
   * Recruiter: Get applications for recruiter's jobs
   */
  async getRecruiterApplications(
    status?: ApplicationStatus,
    jobId?: string,
    search?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ applications: RecruiterApplicationDetails[]; pagination: ApplicationPagination }> {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;
    if (jobId) params.jobId = jobId;
    if (search) params.search = search;

    const response = await api.get<{
      success: boolean;
      data: { applications: RecruiterApplicationDetails[]; pagination: ApplicationPagination };
    }>('/recruiter/applications', { params });
    return response.data.data;
  },

  /**
   * Recruiter: Get single candidate application details
   */
  async getRecruiterApplication(applicationId: string): Promise<RecruiterApplicationDetails> {
    const response = await api.get<{ success: boolean; data: RecruiterApplicationDetails }>(
      `/recruiter/applications/${applicationId}`
    );
    return response.data.data;
  },

  /**
   * Recruiter: Update application status
   */
  async updateApplicationStatus(
    applicationId: string,
    data: UpdateApplicationStatusRequest
  ): Promise<RecruiterApplicationDetails> {
    const response = await api.patch<{ success: boolean; data: RecruiterApplicationDetails }>(
      `/recruiter/applications/${applicationId}/status`,
      data
    );
    return response.data.data;
  },

  /**
   * Admin: Get all applications
   */
  async getAdminApplications(
    status?: ApplicationStatus,
    jobId?: string,
    search?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ applications: AdminApplicationDetails[]; pagination: ApplicationPagination }> {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;
    if (jobId) params.jobId = jobId;
    if (search) params.search = search;

    const response = await api.get<{
      success: boolean;
      data: { applications: AdminApplicationDetails[]; pagination: ApplicationPagination };
    }>('/admin/applications', { params });
    return response.data.data;
  },

  /**
   * Admin: Get single application details
   */
  async getAdminApplication(applicationId: string): Promise<AdminApplicationDetails> {
    const response = await api.get<{ success: boolean; data: AdminApplicationDetails }>(
      `/admin/applications/${applicationId}`
    );
    return response.data.data;
  },
};
