import { Router } from 'express';
import jobController from '../controllers/job.controller';
import applicationController from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validate.middleware';
import { adminApplicationQuerySchema } from '../validators/application.validator';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// Jobs
router.get('/jobs', (req, res) => jobController.getAdminJobs(req, res));
router.get('/jobs/:jobId', (req, res) => jobController.getAdminJobById(req, res));

// Applications
router.get(
  '/applications',
  validateQuery(adminApplicationQuerySchema),
  (req, res, next) => applicationController.getAdminApplications(req, res, next)
);

router.get(
  '/applications/:applicationId',
  (req, res, next) => applicationController.getAdminApplication(req, res, next)
);

export default router;
