import { Request, Response, NextFunction } from 'express';
import savedSearchService from '../services/saved-search.service';

export class SavedSearchController {
  async createSavedSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const savedSearch = await savedSearchService.createSavedSearch(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Saved search created successfully.',
        data: savedSearch,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSavedSearches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const searches = await savedSearchService.getUserSavedSearches(userId);
      res.status(200).json({
        success: true,
        message: 'Saved searches retrieved successfully.',
        data: searches,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSavedSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updated = await savedSearchService.updateSavedSearch(id, userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Saved search updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSavedSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await savedSearchService.deleteSavedSearch(id, userId);
      res.status(200).json({
        success: true,
        message: 'Saved search deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SavedSearchController();
