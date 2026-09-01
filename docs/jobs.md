# SkillBridge — Job Management System Documentation (Phase 5)

## 1. Overview
The Job Management System enables **Recruiters** to draft, publish, edit, close, and manage job postings; **Students** to search, filter, view, and bookmark (save/unsave) active job postings; and **Admins** to monitor system-wide job listings across all recruiter accounts.

---

## 2. Job Status Lifecycle & Visibility Rules

| Job Status | Description | Public / Student Visibility | Recruiter Visibility | Admin Visibility |
| :--- | :--- | :--- | :--- | :--- |
| `DRAFT` | Initial unpublished state created by recruiter. | **Hidden** (Returns 404 on public routes) | Visible to owning recruiter | Visible |
| `ACTIVE` | Published job opportunity open for saving. | **Visible** (Listed on `/api/jobs`) | Visible to owning recruiter | Visible |
| `CLOSED` | Completed or filled job opportunity. | **Hidden** (Returns 404 on public routes) | Visible to owning recruiter | Visible |

---

## 3. Endpoints Specification

### A. Public Endpoints
- `GET /api/jobs`
  - **Access**: Public (Optional JWT token attached to identify student bookmark status `isSaved`).
  - **Query Parameters**:
    - `search` (string): Searches title, description, location, experience level, company name.
    - `jobType` (`FULL_TIME` | `PART_TIME` | `INTERNSHIP` | `CONTRACT` | `FREELANCE`)
    - `workMode` (`REMOTE` | `HYBRID` | `ONSITE`)
    - `location` (string)
    - `experienceLevel` (string)
    - `salaryMin` (number)
    - `salaryMax` (number)
    - `sortBy` (`createdAt` | `salaryMin` | `salaryMax` | `applicationDeadline`)
    - `sortOrder` (`asc` | `desc`)
    - `page` (number, default: 1)
    - `limit` (number, default: 10, max: 50)
  - **Response**: `200 OK` with paginated `ACTIVE` jobs list and company summaries.

- `GET /api/jobs/:jobId`
  - **Access**: Public
  - **Response**: `200 OK` with `ACTIVE` job details, or `404 Not Found` if job is `DRAFT` or `CLOSED`.

---

### B. Recruiter Job Management Endpoints
*All recruiter routes require `Authorization: Bearer <token>` and role `recruiter`.*

- `POST /api/recruiter/jobs`
  - **Body**: `{ title, description, jobType, workMode, location?, salaryMin?, salaryMax?, experienceLevel?, applicationDeadline?, status? }`
  - **Validation & Business Rules**:
    - Recruiter must own an existing company profile in `companies` table. If none exists, returns `400 Bad Request` (`"Please create your company profile before creating a job."`).
    - Recruiter identity (`recruiter_id`) is strictly extracted from `req.user.id`.
  - **Response**: `201 Created`.

- `GET /api/recruiter/jobs`
  - **Query Parameters**: `status` (`DRAFT` | `ACTIVE` | `CLOSED`), `page`, `limit`
  - **Response**: `200 OK` with recruiter's owned jobs.

- `GET /api/recruiter/jobs/:jobId`
  - **Response**: `200 OK` with recruiter job details, or `404 Not Found` if not owned by recruiter.

- `PATCH /api/recruiter/jobs/:jobId`
  - **Body**: Partial update object (`title`, `description`, `jobType`, `workMode`, `location`, `salaryMin`, `salaryMax`, `experienceLevel`, `applicationDeadline`).
  - **Security**: Disallows updating `id`, `recruiter_id`, or `company_id`.

- `PATCH /api/recruiter/jobs/:jobId/publish`
  - **Behavior**: Transitions status `DRAFT` -> `ACTIVE`.

- `PATCH /api/recruiter/jobs/:jobId/close`
  - **Behavior**: Transitions status `ACTIVE` -> `CLOSED`.

- `DELETE /api/recruiter/jobs/:jobId`
  - **Behavior**: Deletes job posting owned by `req.user.id`.

---

### C. Student Saved Jobs Endpoints
*All student routes require `Authorization: Bearer <token>` and role `student`.*

- `POST /api/jobs/:jobId/save`
  - **Behavior**: Bookmarks an `ACTIVE` job. Returns `409 Conflict` if already saved.

- `DELETE /api/jobs/:jobId/save`
  - **Behavior**: Removes saved bookmark.

- `GET /api/students/me/saved-jobs`
  - **Response**: `200 OK` with student's saved active jobs list.

---

### D. Admin Monitoring Endpoints
*All admin routes require `Authorization: Bearer <token>` and role `admin`.*

- `GET /api/admin/jobs`
  - **Query Parameters**: `status`, `search`, `page`, `limit`
  - **Response**: `200 OK` with all jobs across platform including recruiter identity metadata.

- `GET /api/admin/jobs/:jobId`
  - **Response**: `200 OK` with complete job breakdown.

---

## 4. Security & Ownership Rules
1. **Recruiter Identity**: `recruiter_id` is NEVER accepted from request bodies; it is strictly populated from the validated JWT token (`req.user.id`).
2. **Company Verification**: Recruiter company ownership (`companies.recruiter_id = req.user.id`) is verified prior to creating or publishing a job posting.
3. **Student Identity**: `student_id` in saved jobs is strictly populated from `req.user.id`.
4. **SQL Injection Protection**: All search, filter, and sorting logic uses parameterized SQL queries ($1, $2, etc.) and strict column allowlisting (`sortColumns`).
