import { ExtractedSkill } from '../types/resume-intelligence.types';
// Use require for pdf-parse CJS module compatibility
const pdfParse = require('pdf-parse');

export class ResumeParserService {
  // Controlled skill dictionary mapping canonical names to regex patterns & aliases
  private skillDictionary: Array<{ canonical: string; patterns: RegExp[] }> = [
    { canonical: 'React', patterns: [/\breact(\.js|js)?\b/i] },
    { canonical: 'Node.js', patterns: [/\bnode(\.js|js)?\b/i] },
    { canonical: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
    { canonical: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i] },
    { canonical: 'PostgreSQL', patterns: [/\bpostgres(ql)?\b/i] },
    { canonical: 'MongoDB', patterns: [/\bmongodb\b/i, /\bmongo\b/i] },
    { canonical: 'Express.js', patterns: [/\bexpress(\.js|js)?\b/i] },
    { canonical: 'Python', patterns: [/\bpython\b/i] },
    { canonical: 'Docker', patterns: [/\bdocker\b/i] },
    { canonical: 'Git', patterns: [/\bgit\b/i, /\bgithub\b/i] },
    { canonical: 'AWS', patterns: [/\baws\b/i, /\bamazon web services\b/i] },
    { canonical: 'Java', patterns: [/\bjava\b/i] },
    { canonical: 'C++', patterns: [/\bc\+\+\b/i] },
    { canonical: 'GraphQL', patterns: [/\bgraphql\b/i] },
    { canonical: 'Tailwind CSS', patterns: [/\btailwind(css)?\b/i] },
    { canonical: 'REST API', patterns: [/\brest(ful)? api\b/i, /\brest apis\b/i] },
    { canonical: 'Next.js', patterns: [/\bnext(\.js|js)?\b/i] },
    { canonical: 'Vue.js', patterns: [/\bvue(\.js|js)?\b/i] },
    { canonical: 'Angular', patterns: [/\bangular(js)?\b/i] },
    { canonical: 'SQL', patterns: [/\bsql\b/i] },
    { canonical: 'Redis', patterns: [/\bredis\b/i] },
    { canonical: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
    { canonical: 'HTML5', patterns: [/\bhtml5?\b/i] },
    { canonical: 'CSS3', patterns: [/\bcss3?\b/i] },
  ];

  /**
   * Safely extract raw text from PDF buffer
   */
  async extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pages: number }> {
    try {
      const data = await pdfParse(buffer);
      const text = this.normalizeExtractedText(data.text || '');
      return {
        text,
        pages: data.numpages || 1,
      };
    } catch (err: any) {
      throw new Error(`PDF Text Extraction Failed: ${err.message || 'Corrupt PDF'}`);
    }
  }

  /**
   * Normalize extracted text (collapse extra whitespace & empty lines)
   */
  normalizeExtractedText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * Extract recognized skills using controlled dictionary
   */
  extractSkillsFromText(text: string): ExtractedSkill[] {
    const detected: ExtractedSkill[] = [];
    const lowerText = text.toLowerCase();

    for (const skillObj of this.skillDictionary) {
      let matched = false;
      for (const pattern of skillObj.patterns) {
        if (pattern.test(lowerText)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        detected.push({
          name: skillObj.canonical,
          confidence: 0.95,
          source: 'RESUME',
        });
      }
    }

    return detected;
  }

  /**
   * Calculate total word count
   */
  calculateWordCount(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    return text.trim().split(/\s+/).length;
  }
}

export default new ResumeParserService();
