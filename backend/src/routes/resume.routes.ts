import { Router } from 'express';
import resumeController, { resumeUploadMiddleware } from '../controllers/resume.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Student Resume Management
router.get('/', authorize('student'), (req, res, next) => resumeController.getStudentResumes(req, res, next));

router.post('/upload', authorize('student'), resumeUploadMiddleware, (req, res, next) =>
  resumeController.uploadResume(req, res, next)
);

router.patch('/:id/primary', authorize('student'), (req, res, next) =>
  resumeController.setPrimaryResume(req, res, next)
);

router.post('/:id/retry', authorize('student'), (req, res, next) =>
  resumeController.retryProcessing(req, res, next)
);

router.delete('/:id', authorize('student'), (req, res, next) =>
  resumeController.deleteResume(req, res, next)
);

export default router;
