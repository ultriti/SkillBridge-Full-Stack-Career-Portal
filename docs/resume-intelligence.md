# SkillBridge — Resume & Candidate Intelligence System (Phase 10)

## 1. Overview
The Resume & Candidate Intelligence System provides candidate skill extraction, PDF text processing, resume version control, candidate discovery, shortlisting, and a deterministic candidate-job matching engine.

---

## 2. Architecture & Flow

```
Student PDF Upload
   │ (Multer 10MB limit + PDF MIME validation)
   ▼
resumes Table (version = MAX + 1, processing_status = 'PENDING')
   │
   ▼ (Async Processing)
ResumeParserService (pdf-parse)
   ├── Extract Text & Normalize Whitespace
   ├── Match against Controlled Skills Dictionary
   └── Calculate Word Count & Pages
   │
   ▼
CandidateIntelligenceService
   ├── Update processing_status ('COMPLETED' / 'FAILED')
   ├── Store extracted_text & word_count
   └── Link skills to user_skills (source: 'RESUME', preserving MANUAL skills)
```

---

## 3. Resume Versioning & Primary Selection
- **Versioning**: Each upload automatically increments the student's version counter (`v1`, `v2`, etc.).
- **Primary Selection**: Transaction-safe `setPrimaryResume` sets `is_default = TRUE` for the selected resume while resetting previous defaults.

---

## 4. Candidate Discovery & Shortlisting
- **Recruiter Discovery**: `/recruiter/candidates`
  - Keyword search across candidate `first_name`, `last_name`, `bio`, `location`, `skills`, and `resumes.extracted_text`.
  - Skill filter matching (`ANY` vs `ALL`).
  - Allowlisted sorting (`relevance`, `newest`, `experience`).
  - Database pagination (`LIMIT $limit OFFSET $offset`, max 50 per page).
- **Candidate Shortlisting**: `/recruiter/shortlisted`
  - Recruiters can add candidates to private shortlists (`recruiter_candidate_shortlists`).

---

## 5. Candidate-Job Match Score Formula (0 - 100%)
$$ \text{Total Match Score} = \text{Skill Score (60\%)} + \text{Experience Score (20\%)} + \text{Location \& Work Mode Score (20\%)} $$

1. **Skill Match Score (Max 60 points)**:
   $$ \text{Skills Score} = \left(\frac{\text{Matched Candidate Skills}}{\text{Total Job Required Skills}}\right) \times 60 $$
2. **Experience Level Score (Max 20 points)**:
   - Matches candidate bio / resume text against `job.experience_level`.
3. **Location & Work Mode Score (Max 20 points)**:
   - 10 points if `work_mode` is `REMOTE` or candidate location matches job location.
   - 10 points for exact location string match.

---

## 6. Security & Data Isolation
- **RBAC**: Candidate search endpoints (`/api/candidates/search`) return `403` for students.
- **Resume Access Control**: Students can only access and modify their own resumes.
- **Deduplication & Manual Skill Protection**: Resume skill extraction inserts skills with `source = 'RESUME'`, ensuring manually entered student skills (`source = 'MANUAL'`) are never overwritten or deleted.
