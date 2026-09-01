import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { savedJobService } from '../../services/saved-job.service';
import { useAuth } from '../../context/AuthContext';
import { Job } from '../../types/job.types';
import { MapPin, DollarSign, Calendar, Bookmark, ArrowLeft, Building, Clock, Briefcase, Award } from 'lucide-react';

export const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await jobService.getPublicJobById(jobId);
        setJob(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Job posting not found or no longer active');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleToggleSave = async () => {
    if (!job || !user || user.role !== 'student') return;

    try {
      if (job.isSaved) {
        await savedJobService.unsaveJob(job.id);
        setJob({ ...job, isSaved: false });
      } else {
        await savedJobService.saveJob(job.id);
        setJob({ ...job, isSaved: true });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update saved status');
    }
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (min == null && max == null) return 'Salary Undisclosed';
    if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min != null) return `From $${min.toLocaleString()}`;
    return `Up to $${max!.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Job Details...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-slate-900 border border-slate-800 p-12 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Job Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'This job posting does not exist or has been closed.'}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Listings</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>

        {/* Main Job Banner Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1 rounded-full font-semibold">
                  {job.job_type.replace('_', ' ')}
                </span>
                <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs px-3 py-1 rounded-full font-semibold">
                  {job.work_mode}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{job.title}</h1>
              <p className="text-indigo-400 text-lg font-medium mt-1 flex items-center space-x-2">
                <Building className="w-5 h-5 inline text-indigo-500" />
                <span>{job.company.name}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {user && user.role === 'student' && (
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg border font-medium transition ${
                    job.isSaved
                      ? 'bg-indigo-950 border-indigo-600 text-indigo-400 hover:bg-indigo-900'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${job.isSaved ? 'fill-indigo-400' : ''}`} />
                  <span>{job.isSaved ? 'Saved' : 'Save Job'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Salary</span>
                <span className="font-semibold text-slate-200">{formatSalary(job.salary_min, job.salary_max)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-950 rounded-lg text-indigo-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Location</span>
                <span className="font-semibold text-slate-200">{job.location || 'Flexible / Remote'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-950 rounded-lg text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Experience</span>
                <span className="font-semibold text-slate-200">{job.experience_level || 'Not Specified'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-950 rounded-lg text-rose-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Deadline</span>
                <span className="font-semibold text-slate-200">
                  {job.application_deadline
                    ? new Date(job.application_deadline).toLocaleDateString()
                    : 'Open Until Filled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Content & Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <span>Job Description & Requirements</span>
              </h3>
              <div className="text-slate-300 leading-relaxed whitespace-pre-line text-base">
                {job.description}
              </div>
            </div>
          </div>

          {/* Sidebar Company Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Building className="w-5 h-5 text-indigo-400" />
              <span>About the Company</span>
            </h3>

            <div>
              <h4 className="text-xl font-bold text-indigo-400">{job.company.name}</h4>
              {job.company.industry && (
                <p className="text-slate-400 text-sm mt-0.5">{job.company.industry}</p>
              )}
            </div>

            {job.company.location && (
              <div className="text-sm text-slate-400 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{job.company.location}</span>
              </div>
            )}

            <div className="pt-2 text-xs text-slate-500 border-t border-slate-800">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              <span>Posted on {new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
