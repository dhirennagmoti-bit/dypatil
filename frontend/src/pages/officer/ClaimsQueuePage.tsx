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
  AlertTriangle,
  ArrowRight,
  Shield,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ClaimsQueuePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchClaims() {
      try {
        const data = await api.claims.getAll();
        setClaims(data);
      } catch (err: any) {
        console.error('Failed to fetch claims', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, []);

  const filtered = claims.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.claimReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.policyholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.narrative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-indigo-400" />
              Claims Review & Adjudication Queue
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Authorized Insurer Organization:{' '}
            <strong className="text-slate-200">{user?.insurerName || 'Cross-Insurer Platform'}</strong> • Multi-tenant data isolation strictly enforced.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Claims in Queue</span>
          <span className="text-2xl font-bold font-mono text-white">{claims.length}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ref, policyholder, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* Claims List Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading review queue...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
          No claims matching the selected filters.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((claim) => (
            <div
              key={claim.id}
              onClick={() => navigate(`/officer/claims/${claim.id}`)}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-indigo-300">{claim.claimReference}</span>
                  <StatusBadge status={claim.status} size="sm" />
                  
                  {claim.duplicateSuspected && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Duplicate Suspected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="text-slate-200 font-medium">Policyholder: {claim.policyholderName}</span>
                  <span>Policy: {claim.policyTitle}</span>
                  <span className="font-mono">Category: {claim.category}</span>
                  <span className="font-mono">Incident: {claim.incidentDate}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">{claim.narrative}</p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Requested Amount</span>
                  <span className="text-base font-bold font-mono text-white">
                    ${claim.requestedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  {claim.approvedAmount !== null && claim.approvedAmount !== undefined && (
                    <span className="text-[11px] font-mono text-emerald-400 block">
                      Approved: ${claim.approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
