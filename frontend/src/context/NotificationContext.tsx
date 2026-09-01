import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken } from '../services/api';
import { notificationService } from '../services/notification.service';
import type { NotificationItem } from '../types/notification.types';

interface NotificationContextType {
  unreadCount: number;
  recentNotifications: NotificationItem[];
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(Math.max(0, count));
    } catch (err) {
      // Ignore count fetch errors silently
    }
  }, [user]);

  const fetchRecentNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications(undefined, undefined, 1, 5);
      setRecentNotifications(data.notifications);
    } catch (err) {
      // Ignore initial notifications fetch errors
    }
  }, [user]);

  const refreshNotifications = async () => {
    await Promise.all([fetchUnreadCount(), fetchRecentNotifications()]);
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setRecentNotifications([]);
      return;
    }

    refreshNotifications();

    // Setup Socket.IO connection for authenticated user
    const token = getAccessToken();
    if (!token) return;

    const socket: Socket = io('http://localhost:5000', {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO Connected for user:', user.id);
    });

    socket.on('notification:new', (newNotif: NotificationItem) => {
      setUnreadCount((prev) => prev + 1);
      setRecentNotifications((prev) => [
        newNotif,
        ...prev.filter((n) => n.id !== newNotif.id).slice(0, 4),
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, fetchUnreadCount, fetchRecentNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      // Failed to mark read
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      // Failed mark all read
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const target = recentNotifications.find((n) => n.id === id);
      await notificationService.deleteNotification(id);
      if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setRecentNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      // Failed delete
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        recentNotifications,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
