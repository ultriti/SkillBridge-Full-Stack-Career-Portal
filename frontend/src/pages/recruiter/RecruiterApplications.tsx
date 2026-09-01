import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/application.service';
import type { RecruiterApplicationDetails, ApplicationStatus, ApplicationPagination } from '../../types/application.types';
import { ApplicationStatusBadge } from '../../components/applications/ApplicationStatusBadge';
import { Pagination } from '../../components/Pagination';
import { Search, User, Mail, Briefcase, Calendar, ExternalLink } from 'lucide-react';

export const RecruiterApplications: React.FC = () => {
  const [applications, setApplications] = useState<RecruiterApplicationDetails[]>([]);
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus | ''>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [jobIdFilter] = useState<string>('');

  const [pagination, setPagination] = useState<ApplicationPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationService.getRecruiterApplications(
        activeStatus || undefined,
        jobIdFilter || undefined,
        activeSearch || undefined,
        page,
        10
      );
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidate applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
  }, [activeStatus, activeSearch, jobIdFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Candidate <span className="text-emerald-400">Applications</span>
          </h1>
          <p className="mt-1 text-slate-400">Review, evaluate, and update recruitment status for applicants.</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate name, email, or job title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </form>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 uppercase font-semibold">Status:</span>
            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="APPLIED">APPLIED</option>
              <option value="REVIEWING">REVIEWING</option>
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="INTERVIEW">INTERVIEW</option>
              <option value="SELECTED">SELECTED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="WITHDRAWN">WITHDRAWN</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Applications Found</h3>
            <p className="text-slate-400">No applicant submissions matched your current filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-white">
                      {app.candidate.first_name} {app.candidate.last_name}
                    </h2>
                    <ApplicationStatusBadge status={app.status} />
                  </div>

                  <div className="text-sm font-medium text-slate-400 flex items-center space-x-4">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{app.candidate.email}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-indigo-400">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Applied for: {app.job.title}</span>
                    </span>
                  </div>

                  {app.candidate.skills && app.candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {app.candidate.skills.map((s) => (
                        <span key={s.id} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Submitted on {new Date(app.applied_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <Link
                    to={`/recruiter/applications/${app.id}`}
                    className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition text-sm shadow"
                  >
                    <span>Review Candidate</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}

            <Pagination pagination={pagination} onPageChange={(page) => fetchApplications(page)} />
          </div>
        )}
      </div>
    </div>
  );
};
