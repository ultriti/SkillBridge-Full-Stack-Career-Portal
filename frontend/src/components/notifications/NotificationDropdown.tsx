import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationCard } from './NotificationCard';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';

interface DropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<DropdownProps> = ({ onClose }) => {
  const { recentNotifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
      {/* Dropdown Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-semibold transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto p-3 space-y-2 divide-y-0">
        {recentNotifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          recentNotifications.map((notif) => (
            <NotificationCard key={notif.id} notification={notif} onCloseDropdown={onClose} />
          ))
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition"
        >
          <span>View Notification Center</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
