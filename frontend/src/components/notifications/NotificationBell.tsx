import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationBadge } from './NotificationBadge';
import { NotificationDropdown } from './NotificationDropdown';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center justify-center"
        aria-label={`Notifications, ${unreadCount} unread`}
        title={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-5 h-5" />
        <NotificationBadge count={unreadCount} />
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
};
