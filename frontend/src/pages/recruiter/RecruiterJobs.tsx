import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import type { Job, JobStatus, JobPagination } from '../../types/job.types';
import { Pagination } from '../../components/Pagination';
import { PlusCircle, Edit3, Trash2, Eye, CheckCircle, XCircle, Briefcase, MapPin, DollarSign } from 'lucide-react';

export const RecruiterJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<JobStatus | ''>('');
  const [pagination, setPagination] = useState<JobPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruiterJobs = async (status?: JobStatus, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getRecruiterJobs(status || undefined, page, 10);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs(activeTab || undefined, 1);
  }, [activeTab]);

  const handlePublish = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to publish this draft job?')) return;
    try {
      await jobService.publishJob(jobId);
      fetchRecruiterJobs(activeTab || undefined, pagination.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish job');
    }
  };

  const handleClose = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to close this job posting?')) return;
    try {
      await jobService.closeJob(jobId);
      fetchRecruiterJobs(activeTab || undefined, pagination.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close job');
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) return;
    try {
      await jobService.deleteJob(jobId);
      fetchRecruiterJobs(activeTab || undefined, pagination.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete job');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Recruiter <span className="text-emerald-400">Job Management</span>
            </h1>
            <p className="mt-1 text-slate-400">Manage, draft, publish, and track your job postings.</p>
          </div>
          <Link
            to="/recruiter/jobs/create"
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Job</span>
          </Link>
        </div>

        <div className="flex space-x-2 border-b border-slate-800 mb-6">
          {[
            { label: 'All Jobs', value: '' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Drafts', value: 'DRAFT' },
            { label: 'Closed', value: 'CLOSED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.value
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Jobs Found</h3>
            <p className="text-slate-400 mb-4">You have no {activeTab.toLowerCase()} job postings created yet.</p>
            <Link
              to="/recruiter/jobs/create"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Job</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-white">{job.title}</h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        job.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : job.status === 'DRAFT'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">
                      {job.job_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-slate-400 flex items-center space-x-4">
                    <span>{job.company.name}</span>
                    {job.location && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs">
                    Created {new Date(job.created_at).toLocaleDateString()} • Last updated{' '}
                    {new Date(job.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 text-xs">
                  {job.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(job.id)}
                      className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-medium transition"
                      title="Publish Job"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </button>
                  )}

                  {job.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleClose(job.id)}
                      className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-lg font-medium transition"
                      title="Close Job"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Close</span>
                    </button>
                  )}

                  <Link
                    to={`/recruiter/jobs/${job.id}/edit`}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-medium transition"
                    title="Edit Job"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-medium transition"
                    title="View Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="flex items-center space-x-1 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-400 px-3 py-2 rounded-lg font-medium transition"
                    title="Delete Job"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}

            <Pagination
              pagination={pagination}
              onPageChange={(page) => fetchRecruiterJobs(activeTab || undefined, page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
