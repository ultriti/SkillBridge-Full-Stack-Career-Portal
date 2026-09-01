import pool from '../config/db';
import { NotificationRecord, NotificationType, NotificationEntityType } from '../types/notification.types';

export class NotificationRepository {
  /**
   * Create a new notification record in database
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    entityType?: NotificationEntityType | null,
    entityId?: string | null
  ): Promise<NotificationRecord> {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, is_read)
      VALUES ($1, $2, $3, $4, $5, $6, FALSE)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      title,
      message,
      type,
      entityType || null,
      entityId || null,
    ]);
    return result.rows[0];
  }

  /**
   * Find notification by ID
   */
  async findById(id: string): Promise<NotificationRecord | null> {
    const query = 'SELECT * FROM notifications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get user's notifications list with filtering and pagination
   */
  async findUserNotifications(
    userId: string,
    isRead?: boolean,
    type?: NotificationType,
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationRecord[]> {
    const values: any[] = [userId];
    const conditions: string[] = ['user_id = $1'];

    if (isRead !== undefined) {
      values.push(isRead);
      conditions.push(`is_read = $${values.length}`);
    }

    if (type) {
      values.push(type);
      conditions.push(`type = $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const query = `
      SELECT * FROM notifications
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Count user's total notifications matching filter
   */
  async countUserNotifications(
    userId: string,
    isRead?: boolean,
    type?: NotificationType
  ): Promise<number> {
    const values: any[] = [userId];
    const conditions: string[] = ['user_id = $1'];

    if (isRead !== undefined) {
      values.push(isRead);
      conditions.push(`is_read = $${values.length}`);
    }

    if (type) {
      values.push(type);
      conditions.push(`type = $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');
    const query = `SELECT COUNT(*) FROM notifications WHERE ${whereClause}`;

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get user's unread notification count
   */
  async countUnread(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string, userId: string): Promise<NotificationRecord | null> {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Mark all unread notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = FALSE
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount ?? 0;
  }

  /**
   * Delete single notification owned by user
   */
  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const query = 'DELETE FROM notifications WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all read notifications for user
   */
  async deleteReadNotifications(userId: string): Promise<number> {
    const query = 'DELETE FROM notifications WHERE user_id = $1 AND is_read = TRUE';
    const result = await pool.query(query, [userId]);
    return result.rowCount ?? 0;
  }
}

export default new NotificationRepository();
