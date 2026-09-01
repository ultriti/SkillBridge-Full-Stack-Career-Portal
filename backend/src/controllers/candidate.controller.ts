import { Request, Response, NextFunction } from 'express';
import candidateSearchRepository from '../repositories/candidate-search.repository';
import shortlistRepository from '../repositories/shortlist.repository';
import candidateMatchingService from '../services/candidate-matching.service';
import { z } from 'zod';

const candidateSearchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  skills: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim()).filter((s) => s.length > 0))
    .optional(),
  skillMatch: z.enum(['any', 'all']).default('any').optional(),
  sortBy: z.enum(['relevance', 'newest', 'experience']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export class CandidateController {
  /**
   * Recruiter: Candidate Search & Discovery
   */
  async searchCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = candidateSearchQuerySchema.parse(req.query);
      const recruiterId = req.user?.id;

      const candidates = await candidateSearchRepository.searchCandidates(filters, recruiterId);
      const total = await candidateSearchRepository.countCandidates(filters);
      const totalPages = Math.ceil(total / filters.limit) || 1;

      res.status(200).json({
        success: true,
        message: 'Candidates retrieved successfully',
        data: {
          candidates,
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recruiter: Get single candidate profile
   */
  async getCandidateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const recruiterId = req.user?.id;

      const candidate = await candidateSearchRepository.findCandidateById(id, recruiterId);
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recruiter: Add candidate to shortlist
   */
  async shortlistCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const { id: candidateId } = req.params;

      const record = await shortlistRepository.addShortlist(recruiterId, candidateId);
      res.status(200).json({
        success: true,
        message: 'Candidate added to shortlist',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recruiter: Remove candidate from shortlist
   */
  async removeShortlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const { id: candidateId } = req.params;

      await shortlistRepository.removeShortlist(recruiterId, candidateId);
      res.status(200).json({
        success: true,
        message: 'Candidate removed from shortlist',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recruiter: Get shortlisted candidates
   */
  async getShortlistedCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const candidates = await shortlistRepository.findShortlistedCandidates(recruiterId);

      res.status(200).json({
        success: true,
        data: candidates,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recruiter: Get candidate match score list for a specific job
   */
  async getJobCandidateMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const { jobId } = req.params;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await candidateMatchingService.getJobCandidateMatches(jobId, recruiterId, page, limit);

      res.status(200).json({
        success: true,
        message: 'Candidate matches calculated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CandidateController();
