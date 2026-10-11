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
import { HelpSupportPage } from './pages/HelpSupportPage';
import { Link } from 'react-router-dom';

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

              {/* Help & Support Route */}
              <Route path="/help" element={<HelpSupportPage />} />

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
          <footer className="border-t border-slate-200 bg-white py-10 text-xs text-[#64748B]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              
              {/* Top Row: Brand & Regulatory Tag */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                    🛡️
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] text-sm block">InsureChain Bharat</span>
                    <span className="text-[11px] text-[#64748B]">Multi-Insurer Cashless Claims & Cryptographic Audit Ledger</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-[#475569]">
                  <span className="px-2.5 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200 font-bold">
                    IRDAI Sandbox Certified
                  </span>
                  <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                    SHA-256 Ledger
                  </span>
                </div>
              </div>

              {/* Middle Row: Navigation & Support Matrix */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
                <div className="space-y-2">
                  <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] font-mono">Insurance Products</h4>
                  <ul className="space-y-1.5 text-xs text-[#64748B]">
                    <li><Link to="/policyholder/marketplace" className="hover:text-blue-600 transition-colors">Health / Mediclaim</Link></li>
                    <li><Link to="/policyholder/marketplace" className="hover:text-blue-600 transition-colors">Car & 2-Wheeler Motor</Link></li>
                    <li><Link to="/policyholder/marketplace" className="hover:text-blue-600 transition-colors">Commercial & SME Fire</Link></li>
                    <li><Link to="/policyholder/marketplace" className="hover:text-blue-600 transition-colors">Compare All Plans</Link></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] font-mono">Claims & Platform</h4>
                  <ul className="space-y-1.5 text-xs text-[#64748B]">
                    <li><Link to="/policyholder/submit" className="hover:text-blue-600 transition-colors">File Cashless Claim</Link></li>
                    <li><Link to="/policyholder/dashboard" className="hover:text-blue-600 transition-colors">My Policies & Claims</Link></li>
                    <li><Link to="/officer/queue" className="hover:text-blue-600 transition-colors">Claims Adjudication Queue</Link></li>
                    <li><Link to="/auditor/portal" className="hover:text-blue-600 transition-colors">IRDAI Audit Chain Verification</Link></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] font-mono">Help & Expert Guidance</h4>
                  <ul className="space-y-1.5 text-xs text-[#64748B]">
                    <li><Link to="/help" className="hover:text-blue-600 font-semibold text-blue-600 transition-colors">Help & Support Center</Link></li>
                    <li><Link to="/help" className="hover:text-blue-600 transition-colors">Talk to IRDAI Expert</Link></li>
                    <li><Link to="/help" className="hover:text-blue-600 transition-colors">Request Instant Callback</Link></li>
                    <li><Link to="/help" className="hover:text-blue-600 transition-colors">Frequently Asked Questions</Link></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] font-mono">Contact & Redressal</h4>
                  <div className="space-y-1.5 text-xs text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#0F172A]">Email:</span>
                      <a href="mailto:insureclaimsupport@gmail.com" className="text-blue-600 hover:underline font-mono font-bold">
                        insureclaimsupport@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#0F172A]">Toll-Free:</span>
                      <a href="tel:18002584433" className="font-mono text-[#0F172A] hover:text-blue-600 font-semibold">
                        1800-258-4433
                      </a>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] pt-1">
                      24x7 All-India Consumer Assistance
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Legal & Disclaimer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-100 text-[11px] text-[#94A3B8]">
                <p>
                  *Insurance is subject matter of solicitation. Adjudication models certified under VORTEXA 3.0 Hackathon Problem B-02.
                </p>
                <div className="flex items-center gap-3 font-mono">
                  <span>Mumbai • Bengaluru • Delhi NCR</span>
                  <span>•</span>
                  <span>Supabase PostgreSQL (AWS ap-northeast-1)</span>
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
