import React, { useState, useEffect } from 'react';
import { resumeService } from '../../services/resume.service';
import type { ExtendedResume } from '../../types/resume-intelligence.types';
import {
  FileText,
  UploadCloud,
  Star,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';

export const StudentResumes: React.FC = () => {
  const [resumes, setResumes] = useState<ExtendedResume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resumeService.getStudentResumes();
      setResumes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      await resumeService.uploadResume(selectedFile);
      setSaveModalOpen(false);
      setSelectedFile(null);
      await fetchResumes();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await resumeService.setPrimaryResume(id);
      await fetchResumes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set primary resume');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume version?')) return;
    try {
      await resumeService.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await resumeService.retryProcessing(id);
      await fetchResumes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to retry processing');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center space-x-1 bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs px-2.5 py-1 rounded-full font-semibold animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Processing...</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-950 text-red-400 border border-red-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-slate-800 text-slate-400 border border-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const primaryResume = resumes.find((r) => r.is_default);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <FileText className="w-8 h-8 text-indigo-400" />
              <span>Resume Intelligence & <span className="text-indigo-400">Versions</span></span>
            </h1>
            <p className="mt-1 text-slate-400 text-base">
              Manage resume versions, view automated skill extraction results, and select your primary resume.
            </p>
          </div>

          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload New Version</span>
          </button>
        </div>

        {/* Resumes List Table */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-4 rounded-2xl text-center">
            {error}
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-6">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">No Resumes Uploaded Yet</h3>
            <p className="text-slate-400 mb-6">Upload a PDF resume to enable automated skill extraction and profile matching.</p>
            <button
              onClick={() => setSaveModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload PDF Resume</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-white uppercase text-xs tracking-wider">
                Resume Version History ({resumes.length})
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 overflow-x-auto">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-800/40 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold text-white tracking-tight">{resume.file_name}</span>
                      <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono font-bold">
                        v{resume.version}
                      </span>
                      {resume.is_default && (
                        <span className="inline-flex items-center space-x-1 bg-amber-950 text-amber-300 border border-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          <Star className="w-3 h-3 fill-amber-300" />
                          <span>Primary Resume</span>
                        </span>
                      )}
                      {renderStatusBadge(resume.processing_status)}
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                      <span>Uploaded {new Date(resume.created_at).toLocaleDateString()}</span>
                      {resume.file_size > 0 && <span>{(resume.file_size / 1024).toFixed(1)} KB</span>}
                      {resume.word_count > 0 && <span>{resume.word_count} words extracted</span>}
                    </div>

                    {resume.processing_error && (
                      <p className="text-xs text-red-400 font-medium pt-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{resume.processing_error}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {resume.processing_status === 'FAILED' && (
                      <button
                        onClick={() => handleRetry(resume.id)}
                        className="p-2 text-indigo-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Retry processing"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    {!resume.is_default && (
                      <button
                        onClick={() => handleSetPrimary(resume.id)}
                        className="text-xs text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-600 px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Make Primary</span>
                      </button>
                    )}

                    <a
                      href={resume.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Open PDF"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete resume version"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Text & Skills Summary */}
        {primaryResume && primaryResume.extracted_text && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Extracted Content Preview (Primary Resume)</h2>
            </div>
            <p className="text-xs text-slate-300 bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono leading-relaxed line-clamp-6 whitespace-pre-wrap">
              {primaryResume.extracted_text}
            </p>
          </div>
        )}

        {/* Upload Resume Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-800 pb-3 flex items-center space-x-3">
                <UploadCloud className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Upload Resume Version</h2>
              </div>

              {uploadError && (
                <div className="bg-red-950/60 border border-red-800 text-red-300 p-3.5 rounded-xl text-sm">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/60">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="resumeFileInput"
                  />
                  <label htmlFor="resumeFileInput" className="cursor-pointer space-y-2 block">
                    <FileCode className="w-10 h-10 text-indigo-400 mx-auto" />
                    <span className="block text-sm font-semibold text-white">
                      {selectedFile ? selectedFile.name : 'Click to select PDF resume file'}
                    </span>
                    <span className="block text-xs text-slate-500">PDF files only (Max 10MB)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-lg transition text-sm shadow disabled:opacity-50"
                  >
                    {uploading ? 'Uploading & Extracting...' : 'Upload Resume'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
