import { Router } from 'express';
import jobController from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/jobs', (req, res) => jobController.getAdminJobs(req, res));
router.get('/jobs/:jobId', (req, res) => jobController.getAdminJobById(req, res));

export default router;
