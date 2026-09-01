export type ApplicationStatus =
  | 'APPLIED'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationJobCompany {
  id: string;
  name: string;
  logo?: string | null;
  industry?: string | null;
  location?: string | null;
}

export interface ApplicationJobSummary {
  id: string;
  title: string;
  job_type: string;
  work_mode: string;
  location?: string | null;
  status: string;
  company: ApplicationJobCompany;
}

export interface ApplicationCandidateSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  profile_image?: string | null;
  bio?: string | null;
  location?: string | null;
  skills: Array<{ id: string; name: string }>;
}

export interface ApplicationResume {
  id: string;
  file_name: string;
  file_url: string;
  is_default?: boolean;
}

export interface StudentApplicationDetails {
  id: string;
  job_id: string;
  student_id: string;
  resume_id?: string | null;
  cover_letter?: string | null;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  job: ApplicationJobSummary;
  resume?: ApplicationResume | null;
}

export interface RecruiterApplicationDetails {
  id: string;
  job_id: string;
  student_id: string;
  resume_id?: string | null;
  cover_letter?: string | null;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  job: ApplicationJobSummary;
  candidate: ApplicationCandidateSummary;
  resume?: ApplicationResume | null;
}

export interface AdminApplicationDetails {
  id: string;
  job_id: string;
  student_id: string;
  resume_id?: string | null;
  cover_letter?: string | null;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  job: ApplicationJobSummary;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  recruiter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  resume?: ApplicationResume | null;
}

export interface ApplicationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApplyToJobRequest {
  resumeId?: string | null;
  coverLetter?: string | null;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}
