import api from './api';

export interface DashboardMetricPoint {
  label: string;
  value: number;
}

export interface StudentDashboardResponse {
  summary: {
    totalApplications: number;
    activeApplications: number;
    shortlistedApplications: number;
    interviewApplications: number;
    selectedApplications: number;
    rejectedApplications: number;
    savedJobs: number;
    profileCompletion: number;
  };
  charts: {
    statusDistribution: DashboardMetricPoint[];
  };
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

export interface RecruiterDashboardResponse {
  summary: {
    totalJobs: number;
    activeJobs: number;
    closedJobs: number;
    draftJobs: number;
    totalApplications: number;
    newApplications: number;
    shortlistedCandidates: number;
    interviewCandidates: number;
    selectedCandidates: number;
  };
  charts: {
    statusDistribution: DashboardMetricPoint[];
    funnel: DashboardMetricPoint[];
  };
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
  }>;
  jobPerformance: Array<{
    id: string;
    title: string;
    applications: number;
    shortlisted: number;
    interviews: number;
    selected: number;
  }>;
}

export interface AdminDashboardResponse {
  summary: {
    totalUsers: number;
    studentUsers: number;
    recruiterUsers: number;
    companyCount: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    selectedCandidates: number;
  };
  charts: {
    statusDistribution: DashboardMetricPoint[];
    userGrowth: DashboardMetricPoint[];
    jobGrowth: DashboardMetricPoint[];
    applicationGrowth: DashboardMetricPoint[];
  };
  topJobs: Array<{
    id: string;
    title: string;
    applications: number;
  }>;
}

export const dashboardService = {
  async getStudentDashboard(params?: Record<string, string>) {
    const response = await api.get<{ success: boolean; data: StudentDashboardResponse }>('/dashboard/student', { params });
    return response.data.data;
  },
  async getRecruiterDashboard(params?: Record<string, string>) {
    const response = await api.get<{ success: boolean; data: RecruiterDashboardResponse }>('/dashboard/recruiter', { params });
    return response.data.data;
  },
  async getAdminDashboard(params?: Record<string, string>) {
    const response = await api.get<{ success: boolean; data: AdminDashboardResponse }>('/dashboard/admin', { params });
    return response.data.data;
  },
};
