import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboard.service';
import { dashboardDateRangeSchema } from '../validators/dashboard.validator';

export class DashboardController {
  async getStudentDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { from, to, status } = dashboardDateRangeSchema.parse(req.query);
      const data = await dashboardService.getStudentDashboard(user.id, { from, to, status });

      res.status(200).json({
        success: true,
        message: 'Dashboard retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecruiterDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { from, to, status, jobId } = dashboardDateRangeSchema.parse(req.query);
      const data = await dashboardService.getRecruiterDashboard(user.id, { from, to, status, jobId });

      res.status(200).json({
        success: true,
        message: 'Dashboard retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to } = dashboardDateRangeSchema.parse(req.query);
      const data = await dashboardService.getAdminDashboard({ from, to });

      res.status(200).json({
        success: true,
        message: 'Dashboard retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
