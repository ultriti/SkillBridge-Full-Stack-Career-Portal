import { Request, Response } from 'express';
import savedJobService from '../services/saved-job.service';
import { publicJobQuerySchema } from '../validators/job.validator';
import { ZodError } from 'zod';

export class SavedJobController {
  /**
   * Student: Save active job
   */
  async saveJob(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { jobId } = req.params;
      const savedJob = await savedJobService.saveJob(req.user.id, jobId);

      res.status(201).json({
        success: true,
        message: 'Job saved successfully',
        data: savedJob,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Student: Unsave job
   */
  async unsaveJob(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { jobId } = req.params;
      const result = await savedJobService.unsaveJob(req.user.id, jobId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Student: Get saved jobs
   */
  async getSavedJobs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const query = publicJobQuerySchema.parse(req.query);
      const result = await savedJobService.getSavedJobs(req.user.id, {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: any): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues,
      });
      return;
    }

    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('SavedJobController Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default new SavedJobController();
