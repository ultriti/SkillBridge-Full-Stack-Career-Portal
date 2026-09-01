import { Router } from 'express';
import searchHistoryController from '../controllers/search-history.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => searchHistoryController.getSearchHistory(req, res, next));
router.delete('/clear', (req, res, next) => searchHistoryController.clearSearchHistory(req, res, next));
router.delete('/:id', (req, res, next) => searchHistoryController.deleteSearchHistory(req, res, next));

export default router;
