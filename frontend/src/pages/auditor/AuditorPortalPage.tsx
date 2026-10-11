import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuditLog, Insurer } from '../../types';
import { api } from '../../api/client';
import { HashChainVisualizer } from '../../components/HashChainVisualizer';
import {
  FileLock2,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Building2,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';

export const AuditorPortalPage: React.FC = () => {
  const { user } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [auditLogs, allInsurers] = await Promise.all([
        api.audit.getLogs(selectedInsurerId !== 'ALL' ? { insurerId: selectedInsurerId } : {}),
        api.insurers.getAll(),
      ]);
      setLogs(auditLogs);
      setInsurers(allInsurers);
    } catch (e: any) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedInsurerId]);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter === 'ALL') return true;
    if (actionFilter === 'REFUSED') return log.action === 'ACTION_REFUSED';
    return log.action === actionFilter;
  });

  const refusedCount = logs.filter((l) => l.action === 'ACTION_REFUSED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-white border border-[#DDE1E6] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#183153] tracking-tight flex items-center gap-2">
              <FileLock2 className="w-6 h-6 text-[#42658A]" />
              Cryptographic Audit & Compliance Ledger
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              SHA-256 Chained
            </span>
          </div>
          <p className="text-xs text-[#5C6470]">
            Official Compliance & Verification: Accepted decisions and refused actions are recorded in tamper-detectable history.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#F7F7F4] border border-[#DDE1E6] text-right">
            <span className="text-[#5C6470] block text-[10px]">Total Ledger Blocks</span>
            <strong className="text-[#183153] text-base">{logs.length}</strong>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-right">
            <span className="text-rose-700 block text-[10px]">Refused Violations</span>
            <strong className="text-rose-800 text-base">{refusedCount}</strong>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#DDE1E6] shadow-sm">
        <div className="flex items-center gap-3">
          
          {/* Insurer Filter */}
          <div className="flex items-center gap-2 text-xs text-[#5C6470]">
            <Building2 className="w-4 h-4 text-[#42658A]" />
            <span>Insurer:</span>
            <select
              value={selectedInsurerId}
              onChange={(e) => setSelectedInsurerId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DDE1E6] text-xs text-[#252B33] focus:outline-none focus:border-[#183153]"
            >
              <option value="ALL">All Insurers (Cross-Platform)</option>
              {insurers.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#5C6470]">
            <Filter className="w-4 h-4 text-[#42658A]" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DDE1E6] text-xs text-[#252B33] focus:outline-none focus:border-[#183153]"
            >
              <option value="ALL">All Event Types</option>
              <option value="REFUSED">⚠️ Refused Security Actions Only</option>
              <option value="CLAIM_SUBMITTED">Claim Submitted</option>
              <option value="CLAIM_APPROVED">Claim Approved</option>
              <option value="CLAIM_REJECTED">Claim Rejected</option>
              <option value="PAYMENT_ISSUED">Payment Issued</option>
              <option value="STATUS_CHANGE">Status Changes</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 rounded-lg bg-[#183153] hover:bg-[#12243d] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Ledger
        </button>
      </div>

      {/* Hash Chain Visualizer Component */}
      {loading ? (
        <div className="text-center py-16 text-[#5C6470] text-xs">Loading audit ledger...</div>
      ) : (
        <HashChainVisualizer logs={filteredLogs} onRefresh={fetchLogs} />
      )}

    </div>
  );
};
