export type DashboardStatus =
  | 'APPLIED'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type DashboardMetricPoint = {
  label: string;
  value: number;
};

export interface DashboardFilters {
  from?: string;
  to?: string;
  jobId?: string;
  status?: DashboardStatus;
}

export interface StudentDashboardSummary {
  totalApplications: number;
  activeApplications: number;
  shortlistedApplications: number;
  interviewApplications: number;
  selectedApplications: number;
  rejectedApplications: number;
  savedJobs: number;
  profileCompletion: number;
}

export interface RecruiterDashboardSummary {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  draftJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlistedCandidates: number;
  interviewCandidates: number;
  selectedCandidates: number;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  studentUsers: number;
  recruiterUsers: number;
  companyCount: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  selectedCandidates: number;
}

export interface DashboardRecentApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  status: DashboardStatus;
  appliedAt: string;
}

export interface DashboardRecentNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface StudentDashboardData {
  summary: StudentDashboardSummary;
  charts: {
    statusDistribution: DashboardMetricPoint[];
  };
  recentApplications: DashboardRecentApplication[];
  recentNotifications: DashboardRecentNotification[];
}

export interface RecruiterDashboardData {
  summary: RecruiterDashboardSummary;
  charts: {
    statusDistribution: DashboardMetricPoint[];
    funnel: {
      label: string;
      value: number;
    }[];
  };
  recentApplications: DashboardRecentApplication[];
  jobPerformance: Array<{
    id: string;
    title: string;
    applications: number;
    shortlisted: number;
    interviews: number;
    selected: number;
  }>;
}

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
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
