import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import resumeRepository from '../repositories/resume.repository';
import candidateIntelligenceService from '../services/candidate-intelligence.service';
import { ZodError } from 'zod';

// Multer memory storage configuration for file validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max size
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' || file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});

export const resumeUploadMiddleware = upload.single('resume');

export class ResumeController {
  /**
   * Upload resume and trigger processing
   */
  async uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'student') {
        res.status(403).json({ success: false, message: 'Only students can upload resumes' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'Please select a valid PDF resume file' });
        return;
      }

      const studentId = req.user.id;
      const originalName = req.file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const version = await resumeRepository.getNextVersionNumber(studentId);
      const isDefault = version === 1;

      // Local storage URL simulation or bucket key
      const fileUrl = `/uploads/resumes/${studentId}/${Date.now()}_v${version}.pdf`;

      const resume = await resumeRepository.createResume({
        student_id: studentId,
        file_name: originalName,
        file_url: fileUrl,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        is_default: isDefault,
        version,
      });

      // Trigger Async PDF Intelligence Processing (Pass Buffer)
      (async () => {
        try {
          await candidateIntelligenceService.processResumeIntelligence(resume.id, req.file?.buffer);
        } catch (procErr) {
          console.error('Async resume processing failed:', procErr);
        }
      })();

      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully. Processing started.',
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student's resumes
   */
  async getStudentResumes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.id;
      const resumes = await resumeRepository.findByStudentId(studentId);
      res.status(200).json({
        success: true,
        message: 'Resumes retrieved successfully',
        data: resumes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set primary resume
   */
  async setPrimaryResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.id;
      const { id } = req.params;
      const success = await resumeRepository.setPrimaryResume(id, studentId);
      if (!success) {
        res.status(404).json({ success: false, message: 'Resume not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Primary resume updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete resume
   */
  async deleteResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.id;
      const { id } = req.params;
      const success = await resumeRepository.deleteResume(id, studentId);
      if (!success) {
        res.status(404).json({ success: false, message: 'Resume not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Resume deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retry processing failed resume
   */
  async retryProcessing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.id;
      const { id } = req.params;
      const updated = await candidateIntelligenceService.retryResumeProcessing(id, studentId);
      res.status(200).json({
        success: true,
        message: 'Resume processing reset. Retrying extraction.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ResumeController();
