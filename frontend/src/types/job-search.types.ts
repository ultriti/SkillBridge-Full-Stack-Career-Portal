import type { JobType, WorkMode } from './job.types';

export type JobSearchSort = 'relevance' | 'newest' | 'oldest' | 'salary_high' | 'salary_low';
export type SkillMatchMode = 'any' | 'all';

export interface AdvancedJobSearchFilters {
  q?: string;
  location?: string;
  jobType?: JobType;
  workMode?: WorkMode;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  skillMatch?: SkillMatchMode;
  companyId?: string;
  sortBy?: JobSearchSort;
  page?: number;
  limit?: number;
}

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  query?: string | null;
  filters: Record<string, any>;
  created_at: string;
}

export interface SavedSearchItem {
  id: string;
  user_id: string;
  name: string;
  query?: string | null;
  filters: Record<string, any>;
  alert_enabled: boolean;
  last_alerted_at?: string | null;
  created_at: string;
  updated_at: string;
}
