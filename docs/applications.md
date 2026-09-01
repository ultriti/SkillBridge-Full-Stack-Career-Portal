# SkillBridge — Job Application System Documentation (Phase 6)

## 1. Overview
The Job Application System implements the complete recruitment workflow for SkillBridge. **Students** can apply to active jobs using their uploaded resumes and optional cover letters, track their application progress via a visual timeline, and withdraw active applications. **Recruiters** can review candidates for their posted jobs, inspect skills and cover letters, and transition application statuses. **Admins** maintain platform-wide application oversight.

---

## 2. Application Status Lifecycle & Transition Rules

### Status Workflow
```
             APPLIED
                │
                ▼
            REVIEWING
                │
                ▼
           SHORTLISTED
                │
                ▼
            INTERVIEW
                │
                ▼
            SELECTED
```

- **Terminal / Negative Branches**:
  - `REJECTED`: A recruiter can transition from `APPLIED`, `REVIEWING`, `SHORTLISTED`, or `INTERVIEW` to `REJECTED`.
  - `WITHDRAWN`: A student can withdraw an application from `APPLIED` or `REVIEWING`.

### Transition Validation Rules (`canTransitionApplicationStatus`)
1. `APPLIED` -> `REVIEWING`, `SHORTLISTED`, `REJECTED`, `WITHDRAWN`
2. `REVIEWING` -> `SHORTLISTED`, `INTERVIEW`, `REJECTED`, `WITHDRAWN`
3. `SHORTLISTED` -> `INTERVIEW`, `REJECTED`
4. `INTERVIEW` -> `SELECTED`, `REJECTED`
5. `SELECTED` -> Terminal (no further transitions)
6. `REJECTED` -> Terminal (cannot jump to `SELECTED` or `APPLIED`)
7. `WITHDRAWN` -> Terminal (cannot jump to `SHORTLISTED` or `APPLIED`)

---

## 3. Endpoints Specification

### A. Student Application Endpoints
*All student routes require `Authorization: Bearer <token>` and role `student`.*

- `POST /api/jobs/:jobId/apply`
  - **Body**: `{ "resumeId"?: "uuid", "coverLetter"?: "string" }`
  - **Business & Security Rules**:
    - `student_id` is extracted strictly from `req.user.id`.
    - Verifies job exists and status is `ACTIVE`.
    - Verifies job `application_deadline` has not passed.
    - Verifies `resume_id` belongs to the authenticated student (`resumes.student_id = req.user.id`).
    - Enforces uniqueness via database constraint `UNIQUE(job_id, student_id)` and application-level check; returns `409 Conflict` if already applied.
  - **Response**: `201 Created` with application details.

- `GET /api/students/me/applications`
  - **Query Parameters**: `status`, `page`, `limit`
  - **Response**: `200 OK` with paginated application list including job and company metadata.

- `GET /api/students/me/applications/:applicationId`
  - **Security**: Verifies `applications.student_id = req.user.id`.
  - **Response**: `200 OK` with full application details, resume, and timeline.

- `PATCH /api/students/me/applications/:applicationId/withdraw`
  - **Allowed Statuses**: `APPLIED` or `REVIEWING`.
  - **Response**: `200 OK` with updated `WITHDRAWN` application.

---

### B. Recruiter Application Endpoints
*All recruiter routes require `Authorization: Bearer <token>` and role `recruiter`.*

- `GET /api/recruiter/applications`
  - **Query Parameters**: `status`, `jobId`, `search`, `page`, `limit`
  - **Ownership Rule**: Enforces `jobs.recruiter_id = req.user.id`.
  - **Response**: `200 OK` with candidate applications, candidate profile, skills, and pagination.

- `GET /api/recruiter/applications/:applicationId`
  - **Ownership Rule**: Verifies application belongs to a job owned by `req.user.id`.
  - **Response**: `200 OK` with detailed candidate profile, skills, resume, cover letter, and job details.

- `PATCH /api/recruiter/applications/:applicationId/status`
  - **Body**: `{ "status": "SHORTLISTED" }`
  - **Validation**: Enforces status transition rules (`canTransitionApplicationStatus`). Returns `400 Bad Request` on invalid status jump.
  - **Response**: `200 OK` with updated application record.

---

### C. Admin Monitoring Endpoints
*All admin routes require `Authorization: Bearer <token>` and role `admin`.*

- `GET /api/admin/applications`
  - **Query Parameters**: `status`, `jobId`, `search`, `page`, `limit`
  - **Response**: `200 OK` with platform-wide applications list.

- `GET /api/admin/applications/:applicationId`
  - **Response**: `200 OK` with read-only administrative breakdown.

---

## 4. Security & Ownership Architecture
1. **No Client-Supplied Identity**: Student ID and Recruiter ID are ALWAYS populated from JWT (`req.user.id`).
2. **Resume Ownership Verification**: `resumes.student_id` is queried to confirm the resume belongs to the applicant.
3. **Recruiter Job Ownership**: Candidate applications are filtered via SQL JOIN: `jobs.recruiter_id = req.user.id`.
4. **Duplicate Prevention**: Database UNIQUE constraint `CONSTRAINT unique_job_student UNIQUE (job_id, student_id)` prevents concurrent duplicate applications. Returns HTTP `409 Conflict`.
