import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Briefcase, ChartColumn, CheckCircle2, FileText, UserRound, Bookmark } from 'lucide-react';
import { dashboardService, type StudentDashboardResponse } from '../../services/dashboard.service';

const metricStyles = [
  { label: 'Total Applications', icon: FileText, accent: 'text-indigo-400 bg-indigo-500/10' },
  { label: 'Active Applications', icon: Briefcase, accent: 'text-blue-400 bg-blue-500/10' },
  { label: 'Shortlisted', icon: CheckCircle2, accent: 'text-emerald-400 bg-emerald-500/10' },
  { label: 'Profile Completion', icon: UserRound, accent: 'text-violet-400 bg-violet-500/10' },
];

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboard = await dashboardService.getStudentDashboard();
        setData(dashboard);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metrics = useMemo(() => {
    if (!data) return [];
    const { summary } = data;
    return [
      { label: 'Total Applications', value: summary.totalApplications, accent: metricStyles[0].accent },
      { label: 'Active Applications', value: summary.activeApplications, accent: metricStyles[1].accent },
      { label: 'Shortlisted', value: summary.shortlistedApplications, accent: metricStyles[2].accent },
      { label: 'Profile Completion', value: `${summary.profileCompletion}%`, accent: metricStyles[3].accent },
    ];
  }, [data]);

  if (loading) {
    return <div className="p-10 text-center text-slate-300">Loading dashboard...</div>;
  }

  if (error || !data) {
    return <div className="max-w-3xl mx-auto mt-12 rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{error || 'Dashboard unavailable.'}</div>;
  }

  const maxStatusValue = Math.max(1, ...data.charts.statusDistribution.map((item) => item.value));

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-400">Student Overview</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Your career dashboard</h1>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
            Saved jobs: <span className="font-semibold text-indigo-300">{data.summary.savedJobs}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, accent }, index) => {
            const Icon = metricStyles[index].icon;
            return (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Application Status</h2>
              <ChartColumn className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="space-y-4">
              {data.charts.statusDistribution.length === 0 ? (
                <p className="text-sm text-slate-400">No application data available yet.</p>
              ) : (
                data.charts.statusDistribution.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
                        style={{ width: `${(item.value / maxStatusValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Quick Insights</h2>
              <Bookmark className="h-5 w-5 text-violet-400" />
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="rounded-xl bg-slate-800/60 p-4">
                <p className="text-slate-400">Interview stage</p>
                <p className="mt-2 text-2xl font-bold text-white">{data.summary.interviewApplications}</p>
              </div>
              <div className="rounded-xl bg-slate-800/60 p-4">
                <p className="text-slate-400">Selected offers</p>
                <p className="mt-2 text-2xl font-bold text-white">{data.summary.selectedApplications}</p>
              </div>
              <div className="rounded-xl bg-slate-800/60 p-4">
                <p className="text-slate-400">Rejected</p>
                <p className="mt-2 text-2xl font-bold text-white">{data.summary.rejectedApplications}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="space-y-3">
              {data.recentApplications.length === 0 ? (
                <p className="text-sm text-slate-400">No recent applications.</p>
              ) : (
                data.recentApplications.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 p-3">
                    <div>
                      <p className="font-medium text-white">{item.jobTitle}</p>
                      <p className="text-sm text-slate-400">{item.companyName}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-300">
                        {item.status}
                      </span>
                      <p className="mt-2 text-xs text-slate-400">{new Date(item.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Latest Notifications</h2>
              <Bell className="h-5 w-5 text-amber-400" />
            </div>
            <div className="space-y-3">
              {data.recentNotifications.length === 0 ? (
                <p className="text-sm text-slate-400">No notifications yet.</p>
              ) : (
                data.recentNotifications.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-800/60 p-3">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
