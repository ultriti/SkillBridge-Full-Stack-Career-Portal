import { Router } from 'express';
import jobController from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All recruiter routes require recruiter role
router.use(authenticate, authorize('recruiter'));

router.post('/jobs', (req, res) => jobController.createJob(req, res));
router.get('/jobs', (req, res) => jobController.getRecruiterJobs(req, res));
router.get('/jobs/:jobId', (req, res) => jobController.getRecruiterJobById(req, res));
router.patch('/jobs/:jobId', (req, res) => jobController.updateJob(req, res));
router.patch('/jobs/:jobId/publish', (req, res) => jobController.publishJob(req, res));
router.patch('/jobs/:jobId/close', (req, res) => jobController.closeJob(req, res));
router.delete('/jobs/:jobId', (req, res) => jobController.deleteJob(req, res));

export default router;
