import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobSearchService } from '../../services/job-search.service';
import type { SavedSearchItem } from '../../types/job-search.types';
import { Bookmark, Bell, Search, Trash2, ArrowLeft, ExternalLink } from 'lucide-react';

export const SavedSearches: React.FC = () => {
  const navigate = useNavigate();

  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedSearches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobSearchService.getSavedSearches();
      setSavedSearches(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const handleRunSearch = (item: SavedSearchItem) => {
    const params = new URLSearchParams();
    if (item.query) params.set('q', item.query);

    const f = item.filters || {};
    if (f.location) params.set('location', f.location);
    if (f.workMode) params.set('workMode', f.workMode);
    if (f.jobType) params.set('jobType', f.jobType);
    if (f.experienceLevel) params.set('experienceLevel', f.experienceLevel);
    if (f.salaryMin) params.set('salaryMin', String(f.salaryMin));
    if (f.salaryMax) params.set('salaryMax', String(f.salaryMax));
    if (f.skills && Array.isArray(f.skills)) params.set('skills', f.skills.join(','));
    if (f.skillMatch) params.set('skillMatch', f.skillMatch);

    navigate(`/jobs?${params.toString()}`);
  };

  const handleToggleAlert = async (item: SavedSearchItem) => {
    try {
      const updated = await jobSearchService.updateSavedSearch(item.id, {
        alertEnabled: !item.alert_enabled,
      });
      setSavedSearches((prev) => prev.map((s) => (s.id === item.id ? updated : s)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle alert');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this saved search?')) return;
    try {
      await jobSearchService.deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete saved search');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          to="/jobs"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Search</span>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <Bookmark className="w-8 h-8 text-indigo-400" />
              <span>Saved Searches & <span className="text-indigo-400">Job Alerts</span></span>
            </h1>
            <p className="mt-1 text-slate-400">Run saved search profiles and manage real-time job match notifications.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Saved Searches Found</h3>
            <p className="text-slate-400 mb-6">Search jobs with custom filters and click "Save Search" to build alerts.</p>
            <Link
              to="/jobs"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
            >
              <Search className="w-4 h-4" />
              <span>Explore Jobs Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedSearches.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{item.name}</h3>
                    <button
                      onClick={() => handleToggleAlert(item)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition border ${
                        item.alert_enabled
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={item.alert_enabled ? 'Disable Job Alerts' : 'Enable Job Alerts'}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{item.alert_enabled ? 'Alerts ON' : 'Alerts OFF'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 text-xs text-slate-300">
                    {item.query && <div>• Keyword: <strong className="text-white">{item.query}</strong></div>}
                    {item.filters?.location && <div>• Location: <strong className="text-white">{item.filters.location}</strong></div>}
                    {item.filters?.workMode && <div>• Work Mode: <strong className="text-white">{item.filters.workMode}</strong></div>}
                    {item.filters?.jobType && <div>• Job Type: <strong className="text-white">{item.filters.jobType}</strong></div>}
                    {item.filters?.skills && Array.isArray(item.filters.skills) && item.filters.skills.length > 0 && (
                      <div>• Skills: <strong className="text-white">{item.filters.skills.join(', ')}</strong></div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-500">
                  <span>Saved on {new Date(item.created_at).toLocaleDateString()}</span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete saved search"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRunSearch(item)}
                      className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition shadow"
                    >
                      <span>Run Search</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
