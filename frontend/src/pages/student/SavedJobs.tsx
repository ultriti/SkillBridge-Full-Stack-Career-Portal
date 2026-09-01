import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedJobService } from '../../services/saved-job.service';
import type { SavedJob, JobPagination } from '../../types/job.types';
import { Pagination } from '../../components/Pagination';
import { Bookmark, MapPin, DollarSign, Trash2, Calendar, ExternalLink } from 'lucide-react';

export const SavedJobs: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [pagination, setPagination] = useState<JobPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedJobs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await savedJobService.getSavedJobs(page, 10);
      setSavedJobs(data.savedJobs);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs(1);
  }, []);

  const handleUnsave = async (jobId: string) => {
    try {
      await savedJobService.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job.id !== jobId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove saved job');
    }
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (min == null && max == null) return 'Salary Undisclosed';
    if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min != null) return `From $${min.toLocaleString()}`;
    return `Up to $${max!.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Bookmark className="w-8 h-8 text-indigo-500 fill-indigo-500/20" />
            <span>My <span className="text-indigo-400">Saved Jobs</span></span>
          </h1>
          <p className="mt-1 text-slate-400">Manage jobs you have bookmarked for later review.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Saved Jobs Yet</h3>
            <p className="text-slate-400 mb-6">When you browse active job listings, click the save button to bookmark them here.</p>
            <Link
              to="/jobs"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
            >
              <span>Explore Available Jobs</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((item) => {
              const job = item.job;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-bold text-white hover:text-indigo-400 transition">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h2>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                        {job.job_type.replace('_', ' ')}
                      </span>
                      <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                        {job.work_mode}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-slate-400 flex items-center space-x-4">
                      <span>{job.company.name}</span>
                      {job.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.location}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                      <span>Saved on {new Date(item.created_at).toLocaleDateString()}</span>
                      {job.application_deadline && (
                        <span className="flex items-center space-x-1 text-amber-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleUnsave(job.id)}
                      className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg font-medium transition text-xs"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Unsave</span>
                    </button>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition text-xs shadow"
                    >
                      <span>View Job</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            <Pagination pagination={pagination} onPageChange={(page) => fetchSavedJobs(page)} />
          </div>
        )}
      </div>
    </div>
  );
};
