import React, { useState } from 'react';
import type { AdvancedJobSearchFilters } from '../../types/job-search.types';
import { jobSearchService } from '../../services/job-search.service';
import { X, Bookmark, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SaveModalProps {
  filters: AdvancedJobSearchFilters;
  onClose: () => void;
  onSuccess: () => void;
}

export const SaveSearchModal: React.FC<SaveModalProps> = ({
  filters,
  onClose,
  onSuccess,
}) => {
  const defaultName = filters.q
    ? `Jobs matching "${filters.q}"`
    : filters.workMode
    ? `${filters.workMode} Jobs`
    : 'Custom Job Search';

  const [name, setName] = useState<string>(defaultName);
  const [alertEnabled, setAlertEnabled] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await jobSearchService.createSavedSearch(name.trim(), filters.q || null, filters, alertEnabled);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save search');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-800 pb-4 flex items-center space-x-3">
          <Bookmark className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Save Search & Job Alerts</h2>
            <p className="text-xs text-slate-400 mt-0.5">Save current search criteria to run anytime or receive instant job match alerts.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-xl text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Saved Search Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Remote React Developer Jobs"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs text-slate-300">
            <span className="text-slate-500 font-bold uppercase block mb-1">Search Criteria Summary:</span>
            {filters.q && <div>• Keyword: <strong className="text-white">{filters.q}</strong></div>}
            {filters.location && <div>• Location: <strong className="text-white">{filters.location}</strong></div>}
            {filters.workMode && <div>• Work Mode: <strong className="text-white">{filters.workMode}</strong></div>}
            {filters.jobType && <div>• Job Type: <strong className="text-white">{filters.jobType}</strong></div>}
            {filters.skills && filters.skills.length > 0 && (
              <div>• Skills: <strong className="text-white">{filters.skills.join(', ')}</strong></div>
            )}
          </div>

          <div className="flex items-start space-x-3 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
            <input
              type="checkbox"
              id="alertEnabled"
              checked={alertEnabled}
              onChange={(e) => setAlertEnabled(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
            />
            <label htmlFor="alertEnabled" className="text-xs text-slate-300 cursor-pointer">
              <span className="font-bold text-white flex items-center space-x-1.5 mb-0.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Enable Job Match Alerts</span>
              </span>
              <span>Receive instant in-app and email notifications when new matching jobs are published by recruiters.</span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg transition text-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Search Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
