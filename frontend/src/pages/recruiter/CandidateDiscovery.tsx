import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { candidateService } from '../../services/candidate.service';
import { jobService } from '../../services/job.service';
import type { CandidateProfileSummary, CandidateSearchFilters, CandidateMatchResult } from '../../types/resume-intelligence.types';
import type { Job } from '../../types/job.types';
import { CandidateCard } from '../../components/candidates/CandidateCard';
import { CandidateDetailsModal } from '../../components/candidates/CandidateDetailsModal';
import { Pagination } from '../../components/Pagination';
import { Users, Search, Filter, Star, Award, MapPin, Code, RotateCcw } from 'lucide-react';

export const CandidateDiscovery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [candidates, setCandidates] = useState<CandidateProfileSummary[]>([]);
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(searchParams.get('jobId') || '');
  const [jobMatches, setJobMatches] = useState<Map<string, CandidateMatchResult>>(new Map());

  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCandidateModal, setActiveCandidateModal] = useState<CandidateProfileSummary | null>(null);

  const [searchInput, setSearchInput] = useState<string>(searchParams.get('q') || '');
  const [locationInput, setLocationInput] = useState<string>(searchParams.get('location') || '');
  const [skillsInput, setSkillsInput] = useState<string>(searchParams.get('skills') || '');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'experience'>(
    (searchParams.get('sortBy') as any) || 'newest'
  );

  const fetchRecruiterJobs = async () => {
    try {
      const res = await jobService.getRecruiterJobs(undefined, 1, 50);
      setRecruiterJobs(res.jobs);
    } catch (err) {
      // Ignore
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: CandidateSearchFilters = {
        q: searchParams.get('q') || undefined,
        location: searchParams.get('location') || undefined,
        skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',') : undefined,
        sortBy,
        page: Number(searchParams.get('page')) || 1,
        limit: 20,
      };

      const res = await candidateService.searchCandidates(filters);
      setCandidates(res.candidates);
      setPagination(res.pagination);

      // If a job is selected for candidate matching, compute match scores
      if (selectedJobId) {
        try {
          const matchRes = await candidateService.getJobCandidateMatches(selectedJobId, 1, 50);
          const map = new Map<string, CandidateMatchResult>();
          matchRes.matches.forEach((m) => map.set(m.candidateId, m));
          setJobMatches(map);
        } catch (matchErr) {
          console.error('Job candidate matching failed:', matchErr);
        }
      } else {
        setJobMatches(new Map());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [searchParams, selectedJobId]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchInput) params.q = searchInput;
    if (locationInput) params.location = locationInput;
    if (skillsInput) params.skills = skillsInput;
    if (selectedJobId) params.jobId = selectedJobId;
    if (sortBy) params.sortBy = sortBy;
    params.page = '1';

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setLocationInput('');
    setSkillsInput('');
    setSelectedJobId('');
    setSearchParams({});
  };

  const handleToggleShortlist = async (candidateId: string, currentShortlisted: boolean) => {
    try {
      if (currentShortlisted) {
        await candidateService.removeShortlist(candidateId);
      } else {
        await candidateService.shortlistCandidate(candidateId);
      }
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, is_shortlisted: !currentShortlisted } : c))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update shortlist');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl flex items-center space-x-3">
              <Users className="w-8 h-8 text-indigo-400" />
              <span>Candidate Discovery & <span className="text-indigo-400">Intelligence</span></span>
            </h1>
            <p className="mt-1 text-slate-400 text-base">
              Discover top candidate talent, search extracted resume skills, shortlist candidates, and evaluate job match scores.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/recruiter/shortlisted"
              className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-300 font-semibold px-4 py-2.5 rounded-xl transition text-sm shadow"
            >
              <Star className="w-4 h-4 fill-amber-300" />
              <span>Shortlisted Candidates</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <form
          onSubmit={handleApplyFilters}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidate name, bio, skills..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Location (e.g. Remote, NY)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Search Candidates</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center space-x-1">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Filter by Skills</span>
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, PostgreSQL"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>Job Match Evaluator</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  const p = new URLSearchParams(searchParams);
                  if (e.target.value) p.set('jobId', e.target.value);
                  else p.delete('jobId');
                  setSearchParams(p);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="">No Job Selected (General Search)</option>
                {recruiterJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    Evaluate Match for: {j.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Sort Candidates</label>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="newest">Newest Candidates</option>
                <option value="relevance">Most Relevant</option>
                <option value="experience">Experience Level</option>
              </select>
            </div>
          </div>
        </form>

        {/* Candidate Cards Grid */}
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
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Candidates Found</h3>
            <p className="text-slate-400 mb-4">Try relaxing search terms or skill filters.</p>
            <button
              onClick={handleResetFilters}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  matchResult={jobMatches.get(candidate.id)}
                  onViewDetails={(c) => setActiveCandidateModal(c)}
                  onToggleShortlist={handleToggleShortlist}
                />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={(page) => {
                const p = new URLSearchParams(searchParams);
                p.set('page', String(page));
                setSearchParams(p);
              }}
            />
          </div>
        )}

        {/* Candidate Details Modal */}
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
