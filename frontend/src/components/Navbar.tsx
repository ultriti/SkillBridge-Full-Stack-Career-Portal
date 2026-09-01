import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Bookmark, PlusCircle, ShieldCheck, LogOut, LogIn, UserPlus, FileText, Users } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/jobs" className="flex items-center space-x-2 font-bold text-xl text-indigo-400 hover:text-indigo-300 transition">
              <Briefcase className="w-6 h-6 text-indigo-500" />
              <span>SkillBridge</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link to="/jobs" className="text-slate-300 hover:text-white transition">
              Browse Jobs
            </Link>

            {user && user.role === 'student' && (
              <>
                <Link to="/student/applications" className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>My Applications</span>
                </Link>
                <Link to="/student/saved-jobs" className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition">
                  <Bookmark className="w-4 h-4 text-indigo-400" />
                  <span>Saved Jobs</span>
                </Link>
              </>
            )}

            {user && user.role === 'recruiter' && (
              <>
                <Link to="/recruiter/jobs" className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>My Jobs</span>
                </Link>
                <Link to="/recruiter/applications" className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Applicants</span>
                </Link>
                <Link to="/recruiter/jobs/create" className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition font-medium">
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Job</span>
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <Link to="/admin/jobs" className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 transition">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Jobs</span>
                </Link>
                <Link to="/admin/applications" className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 transition">
                  <FileText className="w-4 h-4" />
                  <span>Admin Applications</span>
                </Link>
              </>
            )}
          </div>

          {/* User Profile / Auth Action */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-200">
                    {user.firstName} {user.lastName}
                  </div>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded uppercase font-semibold tracking-wider ${
                    user.role === 'admin' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    user.role === 'recruiter' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition text-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
