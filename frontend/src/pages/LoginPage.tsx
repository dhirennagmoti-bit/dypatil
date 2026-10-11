import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, KeyRound, Check, Sparkles, UserPlus } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('sarah.policyholder@example.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password123!');
  };

  const demoUsers = [
    { label: 'Rahul Sharma', role: 'Policyholder', email: 'sarah.policyholder@example.com', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Priya Patel', role: 'Policyholder', email: 'david.policyholder@example.com', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Rajesh Verma', role: 'Claims Officer', email: 'officer.apex@example.com', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Vikram Malhotra', role: 'Supervisor', email: 'supervisor.apex@example.com', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Marcus Thorne', role: 'Insurer Admin', email: 'admin.apex@example.com', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Ananya Sen', role: 'IRDAI Auditor', email: 'compliance.auditor@example.com', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  ];

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-grid-pattern">
      <div className="w-full max-w-md space-y-6 animate-in fade-in">

        {/* Brand Emblem & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 shadow-md flex items-center justify-center text-white ring-4 ring-slate-100">
            <Shield className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Sign in to InsureChain Bharat
          </h2>
          <p className="text-xs text-[#64748B]">
            India’s Multi-Insurer Claims & Cryptographic Audit Network
          </p>
        </div>

        {/* Demo Fast Selector Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              1-Click Demo Profiles (India):
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">Password: Password123!</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((u) => {
              const isSelected = email === u.email;
              return (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => quickFill(u.email)}
                  className={`p-2.5 rounded-xl text-left transition-all border text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400 text-blue-900 font-semibold'
                      : 'bg-slate-50 border-slate-200/80 text-[#334155] hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-semibold">{u.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                  <span className={`mt-1 inline-block w-fit px-1.5 py-0.2 rounded text-[10px] font-mono border ${u.badge}`}>
                    {u.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Main Sign-In Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] bg-white transition-all shadow-2xs placeholder:text-slate-400 font-medium"
                placeholder="name@example.in"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1E293B]">Password</label>
              <span className="text-[11px] text-blue-600 font-medium">Auto-filled</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] bg-white transition-all shadow-2xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating with Backend...' : 'Sign in to InsureChain'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Create Account Link Banner */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-2xs">
          <span className="text-xs text-[#64748B] block">New to InsureChain Bharat?</span>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <UserPlus className="w-4 h-4" />
            Create an Account & Choose Your Role <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
