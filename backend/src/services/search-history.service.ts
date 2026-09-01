import searchHistoryRepository from '../repositories/search-history.repository';
import { SearchHistoryRecord } from '../types/job-search.types';

export class SearchHistoryService {
  /**
   * Record search history entry
   */
  async recordSearch(
    userId: string,
    query?: string | null,
    filters?: Record<string, any>
  ): Promise<SearchHistoryRecord> {
    return searchHistoryRepository.addSearchHistory(userId, query, filters);
  }

  /**
   * Get user's search history
   */
  async getUserSearchHistory(userId: string): Promise<SearchHistoryRecord[]> {
    return searchHistoryRepository.findUserSearchHistory(userId, 10);
  }

  /**
   * Delete single search history item
   */
  async deleteSearchHistory(id: string, userId: string): Promise<void> {
    await searchHistoryRepository.deleteSearchHistory(id, userId);
  }

  /**
   * Clear all search history for user
   */
  async clearUserSearchHistory(userId: string): Promise<{ deletedCount: number }> {
    const count = await searchHistoryRepository.clearUserSearchHistory(userId);
    return { deletedCount: count };
  }
}

export default new SearchHistoryService();
