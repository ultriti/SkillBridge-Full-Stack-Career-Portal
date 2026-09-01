import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { savedJobService } from '../../services/saved-job.service';
import { useAuth } from '../../context/AuthContext';
import type { Job, JobFilters, JobPagination, JobType, WorkMode } from '../../types/job.types';
import { Pagination } from '../../components/Pagination';
import { Search, MapPin, Briefcase, DollarSign, Calendar, Bookmark, Filter, ArrowUpDown } from 'lucide-react';

export const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<JobPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState<string>(searchParams.get('search') || '');
  const [selectedJobType, setSelectedJobType] = useState<JobType | ''>(
    (searchParams.get('jobType') as JobType) || ''
  );
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode | ''>(
    (searchParams.get('workMode') as WorkMode) || ''
  );
  const [locationInput, setLocationInput] = useState<string>(searchParams.get('location') || '');
  const [salaryMinInput, setSalaryMinInput] = useState<string>(searchParams.get('salaryMin') || '');
  const [sortBy, setSortBy] = useState<'createdAt' | 'salaryMin' | 'salaryMax' | 'applicationDeadline'>(
    (searchParams.get('sortBy') as any) || 'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as any) || 'desc'
  );

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: JobFilters = {
        search: searchParams.get('search') || undefined,
        jobType: (searchParams.get('jobType') as JobType) || undefined,
        workMode: (searchParams.get('workMode') as WorkMode) || undefined,
        location: searchParams.get('location') || undefined,
        salaryMin: searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined,
        sortBy,
        sortOrder,
        page: Number(searchParams.get('page')) || 1,
        limit: 10,
      };

      const data = await jobService.getPublicJobs(filters);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params: Record<string, string> = {};
    if (searchInput) params.search = searchInput;
    if (selectedJobType) params.jobType = selectedJobType;
    if (selectedWorkMode) params.workMode = selectedWorkMode;
    if (locationInput) params.location = locationInput;
    if (salaryMinInput) params.salaryMin = salaryMinInput;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    params.page = '1';

    setSearchParams(params);
  };

  const handleToggleSave = async (jobId: string, isCurrentlySaved: boolean) => {
    if (!user || user.role !== 'student') return;

    try {
      if (isCurrentlySaved) {
        await savedJobService.unsaveJob(jobId);
      } else {
        await savedJobService.saveJob(jobId);
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: !isCurrentlySaved } : j))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update saved job');
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
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
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Explore <span className="text-indigo-400">Career Opportunities</span>
          </h1>
          <p className="mt-2 text-slate-400 text-lg">
            Discover active job openings from top companies around the world.
          </p>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 mb-8 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search job title, skills, or keywords..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Location (e.g. New York, Remote)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center space-x-2 shadow-lg"
            >
              <Filter className="w-4 h-4" />
              <span>Search Jobs</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Job Type
              </label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Job Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Work Mode
              </label>
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Work Modes</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Min Salary ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={salaryMinInput}
                onChange={(e) => setSalaryMinInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="createdAt">Date Posted</option>
                  <option value="salaryMin">Min Salary</option>
                  <option value="salaryMax">Max Salary</option>
                  <option value="applicationDeadline">Deadline</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-400 hover:text-white"
                  title={`Order: ${sortOrder.toUpperCase()}`}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center my-8">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Jobs Found</h3>
            <p className="text-slate-400 mb-4">Try relaxing your search terms or filter criteria.</p>
            <button
              onClick={() => {
                setSearchInput('');
                setSelectedJobType('');
                setSelectedWorkMode('');
                setLocationInput('');
                setSalaryMinInput('');
                setSearchParams({});
              }}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Reset All Filters
            </button>
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
                      <span className="flex items-center space-x-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm line-clamp-2">{job.description}</p>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    {job.application_deadline && (
                      <span className="flex items-center space-x-1 text-amber-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {user && user.role === 'student' && (
                    <button
                      onClick={() => handleToggleSave(job.id, !!job.isSaved)}
                      className={`p-2.5 rounded-lg border transition ${
                        job.isSaved
                          ? 'bg-indigo-950 border-indigo-600 text-indigo-400 hover:bg-indigo-900'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={job.isSaved ? 'Unsave Job' : 'Save Job'}
                    >
                      <Bookmark className={`w-5 h-5 ${job.isSaved ? 'fill-indigo-400' : ''}`} />
                    </button>
                  )}

                  <Link
                    to={`/jobs/${job.id}`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition text-sm text-center shadow"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}

            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
};
