import api from './api';
import type { Company, UpsertCompanyRequest } from '../types/company.types';

export const companyService = {
  /**
   * Get authenticated recruiter's company profile
   */
  async getRecruiterCompany(): Promise<Company | null> {
    try {
      const response = await api.get<{ success: boolean; data: Company }>('/recruiter/company');
      return response.data.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Create or update recruiter's company profile
   */
  async saveCompany(data: UpsertCompanyRequest): Promise<Company> {
    const response = await api.post<{ success: boolean; data: Company }>('/recruiter/company', data);
    return response.data.data;
  },
};
