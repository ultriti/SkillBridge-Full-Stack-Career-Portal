import { Request, Response } from 'express';
import jobService from '../services/job.service';
import {
  createJobSchema,
  updateJobSchema,
  publicJobQuerySchema,
  recruiterJobQuerySchema,
  adminJobQuerySchema,
} from '../validators/job.validator';
import { ZodError } from 'zod';

export class JobController {
  /**
   * Recruiter: Create job
   */
  async createJob(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      console.log('req.body', req.body)

      const validatedData = createJobSchema.parse(req.body);
      const job = await jobService.createJob(req.user.id, validatedData);

      res.status(201).json({
        success: true,
        message: 'Job posting created successfully',
        data: job,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Recruiter: Get recruiter's jobs
   */
  async getRecruiterJobs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const query = recruiterJobQuerySchema.parse(req.query);
      const result = await jobService.getRecruiterJobs(req.user.id, query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Recruiter: Get specific recruiter job
   */
  async getRecruiterJobById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { jobId } = req.params;
      const job = await jobService.getRecruiterJobById(req.user.id, jobId);

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Recruiter: Edit job
   */
  async updateJob(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { jobId } = req.params;
      const validatedData = updateJobSchema.parse(req.body);
      const updatedJob = await jobService.updateJob(req.user.id, jobId, validatedData);

      res.status(200).json({
        success: true,
        message: 'Job posting updated successfully',
        data: updatedJob,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Recruiter: Publish job (DRAFT -> ACTIVE)
   */
  async publishJob(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { jobId } = req.params;
      const publishedJob = await jobService.publishJob(req.user.id, jobId);

      res.status(200).json({
        success: true,
        message: 'Job posting published successfully',
        data: publishedJob,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Recruiter: Close job (ACTIVE -> CLOSED)
   */
  async closeJob(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { jobId } = req.params;
      const closedJob = await jobService.closeJob(req.user.id, jobId);

      res.status(200).json({
        success: true,
        message: 'Job posting closed successfully',
        data: closedJob,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Recruiter: Delete job
   */
  async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { jobId } = req.params;
      const result = await jobService.deleteJob(req.user.id, jobId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Public: List public active jobs
   */
  async getPublicJobs(req: Request, res: Response): Promise<void> {
    try {
      const query = publicJobQuerySchema.parse(req.query);
      const studentId = req.user && req.user.role === 'student' ? req.user.id : undefined;
      const result = await jobService.getPublicJobs(query, studentId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Public: Get public active job details
   */
  async getPublicJobById(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const studentId = req.user && req.user.role === 'student' ? req.user.id : undefined;
      const job = await jobService.getPublicJobById(jobId, studentId);

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Admin: List all jobs across platform
   */
  async getAdminJobs(req: Request, res: Response): Promise<void> {
    try {
      const query = adminJobQuerySchema.parse(req.query);
      const result = await jobService.getAdminJobs(query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Admin: Get job details
   */
  async getAdminJobById(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await jobService.getAdminJobById(jobId);

      res.status(200).json({
        success: true,
        data: job,
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

    console.error('JobController Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default new JobController();
