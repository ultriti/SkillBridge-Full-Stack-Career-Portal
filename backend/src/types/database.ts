export type UserRole = 'student' | 'recruiter' | 'admin';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'FREELANCE';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type JobStatus = 'ACTIVE' | 'CLOSED' | 'DRAFT';
export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone?: string | null;
  profile_image?: string | null;
  bio?: string | null;
  location?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Company {
  id: string;
  recruiter_id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: string | null;
  location?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Skill {
  id: string;
  name: string;
  created_at: Date;
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
  application_deadline?: Date | string | null;
  status: JobStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Resume {
  id: string;
  student_id: string;
  file_url: string;
  file_name: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Application {
  id: string;
  job_id: string;
  student_id: string;
  resume_id?: string | null;
  cover_letter?: string | null;
  status: ApplicationStatus;
  applied_at: Date;
  updated_at: Date;
}

export interface SavedJob {
  id: string;
  student_id: string;
  job_id: string;
  created_at: Date;
}

export interface UserSkill {
  user_id: string;
  skill_id: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  is_read: boolean;
  created_at: Date;
  read_at?: Date | null;
}
