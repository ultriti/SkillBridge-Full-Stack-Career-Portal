import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import type { CreateJobRequest, JobStatus } from '../../types/job.types';
import { ArrowLeft, Save, Send, AlertTriangle } from 'lucide-react';

export const CreateJob: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateJobRequest>({
    title: '',
    description: '',
    jobType: 'FULL_TIME',
    workMode: 'REMOTE',
    location: '',
    salaryMin: undefined,
    salaryMax: undefined,
    experienceLevel: '',
    applicationDeadline: '',
    status: 'DRAFT',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<boolean>(false);

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

  const handleSubmit = async (targetStatus: JobStatus) => {
    setLoading(true);
    setError(null);
    setCompanyError(false);

    try {
      const payload: CreateJobRequest = {
        ...formData,
        status: targetStatus,
      };

      await jobService.createJob(payload);
      navigate('/recruiter/jobs');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create job posting';
      setError(msg);
      if (msg.includes('company profile')) {
        setCompanyError(true);
      }
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-white">Create New Job Posting</h1>
            <p className="text-slate-400 text-sm">Fill in details to list a new job opening for candidates.</p>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-xl mb-6 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span>{error}</span>
                {companyError && (
                  <div className="mt-2">
                    <Link
                      to="/recruiter/company/setup"
                      className="underline font-semibold text-red-200 hover:text-white"
                    >
                      Click here to setup your company profile
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Job Title *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Senior Full Stack Engineer"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Job Description *</label>
              <textarea
                name="description"
                rows={6}
                required
                placeholder="Describe key responsibilities, qualifications, and benefits..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Job Type *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">Onsite</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. New York, NY or Remote"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Experience Level</label>
                <input
                  type="text"
                  name="experienceLevel"
                  placeholder="e.g. 0-2 years or Senior Level"
                  value={formData.experienceLevel || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Minimum Salary ($)</label>
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="e.g. 60000"
                  value={formData.salaryMin ?? ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Maximum Salary ($)</label>
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="e.g. 90000"
                  value={formData.salaryMax ?? ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Application Deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline || ''}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-800">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('DRAFT')}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('ACTIVE')}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Publish Job</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
