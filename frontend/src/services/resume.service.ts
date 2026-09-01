import api from './api';
import type { ExtendedResume } from '../types/resume-intelligence.types';

export const resumeService = {
  /**
   * Get student's resume list
   */
  async getStudentResumes(): Promise<ExtendedResume[]> {
    const response = await api.get<{ success: boolean; data: ExtendedResume[] }>('/resumes');
    return response.data.data;
  },

  /**
   * Upload resume file
   */
  async uploadResume(file: File): Promise<ExtendedResume> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post<{ success: boolean; data: ExtendedResume }>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * Set primary default resume
   */
  async setPrimaryResume(id: string): Promise<void> {
    await api.patch(`/resumes/${id}/primary`);
  },

  /**
   * Delete resume
   */
  async deleteResume(id: string): Promise<void> {
    await api.delete(`/resumes/${id}`);
  },

  /**
   * Retry failed resume processing
   */
  async retryProcessing(id: string): Promise<ExtendedResume> {
    const response = await api.post<{ success: boolean; data: ExtendedResume }>(`/resumes/${id}/retry`);
    return response.data.data;
  },
};
