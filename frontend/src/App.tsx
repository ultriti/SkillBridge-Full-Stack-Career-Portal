import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Jobs } from './pages/public/Jobs';
import { JobDetails } from './pages/public/JobDetails';
import { RecruiterJobs } from './pages/recruiter/RecruiterJobs';
import { CreateJob } from './pages/recruiter/CreateJob';
import { EditJob } from './pages/recruiter/EditJob';
import { CompanySetup } from './pages/recruiter/CompanySetup';
import { SavedJobs } from './pages/student/SavedJobs';
import { SavedSearches } from './pages/student/SavedSearches';
import { AdminJobs } from './pages/admin/AdminJobs';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { NotificationsPage } from './pages/Notifications';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

import { StudentApplications } from './pages/student/StudentApplications';
import { StudentApplicationDetailsPage } from './pages/student/StudentApplicationDetails';
import { RecruiterApplications } from './pages/recruiter/RecruiterApplications';
import { RecruiterApplicationDetailsPage } from './pages/recruiter/RecruiterApplicationDetails';
import { AdminApplications } from './pages/admin/AdminApplications';
import { AdminApplicationDetailsPage } from './pages/admin/AdminApplicationDetails';

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
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

                {/* Dashboard Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Authenticated Notification Center */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/student/saved-jobs"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <SavedJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/saved-searches"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <SavedSearches />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/applications"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/applications/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentApplicationDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Recruiter Routes */}
                <Route
                  path="/recruiter/company"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <CompanySetup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/company/setup"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <CompanySetup />
                    </ProtectedRoute>
                  }
                />
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
                <Route
                  path="/recruiter/applications"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <RecruiterApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/applications/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <RecruiterApplicationDetailsPage />
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
                <Route
                  path="/admin/applications"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/applications/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminApplicationDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/jobs" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
