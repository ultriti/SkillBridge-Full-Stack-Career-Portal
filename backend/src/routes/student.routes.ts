import { Router } from 'express';
import savedJobController from '../controllers/saved-job.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All student routes require student role
router.use(authenticate, authorize('student'));

router.get('/me/saved-jobs', (req, res) => savedJobController.getSavedJobs(req, res));

export default router;
