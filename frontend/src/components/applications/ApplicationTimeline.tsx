import React from 'react';
import type { ApplicationStatus } from '../../types/application.types';
import { CheckCircle2, Clock, XCircle, AlertOctagon } from 'lucide-react';

interface TimelineProps {
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export const ApplicationTimeline: React.FC<TimelineProps> = ({ status, appliedAt, updatedAt }) => {
  const isTerminal = status === 'REJECTED' || status === 'WITHDRAWN';

  const steps = [
    { key: 'APPLIED', label: 'Applied', date: appliedAt },
    { key: 'REVIEWING', label: 'In Review' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW', label: 'Interview' },
    { key: 'SELECTED', label: 'Selected' },
  ];

  const statusOrder: Record<string, number> = {
    APPLIED: 0,
    REVIEWING: 1,
    SHORTLISTED: 2,
    INTERVIEW: 3,
    SELECTED: 4,
  };

  const currentIndex = statusOrder[status] ?? (isTerminal ? 1 : 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
        <Clock className="w-5 h-5 text-indigo-400" />
        <span>Application Progress Timeline</span>
      </h3>

      {isTerminal && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 flex items-center space-x-3">
          {status === 'REJECTED' ? (
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <div className="text-rose-400 font-bold">Application Status: Rejected</div>
                <div className="text-xs text-slate-400">
                  The recruiter has closed review for this application on {new Date(updatedAt).toLocaleDateString()}.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <AlertOctagon className="w-6 h-6 text-slate-400 shrink-0" />
              <div>
                <div className="text-slate-300 font-bold">Application Status: Withdrawn</div>
                <div className="text-xs text-slate-500">
                  You withdrew this application on {new Date(updatedAt).toLocaleDateString()}.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-2">
        {steps.map((step, idx) => {
          const isCompleted = !isTerminal && idx <= currentIndex;
          const isCurrent = !isTerminal && idx === currentIndex;

          return (
            <div key={step.key} className="flex-1 flex flex-row sm:flex-col items-center relative z-10 w-full sm:w-auto">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${
                    isCompleted
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : isCurrent
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-400 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
              </div>

              <div className="ml-4 sm:ml-0 sm:mt-3 text-left sm:text-center">
                <div
                  className={`text-sm font-semibold ${
                    isCompleted || isCurrent ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {step.label}
                </div>
                {step.date && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(step.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
