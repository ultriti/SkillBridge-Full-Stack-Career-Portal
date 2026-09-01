import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notification.service';

export class NotificationController {
  /**
   * Get authenticated user's notifications
   */
  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { read, type, page, limit } = req.query as any;

      const result = await notificationService.getUserNotifications(
        userId,
        read !== undefined ? Boolean(read) : undefined,
        type,
        Number(page) || 1,
        Number(limit) || 20
      );

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      const updated = await notificationService.markAsRead(notificationId, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete single notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      await notificationService.deleteNotification(notificationId, userId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteReadNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await notificationService.deleteReadNotifications(userId);

      res.status(200).json({
        success: true,
        message: 'Read notifications deleted successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
