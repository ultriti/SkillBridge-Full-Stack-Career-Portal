import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/application.service';
import type { StudentApplicationDetails } from '../../types/application.types';
import { ApplicationStatusBadge } from '../../components/applications/ApplicationStatusBadge';
import { ApplicationTimeline } from '../../components/applications/ApplicationTimeline';
import { ArrowLeft, Building, FileText, AlertOctagon, Download } from 'lucide-react';

export const StudentApplicationDetailsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<StudentApplicationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplicationDetails = async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await applicationService.getStudentApplication(applicationId);
      setApplication(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const handleWithdraw = async () => {
    if (!applicationId) return;
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    setWithdrawing(true);
    try {
      const updated = await applicationService.withdrawApplication(applicationId);
      setApplication(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Application Details...</span>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-slate-900 border border-slate-800 p-12 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Application Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'This application does not exist or you do not have permission to view it.'}</p>
          <Link
            to="/student/applications"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Applications</span>
          </Link>
        </div>
      </div>
    );
  }

  const canWithdraw = application.status === 'APPLIED' || application.status === 'REVIEWING';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <button
          onClick={() => navigate('/student/applications')}
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications List</span>
        </button>

        {/* Application Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <ApplicationStatusBadge status={application.status} size="lg" />
                <span className="text-xs text-slate-400">
                  Applied {new Date(application.applied_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {application.job.title}
              </h1>
              <p className="text-indigo-400 font-semibold text-lg flex items-center space-x-2 mt-1">
                <Building className="w-5 h-5 text-indigo-500" />
                <span>{application.job.company.name}</span>
              </p>
            </div>

            {canWithdraw && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold transition text-sm disabled:opacity-50"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{withdrawing ? 'Withdrawing...' : 'Withdraw Application'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <ApplicationTimeline
          status={application.status}
          appliedAt={application.applied_at}
          updatedAt={application.updated_at}
        />

        {/* Application Submission Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Cover Letter</span>
            </h3>
            {application.cover_letter ? (
              <div className="text-slate-300 whitespace-pre-line text-base leading-relaxed">
                {application.cover_letter}
              </div>
            ) : (
              <div className="text-slate-500 text-sm italic">No cover letter submitted with this application.</div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Submitted Resume</h3>
            {application.resume ? (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{application.resume.file_name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">PDF Document</div>
                </div>
                <a
                  href={application.resume.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-indigo-400 hover:text-white bg-slate-900 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">No custom resume attached. Profile applied directly.</div>
            )}

            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Application ID:</span>
                <span className="font-mono text-slate-500">{application.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{new Date(application.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
