import notificationRepository from '../repositories/notification.repository';
import { NotificationType, NotificationEntityType, NotificationRecord } from '../types/notification.types';
import { emitNotificationToUser } from '../sockets/notification.socket';

export class NotificationService {
  /**
   * Create and deliver notification record
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    entityType?: NotificationEntityType | null,
    entityId?: string | null
  ): Promise<NotificationRecord> {
    const notification = await notificationRepository.createNotification(
      userId,
      title,
      message,
      type,
      entityType,
      entityId
    );

    // Emit real-time socket event
    try {
      emitNotificationToUser(userId, notification);
    } catch (err) {
      console.error('Socket notification emission failed:', err);
    }

    return notification;
  }

  /**
   * Get user's notifications list with pagination
   */
  async getUserNotifications(
    userId: string,
    isRead?: boolean,
    type?: NotificationType,
    page: number = 1,
    limit: number = 20
  ) {
    const notifications = await notificationRepository.findUserNotifications(
      userId,
      isRead,
      type,
      page,
      limit
    );
    const total = await notificationRepository.countUserNotifications(userId, isRead, type);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await notificationRepository.countUnread(userId);
    return { count };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string, userId: string): Promise<NotificationRecord> {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      const err: any = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    if (notification.user_id !== userId) {
      const err: any = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await notificationRepository.markAsRead(id, userId);
    return updated || notification;
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    const count = await notificationRepository.markAllAsRead(userId);
    return { updatedCount: count };
  }

  /**
   * Delete single notification
   */
  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await notificationRepository.findById(id);
    if (!notification || notification.user_id !== userId) {
      const err: any = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }

    await notificationRepository.deleteNotification(id, userId);
  }

  /**
   * Delete all read notifications for user
   */
  async deleteReadNotifications(userId: string): Promise<{ deletedCount: number }> {
    const count = await notificationRepository.deleteReadNotifications(userId);
    return { deletedCount: count };
  }
}

export default new NotificationService();
