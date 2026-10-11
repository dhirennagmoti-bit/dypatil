import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
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
  ShoppingBag,
  HelpCircle,
  Globe,
  Headphones,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitch } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const personaRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const demoAccounts = [
    { label: 'Rahul Sharma', roleDesc: 'Policyholder', email: 'sarah.policyholder@example.com', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Priya Patel', roleDesc: 'Policyholder', email: 'david.policyholder@example.com', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Rajesh Verma', roleDesc: 'Claims Officer', email: 'officer.apex@example.com', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Vikram Malhotra', roleDesc: 'Supervisor', email: 'supervisor.apex@example.com', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Marcus Thorne', roleDesc: 'Insurer Admin', email: 'admin.apex@example.com', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Ananya Sen', roleDesc: 'IRDAI Auditor', email: 'compliance.auditor@example.com', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  ];

  const languages: Array<{ code: Language; label: string; native: string }> = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setShowPersonaMenu(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
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
        ? 'bg-[#0F172A] text-white shadow-2xs'
        : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
    }`;

  const currentLangLabel = languages.find((l) => l.code === language)?.native || 'English';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Brand Identity & Primary Nav */}
          <div className="flex items-center gap-7">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003B73] to-[#001F3F] shadow-xs flex items-center justify-center text-white ring-1 ring-slate-800/10 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-[#0F172A] tracking-tight">
                    InsureChain
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200">
                    Bharat
                  </span>
                </div>
                <span className="text-[10px] text-[#64748B] font-medium leading-none">
                  IRDAI Multi-Insurer Sandbox
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-slate-200">
              <Link to="/policyholder/marketplace" className={navLinkClass('/policyholder/marketplace')}>
                <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                Buy Insurance
              </Link>

              <Link to="/help" className={navLinkClass('/help')}>
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Help & Support
              </Link>

              {user && user.role === 'POLICYHOLDER' && (
                <>
                  <Link to="/policyholder/dashboard" className={navLinkClass('/policyholder/dashboard')}>
                    <FileText className="w-3.5 h-3.5" />
                    My Policies
                  </Link>
                  <Link to="/policyholder/submit" className={navLinkClass('/policyholder/submit')}>
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    File Claim
                  </Link>
                </>
              )}

              {user && user.role === 'CLAIMS_OFFICER' && (
                <Link to="/officer/queue" className={navLinkClass('/officer/queue')}>
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                  Claims Queue
                </Link>
              )}

              {user && user.role === 'SUPERVISOR' && (
                <Link to="/supervisor/queue" className={navLinkClass('/supervisor/queue')}>
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  Supervisor Queue
                </Link>
              )}

              {user && user.role === 'INSURER_ADMIN' && (
                <Link to="/insurer/admin" className={navLinkClass('/insurer/admin')}>
                  <Building2 className="w-3.5 h-3.5" />
                  Insurer Hub
                </Link>
              )}

              {user && (user.role === 'AUDITOR' || user.role === 'PLATFORM_ADMIN') && (
                <Link to="/auditor/portal" className={navLinkClass('/auditor/portal')}>
                  <FileLock2 className="w-3.5 h-3.5" />
                  Audit Ledger
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Multi-Language Selector Dropdown (English, Hindi, Marathi) */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#334155] transition-colors"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-xs">{currentLangLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Language / भाषा
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        language === l.code ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-[#0F172A]'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] font-mono text-slate-400">({l.label})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Talk to Expert Link */}
            <Link
              to="/help"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50/60 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Headphones className="w-3.5 h-3.5 text-orange-600" />
              <span>Expert</span>
            </Link>

            {/* Demo Personas Dropdown */}
            <div className="relative" ref={personaRef}>
              <button
                type="button"
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#1E293B] transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      1-Click Profiles
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold font-mono">Indian Personas</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleSwitch(acc.email)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs ${
                          user?.email === acc.email ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-[#0F172A]">{acc.label}</div>
                          <div className="text-[10px] font-mono text-slate-400">{acc.email}</div>
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

            {/* Auth Buttons or Active User */}
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#0F172A] leading-tight">{user.fullName}</span>
                  <span className="text-[10px] font-mono font-semibold text-blue-700">
                    {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-1">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-[#003B73] hover:bg-[#002952] text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-[#0F172A] hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Nav Drawer */}
        {showMobileNav && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1.5">
            <Link
              to="/policyholder/marketplace"
              onClick={() => setShowMobileNav(false)}
              className="block px-3 py-2 text-xs font-bold text-orange-600 rounded-lg hover:bg-slate-100"
            >
              🛍️ Buy Insurance (Marketplace)
            </Link>
            <Link
              to="/help"
              onClick={() => setShowMobileNav(false)}
              className="block px-3 py-2 text-xs font-bold text-blue-600 rounded-lg hover:bg-slate-100 flex items-center justify-between"
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
                  className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-slate-100"
                >
                  My Policies & Claims
                </Link>
                <Link
                  to="/policyholder/submit"
                  onClick={() => setShowMobileNav(false)}
                  className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-slate-100"
                >
                  File Claim
                </Link>
              </>
            )}

            {user && user.role === 'CLAIMS_OFFICER' && (
              <Link
                to="/officer/queue"
                onClick={() => setShowMobileNav(false)}
                className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-slate-100"
              >
                Claims Queue
              </Link>
            )}

            {user && user.role === 'SUPERVISOR' && (
              <Link
                to="/supervisor/queue"
                onClick={() => setShowMobileNav(false)}
                className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-slate-100"
              >
                Supervisor Queue
              </Link>
            )}

            {user && user.role === 'INSURER_ADMIN' && (
              <Link
                to="/insurer/admin"
                onClick={() => setShowMobileNav(false)}
                className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-slate-100"
              >
                Insurer Hub & Settlements
              </Link>
            )}

            {user && (user.role === 'AUDITOR' || user.role === 'PLATFORM_ADMIN') && (
              <Link
                to="/auditor/portal"
                onClick={() => setShowMobileNav(false)}
                className="block px-3 py-2 text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-slate-100"
              >
                IRDAI Audit Ledger
              </Link>
            )}

            {/* Language Selector in Mobile Drawer */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 px-3">
              <span className="text-xs text-slate-500 font-semibold">Language:</span>
              <div className="flex gap-1.5">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setShowMobileNav(false);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      language === l.code ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {l.native}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
