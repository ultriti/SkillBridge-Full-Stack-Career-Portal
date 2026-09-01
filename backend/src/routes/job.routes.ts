import { Router } from 'express';
import jobController from '../controllers/job.controller';
import savedJobController from '../controllers/saved-job.controller';
import applicationController from '../controllers/application.controller';
import savedSearchRoutes from './saved-search.routes';
import searchHistoryRoutes from './search-history.routes';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { applyToJobSchema } from '../validators/application.validator';

const router = Router();

// Subroutes for Saved Searches & Search History
router.use('/saved-searches', savedSearchRoutes);
router.use('/search-history', searchHistoryRoutes);

// PUBLIC & ADVANCED JOB SEARCH ROUTES
router.get('/search', optionalAuthenticate, (req, res) => jobController.searchJobs(req, res));
router.get('/', optionalAuthenticate, (req, res) => jobController.searchJobs(req, res));
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
