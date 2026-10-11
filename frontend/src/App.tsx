import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PolicyholderDashboard } from './pages/policyholder/PolicyholderDashboard';
import { SubmitClaimPage } from './pages/policyholder/SubmitClaimPage';
import { ClaimDetailPage } from './pages/policyholder/ClaimDetailPage';
import { ClaimsQueuePage } from './pages/officer/ClaimsQueuePage';
import { ClaimReviewDetailPage } from './pages/officer/ClaimReviewDetailPage';
import { InsurerAdminPage } from './pages/insurer/InsurerAdminPage';
import { AuditorPortalPage } from './pages/auditor/AuditorPortalPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="text-center py-20 text-slate-400">Verifying session...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Policyholder Portal Routes */}
              <Route
                path="/policyholder/dashboard"
                element={
                  <ProtectedRoute>
                    <PolicyholderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/policyholder/submit"
                element={
                  <ProtectedRoute>
                    <SubmitClaimPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/policyholder/claims/:id"
                element={
                  <ProtectedRoute>
                    <ClaimDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Claims Officer & Supervisor Routes */}
              <Route
                path="/officer/queue"
                element={
                  <ProtectedRoute>
                    <ClaimsQueuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/claims/:id"
                element={
                  <ProtectedRoute>
                    <ClaimReviewDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Insurer Administration Routes */}
              <Route
                path="/insurer/admin"
                element={
                  <ProtectedRoute>
                    <InsurerAdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Auditor & Compliance Routes */}
              <Route
                path="/auditor/portal"
                element={
                  <ProtectedRoute>
                    <AuditorPortalPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-4 text-slate-400">
              <span>InsureChain Platform</span>
              <span>•</span>
              <span>VORTEXA 3.0 Hackathon (Problem B-02)</span>
              <span>•</span>
              <span>Supabase PostgreSQL 17.11</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Deterministic Claim Evaluation Engine • SHA-256 Cryptographic Audit Ledger • Advisory AI Separation
            </p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
