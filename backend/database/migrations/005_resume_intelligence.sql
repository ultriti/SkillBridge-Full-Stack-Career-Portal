-- Migration: 005_resume_intelligence.sql
-- Resume Metadata, Versioning, Processing Status, Skill Source, and Candidate Shortlists

-- 1. Extend RESUMES Table
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS file_type VARCHAR(50) DEFAULT 'application/pdf',
ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_key TEXT,
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
ADD COLUMN IF NOT EXISTS processing_error TEXT,
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_resumes_processing_status ON resumes(processing_status);
CREATE INDEX IF NOT EXISTS idx_resumes_student_default ON resumes(student_id, is_default);

-- 2. Extend USER_SKILLS Table
ALTER TABLE user_skills
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'RESUME')),
ADD COLUMN IF NOT EXISTS confidence NUMERIC(3,2) DEFAULT 1.00;

-- 3. Create RECRUITER_CANDIDATE_SHORTLISTS Table
CREATE TABLE IF NOT EXISTS recruiter_candidate_shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_recruiter_candidate UNIQUE (recruiter_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlists_recruiter ON recruiter_candidate_shortlists(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_candidate ON recruiter_candidate_shortlists(candidate_id);
