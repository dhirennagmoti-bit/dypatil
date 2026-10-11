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
  Paperclip,
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
      setActionError('Decision reason is mandatory.');
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
    return <div className="max-w-screen-xl mx-auto px-4 py-16 text-center text-sm text-ink-muted">Loading claim details…</div>;
  }

  if (error || !detail) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-sm text-accent-error">{error || 'Claim not found or access denied.'}</p>
        <Link to="/officer/queue" className="text-sm text-navy-500 hover:text-navy-700 underline">
          Return to Claims Queue
        </Link>
      </div>
    );
  }

  const { claim, policy, evidence, eligibilityEvaluation, aiExtraction, auditLogs } = detail;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Breadcrumb */}
      <Link
        to="/officer/queue"
        className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Claims Queue
      </Link>

      {/* Page Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg font-semibold font-mono text-ink">{claim.claimReference}</h1>
              <StatusBadge status={claim.status} size="md" />
            </div>
            <p className="text-sm text-ink-muted">
              {claim.policyholderName} · {claim.policyTitle} · {claim.insurerName}
            </p>
          </div>

          {/* Workflow Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {claim.status === 'SUBMITTED' && (
              <button
                onClick={() => {
                  setDecisionReason('Commenced formal review.');
                  setActiveModal('UNDER_REVIEW');
                }}
                className="px-3.5 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" /> Start Review
              </button>
            )}

            {(claim.status === 'UNDER_REVIEW' || claim.status === 'SUBMITTED') && (
              <>
                <button
                  onClick={() => {
                    setDecisionReason(
                      eligibilityEvaluation?.eligible
                        ? `Approved per eligibility rules. Payout: $${approvedAmount}.`
                        : 'Approved with officer override.'
                    );
                    setActiveModal('APPROVED');
                  }}
                  className="px-3.5 py-2 rounded bg-accent-success hover:opacity-90 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => {
                    setDecisionReason(eligibilityEvaluation?.primaryExplanation || 'Rejected due to policy conditions.');
                    setActiveModal('REJECTED');
                  }}
                  className="px-3.5 py-2 rounded bg-accent-error hover:opacity-90 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => {
                    setDecisionReason('Additional documentation required.');
                    setActiveModal('ADDITIONAL_INFO_REQUIRED');
                  }}
                  className="px-3.5 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Request Info
                </button>
              </>
            )}

            {claim.status === 'APPROVED' && (
              <button
                onClick={() => {
                  setDecisionReason('Settlement payment authorized.');
                  setActiveModal('PAID');
                }}
                className="px-3.5 py-2 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" /> Issue Payment
              </button>
            )}
          </div>
        </div>

        {/* Duplicate Warning */}
        {claim.duplicateSuspected && (
          <div className="mt-4">
            <DuplicateWarningBanner
              fingerprint={claim.incidentFingerprint}
              reason={claim.duplicateReason}
            />
          </div>
        )}
      </div>

      {/* Transition Confirmation Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-lg border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-ink">
                Confirm Transition: <span className="font-mono text-navy-700">{activeModal}</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-ink-muted hover:text-ink text-sm px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {actionError && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                  {actionError}
                </div>
              )}

              {activeModal === 'APPROVED' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink">Approved Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded border border-gray-300 text-sm text-ink font-mono bg-white"
                  />
                  <p className="text-[11px] text-ink-muted">
                    Suggested payout: ₹{eligibilityEvaluation?.suggestedPayoutAmount.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink">Decision Reason (required)</label>
                <textarea
                  rows={3}
                  required
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Justification for audit ledger…"
                  className="w-full p-3 rounded border border-gray-300 text-sm text-ink bg-white resize-none"
                />
                <p className="text-[11px] text-ink-muted">
                  This will be cryptographically chained to the SHA-256 audit ledger.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded border border-gray-300 text-ink-muted text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleExecuteTransition(activeModal)}
                className="px-4 py-2 rounded bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                {processing ? 'Recording…' : 'Confirm & Commit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Narrative, Evidence, AI, Eligibility */}
        <div className="lg:col-span-2 space-y-5">

          {/* Narrative */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
              Incident Narrative
            </h3>
            <p className="text-sm text-ink leading-relaxed bg-gray-50 p-4 rounded border border-gray-100">
              {claim.narrative}
            </p>
          </div>

          {/* Evidence */}
          {evidence.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Evidence ({evidence.length})
              </h3>
              <div className="space-y-2">
                {evidence.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded border border-gray-100 bg-gray-50 flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-medium text-ink">{item.fileName}</span>
                      {item.description && (
                        <span className="text-xs text-ink-muted block">{item.description}</span>
                      )}
                    </div>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded border border-gray-200 text-xs font-medium text-navy-700 hover:bg-gray-100 transition-colors"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Advisory */}
          {aiExtraction && <AiAdvisoryBanner aiExtraction={aiExtraction} />}

          {/* Eligibility */}
          {eligibilityEvaluation && <EligibilityExplainer evaluation={eligibilityEvaluation} />}
        </div>

        {/* Right Sidebar: Policy + Audit */}
        <div className="space-y-5">

          {/* Claim Amounts */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
              Financial Summary
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Requested</dt>
                <dd className="font-mono font-medium text-ink">₹{claim.requestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</dd>
              </div>
              {claim.approvedAmount != null && (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Approved</dt>
                  <dd className="font-mono font-medium text-accent-success">₹{claim.approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-muted">Category</dt>
                <dd className="text-ink">{claim.category}</dd>
              </div>
            </dl>
          </div>

          {/* Policy Parameters */}
          {policy && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
                Policy Terms
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Coverage Limit</dt>
                  <dd className="font-mono font-medium text-ink">₹{policy.coverageLimit.toLocaleString('en-IN')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Deductible</dt>
                  <dd className="font-mono font-medium text-ink">₹{policy.deductible.toLocaleString('en-IN')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Filing Window</dt>
                  <dd className="text-ink">{policy.filingWindowDays} days</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Incident Date</dt>
                  <dd className="font-mono text-ink">{claim.incidentDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Filing Date</dt>
                  <dd className="font-mono text-ink">{claim.filingDate}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Audit History */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Audit History ({auditLogs.length})
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded border border-gray-100 bg-gray-50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-medium text-navy-700">{log.action}</span>
                    <span className="text-ink-faint">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-ink-muted">{log.actorEmail} ({log.actorRole})</p>
                  {log.decisionReason && (
                    <p className="text-ink-muted mt-1 italic">{log.decisionReason}</p>
                  )}
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-xs text-ink-muted py-2">No audit events recorded yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
