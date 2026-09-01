import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notification.service';
import { useNotifications } from '../context/NotificationContext';
import type { NotificationItem, NotificationPagination } from '../types/notification.types';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { Pagination } from '../components/Pagination';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { unreadCount, markAllAsRead: markAllContextRead, refreshNotifications } = useNotifications();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [pagination, setPagination] = useState<NotificationPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageNotifications = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const readParam = activeTab === 'UNREAD' ? false : activeTab === 'READ' ? true : undefined;
      const data = await notificationService.getNotifications(readParam, undefined, page, 20);
      setNotifications(data.notifications);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageNotifications(1);
  }, [activeTab]);

  const handleMarkAllRead = async () => {
    await markAllContextRead();
    fetchPageNotifications(pagination.page);
  };

  const handleClearRead = async () => {
    if (!window.confirm('Are you sure you want to delete all read notifications?')) return;
    try {
      await notificationService.deleteReadNotifications();
      fetchPageNotifications(1);
      refreshNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete read notifications');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <Bell className="w-8 h-8 text-indigo-400" />
              <span>Notification <span className="text-indigo-400">Center</span></span>
            </h1>
            <p className="mt-1 text-slate-400">Stay updated on your application status, interviews, and job activity.</p>
          </div>

          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-400 font-semibold px-4 py-2 rounded-xl transition text-sm shadow"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={handleClearRead}
              className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-red-400 font-semibold px-4 py-2 rounded-xl transition text-sm shadow"
              title="Delete all read notifications"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Read</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 mb-6">
          {[
            { label: 'All Notifications', value: 'ALL' },
            { label: 'Unread', value: 'UNREAD' },
            { label: 'Read', value: 'READ' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.value
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">You're All Caught Up</h3>
            <p className="text-slate-400">No notifications found under this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <NotificationCard key={notif.id} notification={notif} />
            ))}

            <Pagination pagination={pagination} onPageChange={(page) => fetchPageNotifications(page)} />
          </div>
        )}
      </div>
    </div>
  );
};
