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

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CLAIM_APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CLAIM_REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'ACTION_REFUSED':
        return 'bg-red-950/60 text-red-300 border-red-500/50 font-bold';
      case 'STATUS_CHANGE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'PAYMENT_ISSUED':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Verification Header Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-indigo-400" />
              SHA-256 Hash-Chained Audit Ledger
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {logs.length} Blocks Recorded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every accepted workflow transition and refused security action is immutably linked via cryptographic SHA-256 chaining.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50"
          >
            <ShieldCheck className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Verifying Hashes...' : 'Verify Cryptographic Integrity'}
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
            verification.valid
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          {verification.valid ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">
                {verification.valid
                  ? 'Cryptographic Chain Integrity 100% Verified'
                  : 'INTEGRITY MISMATCH DETECTED: Tamper Detected!'}
              </span>
              <span className="font-mono text-[11px] opacity-80">
                Verified at: {new Date(verification.verificationTimestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="opacity-90 leading-relaxed">
              {verification.valid
                ? `Sequential verification successful: Checked ${verification.totalRecordsChecked} audit records starting from Genesis hash. All parent hashes and block signatures match.`
                : verification.errorMessage}
            </p>
            <div className="pt-1 flex items-center gap-4 text-[11px] font-mono opacity-80">
              <span>Genesis: {verification.genesisHash.substring(0, 16)}...</span>
              <span>Ledger Tip: {verification.latestHash.substring(0, 16)}...</span>
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
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-slate-900 shadow-lg shadow-indigo-500/10'
                    : isRefused
                    ? 'border-rose-900/60 bg-rose-950/10 hover:border-rose-700'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-800 text-indigo-400 border border-slate-700">
                      #{log.sequenceNumber ?? index + 1}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-semibold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    {log.previousState && log.newState && (
                      <span className="text-xs text-slate-400 font-mono">
                        {log.previousState} → <strong className="text-white">{log.newState}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actor & Reason summary */}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-200">{log.actorEmail}</span> ({log.actorRole})
                  </span>
                  {log.insurerName && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {log.insurerName}
                    </span>
                  )}
                  {log.decisionReason && (
                    <p className={`w-full mt-1.5 text-xs leading-relaxed ${isRefused ? 'text-rose-300 font-medium' : 'text-slate-400'}`}>
                      💬 {log.decisionReason}
                    </p>
                  )}
                </div>

                {/* Cryptographic Hash Pair */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-400 truncate">
                    <span className="text-slate-500">Prev Hash:</span>
                    <code className="text-indigo-400/80 bg-slate-950 px-1.5 py-0.5 rounded truncate">
                      {log.previousHash}
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 truncate">
                    <span className="text-slate-500">Curr Hash:</span>
                    <code className="text-cyan-400/90 bg-slate-950 px-1.5 py-0.5 rounded truncate">
                      {log.currentHash}
                    </code>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-700/80 text-xs text-slate-300 space-y-1.5 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>Record ID: <span className="text-slate-400">{log.id}</span></div>
                      <div>Claim Ref: <span className="text-indigo-400">{log.claimId || 'N/A'}</span></div>
                      <div>IP Address: <span className="text-slate-400">{log.ipAddress || '127.0.0.1'}</span></div>
                      <div>Timestamp: <span className="text-slate-400">{log.timestamp}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Connecting Hash Link Arrow */}
              {index < logs.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="p-1 rounded-full bg-slate-800 text-indigo-400/80 border border-slate-700">
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
