import jobRepository from '../repositories/job.repository';
import candidateSearchRepository from '../repositories/candidate-search.repository';
import { CandidateMatchResult, CandidateProfileSummary } from '../types/resume-intelligence.types';

export class CandidateMatchingService {
  /**
   * Calculate candidate match score against a job using deterministic formula
   */
  async calculateMatch(
    candidate: CandidateProfileSummary,
    jobId: string
  ): Promise<CandidateMatchResult> {
    const job = await jobRepository.findJobWithCompany(jobId);
    if (!job) {
      throw new Error('Job posting not found');
    }

    const jobSkills = job.skills || [];
    const candidateSkills = candidate.skills || [];

    const candidateSkillNames = new Set(candidateSkills.map((s) => s.name.toLowerCase()));
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const js of jobSkills) {
      if (candidateSkillNames.has(js.name.toLowerCase())) {
        matchedSkills.push(js.name);
      } else {
        missingSkills.push(js.name);
      }
    }

    // 1. Skill Score (Max 60 points)
    let skillsScore = 60;
    if (jobSkills.length > 0) {
      skillsScore = Math.round((matchedSkills.length / jobSkills.length) * 60);
    }

    // 2. Experience Score (Max 20 points)
    let experienceScore = 10;
    if (job.experience_level) {
      const expLower = job.experience_level.toLowerCase();
      const bioLower = (candidate.bio || '').toLowerCase();
      if (bioLower.includes(expLower)) {
        experienceScore = 20;
      }
    }

    // 3. Location & Work Mode Score (Max 20 points)
    let locationWorkModeScore = 0;
    if (job.work_mode === 'REMOTE') {
      locationWorkModeScore += 10;
    } else if (candidate.location && job.location) {
      if (candidate.location.toLowerCase().includes(job.location.toLowerCase())) {
        locationWorkModeScore += 10;
      }
    }

    if (candidate.location && job.location && candidate.location.toLowerCase() === job.location.toLowerCase()) {
      locationWorkModeScore += 10;
    } else if (job.work_mode === 'REMOTE') {
      locationWorkModeScore += 10;
    }

    const totalScore = Math.min(100, skillsScore + experienceScore + locationWorkModeScore);

    return {
      candidateId: candidate.id,
      score: totalScore,
      breakdown: {
        skillsScore,
        experienceScore,
        locationWorkModeScore,
      },
      matchedSkills,
      missingSkills,
      candidate,
    };
  }

  /**
   * Get candidate match results for a recruiter's job posting
   */
  async getJobCandidateMatches(
    jobId: string,
    recruiterId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ matches: CandidateMatchResult[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const job = await jobRepository.findById(jobId);
    if (!job || job.recruiter_id !== recruiterId) {
      const err: any = new Error('Job posting not found or access denied');
      err.statusCode = 403;
      throw err;
    }

    const candidates = await candidateSearchRepository.searchCandidates({ page: 1, limit: 100 }, recruiterId);
    const matches: CandidateMatchResult[] = [];

    for (const candidate of candidates) {
      const match = await this.calculateMatch(candidate, jobId);
      matches.push(match);
    }

    // Sort by match score DESC
    matches.sort((a, b) => b.score - a.score);

    const total = matches.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedMatches = matches.slice((page - 1) * limit, page * limit);

    return {
      matches: paginatedMatches,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

export default new CandidateMatchingService();
