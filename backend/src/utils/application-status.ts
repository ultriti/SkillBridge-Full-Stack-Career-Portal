import { ApplicationStatus } from '../types/database';

/**
 * Validates recruiter status transitions
 */
export function canTransitionApplicationStatus(
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus
): boolean {
  if (currentStatus === nextStatus) return true;

  const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    APPLIED: ['REVIEWING', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
    REVIEWING: ['SHORTLISTED', 'INTERVIEW', 'REJECTED', 'WITHDRAWN'],
    SHORTLISTED: ['INTERVIEW', 'REJECTED'],
    INTERVIEW: ['SELECTED', 'REJECTED'],
    SELECTED: [],
    REJECTED: [],
    WITHDRAWN: [],
  };

  const validNextStatuses = allowedTransitions[currentStatus] || [];
  return validNextStatuses.includes(nextStatus);
}

/**
 * Validates if student can withdraw application
 */
export function canStudentWithdraw(currentStatus: ApplicationStatus): boolean {
  return currentStatus === 'APPLIED' || currentStatus === 'REVIEWING';
}
