export type ResumeProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type SkillSource = 'MANUAL' | 'RESUME';

export interface ExtendedResume {
  id: string;
  student_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_key?: string | null;
  is_default: boolean;
  version: number;
  processing_status: ResumeProcessingStatus;
  processing_error?: string | null;
  extracted_text?: string | null;
  word_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ExtractedSkill {
  name: string;
  confidence: number;
  source: SkillSource;
}

export interface CandidateSkill {
  id: string;
  name: string;
  source: SkillSource;
  confidence: number;
}

export interface CandidateProfileSummary {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  profile_image?: string | null;
  skills: CandidateSkill[];
  primaryResume?: ExtendedResume | null;
  isShortlisted?: boolean;
}

export interface CandidateSearchFilters {
  q?: string;
  skills?: string[];
  skillMatch?: 'any' | 'all';
  location?: string;
  experienceLevel?: string;
  sortBy?: 'relevance' | 'newest' | 'experience';
  page?: number;
  limit?: number;
}

export interface MatchBreakdown {
  skillsScore: number;
  experienceScore: number;
  locationWorkModeScore: number;
}

export interface CandidateMatchResult {
  candidateId: string;
  score: number;
  breakdown: MatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  candidate: CandidateProfileSummary;
}

export interface ShortlistRecord {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  created_at: Date;
}
