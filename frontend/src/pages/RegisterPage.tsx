import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  User,
  FileCheck2,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: 'Create Account | InsureChain Bharat',
    description: 'Register as an Indian policyholder, claims officer, insurer administrator, or IRDAI auditor.',
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'POLICYHOLDER' | 'CLAIMS_OFFICER' | 'INSURER_ADMIN' | 'AUDITOR'>('POLICYHOLDER');
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = [
    {
      id: 'POLICYHOLDER',
      title: 'Individual Policyholder / Buyer',
      badge: 'Most Popular',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: User,
      desc: 'Buy and compare health, motor, and term life policies. File cashless claims with instant pre-check simulations.',
    },
    {
      id: 'CLAIMS_OFFICER',
      title: 'Claims Adjudication Officer',
      badge: 'Adjudicator',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: FileCheck2,
      desc: 'Evaluate incoming claims with deterministic IRDAI rule checks, review AI damage summaries, and issue approvals.',
    },
    {
      id: 'INSURER_ADMIN',
      title: 'Insurance Company Administrator',
      badge: 'Underwriting',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Building2,
      desc: 'Configure underwriting guidelines, set coverage limits, manage staff rosters, and monitor financial liabilities.',
    },
    {
      id: 'AUDITOR',
      title: 'IRDAI Compliance & Security Auditor',
      badge: 'Regulatory',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Lock,
      desc: 'Inspect sequential SHA-256 cryptographic audit ledgers, verify hash integrity, and track security violation events.',
    },
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        role: selectedRole,
        insurerId: selectedRole === 'POLICYHOLDER' ? undefined : selectedInsurerId,
      });

      // Route to user's selected role destination
      if (selectedRole === 'POLICYHOLDER') {
        navigate('/policyholder/dashboard');
      } else if (selectedRole === 'CLAIMS_OFFICER') {
        navigate('/officer/queue');
      } else if (selectedRole === 'INSURER_ADMIN') {
        navigate('/insurer/admin');
      } else {
        navigate('/auditor/portal');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-grid-pattern">
      <div className="w-full max-w-xl space-y-6 animate-in fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] shadow-md flex items-center justify-center text-white ring-4 ring-slate-100">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {step === 1 ? 'Create Your InsureChain Account' : 'Choose Your Stakeholder Role'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            {step === 1
              ? 'Join India’s transparent multi-insurer policy and cryptographic claims network'
              : 'Select how you would like to participate in the InsureChain ecosystem'}
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className={`w-8 h-1.5 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-emerald-500'}`}></span>
            <span className={`w-8 h-1.5 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] bg-white transition-all shadow-2xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="rahul.sharma@example.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] bg-white transition-all shadow-2xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Mobile Number (India)</label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-mono font-bold text-[#475569]">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-3 pr-3.5 py-2.5 rounded-r-xl border border-slate-200 text-xs text-[#0F172A] bg-white transition-all shadow-2xs font-mono font-medium"
                />
              </div>
              <span className="text-[10px] text-[#64748B]">Used for instant IRDAI OTP & claim alerts</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] bg-white transition-all shadow-2xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 pt-3"
            >
              Continue to Choose Your Role
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[#64748B]">Already have an account? </span>
              <Link to="/login" className="text-xs font-semibold text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        ) : (
          /* Step 2: "What do you want to be?" Role Selector */
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 font-mono uppercase tracking-wider">
                Step 2 of 2: Role Selection
              </span>
              <h2 className="text-lg font-bold text-[#0F172A]">
                What role do you want to play on InsureChain?
              </h2>
              <p className="text-xs text-[#64748B]">
                Your interface, access rules, and permissions will be personalized immediately.
              </p>
            </div>

            <div className="space-y-3">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedRole === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedRole(opt.id as any)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-[#475569]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A]">{opt.title}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono border ${opt.badgeColor}`}>
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">{opt.desc}</p>
                    </div>

                    <div className="shrink-0 mt-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insurer Selector for Professional Roles */}
            {selectedRole !== 'POLICYHOLDER' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <label className="font-semibold text-[#0F172A] block">
                  Select Associated Insurance Organization:
                </label>
                <select
                  value={selectedInsurerId}
                  onChange={(e) => setSelectedInsurerId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs text-[#0F172A] font-medium"
                >
                  <option value="11111111-1111-1111-1111-111111111111">Apex Mutual Insurance (General & Health)</option>
                  <option value="22222222-2222-2222-2222-222222222222">Vortex Shield Assurance (Transit & Motor)</option>
                  <option value="33333333-3333-3333-3333-333333333333">Beacon Health & Casualty (Mediclaim Group)</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-[#475569] hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account & Setting Up Workspace...' : 'Complete Registration & Launch Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
