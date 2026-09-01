import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/candidate.service';
import type { CandidateProfileSummary } from '../../types/resume-intelligence.types';
import { CandidateCard } from '../../components/candidates/CandidateCard';
import { CandidateDetailsModal } from '../../components/candidates/CandidateDetailsModal';
import { Star, ArrowLeft, Users } from 'lucide-react';

export const ShortlistedCandidates: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfileSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCandidateModal, setActiveCandidateModal] = useState<CandidateProfileSummary | null>(null);

  const fetchShortlisted = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.getShortlistedCandidates();
      setCandidates(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shortlisted candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const handleToggleShortlist = async (candidateId: string, _currentShortlisted: boolean) => {
    try {
      await candidateService.removeShortlist(candidateId);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove candidate from shortlist');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link
          to="/recruiter/candidates"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Discovery</span>
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Star className="w-8 h-8 text-amber-300 fill-amber-300" />
            <span>Shortlisted <span className="text-amber-300">Candidates</span></span>
          </h1>
          <p className="mt-1 text-slate-400">Manage saved talent candidates for your active recruitment pipeline.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-2xl text-center">
            {error}
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-6">
            <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Shortlisted Candidates</h3>
            <p className="text-slate-400 mb-6">Explore candidates and click the star icon to save candidates here.</p>
            <Link
              to="/recruiter/candidates"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
            >
              <Users className="w-4 h-4" />
              <span>Discover Candidates</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onViewDetails={(c) => setActiveCandidateModal(c)}
                onToggleShortlist={handleToggleShortlist}
              />
            ))}
          </div>
        )}

        {activeCandidateModal && (
          <CandidateDetailsModal
            candidate={activeCandidateModal}
            onClose={() => setActiveCandidateModal(null)}
            onToggleShortlist={handleToggleShortlist}
          />
        )}
      </div>
    </div>
  );
};
