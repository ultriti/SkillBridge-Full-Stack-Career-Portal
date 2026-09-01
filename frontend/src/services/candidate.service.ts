import api from './api';
import type {
  CandidateProfileSummary,
  CandidateSearchFilters,
  CandidateMatchResult,
} from '../types/resume-intelligence.types';

export const candidateService = {
  /**
   * Search candidates
   */
  async searchCandidates(
    filters: CandidateSearchFilters
  ): Promise<{ candidates: CandidateProfileSummary[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const params: Record<string, any> = {};

    if (filters.q) params.q = filters.q;
    if (filters.location) params.location = filters.location;
    if (filters.skills && filters.skills.length > 0) params.skills = filters.skills.join(',');
    if (filters.skillMatch) params.skillMatch = filters.skillMatch;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get<{
      success: boolean;
      data: { candidates: CandidateProfileSummary[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    }>('/candidates/search', { params });

    return response.data.data;
  },

  /**
   * Get single candidate details
   */
  async getCandidateById(id: string): Promise<CandidateProfileSummary> {
    const response = await api.get<{ success: boolean; data: CandidateProfileSummary }>(`/candidates/${id}`);
    return response.data.data;
  },

  /**
   * Add candidate to shortlist
   */
  async shortlistCandidate(id: string): Promise<void> {
    await api.post(`/candidates/${id}/shortlist`);
  },

  /**
   * Remove candidate from shortlist
   */
  async removeShortlist(id: string): Promise<void> {
    await api.delete(`/candidates/${id}/shortlist`);
  },

  /**
   * Get recruiter's shortlisted candidates
   */
  async getShortlistedCandidates(): Promise<CandidateProfileSummary[]> {
    const response = await api.get<{ success: boolean; data: CandidateProfileSummary[] }>('/candidates/shortlisted');
    return response.data.data;
  },

  /**
   * Get candidate match scores for a job
   */
  async getJobCandidateMatches(
    jobId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ matches: CandidateMatchResult[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const response = await api.get<{
      success: boolean;
      data: { matches: CandidateMatchResult[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    }>(`/candidates/job-matches/${jobId}`, { params: { page, limit } });

    return response.data.data;
  },
};
