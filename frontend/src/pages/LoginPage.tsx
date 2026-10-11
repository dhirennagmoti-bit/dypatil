import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to InsureChain</h2>
          <p className="text-xs text-slate-400">Multi-Insurer Claims & Cryptographic Audit Platform</p>
        </div>

        {/* Demo Quick-Fill Buttons */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <UserCheck className="w-4 h-4" />
            <span>Quick Fill Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => quickFill('sarah.policyholder@example.com')}
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-left truncate"
            >
              👤 Sarah (Policyholder)
            </button>
            <button
              type="button"
              onClick={() => quickFill('david.policyholder@example.com')}
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-left truncate"
            >
              👤 David (Policyholder)
            </button>
            <button
              type="button"
              onClick={() => quickFill('officer.apex@example.com')}
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-left truncate"
            >
              📋 Officer (Apex Mutual)
            </button>
            <button
              type="button"
              onClick={() => quickFill('supervisor.apex@example.com')}
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-left truncate"
            >
              🎖️ Supervisor (Apex)
            </button>
            <button
              type="button"
              onClick={() => quickFill('admin.apex@example.com')}
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-left truncate"
            >
              🏢 Admin (Apex Mutual)
            </button>
            <button
              type="button"
              onClick={() => quickFill('compliance.auditor@example.com')}
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-left truncate"
            >
              🔍 Elena (Auditor)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
