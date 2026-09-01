import dashboardRepository from '../repositories/dashboard.repository';
import type { DashboardFilters } from '../types/dashboard.types';

export class DashboardService {
  async getStudentDashboard(studentId: string, filters: DashboardFilters = {}) {
    return dashboardRepository.getStudentDashboard(studentId, filters);
  }

  async getRecruiterDashboard(recruiterId: string, filters: DashboardFilters = {}) {
    return dashboardRepository.getRecruiterDashboard(recruiterId, filters);
  }

  async getAdminDashboard(filters: DashboardFilters = {}) {
    return dashboardRepository.getAdminDashboard(filters);
  }
}

export default new DashboardService();
