import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  FileText,
  CheckSquare,
  Building2,
  FileLock2,
  LogOut,
  ChevronDown,
  UserCheck,
  PlusCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const demoAccounts = [
    { label: 'Sarah Jenkins (Policyholder)', email: 'sarah.policyholder@example.com', role: 'POLICYHOLDER' },
    { label: 'David Chen (Policyholder)', email: 'david.policyholder@example.com', role: 'POLICYHOLDER' },
    { label: 'James Miller (Claims Officer - Apex)', email: 'officer.apex@example.com', role: 'CLAIMS_OFFICER' },
    { label: 'Victoria Sterling (Supervisor - Apex)', email: 'supervisor.apex@example.com', role: 'SUPERVISOR' },
    { label: 'Marcus Thorne (Admin - Apex)', email: 'admin.apex@example.com', role: 'INSURER_ADMIN' },
    { label: 'Elena Vance (Lead Auditor)', email: 'compliance.auditor@example.com', role: 'AUDITOR' },
    { label: 'Alexander Cross (Platform Admin)', email: 'platform.admin@example.com', role: 'PLATFORM_ADMIN' },
  ];

  const handleSwitch = async (email: string) => {
    setShowPersonaMenu(false);
    await quickSwitch(email);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  InsureChain
                </span>
                <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] uppercase font-mono font-semibold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                  VORTEXA 3.0
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center ml-8 space-x-1">
                {user.role === 'POLICYHOLDER' && (
                  <>
                    <Link
                      to="/policyholder/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/policyholder/dashboard')
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      My Dashboard
                    </Link>
                    <Link
                      to="/policyholder/submit"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/policyholder/submit')
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                      File Claim
                    </Link>
                  </>
                )}

                {(user.role === 'CLAIMS_OFFICER' || user.role === 'SUPERVISOR') && (
                  <Link
                    to="/officer/queue"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/officer/queue')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    Claims Review Queue
                  </Link>
                )}

                {user.role === 'INSURER_ADMIN' && (
                  <Link
                    to="/insurer/admin"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/insurer/admin')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    Insurer Administration
                  </Link>
                )}

                {(user.role === 'AUDITOR' || user.role === 'PLATFORM_ADMIN') && (
                  <Link
                    to="/auditor/portal"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/auditor/portal')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <FileLock2 className="w-4 h-4 text-indigo-400" />
                    Audit Ledger & Hash Chain
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right Action Menu: Demo Persona Switcher & User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Switcher Modal / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-sm"
                title="Switch demo persona instantly"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-200">1-Click Persona Switcher</p>
                    <p className="text-[11px] text-slate-400">Select any role to test RBAC & workflows instantly</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        onClick={() => handleSwitch(acc.email)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                          user?.email === acc.email
                            ? 'bg-indigo-600/30 text-indigo-200 font-semibold border border-indigo-500/40'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <span className="text-slate-100 font-medium">{acc.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">{acc.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Pill & Logout */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">{user.fullName}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {user.insurerName ? `${user.role} (${user.insurerName})` : user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all"
              >
                Sign In
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
