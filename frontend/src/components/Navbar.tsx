import React, { useState, useRef, useEffect } from 'react';
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
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  Zap,
  HelpCircle,
  PhoneCall,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  const demoAccounts = [
    { label: 'Rahul Sharma', roleDesc: 'Policyholder', email: 'sarah.policyholder@example.com', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Priya Patel', roleDesc: 'Policyholder', email: 'david.policyholder@example.com', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Rajesh Verma', roleDesc: 'Claims Officer', email: 'officer.apex@example.com', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Vikram Malhotra', roleDesc: 'Supervisor', email: 'supervisor.apex@example.com', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Marcus Thorne', roleDesc: 'Insurer Admin', email: 'admin.apex@example.com', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Ananya Sen', roleDesc: 'IRDAI Auditor', email: 'compliance.auditor@example.com', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setShowPersonaMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = async (email: string) => {
    setShowPersonaMenu(false);
    await quickSwitch(email);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
      isActive(path)
        ? 'bg-[#0F172A] text-white shadow-xs'
        : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/80'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 shadow-sm flex items-center justify-center text-white ring-1 ring-slate-800/10 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#0F172A] tracking-tight leading-tight flex items-center gap-1.5">
                  InsureChain
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-orange-50 text-orange-700 border border-orange-200">
                    🇮🇳 Bharat
                  </span>
                </span>
                <span className="text-[10px] text-[#64748B] font-medium tracking-tight">
                  IRDAI Multi-Insurer Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-2 pl-4 border-l border-slate-200">
              {/* Marketplace / Buy Policy link (Always accessible) */}
              <Link to="/policyholder/marketplace" className={navLinkClass('/policyholder/marketplace')}>
                <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                Buy Insurance
                <span className="text-[9px] px-1 py-0.2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded font-bold uppercase">
                  Compare
                </span>
              </Link>

              {user && user.role === 'POLICYHOLDER' && (
                <>
                  <Link to="/policyholder/dashboard" className={navLinkClass('/policyholder/dashboard')}>
                    <FileText className="w-3.5 h-3.5" />
                    My Policies
                  </Link>
                  <Link to="/policyholder/submit" className={navLinkClass('/policyholder/submit')}>
                    <PlusCircle className="w-3.5 h-3.5" />
                    File Claim
                  </Link>
                </>
              )}

              {user && (user.role === 'CLAIMS_OFFICER' || user.role === 'SUPERVISOR') && (
                <Link to="/officer/queue" className={navLinkClass('/officer/queue')}>
                  <CheckSquare className="w-3.5 h-3.5" />
                  Claims Queue
                </Link>
              )}

              {user && user.role === 'INSURER_ADMIN' && (
                <Link to="/insurer/admin" className={navLinkClass('/insurer/admin')}>
                  <Building2 className="w-3.5 h-3.5" />
                  Underwriting Portal
                </Link>
              )}

              {user && (user.role === 'AUDITOR' || user.role === 'PLATFORM_ADMIN') && (
                <Link to="/auditor/portal" className={navLinkClass('/auditor/portal')}>
                  <FileLock2 className="w-3.5 h-3.5" />
                  IRDAI Audit Ledger
                </Link>
              )}

              {/* Help & Support Nav Link */}
              <Link to="/help" className={navLinkClass('/help')}>
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Help & Support
              </Link>
            </nav>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            
            {/* Talk to Expert CTA Button */}
            <Link
              to="/help"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Talk to Expert</span>
            </Link>

            {/* Cashless Hospital Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              10,000+ Cashless Hospitals
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative" ref={personaRef}>
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#1E293B] transition-all shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                      1-Click Demo Profiles
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold font-mono">Indian Personas</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        onClick={() => handleSwitch(acc.email)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs ${
                          user?.email === acc.email ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-[#0F172A]">{acc.label}</div>
                          <div className="text-[10px] font-mono text-[#64748B]">{acc.email}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${acc.badge}`}>
                          {acc.roleDesc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Session Chip or Login/Register Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#0F172A] leading-tight">{user.fullName}</span>
                  <span className="text-[10px] font-mono font-semibold text-blue-700">
                    {user.role} {user.insurerName ? `• ${user.insurerName}` : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[#64748B] transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Nav Button */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="md:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
            >
              {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Nav Drawer */}
        {showMobileNav && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            <Link
              to="/policyholder/marketplace"
              onClick={() => setShowMobileNav(false)}
              className="block px-3 py-2 text-xs font-bold text-orange-600 rounded hover:bg-slate-100"
            >
              🛍️ Buy Insurance (Marketplace)
            </Link>
            <Link
              to="/help"
              onClick={() => setShowMobileNav(false)}
              className="block px-3 py-2 text-xs font-bold text-blue-600 rounded hover:bg-slate-100 flex items-center justify-between"
            >
              <span>🎧 Help & Support Center</span>
              <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-mono font-bold">
                Talk to Expert
              </span>
            </Link>
            {user && user.role === 'POLICYHOLDER' && (
              <>
                <Link
                  to="/policyholder/dashboard"
                  onClick={() => setShowMobileNav(false)}
                  className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded hover:bg-slate-100"
                >
                  My Policies & Claims
                </Link>
                <Link
                  to="/policyholder/submit"
                  onClick={() => setShowMobileNav(false)}
                  className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded hover:bg-slate-100"
                >
                  File Claim
                </Link>
              </>
            )}
            {user && (user.role === 'CLAIMS_OFFICER' || user.role === 'SUPERVISOR') && (
              <Link
                to="/officer/queue"
                onClick={() => setShowMobileNav(false)}
                className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded hover:bg-slate-100"
              >
                Claims Queue
              </Link>
            )}
            {user && user.role === 'INSURER_ADMIN' && (
              <Link
                to="/insurer/admin"
                onClick={() => setShowMobileNav(false)}
                className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded hover:bg-slate-100"
              >
                Underwriting & Staff
              </Link>
            )}
            {user && (user.role === 'AUDITOR' || user.role === 'PLATFORM_ADMIN') && (
              <Link
                to="/auditor/portal"
                onClick={() => setShowMobileNav(false)}
                className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded hover:bg-slate-100"
              >
                IRDAI Audit Ledger
              </Link>
            )}
            {!user && (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setShowMobileNav(false)}
                  className="block px-3 py-2 text-xs font-semibold text-center border border-slate-200 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowMobileNav(false)}
                  className="block px-3 py-2 text-xs font-bold text-center bg-blue-600 text-white rounded-lg"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
