import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Jobs } from './pages/public/Jobs';
import { JobDetails } from './pages/public/JobDetails';
import { RecruiterJobs } from './pages/recruiter/RecruiterJobs';
import { CreateJob } from './pages/recruiter/CreateJob';
import { EditJob } from './pages/recruiter/EditJob';
import { SavedJobs } from './pages/student/SavedJobs';
import { AdminJobs } from './pages/admin/AdminJobs';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/jobs" replace />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/student/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <SavedJobs />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Routes */}
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/create"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <CreateJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/edit"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <EditJob />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminJobs />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/jobs" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
