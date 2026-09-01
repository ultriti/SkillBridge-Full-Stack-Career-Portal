import { Request, Response, NextFunction } from 'express';
import companyService from '../services/company.service';

export class CompanyController {
  /**
   * Get authenticated recruiter's company profile
   */
  async getRecruiterCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const company = await companyService.getRecruiterCompany(recruiterId);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'No company profile found for this recruiter.',
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Company profile retrieved successfully.',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create or update authenticated recruiter's company profile
   */
  async upsertRecruiterCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const company = await companyService.upsertRecruiterCompany(recruiterId, req.body);

      res.status(200).json({
        success: true,
        message: 'Company profile saved successfully.',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CompanyController();
