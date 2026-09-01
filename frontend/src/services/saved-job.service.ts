import api from './api';
import { SavedJob, JobPagination } from '../types/job.types';

export interface GetSavedJobsResponse {
  savedJobs: SavedJob[];
  pagination: JobPagination;
}

export const savedJobService = {
  /**
   * Save a job bookmark for student
   */
  async saveJob(jobId: string): Promise<SavedJob> {
    const response = await api.post<{ success: boolean; data: SavedJob }>(`/jobs/${jobId}/save`);
    return response.data.data;
  },

  /**
   * Unsave a job bookmark for student
   */
  async unsaveJob(jobId: string): Promise<void> {
    await api.delete(`/jobs/${jobId}/save`);
  },

  /**
   * Get student's saved jobs list
   */
  async getSavedJobs(page: number = 1, limit: number = 10): Promise<GetSavedJobsResponse> {
    const response = await api.get<{ success: boolean; data: GetSavedJobsResponse }>(
      '/students/me/saved-jobs',
      { params: { page, limit } }
    );
    return response.data.data;
  },
};
