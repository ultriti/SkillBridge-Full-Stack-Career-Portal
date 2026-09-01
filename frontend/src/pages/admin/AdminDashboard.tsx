import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, Briefcase, Users, Workflow } from 'lucide-react';
import { dashboardService, type AdminDashboardResponse } from '../../services/dashboard.service';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboard = await dashboardService.getAdminDashboard();
        setData(dashboard);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load admin dashboard.');
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
      { label: 'Total Users', value: summary.totalUsers, icon: Users, accent: 'text-amber-400 bg-amber-500/10' },
      { label: 'Recruiters', value: summary.recruiterUsers, icon: Building2, accent: 'text-cyan-400 bg-cyan-500/10' },
      { label: 'Jobs', value: summary.totalJobs, icon: Briefcase, accent: 'text-indigo-400 bg-indigo-500/10' },
      { label: 'Applications', value: summary.totalApplications, icon: Workflow, accent: 'text-violet-400 bg-violet-500/10' },
    ];
  }, [data]);

  if (loading) {
    return <div className="p-10 text-center text-slate-300">Loading admin dashboard...</div>;
  }

  if (error || !data) {
    return <div className="max-w-3xl mx-auto mt-12 rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{error || 'Dashboard unavailable.'}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-amber-400">Admin Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Platform analytics</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, accent }) => (
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
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Application Status</h2>
              <BarChart3 className="h-5 w-5 text-amber-400" />
            </div>
            <div className="space-y-3">
              {data.charts.statusDistribution.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 p-3">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Top Jobs</h2>
            </div>
            <div className="space-y-3">
              {data.topJobs.length === 0 ? (
                <p className="text-sm text-slate-400">No jobs have received applications yet.</p>
              ) : (
                data.topJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 p-3">
                    <div>
                      <p className="font-medium text-white">{job.title}</p>
                    </div>
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                      {job.applications} applications
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">User Growth</h2>
            <div className="space-y-2 text-sm text-slate-300">
              {data.charts.userGrowth.length === 0 ? <p className="text-slate-400">No data.</p> : data.charts.userGrowth.map((point) => (
                <div key={point.label} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
                  <span>{point.label}</span>
                  <span className="font-semibold text-white">{point.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">Job Growth</h2>
            <div className="space-y-2 text-sm text-slate-300">
              {data.charts.jobGrowth.length === 0 ? <p className="text-slate-400">No data.</p> : data.charts.jobGrowth.map((point) => (
                <div key={point.label} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
                  <span>{point.label}</span>
                  <span className="font-semibold text-white">{point.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">Application Growth</h2>
            <div className="space-y-2 text-sm text-slate-300">
              {data.charts.applicationGrowth.length === 0 ? <p className="text-slate-400">No data.</p> : data.charts.applicationGrowth.map((point) => (
                <div key={point.label} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
                  <span>{point.label}</span>
                  <span className="font-semibold text-white">{point.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
