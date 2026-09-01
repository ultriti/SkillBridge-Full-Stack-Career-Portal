import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/job.service';
import { AdminJobDetails, JobStatus, JobPagination } from '../../types/job.types';
import { Pagination } from '../../components/Pagination';
import { ShieldCheck, Search, Building, User, Mail, Calendar } from 'lucide-react';

export const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<AdminJobDetails[]>([]);
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [pagination, setPagination] = useState<JobPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminJobs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getAdminJobs(
        statusFilter || undefined,
        activeSearch || undefined,
        page,
        10
      );
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load system job postings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminJobs(1);
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
            <span>Admin <span className="text-amber-400">Job Monitoring</span></span>
          </h1>
          <p className="mt-1 text-slate-400">System-wide monitoring of all job postings across recruiters and companies.</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search job title, company, recruiter..."
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
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <h3 className="text-xl font-bold text-white mb-1">No Jobs Found</h3>
            <p className="text-slate-400">No job listings matched the specified filter criteria.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Recruiter</th>
                    <th className="px-6 py-4">Type / Mode</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div>{job.title}</div>
                        <div className="text-xs text-slate-500 font-normal">{job.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-slate-200">
                          <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{job.company.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-medium flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.recruiter.first_name} {job.recruiter.last_name}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{job.recruiter.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-300">{job.job_type}</div>
                        <div className="text-xs text-slate-500">{job.work_mode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                            job.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : job.status === 'DRAFT'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(page) => fetchAdminJobs(page)} />
          </div>
        )}
      </div>
    </div>
  );
};
