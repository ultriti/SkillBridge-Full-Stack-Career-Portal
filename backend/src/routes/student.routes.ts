import { Router } from 'express';
import savedJobController from '../controllers/saved-job.controller';
import applicationController from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validate.middleware';
import { studentApplicationQuerySchema } from '../validators/application.validator';

const router = Router();

// All student routes require student role
router.use(authenticate, authorize('student'));

// Saved jobs
router.get('/me/saved-jobs', (req, res) => savedJobController.getSavedJobs(req, res));

// Applications
router.get(
  '/me/applications',
  validateQuery(studentApplicationQuerySchema),
  (req, res, next) => applicationController.getStudentApplications(req, res, next)
);

router.get(
  '/me/applications/:applicationId',
  (req, res, next) => applicationController.getStudentApplication(req, res, next)
);

router.patch(
  '/me/applications/:applicationId/withdraw',
  (req, res, next) => applicationController.withdrawApplication(req, res, next)
);

export default router;
