import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ClaimDetailResponse, ClaimStatus } from '../../types';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { EligibilityExplainer } from '../../components/EligibilityExplainer';
import { AiAdvisoryBanner } from '../../components/AiAdvisoryBanner';
import { DuplicateWarningBanner } from '../../components/DuplicateWarningBanner';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  DollarSign,
  ShieldAlert,
  Paperclip,
  Scale,
  Building2,
  User,
} from 'lucide-react';

export const ClaimReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [detail, setDetail] = useState<ClaimDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transition Modal State
  const [activeModal, setActiveModal] = useState<ClaimStatus | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const resp = await api.claims.getById(id);
      setDetail(resp);
      if (resp.eligibilityEvaluation) {
        setApprovedAmount(resp.eligibilityEvaluation.suggestedPayoutAmount);
      } else {
        setApprovedAmount(resp.claim.requestedAmount);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch claim review');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleExecuteTransition = async (targetStatus: ClaimStatus) => {
    if (!id || !decisionReason.trim()) {
      setActionError('Decision reason / justification is mandatory.');
      return;
    }

    setProcessing(true);
    setActionError(null);
    try {
      await api.claims.transition(id, {
        targetStatus,
        approvedAmount: targetStatus === 'APPROVED' ? Number(approvedAmount) : undefined,
        decisionReason,
      });

      setActiveModal(null);
      setDecisionReason('');
      await fetchDetail();
    } catch (err: any) {
      setActionError(err.message || 'Workflow transition failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">Loading claim review workspace...</div>;
  }

  if (error || !detail) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Claim not found or access denied.'}</p>
        <Link to="/officer/queue" className="text-xs text-indigo-400 underline">
          Return to Review Queue
        </Link>
      </div>
    );
  }

  const { claim, policy, evidence, eligibilityEvaluation, aiExtraction, auditLogs } = detail;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Back Navigation */}
      <Link
        to="/officer/queue"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Claims Queue
      </Link>

      {/* Main Review Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {claim.claimReference}
              </h1>
              <StatusBadge status={claim.status} size="lg" />
            </div>
            <p className="text-xs text-slate-400">
              Claimant: <strong className="text-slate-200">{claim.policyholderName}</strong> • Policy:{' '}
              <strong className="text-slate-200">{claim.policyTitle}</strong> ({claim.insurerName})
            </p>
          </div>

          {/* Workflow Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {claim.status === 'SUBMITTED' && (
              <button
                onClick={() => {
                  setDecisionReason('Commenced formal claims officer inspection.');
                  setActiveModal('UNDER_REVIEW');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Clock className="w-4 h-4" /> Move to Under Review
              </button>
            )}

            {(claim.status === 'UNDER_REVIEW' || claim.status === 'SUBMITTED') && (
              <>
                <button
                  onClick={() => {
                    setDecisionReason(
                      eligibilityEvaluation?.eligible
                        ? `Approved in accordance with deterministic rules. Payout: $${approvedAmount}.`
                        : 'Approved with officer override justification.'
                    );
                    setActiveModal('APPROVED');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Claim
                </button>

                <button
                  onClick={() => {
                    setDecisionReason(eligibilityEvaluation?.primaryExplanation || 'Claim rejected due to policy conditions.');
                    setActiveModal('REJECTED');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <XCircle className="w-4 h-4" /> Reject Claim
                </button>

                <button
                  onClick={() => {
                    setDecisionReason('Requesting supplemental mechanic receipt and official police incident certificate.');
                    setActiveModal('ADDITIONAL_INFO_REQUIRED');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <HelpCircle className="w-4 h-4" /> Request Info
                </button>
              </>
            )}

            {claim.status === 'APPROVED' && (
              <button
                onClick={() => {
                  setDecisionReason('Electronic claim payout settlement authorized.');
                  setActiveModal('PAID');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <DollarSign className="w-4 h-4" /> Issue Settlement Payment
              </button>
            )}
          </div>
        </div>

        {claim.duplicateSuspected && (
          <DuplicateWarningBanner
            fingerprint={claim.incidentFingerprint}
            reason={claim.duplicateReason}
          />
        )}
      </div>

      {/* Decision Execution Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Confirm Transition:</span>
                <span className="text-indigo-400 font-mono">{activeModal}</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Cancel
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-xs text-rose-300">
                {actionError}
              </div>
            )}

            {activeModal === 'APPROVED' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Approved Settlement Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-400 block">
                  Suggested deterministic payout: ${eligibilityEvaluation?.suggestedPayoutAmount.toLocaleString() || '0'}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Mandatory Decision Reason / Justification
              </label>
              <textarea
                rows={3}
                required
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Enter justification for audit ledger..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 block">
                This explanation will be cryptographically chained to the SHA-256 audit ledger.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleExecuteTransition(activeModal)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
              >
                {processing ? 'Recording to Ledger...' : 'Confirm & Commit Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Narrative & Amounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Narrative & Evidence Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Incident Narrative
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {claim.narrative}
            </p>
          </div>

          {evidence.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-400" />
                Submitted Evidence Files ({evidence.length})
              </h3>
              <div className="grid gap-2">
                {evidence.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block">{item.fileName}</span>
                      <span className="text-slate-400 text-[11px]">{item.description}</span>
                    </div>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium"
                    >
                      Inspect File
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Narrative Advisory Banner */}
          {aiExtraction && <AiAdvisoryBanner aiExtraction={aiExtraction} />}

          {/* Deterministic Rules Engine */}
          {eligibilityEvaluation && <EligibilityExplainer evaluation={eligibilityEvaluation} />}
        </div>

        {/* Sidebar Info & Policy Parameters */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 text-xs">
            <h3 className="font-bold text-white font-mono uppercase tracking-wider text-[11px]">
              Policy Parameters
            </h3>
            <div className="space-y-2 border-t border-slate-800 pt-2 text-slate-400">
              <div className="flex justify-between">
                <span>Coverage Limit:</span>
                <strong className="text-slate-200 font-mono">${policy?.coverageLimit.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Deductible:</span>
                <strong className="text-slate-200 font-mono">${policy?.deductible.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Filing Window:</span>
                <strong className="text-slate-200 font-mono">{policy?.filingWindowDays} Days</strong>
              </div>
              <div className="flex justify-between">
                <span>Incident Date:</span>
                <strong className="text-slate-200 font-mono">{claim.incidentDate}</strong>
              </div>
              <div className="flex justify-between">
                <span>Filing Date:</span>
                <strong className="text-slate-200 font-mono">{claim.filingDate}</strong>
              </div>
            </div>
          </div>

          {/* Audit History Snapshot */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 text-xs">
            <h3 className="font-bold text-white font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Claim Audit History ({auditLogs.length})
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                  <div className="flex items-center justify-between text-indigo-300 font-mono font-semibold">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-400 mt-1">{log.decisionReason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
