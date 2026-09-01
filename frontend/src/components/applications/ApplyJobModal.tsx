import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { applicationService } from '../../services/application.service';
import type { ApplicationResume } from '../../types/application.types';
import { X, Send, AlertTriangle } from 'lucide-react';

interface ApplyJobModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  jobId,
  jobTitle,
  companyName,
  onClose,
  onSuccess,
}) => {
  const [resumes, setResumes] = useState<ApplicationResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentResumes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/students/me/resumes');
        const list = response.data.data || [];
        setResumes(list);
        const defaultResume = list.find((r: any) => r.is_default);
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id);
        } else if (list.length > 0) {
          setSelectedResumeId(list[0].id);
        }
      } catch (err: any) {
        // Resume fetching error non-fatal if optional
        console.warn('Could not fetch student resumes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentResumes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await applicationService.applyToJob(jobId, {
        resumeId: selectedResumeId || null,
        coverLetter: coverLetter.trim() || null,
      });
      onSuccess(result.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
            Applying to {companyName}
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">{jobTitle}</h2>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-xl text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Select Resume
            </label>
            {loading ? (
              <div className="text-xs text-slate-500">Loading resumes...</div>
            ) : resumes.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-amber-400">
                No uploaded resumes found. You can still apply with your profile or upload a resume first in settings.
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name} {r.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Cover Letter (Optional)
            </label>
            <textarea
              rows={5}
              placeholder="Introduce yourself and explain why you're a great fit for this position..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <div className="text-right text-xs text-slate-500 mt-1">
              {coverLetter.length}/5000 characters
            </div>
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
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg transition text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
