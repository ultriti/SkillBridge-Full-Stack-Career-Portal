import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/application.service';
import type { AdminApplicationDetails, ApplicationStatus, ApplicationPagination } from '../../types/application.types';
import { ApplicationStatusBadge } from '../../components/applications/ApplicationStatusBadge';
import { Pagination } from '../../components/Pagination';
import { ShieldCheck, Search, Building, ExternalLink } from 'lucide-react';

export const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<AdminApplicationDetails[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [pagination, setPagination] = useState<ApplicationPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminApplications = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationService.getAdminApplications(
        statusFilter || undefined,
        undefined,
        activeSearch || undefined,
        page,
        10
      );
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load platform applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminApplications(1);
  }, [statusFilter, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <span>Admin <span className="text-amber-400">Application Monitoring</span></span>
          </h1>
          <p className="mt-1 text-slate-400">System-wide read-only monitoring of all recruitment applications.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate, job, company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </form>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 uppercase font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
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
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <h3 className="text-xl font-bold text-white mb-1">No Applications Found</h3>
            <p className="text-slate-400">No applications match the specified criteria.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Recruiter</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {app.candidate.first_name} {app.candidate.last_name}
                        </div>
                        <div className="text-xs text-slate-400">{app.candidate.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">{app.job.title}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-slate-200">
                          <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{app.job.company.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div>{app.recruiter.first_name} {app.recruiter.last_name}</div>
                        <div className="text-slate-500">{app.recruiter.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <ApplicationStatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(page) => fetchAdminApplications(page)} />
          </div>
        )}
      </div>
    </div>
  );
};
