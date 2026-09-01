export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'FREELANCE';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type UserRole = 'student' | 'recruiter' | 'admin';

export interface CompanySummary {
  id: string;
  name: string;
  logo?: string | null;
  industry?: string | null;
  location?: string | null;
}

export interface Job {
  id: string;
  company_id: string;
  recruiter_id: string;
  title: string;
  description: string;
  job_type: JobType;
  work_mode: WorkMode;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  experience_level?: string | null;
  application_deadline?: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  company: CompanySummary;
  isSaved?: boolean;
}

export interface AdminJobDetails extends Job {
  recruiter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
  };
}

export interface JobFilters {
  search?: string;
  jobType?: JobType | '';
  workMode?: WorkMode | '';
  location?: string;
  experienceLevel?: string;
  salaryMin?: number | '';
  salaryMax?: number | '';
  sortBy?: 'createdAt' | 'salaryMin' | 'salaryMax' | 'applicationDeadline';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface JobPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  jobType: JobType;
  workMode: WorkMode;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  applicationDeadline?: string;
  status?: JobStatus;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  jobType?: JobType;
  workMode?: WorkMode;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  applicationDeadline?: string;
}

export interface SavedJob {
  id: string;
  student_id: string;
  job_id: string;
  created_at: string;
  job: Job;
}

export interface UserUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}
