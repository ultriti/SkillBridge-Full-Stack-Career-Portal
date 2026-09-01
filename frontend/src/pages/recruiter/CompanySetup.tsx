import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { companyService } from '../../services/company.service';
import type { UpsertCompanyRequest } from '../../types/company.types';
import { Building, Save, ArrowLeft, CheckCircle2, AlertTriangle, Globe, MapPin, Image } from 'lucide-react';

export const CompanySetup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpsertCompanyRequest>({
    name: '',
    description: '',
    website: '',
    logo: '',
    industry: '',
    location: '',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const company = await companyService.getRecruiterCompany();
        if (company) {
          setFormData({
            name: company.name || '',
            description: company.description || '',
            website: company.website || '',
            logo: company.logo || '',
            industry: company.industry || '',
            location: company.location || '',
          });
        }
      } catch (err: any) {
        // Non-fatal if company does not exist yet
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await companyService.saveCompany(formData);
      setSuccessMsg('Company profile saved successfully!');
      setTimeout(() => {
        navigate('/recruiter/jobs/create');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Company Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center space-x-3">
            <Building className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Company Profile Setup</h1>
              <p className="text-slate-400 text-sm">Configure your organization details to publish jobs and attract top talent.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-xl text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-sm flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg} Redirecting to job creation...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Acme Corporation"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Industry</span>
                </label>
                <input
                  type="text"
                  name="industry"
                  placeholder="e.g. Information Technology & Services"
                  value={formData.industry || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Website URL</span>
                </label>
                <input
                  type="url"
                  name="website"
                  placeholder="e.g. https://acme.com"
                  value={formData.website || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Image className="w-4 h-4 text-emerald-400" />
                  <span>Logo Image URL</span>
                </label>
                <input
                  type="url"
                  name="logo"
                  placeholder="e.g. https://example.com/logo.png"
                  value={formData.logo || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Company Overview & Description
              </label>
              <textarea
                name="description"
                rows={5}
                placeholder="Share your company's mission, values, culture, and team vision..."
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg transition text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Profile...' : 'Save Company Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
