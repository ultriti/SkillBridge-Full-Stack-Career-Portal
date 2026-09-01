import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import type { NotificationItem } from '../../types/notification.types';
import { Bell, CheckCircle, FileText, Briefcase, Trash2 } from 'lucide-react';

interface CardProps {
  notification: NotificationItem;
  onCloseDropdown?: () => void;
}

export const NotificationCard: React.FC<CardProps> = ({ notification, onCloseDropdown }) => {
  const { user } = useAuth();
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const formatRelativeTime = (dateStr: string) => {
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'APPLICATION_SUBMITTED':
      case 'APPLICATION_REVIEWING':
      case 'APPLICATION_SHORTLISTED':
      case 'APPLICATION_INTERVIEW':
      case 'APPLICATION_SELECTED':
        return <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'APPLICATION_REJECTED':
      case 'APPLICATION_WITHDRAWN':
        return <FileText className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'JOB_PUBLISHED':
        return <Briefcase className="w-5 h-5 text-indigo-400 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
  };

  const handleClick = async () => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (onCloseDropdown) onCloseDropdown();

    if (notification.entity_type === 'APPLICATION' && notification.entity_id) {
      if (user?.role === 'student') {
        navigate(`/student/applications/${notification.entity_id}`);
      } else if (user?.role === 'recruiter') {
        navigate(`/recruiter/applications/${notification.entity_id}`);
      } else if (user?.role === 'admin') {
        navigate(`/admin/applications/${notification.entity_id}`);
      }
    } else if (notification.entity_type === 'JOB' && notification.entity_id) {
      navigate(`/jobs/${notification.entity_id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
        !notification.is_read
          ? 'bg-slate-900 border-indigo-950/80 hover:bg-slate-850'
          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg mt-0.5">
          {getIcon()}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-white leading-snug">{notification.title}</h4>
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notification.message}</p>
          <span className="text-[11px] text-slate-500 mt-1.5 block">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNotification(notification.id);
        }}
        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition shrink-0"
        title="Delete notification"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
