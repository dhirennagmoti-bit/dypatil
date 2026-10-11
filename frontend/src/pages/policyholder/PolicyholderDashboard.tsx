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
  ArrowRight,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Sparkles,
  DollarSign,
  Building2,
  ShoppingBag,
  Zap,
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-[#64748B]">
        Loading your enrolled policies and claims in India...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Banner with Policybazaar-style Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003B73] via-[#00509D] to-[#002952] text-white p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Policyholder Portal</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-400/30">
              Verified Member 🇮🇳
            </span>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Welcome back, <strong className="text-white">{user?.fullName}</strong>. Review your active policy coverage, buy new policies, or file a cashless claim.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          <Link
            to="/policyholder/marketplace"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Buy New Policy
          </Link>
          <Link
            to="/policyholder/submit"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#003B73] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Claim
          </Link>
        </div>
      </div>

      {/* Policybazaar Quick Action Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/policyholder/marketplace')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card hover:border-blue-400 hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              AI Recommendation
            </span>
            <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors">
              Find Best Policy For You
            </h3>
            <p className="text-xs text-[#64748B]">Tailored to your family size & budget</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => navigate('/policyholder/marketplace')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card hover:border-blue-400 hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Compare 15+ Plans
            </span>
            <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors">
              Health, Motor & Term Life
            </h3>
            <p className="text-xs text-[#64748B]">Cashless network & 98.4% CSR</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => navigate('/policyholder/submit')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card hover:border-blue-400 hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Instant Pre-Check
            </span>
            <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors">
              File Fast Insurance Claim
            </h3>
            <p className="text-xs text-[#64748B]">Deterministic rule simulator</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Enrolled Policies Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            My Active Insurance Policies ({policies.length})
          </h2>
          <Link
            to="/policyholder/marketplace"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            + Add Another Policy <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {policies.length === 0 ? (
          <div className="p-8 rounded-3xl border border-slate-200 bg-white text-center space-y-3 shadow-card">
            <p className="text-xs text-[#64748B]">You do not have any active policies yet.</p>
            <Link
              to="/policyholder/marketplace"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Browse & Buy Policy in Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((policy) => {
              let exclusions: string[] = [];
              try {
                exclusions = JSON.parse(policy.excludedCategories || '[]');
              } catch (_) {}

              return (
                <div
                  key={policy.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-card transition-all space-y-3.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
                        {policy.insurerName}
                      </span>
                      <h3 className="text-base font-bold text-[#0F172A] mt-0.5">{policy.title}</h3>
                      <span className="text-xs font-mono text-[#64748B]">Plan #{policy.policyNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      ACTIVE
                    </span>
                  </div>

                  {policy.description && (
                    <p className="text-xs text-[#64748B] leading-relaxed">{policy.description}</p>
                  )}

                  {/* Key Policy Parameters in Indian Rupees */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[#64748B] block text-[10px] font-medium">Coverage Sum</span>
                      <strong className="text-[#0F172A] font-mono text-xs font-bold">
                        ₹{policy.coverageLimit.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[#64748B] block text-[10px] font-medium">Deductible</span>
                      <strong className="text-[#0F172A] font-mono text-xs font-bold">
                        ₹{policy.deductible.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[#64748B] block text-[10px] font-medium">Filing Window</span>
                      <strong className="text-[#0F172A] font-mono text-xs font-bold">{policy.filingWindowDays} Days</strong>
                    </div>
                  </div>

                  {/* Excluded Perils */}
                  {exclusions.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] text-[#64748B] block mb-1 font-semibold uppercase tracking-wider">
                        Excluded Perils:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {exclusions.map((ex, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200"
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
        )}
      </div>

      {/* Submitted Claims History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            My Filed Claims & Adjudication History ({claims.length})
          </h2>
          <span className="text-xs text-[#64748B]">Logged sequentially in SHA-256 audit ledger</span>
        </div>

        {claims.length === 0 ? (
          <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center text-[#64748B] text-xs space-y-2 shadow-card">
            <p>You have not filed any claims yet.</p>
            <Link
              to="/policyholder/submit"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold"
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
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-card transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-blue-600 group-hover:text-blue-700">
                      {claim.claimReference}
                    </span>
                    <StatusBadge status={claim.status} size="sm" />
                    {claim.duplicateSuspected && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                        ⚠️ Duplicate Warning
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#0F172A] font-semibold">{claim.policyTitle} ({claim.insurerName})</p>
                  <p className="text-xs text-[#64748B] line-clamp-1">{claim.narrative}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Claimed (₹)</span>
                    <span className="text-sm font-bold font-mono text-[#0F172A]">
                      ₹{claim.requestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Incident Date</span>
                    <span className="text-xs font-mono text-[#64748B]">{claim.incidentDate}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 text-[#64748B] group-hover:bg-[#003B73] group-hover:text-white transition-all">
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
