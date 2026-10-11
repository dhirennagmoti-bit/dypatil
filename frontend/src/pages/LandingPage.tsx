import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Scale,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  User,
  FileCheck2,
  Building2,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight,
  Heart,
  Car,
  Plane,
  ShoppingBag,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, quickSwitch } = useAuth();
  const navigate = useNavigate();

  const handleLaunchPersona = async (email: string, targetPath: string) => {
    await quickSwitch(email);
    navigate(targetPath);
  };

  const categories = [
    {
      title: 'Health Insurance',
      sub: '₹5L - ₹1Cr Cover • 10,000+ Hospitals',
      tag: 'Save Tax 80D',
      icon: Heart,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Car Insurance',
      sub: 'Instant Zero-Dep • Cashless Garages',
      tag: 'Up to 50% Off',
      icon: Car,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: '2-Wheeler (Bike)',
      sub: 'Third-party & Own Damage Protection',
      tag: 'Starting ₹499/yr',
      icon: Zap,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      title: 'Travel Insurance',
      sub: 'Medical Emergencies & Flight Delays',
      tag: 'Worldwide',
      icon: Plane,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Commercial Property',
      sub: 'Shop, Warehouse & Fire Insurance',
      tag: 'SME Protection',
      icon: Building2,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Smart AI Recommender',
      sub: 'Find the best matched policy for you',
      tag: 'AI Powered',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
  ];

  const personas = [
    {
      role: 'Policyholder',
      name: 'Rahul Sharma',
      email: 'sarah.policyholder@example.com',
      path: '/policyholder/dashboard',
      description: 'Enrolled in Comprehensive Health & Car insurance. Buy new policies, simulate payouts & file cashless claims.',
      icon: User,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      actionLabel: 'Enter as Policyholder',
    },
    {
      role: 'Claims Officer',
      name: 'Rajesh Verma',
      email: 'officer.apex@example.com',
      path: '/officer/queue',
      description: 'Adjudicate Indian claims with deterministic IRDAI rules breakdown, AI advisory notes, and tamper-resistant audit logs.',
      icon: FileCheck2,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionLabel: 'Enter as Claims Officer',
    },
    {
      role: 'Insurer Admin',
      name: 'Marcus Thorne',
      email: 'admin.apex@example.com',
      path: '/insurer/admin',
      description: 'Manage underwriting policy rules, coverage limits in ₹, excluded perils, staff rosters, and financial ratios.',
      icon: Building2,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      actionLabel: 'Enter as Insurer Admin',
    },
    {
      role: 'IRDAI Auditor',
      name: 'Ananya Sen',
      email: 'compliance.auditor@example.com',
      path: '/auditor/portal',
      description: 'Inspect sequential SHA-256 hash chains, verify cryptographic ledger integrity, and audit rejected claims.',
      icon: Lock,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      actionLabel: 'Enter as Auditor',
    },
  ];

  return (
    <div className="space-y-16 pb-20">

      {/* Policybazaar-Style Vibrant Indian Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#003B73] via-[#00509D] to-[#002952] text-white pt-16 pb-24 border-b border-blue-900 shadow-lg">
        <div className="absolute inset-0 bg-grid-dark opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-400/40 bg-orange-500/20 text-orange-200 text-xs font-bold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              IRDAI Sandbox • VORTEXA 3.0 Hackathon Problem B-02
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              India’s Most Trusted Multi-Insurer Claims & Policy Marketplace
            </h1>

            <p className="text-base sm:text-lg text-blue-100 leading-relaxed font-normal max-w-2xl">
              Compare & buy health, motor, and commercial insurance plans with instant deterministic eligibility, 100% cashless network assistance, and cryptographic SHA-256 audit trails.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/policyholder/marketplace"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore & Compare Policies
              </Link>

              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#003B73] font-bold text-xs transition-all shadow-md flex items-center gap-2"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => handleLaunchPersona('compliance.auditor@example.com', '/auditor/portal')}
                className="px-5 py-3.5 rounded-xl border border-blue-400/30 bg-blue-900/40 hover:bg-blue-800/50 text-blue-100 font-semibold text-xs transition-all backdrop-blur-md flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4 text-teal-400" />
                Verify IRDAI Audit Ledger
              </button>
            </div>

            {/* Quick KPI stats strip with Indian Rupee figures */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-blue-800/80">
              <div>
                <span className="block text-xl sm:text-2xl font-bold font-mono text-white">10,000+</span>
                <span className="text-xs text-blue-200">Cashless Hospitals</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold font-mono text-orange-300">₹1.2 Crore</span>
                <span className="text-xs text-blue-200">Settled Liability</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold font-mono text-emerald-300">98.6%</span>
                <span className="text-xs text-blue-200">IRDAI Settlement Ratio</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold font-mono text-teal-300">SHA-256</span>
                <span className="text-xs text-blue-200">Chained Hash Ledger</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Policybazaar-Style Interactive Category Tiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Compare and Buy Insurance Plans in India
              </h2>
              <p className="text-xs text-[#64748B]">
                Instant quote comparison across Star Health, Apex Mutual, HDFC ERGO & Vortex Shield.
              </p>
            </div>
            <Link
              to="/policyholder/marketplace"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
            >
              View All 15+ Plans <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate('/policyholder/marketplace')}
                  className="p-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-blue-500 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {cat.tag}
                    </span>
                    <h3 className="text-xs font-bold text-[#0F172A] mt-1 group-hover:text-blue-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] text-[#64748B] mt-0.5 leading-tight">
                      {cat.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Personas Quick Launcher */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
              Live Interactive Walkthrough
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Test Any Stakeholder Role with Indian Demo Profiles
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-[#475569]">
            Pre-seeded with Live Claims & Policies
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.email}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-card transition-all flex flex-col justify-between space-y-4 group shadow-card"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0F172A] group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${p.badgeColor}`}>
                      {p.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{p.name}</h3>
                    <span className="text-[11px] font-mono text-[#64748B] block">{p.email}</span>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchPersona(p.email, p.path)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0F172A] hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>{p.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4 Core Architectural Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
            Architecture Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Built for Transparent Insurance Adjudication
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Engineered to fulfill all official requirements of VORTEXA 3.0 Problem B-02.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Deterministic Rules Engine</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Filing deadlines, peril exclusions, deductibles in ₹, and coverage limits are evaluated mathematically without hallucinating AI payout amounts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <LinkIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Cryptographic Audit Chain</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Every state transition and refused access event is permanently linked via SHA-256 hashes. Any database tampering causes sequential integrity failures.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Multi-Tenant Isolation</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Competing Indian insurers cannot view or adjudicate claims from competing underwriters. Permissions are strictly enforced on backend APIs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Advisory-Only AI Support</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              AI parses unstructured police narratives and flags inconsistencies, but the human claims supervisor retains absolute authority over approvals.
            </p>
          </div>

        </div>
      </section>

      {/* Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#003B73] to-[#002952] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-emerald-300">
                Transparent & Verifiable
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to find the ideal policy or audit claim logs?
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Explore India's verified insurance plans or inspect sequential cryptographic proofs live from Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/policyholder/marketplace"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-md"
            >
              Explore Marketplace
            </Link>
            <button
              onClick={() => handleLaunchPersona('compliance.auditor@example.com', '/auditor/portal')}
              className="px-5 py-3 rounded-xl bg-white text-[#003B73] hover:bg-slate-100 font-bold text-xs transition-all shadow-md"
            >
              Launch Auditor Portal
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
