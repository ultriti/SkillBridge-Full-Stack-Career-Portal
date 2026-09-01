-- Migration: 002_extend_notifications.sql
-- Extend notifications table with entity references and read timestamp

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS entity_id UUID,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
