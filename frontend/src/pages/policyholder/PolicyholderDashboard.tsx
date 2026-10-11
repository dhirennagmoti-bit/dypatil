import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Policy, Claim } from '../../types';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Shield,
  PlusCircle,
  FileText,
  Clock,
  ArrowRight,
  AlertTriangle,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const PolicyholderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userPolicies, userClaims] = await Promise.all([
          api.policies.getMy(),
          api.claims.getAll(),
        ]);
        setPolicies(userPolicies);
        setClaims(userClaims);
      } catch (err: any) {
        console.error('Failed to load policyholder data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading policyholder dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Policyholder Portal</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Active Member
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Welcome back, <strong className="text-slate-200">{user?.fullName}</strong>. Review your enrolled insurance policies or file a new verified claim.
          </p>
        </div>

        <Link
          to="/policyholder/submit"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Submit New Claim
        </Link>
      </div>

      {/* Enrolled Policies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            My Active Insurance Policies ({policies.length})
          </h2>
          <span className="text-xs text-slate-400">Deterministic coverage limits & rules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => {
            let exclusions: string[] = [];
            try {
              exclusions = JSON.parse(policy.excludedCategories || '[]');
            } catch (_) {}

            return (
              <div
                key={policy.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">
                      {policy.insurerName}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{policy.title}</h3>
                    <span className="text-xs font-mono text-slate-400">#{policy.policyNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                {policy.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">{policy.description}</p>
                )}

                {/* Key Policy Parameters */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Coverage Limit</span>
                    <strong className="text-slate-200 font-mono">
                      ${policy.coverageLimit.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Deductible</span>
                    <strong className="text-slate-200 font-mono">
                      ${policy.deductible.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Filing Window</span>
                    <strong className="text-slate-200 font-mono">{policy.filingWindowDays} Days</strong>
                  </div>
                </div>

                {/* Excluded Perils */}
                {exclusions.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-500 block mb-1">Excluded Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {exclusions.map((ex, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/40 text-rose-300 border border-rose-900/40"
                        >
                          ⛔ {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submitted Claims History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            My Filed Claims & Evaluation History ({claims.length})
          </h2>
          <span className="text-xs text-slate-400">Live deterministic workflow tracking</span>
        </div>

        {claims.length === 0 ? (
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-slate-400 text-xs space-y-2">
            <p>You have not filed any claims yet.</p>
            <Link
              to="/policyholder/submit"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Submit your first claim <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                onClick={() => navigate(`/policyholder/claims/${claim.id}`)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-indigo-300">{claim.claimReference}</span>
                    <StatusBadge status={claim.status} size="sm" />
                    {claim.duplicateSuspected && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800 font-semibold">
                        ⚠️ Duplicate Warning
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{claim.policyTitle} ({claim.insurerName})</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{claim.narrative}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Requested Amount</span>
                    <span className="text-sm font-bold font-mono text-white">
                      ${claim.requestedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Incident Date</span>
                    <span className="text-xs font-mono text-slate-400">{claim.incidentDate}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
