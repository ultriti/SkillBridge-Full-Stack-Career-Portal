export interface Company {
  id: string;
  recruiter_id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertCompanyRequest {
  name: string;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: string | null;
  location?: string | null;
}
