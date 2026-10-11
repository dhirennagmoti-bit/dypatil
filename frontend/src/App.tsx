import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PolicyholderDashboard } from './pages/policyholder/PolicyholderDashboard';
import { PolicyMarketplacePage } from './pages/policyholder/PolicyMarketplacePage';
import { SubmitClaimPage } from './pages/policyholder/SubmitClaimPage';
import { ClaimDetailPage } from './pages/policyholder/ClaimDetailPage';
import { ClaimsQueuePage } from './pages/officer/ClaimsQueuePage';
import { ClaimReviewDetailPage } from './pages/officer/ClaimReviewDetailPage';
import { InsurerAdminPage } from './pages/insurer/InsurerAdminPage';
import { AuditorPortalPage } from './pages/auditor/AuditorPortalPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2.5 text-xs text-[#64748B] font-medium bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Verifying security session...
        </div>
      </div>
    );
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
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#00509D] selection:text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/policyholder/marketplace" element={<PolicyMarketplacePage />} />

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

          {/* Premium Policybazaar-inspired Indian Footer */}
          <footer className="border-t border-slate-200 bg-white py-8 text-xs text-[#64748B]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    🛡️
                  </div>
                  <span className="font-bold text-[#0F172A] text-sm">InsureChain Bharat</span>
                  <span>— Multi-Insurer Claims & Cryptographic Audit Platform</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono text-[#475569]">
                  <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-bold">
                    IRDAI Reg. Sandbox
                  </span>
                  <span>100% SHA-256 Ledger</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
                <p>
                  *Insurance is subject matter of solicitation. Certified under VORTEXA 3.0 Hackathon Problem B-02.
                </p>
                <div className="flex items-center gap-3 font-mono">
                  <span>Mumbai • Bengaluru • Delhi NCR</span>
                  <span>•</span>
                  <span>Supabase PostgreSQL</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
