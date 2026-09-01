import { Request, Response, NextFunction } from 'express';
import searchHistoryService from '../services/search-history.service';

export class SearchHistoryController {
  async getSearchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await searchHistoryService.getUserSearchHistory(userId);
      res.status(200).json({
        success: true,
        message: 'Search history retrieved successfully.',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSearchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await searchHistoryService.deleteSearchHistory(id, userId);
      res.status(200).json({
        success: true,
        message: 'Search history item deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async clearSearchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await searchHistoryService.clearUserSearchHistory(userId);
      res.status(200).json({
        success: true,
        message: 'Search history cleared successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchHistoryController();
