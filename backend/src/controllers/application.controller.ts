import { Request, Response, NextFunction } from 'express';
import applicationService from '../services/application.service';

export class ApplicationController {
  /**
   * Student: Apply to a job opportunity
   */
  async applyToJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const { resumeId, coverLetter } = req.body;
      const studentId = req.user!.id;

      const application = await applicationService.applyToJob(
        jobId,
        studentId,
        resumeId,
        coverLetter
      );

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Student: Get applications submitted by student
   */
  async getStudentApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.id;
      const { status, page, limit } = req.query as any;

      const result = await applicationService.getStudentApplications(
        studentId,
        status,
        Number(page) || 1,
        Number(limit) || 10
      );

      res.status(200).json({
        success: true,
        message: 'Student applications retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Student: Get single application details
   */
  async getStudentApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.id;
      const { applicationId } = req.params;

      const application = await applicationService.getStudentApplication(
        studentId,
        applicationId
      );

      res.status(200).json({
        success: true,
        message: 'Application details retrieved successfully.',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Student: Withdraw application
   */
  async withdrawApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.id;
      const { applicationId } = req.params;

      const updated = await applicationService.withdrawApplication(
        studentId,
        applicationId
      );

      res.status(200).json({
        success: true,
        message: 'Application withdrawn successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recruiter: List applications for recruiter's jobs
   */
  async getRecruiterApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const { status, jobId, search, page, limit } = req.query as any;

      const result = await applicationService.getRecruiterApplications(recruiterId, {
        status,
        jobId,
        search,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      res.status(200).json({
        success: true,
        message: 'Recruiter applications retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recruiter: Get single candidate application details
   */
  async getRecruiterApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const { applicationId } = req.params;

      const application = await applicationService.getRecruiterApplication(
        recruiterId,
        applicationId
      );

      res.status(200).json({
        success: true,
        message: 'Candidate application details retrieved successfully.',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recruiter: Update application status
   */
  async updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const { applicationId } = req.params;
      const { status } = req.body;

      const updated = await applicationService.updateApplicationStatus(
        recruiterId,
        applicationId,
        status
      );

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all applications across platform
   */
  async getAdminApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, jobId, search, page, limit } = req.query as any;

      const result = await applicationService.getAdminApplications({
        status,
        jobId,
        search,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      res.status(200).json({
        success: true,
        message: 'Admin applications retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get application details
   */
  async getAdminApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { applicationId } = req.params;

      const application = await applicationService.getAdminApplication(applicationId);

      res.status(200).json({
        success: true,
        message: 'Admin application details retrieved successfully.',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ApplicationController();
