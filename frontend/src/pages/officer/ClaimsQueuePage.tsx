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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.claimReference.toLowerCase().includes(search.toLowerCase()) ||
      c.narrative.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.policyTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.insurerName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: claims.length,
    underReview: claims.filter((c) => c.status === 'UNDER_REVIEW').length,
    submitted: claims.filter((c) => c.status === 'SUBMITTED').length,
    approved: claims.filter((c) => c.status === 'APPROVED').length,
    duplicates: claims.filter((c) => c.duplicateSuspected).length,
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
              Claims Adjudication Queue
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-[#475569] border border-slate-200">
              {user?.insurerName || 'All Insurers'}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Review submitted claims, inspect deterministic rules evaluations, and execute state transitions.
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-1">
          <span className="text-xs text-[#64748B] font-medium">Total Queue Items</span>
          <div className="text-2xl font-bold font-mono text-[#0F172A]">{counts.all}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-1">
          <span className="text-xs text-amber-600 font-medium">Under Active Review</span>
          <div className="text-2xl font-bold font-mono text-amber-600">{counts.underReview}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-1">
          <span className="text-xs text-emerald-600 font-medium">Approved / Settled</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{counts.approved}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-1">
          <span className="text-xs text-rose-600 font-medium">Duplicate Warnings</span>
          <div className="text-2xl font-bold font-mono text-rose-600">{counts.duplicates}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Items', count: counts.all },
            { id: 'SUBMITTED', label: 'Submitted', count: counts.submitted },
            { id: 'UNDER_REVIEW', label: 'Under Review', count: counts.underReview },
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

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reference, narrative, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] placeholder:text-slate-400 font-medium focus:bg-white transition-colors"
          />
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
            <p className="text-[11px] text-[#64748B]">Try clearing the search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-4 font-mono">Reference</th>
                  <th className="py-3.5 px-4">Policy & Insurer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Incident Date</th>
                  <th className="py-3.5 px-4 text-right">Requested</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim) => (
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
                            Duplicate Alert
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

                    <td className="py-3.5 px-4 text-[#64748B] font-mono">
                      {claim.incidentDate}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0F172A]">
                      ₹{claim.requestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                        Review <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
