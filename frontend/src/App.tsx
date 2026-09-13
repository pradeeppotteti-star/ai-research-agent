import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewResearchPage } from './pages/NewResearchPage';
import { ResearchProgressPage } from './pages/ResearchProgressPage';
import { ResearchResultsPage } from './pages/ResearchResultsPage';
import { PaperDetailsPage } from './pages/PaperDetailsPage';
import { PaperComparisonPage } from './pages/PaperComparisonPage';
import { ResearchHistoryPage } from './pages/ResearchHistoryPage';
import { SavedPapersPage } from './pages/SavedPapersPage';
import { GeneratedReportPage } from './pages/GeneratedReportPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Application Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/research/new"
                element={
                  <ProtectedRoute>
                    <NewResearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/research/progress/:id"
                element={
                  <ProtectedRoute>
                    <ResearchProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/research/:id"
                element={
                  <ProtectedRoute>
                    <ResearchResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/research/compare"
                element={
                  <ProtectedRoute>
                    <PaperComparisonPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/papers/:id"
                element={
                  <ProtectedRoute>
                    <PaperDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <ResearchHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved-papers"
                element={
                  <ProtectedRoute>
                    <SavedPapersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/:id"
                element={
                  <ProtectedRoute>
                    <GeneratedReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

