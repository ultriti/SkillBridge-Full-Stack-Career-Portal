import { Router } from 'express';
import jobController from '../controllers/job.controller';
import savedJobController from '../controllers/saved-job.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

// PUBLIC JOB ROUTES
router.get('/', optionalAuthenticate, (req, res) => jobController.getPublicJobs(req, res));
router.get('/:jobId', optionalAuthenticate, (req, res) => jobController.getPublicJobById(req, res));

// STUDENT SAVED JOB ACTIONS (PROTECTED BY JOB ID)
router.post('/:jobId/save', authenticate, authorize('student'), (req, res) =>
  savedJobController.saveJob(req, res)
);
router.delete('/:jobId/save', authenticate, authorize('student'), (req, res) =>
  savedJobController.unsaveJob(req, res)
);

export default router;
