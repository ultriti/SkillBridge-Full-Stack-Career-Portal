export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_REVIEWING'
  | 'APPLICATION_SHORTLISTED'
  | 'APPLICATION_INTERVIEW'
  | 'APPLICATION_SELECTED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_WITHDRAWN'
  | 'JOB_PUBLISHED'
  | 'JOB_ALERT'
  | 'PROFILE_UPDATE'
  | 'SYSTEM';

export type NotificationEntityType = 'APPLICATION' | 'JOB' | 'USER' | 'SYSTEM';

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  entity_type?: NotificationEntityType | null;
  entity_id?: string | null;
  is_read: boolean;
  created_at: Date;
  read_at?: Date | null;
}
