import savedSearchRepository from '../repositories/saved-search.repository';
import jobRepository from '../repositories/job.repository';
import notificationService from './notification.service';
import emailService from './email.service';
import userRepository from '../repositories/user.repository';
import { JobWithCompany } from '../repositories/job.repository';

export class JobAlertService {
  /**
   * Process newly published job against active saved search alerts
   */
  async processJobAlertsForJob(jobId: string): Promise<void> {
    try {
      const job = await jobRepository.findPublicJobById(jobId);
      if (!job) return;

      const activeAlerts = await savedSearchRepository.findActiveAlertSearches();
      if (activeAlerts.length === 0) return;

      for (const alert of activeAlerts) {
        // Skip alerting the recruiter who posted the job
        if (alert.user_id === job.recruiter_id) continue;

        // Check if job matches saved search filters
        const matches = this.checkJobMatchesFilters(job, alert.query, alert.filters);
        if (!matches) continue;

        // Record delivery for idempotency
        const isNewDelivery = await savedSearchRepository.recordJobAlertDelivery(
          alert.id,
          job.id,
          alert.user_id
        );

        if (isNewDelivery) {
          // Create In-App Notification
          await notificationService.createNotification(
            alert.user_id,
            'New Job Match Alert',
            `A new position '${job.title}' at ${job.company.name} matches your saved search '${alert.name}'.`,
            'JOB_ALERT',
            'JOB',
            job.id
          );

          // Trigger email alert (non-blocking)
          (async () => {
            try {
              const user = await userRepository.findById(alert.user_id);
              if (user && user.email) {
                await emailService.sendApplicationStatusEmail(
                  user.email,
                  `${user.first_name} ${user.last_name}`,
                  job.title,
                  'New Job Match'
                );
              }
            } catch (emailErr) {
              console.error('Failed to send job alert email:', emailErr);
            }
          })();
        }
      }
    } catch (err) {
      console.error('Job alert processing failed:', err);
    }
  }

  /**
   * Client-side match checker for job alert filters
   */
  private checkJobMatchesFilters(
    job: JobWithCompany,
    query?: string | null,
    filters?: Record<string, any>
  ): boolean {
    if (!filters) filters = {};

    // 1. Keyword check
    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      const titleMatch = job.title.toLowerCase().includes(q);
      const descMatch = job.description.toLowerCase().includes(q);
      const companyMatch = job.company.name.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !companyMatch) return false;
    }

    // 2. Job Type check
    if (filters.jobType && job.job_type !== filters.jobType) return false;

    // 3. Work Mode check
    if (filters.workMode && job.work_mode !== filters.workMode) return false;

    // 4. Location check
    if (filters.location && job.location) {
      if (!job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    }

    // 5. Salary Min check
    if (filters.salaryMin != null) {
      const maxSal = job.salary_max ?? job.salary_min ?? 0;
      if (maxSal < filters.salaryMin) return false;
    }

    return true;
  }
}

export default new JobAlertService();
