import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/application.service';
import type { RecruiterApplicationDetails, ApplicationStatus } from '../../types/application.types';
import { ApplicationStatusBadge } from '../../components/applications/ApplicationStatusBadge';
import { ApplicationTimeline } from '../../components/applications/ApplicationTimeline';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Download, CheckCircle2 } from 'lucide-react';

export const RecruiterApplicationDetailsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<RecruiterApplicationDetails | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchApplicationDetails = async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await applicationService.getRecruiterApplication(applicationId);
      setApplication(data);
      setSelectedStatus(data.status);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !selectedStatus) return;

    setUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await applicationService.updateApplicationStatus(applicationId, {
        status: selectedStatus as ApplicationStatus,
      });
      setApplication(updated);
      setSuccessMsg(`Status updated to ${updated.status} successfully`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Candidate Profile...</span>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-slate-900 border border-slate-800 p-12 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Application Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'Candidate application not found or unauthorized access.'}</p>
          <Link
            to="/recruiter/applications"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Candidate Applications</span>
          </Link>
        </div>
      </div>
    );
  }

  const { candidate, job, resume } = application;

  const getAvailableNextStatuses = (current: ApplicationStatus): ApplicationStatus[] => {
    switch (current) {
      case 'APPLIED':
        return ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED'];
      case 'REVIEWING':
        return ['REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'REJECTED'];
      case 'SHORTLISTED':
        return ['SHORTLISTED', 'INTERVIEW', 'REJECTED'];
      case 'INTERVIEW':
        return ['INTERVIEW', 'SELECTED', 'REJECTED'];
      case 'SELECTED':
        return ['SELECTED'];
      case 'REJECTED':
        return ['REJECTED'];
      case 'WITHDRAWN':
        return ['WITHDRAWN'];
      default:
        return [current];
    }
  };

  const availableStatuses = getAvailableNextStatuses(application.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <button
          onClick={() => navigate('/recruiter/applications')}
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications List</span>
        </button>

        {/* Candidate & Job Summary Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <ApplicationStatusBadge status={application.status} size="lg" />
              <span className="text-xs text-slate-400">
                Applied on {new Date(application.applied_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {candidate.first_name} {candidate.last_name}
            </h1>
            <p className="text-indigo-400 font-semibold text-lg flex items-center space-x-2 mt-1">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <span>Applied for: {job.title}</span>
            </p>
          </div>

          {/* Quick Contact Specs */}
          <div className="space-y-1.5 text-sm text-slate-300 bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{candidate.phone}</span>
              </div>
            )}
            {candidate.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{candidate.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Update Control Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Update Application Status</h3>

          {error && (
            <div className="bg-red-950/60 border border-red-800 text-red-300 p-3.5 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3.5 rounded-xl text-sm mb-4">
              {successMsg}
            </div>
          )}

          {application.status === 'WITHDRAWN' ? (
            <div className="text-sm text-slate-400 italic">
              Candidate has withdrawn this application. Status cannot be modified further.
            </div>
          ) : (
            <form onSubmit={handleUpdateStatus} className="flex flex-col sm:flex-row items-center gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
                className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                {availableStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={updating || selectedStatus === application.status}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{updating ? 'Updating...' : 'Update Status'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Timeline */}
        <ApplicationTimeline
          status={application.status}
          appliedAt={application.applied_at}
          updatedAt={application.updated_at}
        />

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-3">
                Cover Letter
              </h3>
              {application.cover_letter ? (
                <div className="text-slate-300 whitespace-pre-line text-base leading-relaxed">
                  {application.cover_letter}
                </div>
              ) : (
                <div className="text-slate-500 text-sm italic">No cover letter submitted.</div>
              )}
            </div>

            {candidate.bio && (
              <div>
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-3">
                  Candidate Bio
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{candidate.bio}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 h-fit">
            <div>
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-3">
                Candidate Skills
              </h3>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((s) => (
                    <span key={s.id} className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1 rounded-full font-medium">
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">No skills listed on profile.</div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-3">
                Attached Resume
              </h3>
              {resume ? (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white truncate max-w-[150px]">
                      {resume.file_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Resume Document</div>
                  </div>
                  <a
                    href={resume.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-emerald-400 hover:text-white bg-slate-900 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">No custom resume file attached.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
