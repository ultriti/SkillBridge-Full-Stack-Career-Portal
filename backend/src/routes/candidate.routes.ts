import { Router } from 'express';
import candidateController from '../controllers/candidate.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Recruiter / Admin Candidate Discovery & Shortlisting
router.get('/search', authorize('recruiter', 'admin'), (req, res, next) =>
  candidateController.searchCandidates(req, res, next)
);

router.get('/shortlisted', authorize('recruiter'), (req, res, next) =>
  candidateController.getShortlistedCandidates(req, res, next)
);

router.get('/job-matches/:jobId', authorize('recruiter'), (req, res, next) =>
  candidateController.getJobCandidateMatches(req, res, next)
);

router.get('/:id', authorize('recruiter', 'admin'), (req, res, next) =>
  candidateController.getCandidateById(req, res, next)
);

router.post('/:id/shortlist', authorize('recruiter'), (req, res, next) =>
  candidateController.shortlistCandidate(req, res, next)
);

router.delete('/:id/shortlist', authorize('recruiter'), (req, res, next) =>
  candidateController.removeShortlist(req, res, next)
);

export default router;
