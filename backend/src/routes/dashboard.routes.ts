import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/student', authenticate, authorize('student'), (req, res, next) =>
  dashboardController.getStudentDashboard(req, res, next)
);
router.get('/recruiter', authenticate, authorize('recruiter'), (req, res, next) =>
  dashboardController.getRecruiterDashboard(req, res, next)
);
router.get('/admin', authenticate, authorize('admin'), (req, res, next) =>
  dashboardController.getAdminDashboard(req, res, next)
);

export default router;
