import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { UpdateJobRequest, JobType, WorkMode } from '../../types/job.types';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export const EditJob: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateJobRequest>({
    title: '',
    description: '',
    jobType: 'FULL_TIME',
    workMode: 'REMOTE',
    location: '',
    salaryMin: undefined,
    salaryMax: undefined,
    experienceLevel: '',
    applicationDeadline: '',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      setLoading(true);
      try {
        const job = await jobService.getRecruiterJobById(jobId);
        setFormData({
          title: job.title,
          description: job.description,
          jobType: job.job_type,
          workMode: job.work_mode,
          location: job.location || '',
          salaryMin: job.salary_min ?? undefined,
          salaryMax: job.salary_max ?? undefined,
          experienceLevel: job.experience_level || '',
          applicationDeadline: job.application_deadline
            ? new Date(job.application_deadline).toISOString().split('T')[0]
            : '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'salaryMin' || name === 'salaryMax'
          ? value === '' ? undefined : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;

    setSaving(true);
    setError(null);

    try {
      await jobService.updateJob(jobId, formData);
      navigate('/recruiter/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update job posting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Job Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Jobs</span>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-white">Edit Job Posting</h1>
            <p className="text-slate-400 text-sm">Update parameters for your job posting.</p>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-xl mb-6 text-sm flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Job Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Job Description *</label>
              <textarea
                name="description"
                rows={6}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Job Type & Work Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Job Type *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Work Mode *</label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">Onsite</option>
                </select>
              </div>
            </div>

            {/* Location & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Experience Level</label>
                <input
                  type="text"
                  name="experienceLevel"
                  value={formData.experienceLevel || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Minimum Salary ($)</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin ?? ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Maximum Salary ($)</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax ?? ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Application Deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline || ''}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
