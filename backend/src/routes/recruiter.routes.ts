import { Router } from 'express';
import jobController from '../controllers/job.controller';
import applicationController from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import {
  recruiterApplicationQuerySchema,
  updateApplicationStatusSchema,
} from '../validators/application.validator';

const router = Router();

// All recruiter routes require recruiter role
router.use(authenticate, authorize('recruiter'));

// Jobs
router.post('/jobs', (req, res) => jobController.createJob(req, res));
router.get('/jobs', (req, res) => jobController.getRecruiterJobs(req, res));
router.get('/jobs/:jobId', (req, res) => jobController.getRecruiterJobById(req, res));
router.patch('/jobs/:jobId', (req, res) => jobController.updateJob(req, res));
router.patch('/jobs/:jobId/publish', (req, res) => jobController.publishJob(req, res));
router.patch('/jobs/:jobId/close', (req, res) => jobController.closeJob(req, res));
router.delete('/jobs/:jobId', (req, res) => jobController.deleteJob(req, res));

// Applications
router.get(
  '/applications',
  validateQuery(recruiterApplicationQuerySchema),
  (req, res, next) => applicationController.getRecruiterApplications(req, res, next)
);

router.get(
  '/applications/:applicationId',
  (req, res, next) => applicationController.getRecruiterApplication(req, res, next)
);

router.patch(
  '/applications/:applicationId/status',
  validateBody(updateApplicationStatusSchema),
  (req, res, next) => applicationController.updateApplicationStatus(req, res, next)
);

export default router;
