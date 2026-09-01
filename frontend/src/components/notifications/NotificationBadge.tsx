import React from 'react';

interface BadgeProps {
  count: number;
}

export const NotificationBadge: React.FC<BadgeProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg border border-slate-900 animate-pulse">
      {count > 99 ? '99+' : count}
    </span>
  );
};
