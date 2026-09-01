import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/application.service';
import type { AdminApplicationDetails } from '../../types/application.types';
import { ApplicationStatusBadge } from '../../components/applications/ApplicationStatusBadge';
import { ApplicationTimeline } from '../../components/applications/ApplicationTimeline';
import { ArrowLeft, ShieldCheck, FileText, Download } from 'lucide-react';

export const AdminApplicationDetailsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<AdminApplicationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    const fetchAdminApplication = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await applicationService.getAdminApplication(applicationId);
        setApplication(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load administrative application record');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminApplication();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Administrative Record...</span>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-slate-900 border border-slate-800 p-12 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Record Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'Application record not found.'}</p>
          <Link
            to="/admin/applications"
            className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Applications</span>
          </Link>
        </div>
      </div>
    );
  }

  const { candidate, recruiter, job, resume } = application;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <button
          onClick={() => navigate('/admin/applications')}
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Applications</span>
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-7 h-7 text-amber-500" />
              <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">
                Administrative Audit View (Read-Only)
              </span>
            </div>
            <ApplicationStatusBadge status={application.status} size="lg" />
          </div>

          <div className="border-t border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold block">Candidate</span>
              <div className="text-base font-bold text-white mt-1">
                {candidate.first_name} {candidate.last_name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{candidate.email}</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold block">Job & Company</span>
              <div className="text-base font-bold text-white mt-1">{job.title}</div>
              <div className="text-xs text-indigo-400 mt-0.5">{job.company.name}</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold block">Recruiter Owner</span>
              <div className="text-base font-bold text-white mt-1">
                {recruiter.first_name} {recruiter.last_name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{recruiter.email}</div>
            </div>
          </div>
        </div>

        <ApplicationTimeline
          status={application.status}
          appliedAt={application.applied_at}
          updatedAt={application.updated_at}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Cover Letter Payload</span>
            </h3>
            {application.cover_letter ? (
              <div className="text-slate-300 whitespace-pre-line text-sm leading-relaxed">
                {application.cover_letter}
              </div>
            ) : (
              <div className="text-slate-500 text-xs italic">No cover letter submitted.</div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Resume Attachment</h3>
            {resume ? (
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white truncate max-w-[140px]">
                    {resume.file_name}
                  </div>
                  <div className="text-xs text-slate-500">PDF File</div>
                </div>
                <a
                  href={resume.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-amber-400 hover:text-white bg-slate-900 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">No custom resume attached.</div>
            )}

            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Application UUID:</span>
                <span className="font-mono text-slate-500">{application.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Applied At:</span>
                <span>{new Date(application.applied_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified:</span>
                <span>{new Date(application.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
