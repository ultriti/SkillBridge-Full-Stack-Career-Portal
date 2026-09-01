import api from './api';
import type {
  AdvancedJobSearchFilters,
  SearchHistoryItem,
  SavedSearchItem,
} from '../types/job-search.types';
import type { Job, JobPagination } from '../types/job.types';

export const jobSearchService = {
  /**
   * Search jobs with full-text search & filters
   */
  async searchJobs(
    filters: AdvancedJobSearchFilters
  ): Promise<{ jobs: (Job & { isSaved?: boolean })[]; pagination: JobPagination }> {
    const params: Record<string, any> = {};

    if (filters.q) params.q = filters.q;
    if (filters.location) params.location = filters.location;
    if (filters.jobType) params.jobType = filters.jobType;
    if (filters.workMode) params.workMode = filters.workMode;
    if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
    if (filters.salaryMin != null) params.salaryMin = filters.salaryMin;
    if (filters.salaryMax != null) params.salaryMax = filters.salaryMax;
    if (filters.skills && filters.skills.length > 0) params.skills = filters.skills.join(',');
    if (filters.skillMatch) params.skillMatch = filters.skillMatch;
    if (filters.companyId) params.companyId = filters.companyId;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get<{
      success: boolean;
      data: { jobs: (Job & { isSaved?: boolean })[]; pagination: JobPagination };
    }>('/jobs/search', { params });

    return response.data.data;
  },

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    const response = await api.get<{ success: boolean; data: SearchHistoryItem[] }>(
      '/jobs/search-history'
    );
    return response.data.data;
  },

  /**
   * Delete single search history item
   */
  async deleteSearchHistory(id: string): Promise<void> {
    await api.delete(`/jobs/search-history/${id}`);
  },

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    await api.delete('/jobs/search-history/clear');
  },

  /**
   * Get saved searches
   */
  async getSavedSearches(): Promise<SavedSearchItem[]> {
    const response = await api.get<{ success: boolean; data: SavedSearchItem[] }>(
      '/jobs/saved-searches'
    );
    return response.data.data;
  },

  /**
   * Create saved search
   */
  async createSavedSearch(
    name: string,
    query?: string | null,
    filters?: Record<string, any>,
    alertEnabled: boolean = false
  ): Promise<SavedSearchItem> {
    const response = await api.post<{ success: boolean; data: SavedSearchItem }>(
      '/jobs/saved-searches',
      { name, query, filters, alertEnabled }
    );
    return response.data.data;
  },

  /**
   * Update saved search
   */
  async updateSavedSearch(
    id: string,
    updates: { name?: string; alertEnabled?: boolean; query?: string | null; filters?: Record<string, any> }
  ): Promise<SavedSearchItem> {
    const response = await api.patch<{ success: boolean; data: SavedSearchItem }>(
      `/jobs/saved-searches/${id}`,
      updates
    );
    return response.data.data;
  },

  /**
   * Delete saved search
   */
  async deleteSavedSearch(id: string): Promise<void> {
    await api.delete(`/jobs/saved-searches/${id}`);
  },
};
