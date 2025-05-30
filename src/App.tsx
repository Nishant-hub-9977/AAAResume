import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ConfigurationError from './components/ConfigurationError';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { hasValidSupabaseCredentials } from './lib/supabase';

// Lazy load components
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/auth/SignupPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const ResumesPage = React.lazy(() => import('./pages/resumes/ResumesPage'));
const ResumeDetailPage = React.lazy(() => import('./pages/resumes/ResumeDetailPage'));
const JobsPage = React.lazy(() => import('./pages/jobs/JobsPage'));
const JobDetailPage = React.lazy(() => import('./pages/jobs/JobDetailPage'));
const ShortlistedPage = React.lazy(() => import('./pages/shortlisted/ShortlistedPage'));
const LandingPage = React.lazy(() => import('./pages/landing/LandingPage'));
const PrivacyPage = React.lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/legal/TermsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

function App() {
  // Check if we have valid Supabase credentials
  if (!hasValidSupabaseCredentials()) {
    return <ConfigurationError />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/resumes" element={
                  <ProtectedRoute>
                    <ResumesPage />
                  </ProtectedRoute>
                } />
                <Route path="/resumes/:id" element={
                  <ProtectedRoute>
                    <ResumeDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/jobs" element={
                  <ProtectedRoute>
                    <JobsPage />
                  </ProtectedRoute>
                } />
                <Route path="/jobs/:id" element={
                  <ProtectedRoute>
                    <JobDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/shortlisted" element={
                  <ProtectedRoute>
                    <ShortlistedPage />
                  </ProtectedRoute>
                } />
                
                {/* Fallback routes */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404\" replace />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;