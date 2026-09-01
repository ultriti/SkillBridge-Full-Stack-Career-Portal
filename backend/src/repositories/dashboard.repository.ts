import pool from '../config/db';
import type { DashboardFilters } from '../types/dashboard.types';

export class DashboardRepository {
  private buildDateClause(filters: DashboardFilters = {}, alias = 'created_at') {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.from) {
      values.push(filters.from);
      conditions.push(`${alias} >= $${values.length}`);
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      values.push(toDate.toISOString());
      conditions.push(`${alias} <= $${values.length}`);
    }

    return { conditions, values };
  }

  async getStudentDashboard(studentId: string, filters: DashboardFilters = {}) {
    const { conditions: dateConditions, values: dateValues } = this.buildDateClause(filters, 'a.applied_at');
    const dateWhere = dateConditions.length ? `AND ${dateConditions.join(' AND ')}` : '';

    const summaryQuery = `
      SELECT
        COUNT(a.id)::int AS total_applications,
        COUNT(*) FILTER (WHERE a.status IN ('APPLIED','REVIEWING','SHORTLISTED','INTERVIEW'))::int AS active_applications,
        COUNT(*) FILTER (WHERE a.status = 'SHORTLISTED')::int AS shortlisted_applications,
        COUNT(*) FILTER (WHERE a.status = 'INTERVIEW')::int AS interview_applications,
        COUNT(*) FILTER (WHERE a.status = 'SELECTED')::int AS selected_applications,
        COUNT(*) FILTER (WHERE a.status = 'REJECTED')::int AS rejected_applications,
        COUNT(*) FILTER (WHERE sj.id IS NOT NULL)::int AS saved_jobs,
        CASE
          WHEN u.bio IS NULL THEN 0
          ELSE 25
        END +
        CASE WHEN u.profile_image IS NULL THEN 0 ELSE 15 END +
        CASE WHEN EXISTS (SELECT 1 FROM user_skills us WHERE us.user_id = u.id) THEN 20 ELSE 0 END +
        CASE WHEN EXISTS (SELECT 1 FROM resumes r WHERE r.student_id = u.id) THEN 20 ELSE 0 END +
        CASE WHEN u.location IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN u.phone IS NOT NULL THEN 10 ELSE 0 END AS profile_completion
      FROM users u
      LEFT JOIN applications a ON a.student_id = u.id ${dateWhere.replace('a.applied_at', 'a.applied_at')}
      LEFT JOIN saved_jobs sj ON sj.student_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.bio, u.profile_image, u.location, u.phone
    `;

    const summaryResult = await pool.query(summaryQuery, [studentId, ...dateValues]);
    const summary = summaryResult.rows[0] || {
      total_applications: 0,
      active_applications: 0,
      shortlisted_applications: 0,
      interview_applications: 0,
      selected_applications: 0,
      rejected_applications: 0,
      saved_jobs: 0,
      profile_completion: 0,
    };

    const statusSql = `
      SELECT
        status AS label,
        COUNT(*)::int AS value
      FROM applications
      WHERE student_id = $1
      ${dateWhere}
      GROUP BY status
      ORDER BY CASE status
        WHEN 'APPLIED' THEN 1
        WHEN 'REVIEWING' THEN 2
        WHEN 'SHORTLISTED' THEN 3
        WHEN 'INTERVIEW' THEN 4
        WHEN 'SELECTED' THEN 5
        WHEN 'REJECTED' THEN 6
        WHEN 'WITHDRAWN' THEN 7
        ELSE 8
      END
    `;

    const statusResult = await pool.query(statusSql, [studentId, ...dateValues]);

    const recentApplicationsQuery = `
      SELECT a.id, j.title AS "jobTitle", c.name AS "companyName", a.status, a.applied_at AS "appliedAt"
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      INNER JOIN companies c ON c.id = j.company_id
      WHERE a.student_id = $1
      ${dateWhere}
      ORDER BY a.applied_at DESC
      LIMIT 5
    `;

    const recentApplications = (await pool.query(recentApplicationsQuery, [studentId, ...dateValues])).rows;

    const recentNotificationsQuery = `
      SELECT id, title, message, created_at AS "createdAt"
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const recentNotifications = (await pool.query(recentNotificationsQuery, [studentId])).rows;

    return {
      summary: {
        totalApplications: Number(summary.total_applications || 0),
        activeApplications: Number(summary.active_applications || 0),
        shortlistedApplications: Number(summary.shortlisted_applications || 0),
        interviewApplications: Number(summary.interview_applications || 0),
        selectedApplications: Number(summary.selected_applications || 0),
        rejectedApplications: Number(summary.rejected_applications || 0),
        savedJobs: Number(summary.saved_jobs || 0),
        profileCompletion: Math.min(100, Number(summary.profile_completion || 0)),
      },
      charts: {
        statusDistribution: statusResult.rows.map((row) => ({
          label: row.label,
          value: Number(row.value),
        })),
      },
      recentApplications: recentApplications.map((row) => ({
        id: row.id,
        jobTitle: row.jobTitle,
        companyName: row.companyName,
        status: row.status,
        appliedAt: row.appliedAt,
      })),
      recentNotifications: recentNotifications.map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        createdAt: row.createdAt,
      })),
    };
  }

  async getRecruiterDashboard(recruiterId: string, filters: DashboardFilters = {}) {
    const { conditions: dateConditions, values: dateValues } = this.buildDateClause(filters, 'a.applied_at');
    const dateWhere = dateConditions.length ? `WHERE ${dateConditions.join(' AND ')}` : '';

    const summaryQuery = `
      SELECT
        COUNT(DISTINCT j.id)::int AS total_jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'ACTIVE' THEN j.id END)::int AS active_jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'CLOSED' THEN j.id END)::int AS closed_jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'DRAFT' THEN j.id END)::int AS draft_jobs,
        COUNT(DISTINCT a.id)::int AS total_applications,
        COUNT(DISTINCT CASE WHEN a.status IN ('APPLIED','REVIEWING','SHORTLISTED','INTERVIEW','SELECTED') AND a.applied_at >= NOW() - INTERVAL '30 days' THEN a.id END)::int AS new_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'SHORTLISTED' THEN a.id END)::int AS shortlisted_candidates,
        COUNT(DISTINCT CASE WHEN a.status = 'INTERVIEW' THEN a.id END)::int AS interview_candidates,
        COUNT(DISTINCT CASE WHEN a.status = 'SELECTED' THEN a.id END)::int AS selected_candidates
      FROM jobs j
      LEFT JOIN applications a ON a.job_id = j.id
      WHERE j.recruiter_id = $1
    `;

    const summaryResult = await pool.query(summaryQuery, [recruiterId]);
    const summary = summaryResult.rows[0];

    const statusQuery = `
      SELECT a.status AS label, COUNT(*)::int AS value
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      WHERE j.recruiter_id = $1
      GROUP BY a.status
      ORDER BY CASE a.status
        WHEN 'APPLIED' THEN 1
        WHEN 'REVIEWING' THEN 2
        WHEN 'SHORTLISTED' THEN 3
        WHEN 'INTERVIEW' THEN 4
        WHEN 'SELECTED' THEN 5
        WHEN 'REJECTED' THEN 6
        WHEN 'WITHDRAWN' THEN 7
        ELSE 8
      END
    `;

    const statusDistribution = (await pool.query(statusQuery, [recruiterId])).rows;

    const funnelQuery = `
      SELECT
        'Applications' AS label, COUNT(*)::int AS value FROM applications a INNER JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = $1
      UNION ALL
      SELECT 'Reviewing', COUNT(*)::int FROM applications a INNER JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = $1 AND a.status = 'REVIEWING'
      UNION ALL
      SELECT 'Shortlisted', COUNT(*)::int FROM applications a INNER JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = $1 AND a.status = 'SHORTLISTED'
      UNION ALL
      SELECT 'Interview', COUNT(*)::int FROM applications a INNER JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = $1 AND a.status = 'INTERVIEW'
      UNION ALL
      SELECT 'Selected', COUNT(*)::int FROM applications a INNER JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = $1 AND a.status = 'SELECTED'
    `;

    const funnel = (await pool.query(funnelQuery, [recruiterId])).rows;

    const recentApplicationsQuery = `
      SELECT a.id, j.title AS "jobTitle", c.name AS "companyName", a.status, a.applied_at AS "appliedAt"
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      INNER JOIN companies c ON c.id = j.company_id
      WHERE j.recruiter_id = $1
      ORDER BY a.applied_at DESC
      LIMIT 10
    `;

    const recentApplications = (await pool.query(recentApplicationsQuery, [recruiterId])).rows;

    const jobPerformanceQuery = `
      SELECT
        j.id,
        j.title,
        COUNT(a.id)::int AS applications,
        COUNT(*) FILTER (WHERE a.status = 'SHORTLISTED')::int AS shortlisted,
        COUNT(*) FILTER (WHERE a.status = 'INTERVIEW')::int AS interviews,
        COUNT(*) FILTER (WHERE a.status = 'SELECTED')::int AS selected
      FROM jobs j
      LEFT JOIN applications a ON a.job_id = j.id
      WHERE j.recruiter_id = $1
      GROUP BY j.id, j.title
      ORDER BY applications DESC, j.created_at DESC
      LIMIT 5
    `;

    const jobPerformance = (await pool.query(jobPerformanceQuery, [recruiterId])).rows;

    return {
      summary: {
        totalJobs: Number(summary.total_jobs || 0),
        activeJobs: Number(summary.active_jobs || 0),
        closedJobs: Number(summary.closed_jobs || 0),
        draftJobs: Number(summary.draft_jobs || 0),
        totalApplications: Number(summary.total_applications || 0),
        newApplications: Number(summary.new_applications || 0),
        shortlistedCandidates: Number(summary.shortlisted_candidates || 0),
        interviewCandidates: Number(summary.interview_candidates || 0),
        selectedCandidates: Number(summary.selected_candidates || 0),
      },
      charts: {
        statusDistribution: statusDistribution.map((row) => ({ label: row.label, value: Number(row.value) })),
        funnel: funnel.map((row) => ({ label: row.label, value: Number(row.value) })),
      },
      recentApplications: recentApplications.map((row) => ({
        id: row.id,
        jobTitle: row.jobTitle,
        companyName: row.companyName,
        status: row.status,
        appliedAt: row.appliedAt,
      })),
      jobPerformance: jobPerformance.map((row) => ({
        id: row.id,
        title: row.title,
        applications: Number(row.applications),
        shortlisted: Number(row.shortlisted),
        interviews: Number(row.interviews),
        selected: Number(row.selected),
      })),
    };
  }

  async getAdminDashboard(filters: DashboardFilters = {}) {
    const { conditions: dateConditions, values: dateValues } = this.buildDateClause(filters, 'created_at');
    const userGrowthQuery = `
      SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') AS label,
        COUNT(*)::int AS value
      FROM users
      WHERE role IN ('student','recruiter')
      ${dateConditions.length ? `AND ${dateConditions.join(' AND ')}` : ''}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY label ASC
      LIMIT 30
    `;

    const jobGrowthQuery = `
      SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') AS label,
        COUNT(*)::int AS value
      FROM jobs
      ${dateConditions.length ? `WHERE ${dateConditions.join(' AND ')}` : ''}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY label ASC
      LIMIT 30
    `;

    const appGrowthQuery = `
      SELECT
        TO_CHAR(applied_at, 'YYYY-MM-DD') AS label,
        COUNT(*)::int AS value
      FROM applications
      ${dateConditions.length ? `WHERE ${dateConditions.join(' AND ')}` : ''}
      GROUP BY TO_CHAR(applied_at, 'YYYY-MM-DD')
      ORDER BY label ASC
      LIMIT 30
    `;

    const summaryQuery = `
      SELECT
        COUNT(DISTINCT u.id)::int AS total_users,
        COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.id END)::int AS student_users,
        COUNT(DISTINCT CASE WHEN u.role = 'recruiter' THEN u.id END)::int AS recruiter_users,
        COUNT(DISTINCT c.id)::int AS company_count,
        COUNT(DISTINCT j.id)::int AS total_jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'ACTIVE' THEN j.id END)::int AS active_jobs,
        COUNT(DISTINCT a.id)::int AS total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'SELECTED' THEN a.id END)::int AS selected_candidates
      FROM users u
      LEFT JOIN companies c ON c.recruiter_id = u.id
      LEFT JOIN jobs j ON j.recruiter_id = u.id
      LEFT JOIN applications a ON a.student_id = u.id
    `;

    const summaryResult = await pool.query(summaryQuery);
    const summary = summaryResult.rows[0];

    const statusQuery = `
      SELECT a.status AS label, COUNT(*)::int AS value
      FROM applications a
      GROUP BY a.status
      ORDER BY CASE a.status
        WHEN 'APPLIED' THEN 1
        WHEN 'REVIEWING' THEN 2
        WHEN 'SHORTLISTED' THEN 3
        WHEN 'INTERVIEW' THEN 4
        WHEN 'SELECTED' THEN 5
        WHEN 'REJECTED' THEN 6
        WHEN 'WITHDRAWN' THEN 7
        ELSE 8
      END
    `;

    const topJobsQuery = `
      SELECT j.id, j.title, COUNT(a.id)::int AS applications
      FROM jobs j
      LEFT JOIN applications a ON a.job_id = j.id
      GROUP BY j.id, j.title
      ORDER BY applications DESC, j.created_at DESC
      LIMIT 5
    `;

    const userGrowth = (await pool.query(userGrowthQuery, dateValues)).rows;
    const jobGrowth = (await pool.query(jobGrowthQuery, dateValues)).rows;
    const applicationGrowth = (await pool.query(appGrowthQuery, dateValues)).rows;
    const statusDistribution = (await pool.query(statusQuery)).rows;
    const topJobs = (await pool.query(topJobsQuery)).rows;

    return {
      summary: {
        totalUsers: Number(summary.total_users || 0),
        studentUsers: Number(summary.student_users || 0),
        recruiterUsers: Number(summary.recruiter_users || 0),
        companyCount: Number(summary.company_count || 0),
        totalJobs: Number(summary.total_jobs || 0),
        activeJobs: Number(summary.active_jobs || 0),
        totalApplications: Number(summary.total_applications || 0),
        selectedCandidates: Number(summary.selected_candidates || 0),
      },
      charts: {
        statusDistribution: statusDistribution.map((row) => ({ label: row.label, value: Number(row.value) })),
        userGrowth: userGrowth.map((row) => ({ label: row.label, value: Number(row.value) })),
        jobGrowth: jobGrowth.map((row) => ({ label: row.label, value: Number(row.value) })),
        applicationGrowth: applicationGrowth.map((row) => ({ label: row.label, value: Number(row.value) })),
      },
      topJobs: topJobs.map((row) => ({ id: row.id, title: row.title, applications: Number(row.applications) })),
    };
  }
}

export default new DashboardRepository();
