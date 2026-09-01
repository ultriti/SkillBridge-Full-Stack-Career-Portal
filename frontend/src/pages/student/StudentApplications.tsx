import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/application.service';
import type { StudentApplicationDetails, ApplicationStatus, ApplicationPagination } from '../../types/application.types';
import { ApplicationStatusBadge } from '../../components/applications/ApplicationStatusBadge';
import { Pagination } from '../../components/Pagination';
import { Briefcase, Building, Calendar, MapPin, ExternalLink, Filter } from 'lucide-react';

export const StudentApplications: React.FC = () => {
  const [applications, setApplications] = useState<StudentApplicationDetails[]>([]);
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus | ''>('');
  const [pagination, setPagination] = useState<ApplicationPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async (status?: ApplicationStatus, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationService.getStudentApplications(status || undefined, page, 10);
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(activeStatus || undefined, 1);
  }, [activeStatus]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My <span className="text-indigo-400">Applications</span>
          </h1>
          <p className="mt-1 text-slate-400">Track and manage the progress of your submitted job applications.</p>
        </div>

        {/* Filter Status Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 mb-6 overflow-x-auto pb-1">
          {[
            { label: 'All', value: '' },
            { label: 'Applied', value: 'APPLIED' },
            { label: 'Reviewing', value: 'REVIEWING' },
            { label: 'Shortlisted', value: 'SHORTLISTED' },
            { label: 'Interview', value: 'INTERVIEW' },
            { label: 'Selected', value: 'SELECTED' },
            { label: 'Rejected', value: 'REJECTED' },
            { label: 'Withdrawn', value: 'WITHDRAWN' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeStatus === tab.value
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Applications Found</h3>
            <p className="text-slate-400 mb-6">
              {activeStatus
                ? `You have no applications with status '${activeStatus}'.`
                : "You haven't applied to any jobs yet."}
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
            >
              <span>Explore Active Jobs</span>
            </Link>
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
                    <h2 className="text-xl font-bold text-white hover:text-indigo-400 transition">
                      <Link to={`/student/applications/${app.id}`}>{app.job.title}</Link>
                    </h2>
                    <ApplicationStatusBadge status={app.status} />
                  </div>

                  <div className="text-sm font-medium text-slate-400 flex items-center space-x-4">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <Building className="w-4 h-4 text-indigo-400" />
                      <span>{app.job.company.name}</span>
                    </span>
                    {app.job.location && (
                      <span className="flex items-center space-x-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{app.job.location}</span>
                      </span>
                    )}
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {app.job.work_mode}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <Link
                    to={`/student/applications/${app.id}`}
                    className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition text-sm shadow"
                  >
                    <span>View Progress</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}

            <Pagination
              pagination={pagination}
              onPageChange={(page) => fetchApplications(activeStatus || undefined, page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
