import api from './api';
import type {
  NotificationItem,
  NotificationPagination,
  NotificationType,
} from '../types/notification.types';

export const notificationService = {
  /**
   * Get user's notifications list
   */
  async getNotifications(
    read?: boolean,
    type?: NotificationType,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: NotificationItem[]; pagination: NotificationPagination }> {
    const params: Record<string, any> = { page, limit };
    if (read !== undefined) params.read = read;
    if (type) params.type = type;

    const response = await api.get<{
      success: boolean;
      data: { notifications: NotificationItem[]; pagination: NotificationPagination };
    }>('/notifications', { params });
    return response.data.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ success: boolean; data: { count: number } }>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationItem> {
    const response = await api.patch<{ success: boolean; data: NotificationItem }>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<number> {
    const response = await api.patch<{ success: boolean; data: { updatedCount: number } }>(
      '/notifications/read-all'
    );
    return response.data.data.updatedCount;
  },

  /**
   * Delete single notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  /**
   * Delete all read notifications
   */
  async deleteReadNotifications(): Promise<number> {
    const response = await api.delete<{ success: boolean; data: { deletedCount: number } }>(
      '/notifications/read'
    );
    return response.data.data.deletedCount;
  },
};
