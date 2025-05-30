import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ConfigurationError from './components/ConfigurationError';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { hasValidSupabaseCredentials } from './lib/supabase';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ResumesPage from './pages/resumes/ResumesPage';
import ResumeDetailPage from './pages/resumes/ResumeDetailPage';
import JobsPage from './pages/jobs/JobsPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import ShortlistedPage from './pages/shortlisted/ShortlistedPage';
import LandingPage from './pages/landing/LandingPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

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
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}