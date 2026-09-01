import savedJobRepository from '../repositories/saved-job.repository';
import jobRepository from '../repositories/job.repository';

export class SavedJobService {
  /**
   * Save an active job for student
   */
  async saveJob(studentId: string, jobId: string) {
    const job = await jobRepository.findById(jobId);
    if (!job || job.status !== 'ACTIVE') {
      const error: any = new Error('Cannot save a job that is not active.');
      error.statusCode = 400;
      throw error;
    }

    try {
      const saved = await savedJobRepository.saveJob(studentId, jobId);
      return saved;
    } catch (error: any) {
      if (error.code === '23505') {
        const conflictErr: any = new Error('Job is already saved');
        conflictErr.statusCode = 409;
        throw conflictErr;
      }
      throw error;
    }
  }

  /**
   * Remove a saved job for student
   */
  async unsaveJob(studentId: string, jobId: string) {
    const success = await savedJobRepository.unsaveJob(studentId, jobId);
    return { success, message: 'Saved job removed successfully' };
  }

  /**
   * Get saved jobs for student
   */
  async getSavedJobs(
    studentId: string,
    query: { page: number; limit: number; sortBy: string; sortOrder: string }
  ) {
    const { page, limit, sortBy, sortOrder } = query;
    const savedJobs = await savedJobRepository.findSavedJobs(studentId, page, limit, sortBy, sortOrder);
    const total = await savedJobRepository.countSavedJobs(studentId);
    const totalPages = Math.ceil(total / limit);

    return {
      savedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

export default new SavedJobService();
