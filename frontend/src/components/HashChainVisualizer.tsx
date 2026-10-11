import React, { useState } from 'react';
import { AuditLog, HashChainVerificationResult } from '../types';
import { api } from '../api/client';
import {
  Link as LinkIcon,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Hash,
  ArrowDown,
  User,
  Clock,
  AlertOctagon,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  logs: AuditLog[];
  onRefresh?: () => void;
}

export const HashChainVisualizer: React.FC<Props> = ({ logs, onRefresh }) => {
  const [verification, setVerification] = useState<HashChainVerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<AuditLog | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await api.audit.verifyChain();
      setVerification(result);
    } catch (e: any) {
      alert('Verification error: ' + e.message);
    } finally {
      setVerifying(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CLAIM_APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLAIM_REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ACTION_REFUSED':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'STATUS_CHANGE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PAYMENT_ISSUED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Verification Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <LinkIcon className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              SHA-256 Hash-Chained Audit Ledger
            </h3>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {logs.length} Blocks
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1.5">
            Every accepted workflow transition and refused security violation is immutably linked via sequential SHA-256 parent hash pointers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#64748B] transition-all shadow-2xs"
              title="Refresh ledger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md"
          >
            <ShieldCheck className={`w-4 h-4 text-teal-400 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Computing SHA-256 Hashes...' : 'Verify Ledger Integrity'}
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verification && (
        <div
          className={`p-5 rounded-2xl border text-xs flex items-start gap-3.5 transition-all shadow-sm ${
            verification.valid
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}
        >
          {verification.valid ? (
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-sm">
                {verification.valid
                  ? 'Sequential Cryptographic Hash Chain: 100% Intact & Verified'
                  : 'INTEGRITY MISMATCH DETECTED: Database Tampering Found!'}
              </span>
              <span className="font-mono text-[11px] text-emerald-800">
                Timestamp: {new Date(verification.verificationTimestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="leading-relaxed text-emerald-900/90 text-xs">
              {verification.valid
                ? `Sequential verification successful: Checked ${verification.totalRecordsChecked} records from Genesis hash. All parent hashes and block signatures match.`
                : verification.errorMessage}
            </p>
            <div className="pt-1.5 flex flex-wrap items-center gap-4 text-[11px] font-mono text-emerald-800/80 border-t border-emerald-200/60">
              <span>Genesis: {verification.genesisHash.substring(0, 16)}...</span>
              <span>•</span>
              <span>Tip Block: {verification.latestHash.substring(0, 16)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Sequential Hash Chain Blocks */}
      <div className="relative space-y-3">
        {logs.map((log, index) => {
          const isSelected = selectedBlock?.id === log.id;
          const isRefused = log.action === 'ACTION_REFUSED';

          return (
            <div key={log.id} className="relative">
              
              {/* Block Card */}
              <div
                onClick={() => setSelectedBlock(isSelected ? null : log)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-card ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20'
                    : isRefused
                    ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-slate-100 text-[#0F172A] border border-slate-200">
                      Block #{log.sequenceNumber ?? index + 1}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-semibold ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    {log.previousState && log.newState && (
                      <span className="text-xs text-[#64748B] font-mono">
                        {log.previousState} → <strong className="text-[#0F172A]">{log.newState}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actor & Reason summary */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#334155]">
                  <span className="flex items-center gap-1 text-[#64748B]">
                    <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span className="text-[#0F172A] font-semibold">{log.actorEmail}</span> ({log.actorRole})
                  </span>
                  {log.insurerName && (
                    <span className="flex items-center gap-1 text-[#64748B]">
                      <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {log.insurerName}
                    </span>
                  )}
                  {log.decisionReason && (
                    <p className={`w-full mt-2 text-xs leading-relaxed p-2.5 rounded-lg border ${
                      isRefused
                        ? 'bg-rose-100/60 text-rose-800 border-rose-200 font-semibold'
                        : 'bg-slate-50 text-[#334155] border-slate-100'
                    }`}>
                      💬 {log.decisionReason}
                    </p>
                  )}
                </div>

                {/* Cryptographic Hash Pair */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-[#64748B] truncate">
                    <span className="text-[#94A3B8] font-bold">Prev Hash:</span>
                    <code className="text-[#475569] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 truncate">
                      {log.previousHash}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B] truncate">
                    <span className="text-[#94A3B8] font-bold">Curr Hash:</span>
                    <code className="text-[#0F172A] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-bold truncate">
                      {log.currentHash}
                    </code>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-[#334155] space-y-1.5 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>Record ID: <span className="text-[#64748B]">{log.id}</span></div>
                      <div>Claim Ref: <span className="text-blue-600 font-semibold">{log.claimId || 'N/A'}</span></div>
                      <div>IP Address: <span className="text-[#64748B]">{log.ipAddress || '127.0.0.1'}</span></div>
                      <div>Timestamp: <span className="text-[#64748B]">{log.timestamp}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Connecting Hash Arrow Link */}
              {index < logs.length - 1 && (
                <div className="flex justify-center my-1.5">
                  <div className="p-1 rounded-full bg-white text-slate-400 border border-slate-200 shadow-2xs">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
