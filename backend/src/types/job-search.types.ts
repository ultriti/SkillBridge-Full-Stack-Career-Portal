import { JobType, WorkMode } from './database';

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

export interface SearchHistoryRecord {
  id: string;
  user_id: string;
  query?: string | null;
  filters: Record<string, any>;
  created_at: Date;
}

export interface SavedSearchRecord {
  id: string;
  user_id: string;
  name: string;
  query?: string | null;
  filters: Record<string, any>;
  alert_enabled: boolean;
  last_alerted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSavedSearchDTO {
  name: string;
  query?: string | null;
  filters?: Record<string, any>;
  alertEnabled?: boolean;
}

export interface UpdateSavedSearchDTO {
  name?: string;
  query?: string | null;
  filters?: Record<string, any>;
  alertEnabled?: boolean;
}
