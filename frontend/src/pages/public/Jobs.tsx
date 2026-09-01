import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobSearchService } from '../../services/job-search.service';
import { savedJobService } from '../../services/saved-job.service';
import { useAuth } from '../../context/AuthContext';
import type { Job, JobPagination, JobType, WorkMode } from '../../types/job.types';
import type { AdvancedJobSearchFilters, JobSearchSort } from '../../types/job-search.types';
import { Pagination } from '../../components/Pagination';
import { JobSearchBar } from '../../components/jobs/JobSearchBar';
import { JobFilters } from '../../components/jobs/JobFilters';
import { ActiveFilters } from '../../components/jobs/ActiveFilters';
import { SaveSearchModal } from '../../components/jobs/SaveSearchModal';
import { MapPin, DollarSign, Calendar, Bookmark, Briefcase, Filter, ArrowUpDown, BookmarkCheck } from 'lucide-react';

export const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<JobPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Parse filters from URL search parameters
  const currentFilters: AdvancedJobSearchFilters = {
    q: searchParams.get('q') || undefined,
    location: searchParams.get('location') || undefined,
    jobType: (searchParams.get('jobType') as JobType) || undefined,
    workMode: (searchParams.get('workMode') as WorkMode) || undefined,
    experienceLevel: searchParams.get('experienceLevel') || undefined,
    salaryMin: searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined,
    salaryMax: searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : undefined,
    skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',') : undefined,
    skillMatch: (searchParams.get('skillMatch') as any) || 'any',
    companyId: searchParams.get('companyId') || undefined,
    sortBy: (searchParams.get('sortBy') as JobSearchSort) || (searchParams.get('q') ? 'relevance' : 'newest'),
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobSearchService.searchJobs(currentFilters);
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

  const updateFiltersInUrl = (newFilters: AdvancedJobSearchFilters) => {
    const params: Record<string, string> = {};

    if (newFilters.q) params.q = newFilters.q;
    if (newFilters.location) params.location = newFilters.location;
    if (newFilters.jobType) params.jobType = newFilters.jobType;
    if (newFilters.workMode) params.workMode = newFilters.workMode;
    if (newFilters.experienceLevel) params.experienceLevel = newFilters.experienceLevel;
    if (newFilters.salaryMin != null) params.salaryMin = String(newFilters.salaryMin);
    if (newFilters.salaryMax != null) params.salaryMax = String(newFilters.salaryMax);
    if (newFilters.skills && newFilters.skills.length > 0) params.skills = newFilters.skills.join(',');
    if (newFilters.skillMatch && newFilters.skillMatch !== 'any') params.skillMatch = newFilters.skillMatch;
    if (newFilters.companyId) params.companyId = newFilters.companyId;
    if (newFilters.sortBy) params.sortBy = newFilters.sortBy;
    params.page = String(newFilters.page || 1);

    setSearchParams(params);
  };

  const handleQueryChange = (query: string) => {
    updateFiltersInUrl({
      ...currentFilters,
      q: query || undefined,
      sortBy: query ? 'relevance' : currentFilters.sortBy === 'relevance' ? 'newest' : currentFilters.sortBy,
      page: 1,
    });
  };

  const handleRemoveFilter = (key: keyof AdvancedJobSearchFilters) => {
    const updated = { ...currentFilters, [key]: undefined, page: 1 };
    updateFiltersInUrl(updated);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handleToggleSaveJob = async (jobId: string, isCurrentlySaved: boolean) => {
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

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (min == null && max == null) return 'Salary Undisclosed';
    if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min != null) return `From $${min.toLocaleString()}`;
    return `Up to $${max!.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Advanced <span className="text-indigo-400">Job Discovery</span>
            </h1>
            <p className="mt-1 text-slate-400 text-base">
              Find positions matching your exact skills, experience, location, and salary goals.
            </p>
          </div>

          {user && user.role === 'student' && (
            <div className="flex items-center space-x-3">
              <Link
                to="/jobs/saved-searches"
                className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-400 font-semibold px-4 py-2 rounded-xl transition text-sm shadow"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Saved Searches & Alerts</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar & Primary Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <JobSearchBar
              value={currentFilters.q || ''}
              onChange={handleQueryChange}
              onSelectHistoryItem={(query, filters) => {
                updateFiltersInUrl({
                  ...filters,
                  q: query || undefined,
                  page: 1,
                });
              }}
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="md:hidden flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl text-slate-300 font-semibold text-sm"
            >
              <Filter className="w-4 h-4 text-indigo-400" />
              <span>Filters</span>
            </button>

            {user && user.role === 'student' && (
              <button
                onClick={() => setSaveModalOpen(true)}
                className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 px-4 py-3 rounded-2xl text-sm font-semibold transition shadow"
              >
                <Bookmark className="w-4 h-4 text-indigo-400" />
                <span>Save Search</span>
              </button>
            )}

            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl">
              <ArrowUpDown className="w-4 h-4 text-indigo-400 shrink-0" />
              <select
                value={currentFilters.sortBy || 'newest'}
                onChange={(e) => updateFiltersInUrl({ ...currentFilters, sortBy: e.target.value as any, page: 1 })}
                className="bg-transparent text-sm text-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="relevance" className="bg-slate-900">Most Relevant</option>
                <option value="newest" className="bg-slate-900">Newest</option>
                <option value="oldest" className="bg-slate-900">Oldest</option>
                <option value="salary_high" className="bg-slate-900">Highest Salary</option>
                <option value="salary_low" className="bg-slate-900">Lowest Salary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        <ActiveFilters
          filters={currentFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleResetFilters}
        />

        {/* Main Grid: Filters Sidebar + Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <JobFilters
                filters={currentFilters}
                onChange={updateFiltersInUrl}
                onReset={handleResetFilters}
              />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="lg:hidden bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4">
              <JobFilters
                filters={currentFilters}
                onChange={(f) => {
                  updateFiltersInUrl(f);
                  setShowMobileFilters(false);
                }}
                onReset={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
              />
            </div>
          )}

          {/* Job Listings Column */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse space-y-3">
                    <div className="h-6 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-12 bg-slate-800 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-2xl text-center">
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-4">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-1">No Jobs Found</h3>
                <p className="text-slate-400 mb-6">
                  {currentFilters.q
                    ? `No jobs match your search for "${currentFilters.q}".`
                    : 'No jobs match your selected filter criteria.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition shadow"
                >
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
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

                      <div className="text-sm font-medium text-slate-400 flex flex-wrap items-center gap-4">
                        <span className="text-slate-200 font-bold">{job.company.name}</span>
                        {job.location && (
                          <span className="flex items-center space-x-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{job.location}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                        </span>
                      </div>

                      <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">{job.description}</p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skills.map((s) => (
                            <span
                              key={s.id}
                              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-lg font-medium"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        {job.application_deadline && (
                          <span className="flex items-center space-x-1 text-amber-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                      {user && user.role === 'student' && (
                        <button
                          onClick={() => handleToggleSaveJob(job.id, !!job.isSaved)}
                          className={`p-2.5 rounded-xl border transition ${
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
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm text-center shadow-lg"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}

                <Pagination
                  pagination={pagination}
                  onPageChange={(page) => updateFiltersInUrl({ ...currentFilters, page })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Search Modal */}
        {saveModalOpen && (
          <SaveSearchModal
            filters={currentFilters}
            onClose={() => setSaveModalOpen(false)}
            onSuccess={() => {
              setSaveModalOpen(false);
              alert('Search profile and job alerts saved successfully!');
            }}
          />
        )}
      </div>
    </div>
  );
};
