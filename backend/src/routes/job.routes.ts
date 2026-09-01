import { Router } from 'express';
import jobController from '../controllers/job.controller';
import savedJobController from '../controllers/saved-job.controller';
import applicationController from '../controllers/application.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { applyToJobSchema } from '../validators/application.validator';

const router = Router();

// PUBLIC JOB ROUTES
router.get('/', optionalAuthenticate, (req, res) => jobController.getPublicJobs(req, res));
router.get('/:jobId', optionalAuthenticate, (req, res) => jobController.getPublicJobById(req, res));

// STUDENT JOB APPLICATIONS
router.post(
  '/:jobId/apply',
  authenticate,
  authorize('student'),
  validateBody(applyToJobSchema),
  (req, res, next) => applicationController.applyToJob(req, res, next)
);

// STUDENT SAVED JOB ACTIONS (PROTECTED BY JOB ID)
router.post('/:jobId/save', authenticate, authorize('student'), (req, res) =>
  savedJobController.saveJob(req, res)
);
router.delete('/:jobId/save', authenticate, authorize('student'), (req, res) =>
  savedJobController.unsaveJob(req, res)
);

export default router;
