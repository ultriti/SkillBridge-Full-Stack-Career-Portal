import pool from '../config/db';
import resumeRepository from '../repositories/resume.repository';
import resumeParserService from './resume-parser.service';
import { ExtendedResume } from '../types/resume-intelligence.types';

export class CandidateIntelligenceService {
  /**
   * Asynchronously process uploaded resume buffer for text & skill extraction
   */
  async processResumeIntelligence(resumeId: string, buffer?: Buffer): Promise<ExtendedResume | null> {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) return null;

    try {
      // Mark as PROCESSING
      await resumeRepository.updateProcessingResult(resumeId, 'PROCESSING');

      if (!buffer) {
        throw new Error('Resume file buffer unavailable for processing');
      }

      // 1. Extract PDF text
      const { text, pages } = await resumeParserService.extractTextFromPDF(buffer);
      const wordCount = resumeParserService.calculateWordCount(text);

      if (text.length === 0) {
        throw new Error('No readable text could be extracted from PDF (may be scanned image)');
      }

      // 2. Extract Skills
      const detectedSkills = resumeParserService.extractSkillsFromText(text);

      // 3. Upsert extracted skills into `skills` and `user_skills`
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        for (const skillObj of detectedSkills) {
          // Ensure skill exists in `skills` table
          const skillResult = await client.query(
            `INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
            [skillObj.name]
          );
          const skillId = skillResult.rows[0].id;

          // Upsert into `user_skills` preserving MANUAL source
          await client.query(
            `
            INSERT INTO user_skills (user_id, skill_id, source, confidence)
            VALUES ($1, $2, 'RESUME', $3)
            ON CONFLICT (user_id, skill_id) DO NOTHING
          `,
            [resume.student_id, skillId, skillObj.confidence]
          );
        }

        await client.query('COMMIT');
      } catch (dbErr) {
        await client.query('ROLLBACK');
        console.error('Failed to link extracted skills to user:', dbErr);
      } finally {
        client.release();
      }

      // 4. Mark as COMPLETED
      return await resumeRepository.updateProcessingResult(
        resumeId,
        'COMPLETED',
        text,
        wordCount,
        null
      );
    } catch (err: any) {
      console.error(`Resume processing failed for ID ${resumeId}:`, err.message);
      return await resumeRepository.updateProcessingResult(
        resumeId,
        'FAILED',
        null,
        0,
        err.message || 'Resume processing failed'
      );
    }
  }

  /**
   * Manual retry for failed resume processing
   */
  async retryResumeProcessing(resumeId: string, studentId: string): Promise<ExtendedResume> {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume || resume.student_id !== studentId) {
      const err: any = new Error('Resume not found');
      err.statusCode = 404;
      throw err;
    }

    // Reset status to PENDING
    const reset = await resumeRepository.updateProcessingResult(resumeId, 'PENDING', null, 0, null);
    return reset || resume;
  }
}

export default new CandidateIntelligenceService();
