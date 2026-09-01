import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Briefcase, FileText, Users, TrendingUp } from 'lucide-react';
import { dashboardService, type RecruiterDashboardResponse } from '../../services/dashboard.service';

export const RecruiterDashboard: React.FC = () => {
  const [data, setData] = useState<RecruiterDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboard = await dashboardService.getRecruiterDashboard();
        setData(dashboard);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load recruiter dashboard.');
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
      { label: 'Total Jobs', value: summary.totalJobs, icon: Briefcase, accent: 'text-emerald-400 bg-emerald-500/10' },
      { label: 'Active Jobs', value: summary.activeJobs, icon: TrendingUp, accent: 'text-sky-400 bg-sky-500/10' },
      { label: 'Applications', value: summary.totalApplications, icon: FileText, accent: 'text-indigo-400 bg-indigo-500/10' },
      { label: 'Shortlisted', value: summary.shortlistedCandidates, icon: Users, accent: 'text-violet-400 bg-violet-500/10' },
    ];
  }, [data]);

  if (loading) {
    return <div className="p-10 text-center text-slate-300">Loading recruiter dashboard...</div>;
  }

  if (error || !data) {
    return <div className="max-w-3xl mx-auto mt-12 rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">{error || 'Dashboard unavailable.'}</div>;
  }

  const maxFunnelValue = Math.max(1, ...data.charts.funnel.map((item) => item.value));

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">Recruiter Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Hiring dashboard</h1>
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

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Candidate Pipeline</h2>
              <BarChart3 className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="space-y-4">
              {data.charts.funnel.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                      style={{ width: `${(item.value / maxFunnelValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Application Mix</h2>
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
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">Recent Applications</h2>
            <div className="space-y-3">
              {data.recentApplications.length === 0 ? (
                <p className="text-sm text-slate-400">No applications received yet.</p>
              ) : (
                data.recentApplications.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 p-3">
                    <div>
                      <p className="font-medium text-white">{item.jobTitle}</p>
                      <p className="text-sm text-slate-400">{item.companyName}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
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
            <h2 className="mb-5 text-xl font-semibold text-white">Job Performance</h2>
            <div className="space-y-3">
              {data.jobPerformance.length === 0 ? (
                <p className="text-sm text-slate-400">No job data available.</p>
              ) : (
                data.jobPerformance.map((job) => (
                  <div key={job.id} className="rounded-xl border border-slate-800 bg-slate-800/60 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{job.title}</p>
                      <span className="text-sm text-slate-300">{job.applications} applicants</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                      <div className="rounded-lg bg-slate-900 p-2">
                        <p className="text-slate-500">Shortlisted</p>
                        <p className="mt-1 text-base font-semibold text-white">{job.shortlisted}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900 p-2">
                        <p className="text-slate-500">Interview</p>
                        <p className="mt-1 text-base font-semibold text-white">{job.interviews}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900 p-2">
                        <p className="text-slate-500">Selected</p>
                        <p className="mt-1 text-base font-semibold text-white">{job.selected}</p>
                      </div>
                    </div>
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
