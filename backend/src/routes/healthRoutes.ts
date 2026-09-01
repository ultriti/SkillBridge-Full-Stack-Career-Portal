import { Router } from 'express';
import { getHealth, getDbHealth } from '../controllers/healthController';

const router = Router();

router.get('/', getHealth);
router.get('/db', getDbHealth);

export default router;
