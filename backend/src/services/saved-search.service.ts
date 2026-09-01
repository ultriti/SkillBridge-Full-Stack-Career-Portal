import savedSearchRepository from '../repositories/saved-search.repository';
import { SavedSearchRecord, CreateSavedSearchDTO, UpdateSavedSearchDTO } from '../types/job-search.types';

export class SavedSearchService {
  /**
   * Create saved search for authenticated user
   */
  async createSavedSearch(userId: string, dto: CreateSavedSearchDTO): Promise<SavedSearchRecord> {
    const existingCount = await savedSearchRepository.countUserSavedSearches(userId);
    if (existingCount >= 50) {
      const err: any = new Error('Maximum limit of 50 saved searches reached');
      err.statusCode = 400;
      throw err;
    }

    if (!dto.name || dto.name.trim().length === 0) {
      const err: any = new Error('Saved search name is required');
      err.statusCode = 400;
      throw err;
    }

    return savedSearchRepository.createSavedSearch(userId, dto);
  }

  /**
   * Get user's saved searches
   */
  async getUserSavedSearches(userId: string): Promise<SavedSearchRecord[]> {
    return savedSearchRepository.findUserSavedSearches(userId);
  }

  /**
   * Update saved search
   */
  async updateSavedSearch(
    id: string,
    userId: string,
    dto: UpdateSavedSearchDTO
  ): Promise<SavedSearchRecord> {
    const search = await savedSearchRepository.findById(id);
    if (!search || search.user_id !== userId) {
      const err: any = new Error('Saved search not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await savedSearchRepository.updateSavedSearch(id, userId, dto);
    return updated || search;
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(id: string, userId: string): Promise<void> {
    const search = await savedSearchRepository.findById(id);
    if (!search || search.user_id !== userId) {
      const err: any = new Error('Saved search not found');
      err.statusCode = 404;
      throw err;
    }

    await savedSearchRepository.deleteSavedSearch(id, userId);
  }
}

export default new SavedSearchService();
