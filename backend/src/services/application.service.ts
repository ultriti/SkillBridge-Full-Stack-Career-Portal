import applicationRepository, {
  StudentApplicationDetails,
  RecruiterApplicationDetails,
  AdminApplicationDetails,
} from '../repositories/application.repository';
import jobRepository from '../repositories/job.repository';
import resumeRepository from '../repositories/resume.repository';
import { ApplicationStatus } from '../types/database';
import { canTransitionApplicationStatus, canStudentWithdraw } from '../utils/application-status';

export interface ApplicationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApplicationService {
  /**
   * Apply to an active job opportunity
   */
  async applyToJob(
    jobId: string,
    studentId: string,
    resumeId?: string | null,
    coverLetter?: string | null
  ) {
    // 1. Verify job exists
    const job = await jobRepository.findById(jobId);
    if (!job) {
      const err: any = new Error('Job posting not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Verify job is ACTIVE
    if (job.status !== 'ACTIVE') {
      const err: any = new Error('This job is no longer accepting applications');
      err.statusCode = 400;
      throw err;
    }

    // 3. Verify application deadline
    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      const today = new Date();
      // Reset time portion for fair date comparison
      deadline.setHours(23, 59, 59, 999);
      if (today > deadline) {
        const err: any = new Error('Application deadline has passed');
        err.statusCode = 400;
        throw err;
      }
    }

    // 4. Verify resume ownership
    if (resumeId) {
      const resume = await resumeRepository.findById(resumeId);
      if (!resume || resume.student_id !== studentId) {
        const err: any = new Error('Invalid resume or resume does not belong to you');
        err.statusCode = 403;
        throw err;
      }
    }

    // 5. Verify duplicate application
    const existing = await applicationRepository.findByStudentAndJob(studentId, jobId);
    if (existing) {
      const err: any = new Error('You have already applied to this job');
      err.statusCode = 409;
      throw err;
    }

    try {
      const application = await applicationRepository.createApplication(
        jobId,
        studentId,
        resumeId,
        coverLetter
      );
      return application;
    } catch (err: any) {
      if (err.code === '23505') {
        const duplicateErr: any = new Error('You have already applied to this job');
        duplicateErr.statusCode = 409;
        throw duplicateErr;
      }
      throw err;
    }
  }

  /**
   * Get student's submitted applications
   */
  async getStudentApplications(
    studentId: string,
    status?: ApplicationStatus,
    page: number = 1,
    limit: number = 10
  ) {
    const applications = await applicationRepository.findStudentApplications(
      studentId,
      status,
      page,
      limit
    );
    const total = await applicationRepository.countStudentApplications(studentId, status);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get student application details by ID
   */
  async getStudentApplication(studentId: string, applicationId: string) {
    const application = await applicationRepository.findStudentApplicationById(
      studentId,
      applicationId
    );
    if (!application) {
      const err: any = new Error('Application not found');
      err.statusCode = 404;
      throw err;
    }
    return application;
  }

  /**
   * Withdraw student application
   */
  async withdrawApplication(studentId: string, applicationId: string) {
    const application = await applicationRepository.findStudentApplicationById(
      studentId,
      applicationId
    );
    if (!application) {
      const err: any = new Error('Application not found');
      err.statusCode = 404;
      throw err;
    }

    if (!canStudentWithdraw(application.status)) {
      const err: any = new Error(`Cannot withdraw application with status '${application.status}'`);
      err.statusCode = 400;
      throw err;
    }

    const updated = await applicationRepository.updateStatus(applicationId, 'WITHDRAWN');
    return updated;
  }

  /**
   * Recruiter: Get applications submitted to owned jobs
   */
  async getRecruiterApplications(
    recruiterId: string,
    filters: { status?: ApplicationStatus; jobId?: string; search?: string; page: number; limit: number }
  ) {
    const applications = await applicationRepository.findRecruiterApplications(
      recruiterId,
      filters
    );
    const total = await applicationRepository.countRecruiterApplications(recruiterId, {
      status: filters.status,
      jobId: filters.jobId,
      search: filters.search,
    });
    const totalPages = Math.ceil(total / filters.limit) || 1;

    return {
      applications,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Recruiter: Get candidate application details
   */
  async getRecruiterApplication(recruiterId: string, applicationId: string) {
    const application = await applicationRepository.findRecruiterApplicationById(
      recruiterId,
      applicationId
    );
    if (!application) {
      const err: any = new Error('Application not found or unauthorized access');
      err.statusCode = 404;
      throw err;
    }
    return application;
  }

  /**
   * Recruiter: Update application status
   */
  async updateApplicationStatus(
    recruiterId: string,
    applicationId: string,
    nextStatus: ApplicationStatus
  ) {
    const application = await applicationRepository.findRecruiterApplicationById(
      recruiterId,
      applicationId
    );
    if (!application) {
      const err: any = new Error('Application not found or unauthorized access');
      err.statusCode = 404;
      throw err;
    }

    if (!canTransitionApplicationStatus(application.status, nextStatus)) {
      const err: any = new Error(
        `Invalid status transition from '${application.status}' to '${nextStatus}'`
      );
      err.statusCode = 400;
      throw err;
    }

    const updated = await applicationRepository.updateStatus(applicationId, nextStatus);
    return updated;
  }

  /**
   * Admin: Get all applications across system
   */
  async getAdminApplications(filters: {
    status?: ApplicationStatus;
    jobId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const applications = await applicationRepository.findAdminApplications(filters);
    const total = await applicationRepository.countAdminApplications({
      status: filters.status,
      jobId: filters.jobId,
      search: filters.search,
    });
    const totalPages = Math.ceil(total / filters.limit) || 1;

    return {
      applications,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Admin: Get single application details
   */
  async getAdminApplication(applicationId: string) {
    const application = await applicationRepository.findAdminApplicationById(applicationId);
    if (!application) {
      const err: any = new Error('Application not found');
      err.statusCode = 404;
      throw err;
    }
    return application;
  }
}

export default new ApplicationService();
