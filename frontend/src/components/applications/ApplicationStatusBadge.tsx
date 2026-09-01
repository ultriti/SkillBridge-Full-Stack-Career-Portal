import React from 'react';
import type { ApplicationStatus } from '../../types/application.types';

interface BadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const ApplicationStatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'REVIEWING':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'SHORTLISTED':
        return 'bg-purple-950 text-purple-400 border-purple-800';
      case 'INTERVIEW':
        return 'bg-indigo-950 text-indigo-400 border-indigo-800';
      case 'SELECTED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'REJECTED':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'WITHDRAWN':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3.5 py-1.5 font-bold';
      default:
        return 'text-xs px-3 py-1 font-semibold';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border uppercase tracking-wider ${getStyles()} ${getSizeClasses()}`}>
      {status}
    </span>
  );
};
