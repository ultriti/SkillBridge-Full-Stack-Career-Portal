# SkillBridge — Advanced Job Discovery & Search System (Phase 9)

## 1. Overview
The Advanced Job Discovery & Search System empowers candidates to search, rank, filter, save, and receive alerts on job opportunities. Powered by PostgreSQL Full-Text Search (`tsvector`, `websearch_to_tsquery`, GIN indexes) and multi-criteria filters, it ensures rapid and relevant job matching across millions of records.

---

## 2. Search Architecture & PostgreSQL Integration

```
React (JobSearchBar & JobFilters)
   │ (Debounced 400ms query & URL params)
   ▼
GET /api/jobs/search
   │
Zod Validator (advancedSearchQuerySchema)
   │
JobController & JobService
   │
JobRepository
   │
PostgreSQL Full-Text Search (websearch_to_tsquery + GIN Index)
```

### Full-Text Search Column & Index
Generated tsvector column on `jobs`:
```sql
ALTER TABLE jobs 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', 
    coalesce(title, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(location, '') || ' ' || 
    coalesce(experience_level, '')
  )
) STORED;

CREATE INDEX idx_jobs_search_vector ON jobs USING GIN(search_vector);
```

### Relevance Ranking
Queries rank results using `ts_rank(search_vector, websearch_to_tsquery('english', $q))` when a search term `q` is provided.

---

## 3. Advanced Filtering Capabilities

| Filter | Query Param | Behavior |
| :--- | :--- | :--- |
| Keyword Search | `q` | Full-text vector search + title/company ILIKE |
| Location | `location` | ILIKE contains matching |
| Work Mode | `workMode` | `REMOTE` \| `HYBRID` \| `ONSITE` |
| Job Type | `jobType` | `FULL_TIME` \| `PART_TIME` \| `INTERNSHIP` \| `CONTRACT` \| `FREELANCE` |
| Experience | `experienceLevel` | ILIKE contains matching |
| Min Salary | `salaryMin` | Matches jobs where `salary_max >= salaryMin` |
| Max Salary | `salaryMax` | Matches jobs where `salary_min <= salaryMax` |
| Skills | `skills` | Comma-separated skill names linked via `job_skills` JOIN |
| Skill Match Mode | `skillMatch` | `any` (job matches ANY skill) or `all` (job matches ALL skills) |
| Company | `companyId` | Exact UUID match |

---

## 4. Allowlisted Sorting
- `relevance`: Ranks by `ts_rank` DESC (default when `q` is specified).
- `newest`: Ranks by `j.created_at DESC, j.id DESC` (default when no query).
- `oldest`: Ranks by `j.created_at ASC, j.id ASC`.
- `salary_high`: Ranks by `j.salary_max DESC NULLS LAST, j.id DESC`.
- `salary_low`: Ranks by `j.salary_min ASC NULLS LAST, j.id DESC`.

---

## 5. Search History System
- Automatically records search queries and filters for authenticated students (up to top 20 most recent entries per user).
- **APIs**:
  - `GET /api/jobs/search-history`
  - `DELETE /api/jobs/search-history/:id`
  - `DELETE /api/jobs/search-history/clear`

---

## 6. Saved Searches & Job Alerts
- Candidates can save custom search criteria profiles with a single click.
- **Job Alert Delivery & Idempotency**:
  - When recruiters publish a job (`ACTIVE`), `JobAlertService` matches the job against active `saved_searches` where `alert_enabled = TRUE`.
  - Delivery is tracked in `job_alert_deliveries` (`UNIQUE(saved_search_id, job_id)`) to prevent duplicate alerts.
  - Automatically triggers a Phase 7 notification (`type: 'JOB_ALERT'`) and email.
- **APIs**:
  - `GET /api/jobs/saved-searches`
  - `POST /api/jobs/saved-searches`
  - `PATCH /api/jobs/saved-searches/:id`
  - `DELETE /api/jobs/saved-searches/:id`

---

## 7. Security & Optimization
1. **No Unsafe SQL**: `websearch_to_tsquery` safely parses user input into TS queries without risk of syntax errors or injection.
2. **Allowlisted Ordering**: Sorting parameters map strictly to internal column expressions.
3. **Private Job Protection**: Public search strictly enforces `jobs.status = 'ACTIVE'`.
4. **Ownership Verification**: Saved searches and search history are isolated by `req.user.id`.
