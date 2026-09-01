import React from 'react';
import type { CandidateProfileSummary } from '../../types/resume-intelligence.types';
import { X, MapPin, Mail, FileText, Star, ExternalLink, User } from 'lucide-react';

interface ModalProps {
  candidate: CandidateProfileSummary;
  onClose: () => void;
  onToggleShortlist: (candidateId: string, currentShortlisted: boolean) => void;
}

export const CandidateDetailsModal: React.FC<ModalProps> = ({
  candidate,
  onClose,
  onToggleShortlist,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Info */}
        <div className="flex items-start space-x-4 border-b border-slate-800 pb-5">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-2xl overflow-hidden shrink-0">
            {candidate.profile_image ? (
              <img src={candidate.profile_image} alt={candidate.first_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {candidate.first_name} {candidate.last_name}
              </h2>
              <button
                onClick={() => onToggleShortlist(candidate.id, !!candidate.is_shortlisted)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  candidate.is_shortlisted
                    ? 'bg-amber-950 border-amber-600 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Star className={`w-4 h-4 ${candidate.is_shortlisted ? 'fill-amber-300' : ''}`} />
                <span>{candidate.is_shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
              {candidate.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{candidate.location}</span>
                </span>
              )}
              {candidate.email && (
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{candidate.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {candidate.bio && (
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">About Candidate</h3>
            <p className="text-sm text-slate-300 bg-slate-950 border border-slate-800 p-4 rounded-xl leading-relaxed">
              {candidate.bio}
            </p>
          </div>
        )}

        {/* Extracted & Profile Skills */}
        <div>
          <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Candidate Skills</h3>
          {candidate.skills && candidate.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 bg-slate-950 border border-slate-800 p-4 rounded-xl">
              {candidate.skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`text-xs px-3 py-1 rounded-xl font-semibold border ${
                    skill.source === 'RESUME'
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                      : 'bg-slate-900 text-slate-200 border-slate-700'
                  }`}
                >
                  {skill.name} {skill.source === 'RESUME' && '(Extracted from Resume)'}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No skills listed.</p>
          )}
        </div>

        {/* Primary Resume Section */}
        <div>
          <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Primary Resume</h3>
          {candidate.primaryResume ? (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-indigo-400" />
                <div>
                  <span className="text-sm font-bold text-white block">{candidate.primaryResume.file_name}</span>
                  <span className="text-xs text-slate-400">Version {candidate.primaryResume.version} • Status: {candidate.primaryResume.processing_status}</span>
                </div>
              </div>

              <a
                href={candidate.primaryResume.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition shadow"
              >
                <span>View PDF</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No primary resume uploaded.</p>
          )}
        </div>
      </div>
    </div>
  );
};
