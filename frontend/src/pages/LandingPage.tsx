import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Scale,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  FileCheck2,
  User,
  Users,
  Eye,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, quickSwitch } = useAuth();
  const navigate = useNavigate();

  const handleLaunchPersona = async (email: string, targetPath: string) => {
    await quickSwitch(email);
    navigate(targetPath);
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]"></div>
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 relative z-10 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            VORTEXA 3.0 Hackathon — Problem Statement B-02
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Transparent Multi-Insurer Claims &{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Cryptographic Audit
            </span>{' '}
            Platform
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate insurance opacity with <strong>deterministic claim eligibility</strong>, strict <strong>multi-tenant insurer data isolation</strong>, <strong>tamper-evident SHA-256 hash chains</strong>, and <strong>AI consistency advisories</strong> that never override human judgment.
          </p>

          {/* Quick CTA or dashboard link */}
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            {user ? (
              <button
                onClick={() => {
                  if (user.role === 'POLICYHOLDER') navigate('/policyholder/dashboard');
                  else if (user.role === 'CLAIMS_OFFICER' || user.role === 'SUPERVISOR') navigate('/officer/queue');
                  else if (user.role === 'INSURER_ADMIN') navigate('/insurer/admin');
                  else navigate('/auditor/portal');
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                Go to My Dashboard ({user.role})
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                Sign In to Platform
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={() => handleLaunchPersona('compliance.auditor@example.com', '/auditor/portal')}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4 text-indigo-400" />
              Verify Cryptographic Ledger
            </button>
          </div>
        </div>
      </section>

      {/* 1-Click Interactive Persona Switcher Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            1-Click Live Role Demonstration
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test full end-to-end multi-tenant workflows and authorization checks with pre-loaded demo personas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Policyholder */}
          <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase text-blue-400">Policyholder</span>
                <h3 className="text-base font-bold text-white">Sarah Jenkins</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enrolled in Apex Auto & Vortex Travel policies. Submit claims, inspect instant eligibility explanations and track status.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchPersona('sarah.policyholder@example.com', '/policyholder/dashboard')}
              className="mt-5 w-full py-2 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Launch Policyholder <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Claims Officer */}
          <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase text-amber-400">Claims Officer (Apex)</span>
                <h3 className="text-base font-bold text-white">James Miller</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Assigned to Apex Mutual. Review claims, inspect duplicate alerts, view advisory AI flags, transition workflow states.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchPersona('officer.apex@example.com', '/officer/queue')}
              className="mt-5 w-full py-2 rounded-lg bg-slate-800 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Launch Claims Officer <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Insurer Admin */}
          <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase text-purple-400">Insurer Admin (Apex)</span>
                <h3 className="text-base font-bold text-white">Marcus Thorne</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure policy limits, filing windows, excluded perils, view settlement volume, manage organization personnel.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchPersona('admin.apex@example.com', '/insurer/admin')}
              className="mt-5 w-full py-2 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Launch Insurer Admin <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Auditor & Compliance */}
          <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase text-emerald-400">Compliance Auditor</span>
                <h3 className="text-base font-bold text-white">Elena Vance</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Verify cryptographic SHA-256 hash chains, inspect refused unauthorized attempts across multi-tenant boundaries.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchPersona('compliance.auditor@example.com', '/auditor/portal')}
              className="mt-5 w-full py-2 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Launch Auditor Portal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Core Architectural Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Deterministic Rules Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every claim is evaluated through 5 explicit mathematical rules: policy active term, filing window compliance, excluded perils detection, coverage limit capping, and duplicate fingerprinting.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <LinkIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Cryptographic SHA-256 Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every state transition and refused unauthorized action is chained with SHA-256 cryptographic hashes. The live auditor tool verifies block signatures to detect any out-of-band database modification.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Advisory-Only AI Separation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complies strictly with Hackathon Requirement B-02: AI extracts entities and highlights narrative discrepancies as advisory prompts only, never overriding deterministic eligibility or altering state.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
