import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validate.middleware';
import { notificationQuerySchema } from '../validators/notification.validator';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', validateQuery(notificationQuerySchema), (req, res, next) =>
  notificationController.getUserNotifications(req, res, next)
);

router.get('/unread-count', (req, res, next) =>
  notificationController.getUnreadCount(req, res, next)
);

router.patch('/read-all', (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

router.patch('/:notificationId/read', (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);

router.delete('/read', (req, res, next) =>
  notificationController.deleteReadNotifications(req, res, next)
);

router.delete('/:notificationId', (req, res, next) =>
  notificationController.deleteNotification(req, res, next)
);

export default router;
