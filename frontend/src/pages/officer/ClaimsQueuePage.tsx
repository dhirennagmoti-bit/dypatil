import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Claim, ClaimStatus } from '../../types';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import {
  CheckSquare,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Building2,
  RefreshCw,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';

export const ClaimsQueuePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    user?.role === 'SUPERVISOR' ? 'PENDING_SUPERVISOR_REVIEW' : 'ALL'
  );
  const [highValueOnly, setHighValueOnly] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const data = await api.claims.getAll();
      setClaims(data);
    } catch (err: any) {
      console.error('Failed to load queue claims', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const filteredClaims = claims.filter((c) => {
    const isHigh = c.highValue || (c.requestedAmount >= (c.highValueThreshold || 500000));
    if (highValueOnly && !isHigh) return false;

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.claimReference.toLowerCase().includes(search.toLowerCase()) ||
      c.narrative.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.policyTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.insurerName.toLowerCase().includes(search.toLowerCase()) ||
      (c.officerRecommendation && c.officerRecommendation.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: claims.length,
    submitted: claims.filter((c) => c.status === 'SUBMITTED').length,
    underReview: claims.filter((c) => c.status === 'UNDER_REVIEW').length,
    pendingSupervisor: claims.filter((c) => c.status === 'PENDING_SUPERVISOR_REVIEW').length,
    approved: claims.filter((c) => c.status === 'APPROVED').length,
    paid: claims.filter((c) => c.status === 'PAID').length,
    duplicates: claims.filter((c) => c.duplicateSuspected).length,
    highValue: claims.filter((c) => c.highValue || (c.requestedAmount >= (c.highValueThreshold || 500000))).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              {user?.role === 'SUPERVISOR' ? 'Supervisor Claims Decision Queue' : 'Claims Adjudication Queue'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-[#475569] border border-slate-200">
              {user?.insurerName || 'All Insurers'}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Role: {user?.role}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            {user?.role === 'SUPERVISOR'
              ? 'Evaluate claims officer recommendations, review compliance checklists, and render justified decisions on high-value and escalated claims.'
              : 'Review submitted claims, inspect deterministic rules evaluations, and submit officer recommendations.'}
          </p>
        </div>

        <button
          onClick={fetchClaims}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#334155] flex items-center gap-2 transition-all shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-1">
          <span className="text-xs text-[#64748B] font-medium">Total Claims</span>
          <div className="text-2xl font-bold font-mono text-[#0F172A]">{counts.all}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-1">
          <span className="text-xs text-amber-600 font-medium">Officer Review</span>
          <div className="text-2xl font-bold font-mono text-amber-600">{counts.underReview}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-card space-y-1">
          <span className="text-xs text-blue-600 font-bold">Pending Supervisor</span>
          <div className="text-2xl font-bold font-mono text-blue-700">{counts.pendingSupervisor}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-1">
          <span className="text-xs text-emerald-600 font-medium">Approved / Settled</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{counts.approved + counts.paid}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-card space-y-1">
          <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
            ⚡ High-Value (₹5L+)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-800">{counts.highValue}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Items', count: counts.all },
            { id: 'SUBMITTED', label: 'Submitted', count: counts.submitted },
            { id: 'UNDER_REVIEW', label: 'In Review', count: counts.underReview },
            { id: 'PENDING_SUPERVISOR_REVIEW', label: 'Supervisor Queue', count: counts.pendingSupervisor },
            { id: 'APPROVED', label: 'Approved', count: counts.approved },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-slate-50 text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-[#475569]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* High Value Toggle & Search Input */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setHighValueOnly(!highValueOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              highValueOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>⚡ High-Value Only</span>
            <span className={`text-[10px] px-1.5 rounded-full ${highValueOnly ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {counts.highValue}
            </span>
          </button>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, officer rec..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] placeholder:text-slate-400 font-medium focus:bg-white transition-colors"
            />
          </div>
        </div>

      </div>

      {/* Main Queue Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading queue records...</div>
        ) : filteredClaims.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CheckSquare className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
            <p className="text-xs font-semibold text-[#0F172A]">No claims match the selected criteria</p>
            <p className="text-[11px] text-[#64748B]">Try clearing the search or high-value filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-4 font-mono">Reference</th>
                  <th className="py-3.5 px-4">Policy & Insurer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Officer Rec.</th>
                  <th className="py-3.5 px-4">Incident Date</th>
                  <th className="py-3.5 px-4 text-right">Requested</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim) => {
                  const isHigh = claim.highValue || (claim.requestedAmount >= (claim.highValueThreshold || 500000));
                  return (
                    <tr
                      key={claim.id}
                      onClick={() => navigate(`/officer/claims/${claim.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-blue-600 group-hover:text-blue-700">
                            {claim.claimReference}
                          </span>
                          {claim.duplicateSuspected && (
                            <span className="block w-fit px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Duplicate Collision
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-[#0F172A] block">{claim.policyTitle}</span>
                          <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#94A3B8]" />
                            {claim.insurerName} • <span className="font-medium text-[#475569]">{claim.category}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        {claim.officerRecommendation ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            claim.officerRecommendation === 'APPROVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {claim.officerRecommendation}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B] font-mono">
                        {claim.incidentDate}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[#0F172A] block">
                            ₹{claim.requestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          {isHigh && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              ⚡ High-Value
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                          Review <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
