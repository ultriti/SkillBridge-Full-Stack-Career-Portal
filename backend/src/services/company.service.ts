import companyRepository, { CompanyData } from '../repositories/company.repository';
import { Company } from '../types/database';

export class CompanyService {
  /**
   * Get company profile for recruiter
   */
  async getRecruiterCompany(recruiterId: string): Promise<Company | null> {
    return companyRepository.findByRecruiterId(recruiterId);
  }

  /**
   * Create or update recruiter company profile
   */
  async upsertRecruiterCompany(recruiterId: string, data: CompanyData): Promise<Company> {
    if (!data.name || data.name.trim().length < 2) {
      const err: any = new Error('Company name must be at least 2 characters long');
      err.statusCode = 400;
      throw err;
    }

    const existing = await companyRepository.findByRecruiterId(recruiterId);

    if (existing) {
      return companyRepository.update(existing.id, data);
    } else {
      return companyRepository.create(recruiterId, data);
    }
  }
}

export default new CompanyService();
