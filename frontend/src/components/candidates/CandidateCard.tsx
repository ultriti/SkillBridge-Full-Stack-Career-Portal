import React from 'react';
import type { CandidateProfileSummary, CandidateMatchResult } from '../../types/resume-intelligence.types';
import { MapPin, Star, User, FileText, Award } from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateProfileSummary;
  matchResult?: CandidateMatchResult;
  onViewDetails: (candidate: CandidateProfileSummary) => void;
  onToggleShortlist: (candidateId: string, currentShortlisted: boolean) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  matchResult,
  onViewDetails,
  onToggleShortlist,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition shadow-xl flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-lg overflow-hidden shrink-0">
              {candidate.profile_image ? (
                <img src={candidate.profile_image} alt={candidate.first_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>{candidate.first_name} {candidate.last_name}</span>
              </h3>
              {candidate.location && (
                <span className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span>{candidate.location}</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onToggleShortlist(candidate.id, !!candidate.is_shortlisted)}
            className={`p-2 rounded-xl border transition ${
              candidate.is_shortlisted
                ? 'bg-amber-950 border-amber-600 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={candidate.is_shortlisted ? 'Remove from Shortlist' : 'Shortlist Candidate'}
          >
            <Star className={`w-4 h-4 ${candidate.is_shortlisted ? 'fill-amber-300' : ''}`} />
          </button>
        </div>

        {/* Bio Snippet */}
        {candidate.bio && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{candidate.bio}</p>
        )}

        {/* Match Score Badge (if match mode active) */}
        {matchResult && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Job Match Score</span>
              </span>
              <span className="font-extrabold text-emerald-400 text-sm">{matchResult.score}% Match</span>
            </div>
            {matchResult.matchedSkills.length > 0 && (
              <div className="text-slate-400 text-[11px]">
                Matched: <span className="text-emerald-300 font-semibold">{matchResult.matchedSkills.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills Chips */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {candidate.skills.slice(0, 5).map((skill) => (
              <span
                key={skill.id}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg font-medium border ${
                  skill.source === 'RESUME'
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                {skill.name}
              </span>
            ))}
            {candidate.skills.length > 5 && (
              <span className="text-[11px] text-slate-500 font-bold px-1 py-0.5">
                +{candidate.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-500">
        <span className="flex items-center space-x-1">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>{candidate.primaryResume ? `Resume v${candidate.primaryResume.version}` : 'No resume'}</span>
        </span>

        <button
          onClick={() => onViewDetails(candidate)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition shadow"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};
