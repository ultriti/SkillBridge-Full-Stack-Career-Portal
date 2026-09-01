import { Router } from 'express';
import savedSearchController from '../controllers/saved-search.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createSavedSearchSchema, updateSavedSearchSchema } from '../validators/job-search.validator';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => savedSearchController.getSavedSearches(req, res, next));

router.post('/', validateBody(createSavedSearchSchema), (req, res, next) =>
  savedSearchController.createSavedSearch(req, res, next)
);

router.patch('/:id', validateBody(updateSavedSearchSchema), (req, res, next) =>
  savedSearchController.updateSavedSearch(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  savedSearchController.deleteSavedSearch(req, res, next)
);

export default router;
