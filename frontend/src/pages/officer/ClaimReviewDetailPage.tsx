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
  const [officerRecommendation, setOfficerRecommendation] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [settlementReference, setSettlementReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
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

    if (targetStatus === 'PENDING_SUPERVISOR_REVIEW' && !officerRecommendation) {
      setActionError('Please select a formal recommendation (APPROVE or REJECT).');
      return;
    }

    if (targetStatus === 'PAID' && !settlementReference.trim()) {
      setActionError('Settlement / NEFT transaction reference is mandatory for payment.');
      return;
    }

    setProcessing(true);
    setActionError(null);
    try {
      await api.claims.transition(id, {
        targetStatus,
        approvedAmount: targetStatus === 'APPROVED' ? Number(approvedAmount) : undefined,
        decisionReason: decisionReason.trim(),
        officerRecommendation: targetStatus === 'PENDING_SUPERVISOR_REVIEW' ? officerRecommendation : undefined,
        settlementReference: targetStatus === 'PAID' ? settlementReference.trim() : undefined,
        notes: adminNotes.trim() || undefined,
      });

      setActiveModal(null);
      setDecisionReason('');
      setSettlementReference('');
      setAdminNotes('');
      await fetchDetail();
    } catch (err: any) {
      setActionError(err.message || 'Workflow transition failed');
      // Refresh audit logs so newly recorded ACTION_REFUSED entry appears immediately
      await fetchDetail();
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="max-w-screen-xl mx-auto px-4 py-16 text-center text-sm text-[#64748B]">Loading claim details…</div>;
  }

  if (error || !detail) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-sm text-red-600 font-semibold">{error || 'Claim not found or access denied.'}</p>
        <Link to="/officer/queue" className="text-sm text-blue-600 hover:text-blue-800 underline">
          Return to Claims Queue
        </Link>
      </div>
    );
  }

  const { claim, policy, evidence, eligibilityEvaluation, aiExtraction, auditLogs } = detail;
  const isOfficer = user?.role === 'CLAIMS_OFFICER';
  const isSupervisor = user?.role === 'SUPERVISOR';
  const isAdmin = user?.role === 'INSURER_ADMIN' || user?.role === 'PLATFORM_ADMIN';
  const hasHardEligibilityFailure = eligibilityEvaluation && !eligibilityEvaluation.eligible;
  const isDuplicate = claim.duplicateSuspected;
  const isHighValue = claim.highValue || (claim.requestedAmount >= (claim.highValueThreshold || 500000));

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/officer/queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Claims Queue
        </Link>
        <div className="flex items-center gap-2">
          {isHighValue && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
              ⚡ High-Value Claim (Threshold: ₹{(claim.highValueThreshold || 500000).toLocaleString('en-IN')})
            </span>
          )}
          <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-slate-100 text-slate-700 font-bold border border-slate-200">
            Role: {user?.role}
          </span>
        </div>
      </div>

      {/* Page Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-[#0F172A]">{claim.claimReference}</h1>
              <StatusBadge status={claim.status} size="md" />
              {claim.officerRecommendation && (
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  claim.officerRecommendation === 'APPROVE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  Officer Rec: {claim.officerRecommendation}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
              <span>Policyholder: <strong className="text-[#0F172A]">{claim.policyholderName}</strong></span>
              <span>•</span>
              <span>Policy: <strong className="text-[#0F172A]">{claim.policyTitle} ({claim.policyNumber})</strong></span>
              <span>•</span>
              <span>Insurer: <strong className="text-[#0F172A]">{claim.insurerName}</strong></span>
              <span>•</span>
              <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                Incident ID: {claim.incidentId || 'INC-N/A'}
              </span>
            </div>
          </div>

          {/* Role-Aware Consequential Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* 1. CLAIMS OFFICER ACTIONS */}
            {isOfficer && claim.status === 'SUBMITTED' && (
              <button
                onClick={() => {
                  setDecisionReason('Commenced formal document inspection and rules evaluation.');
                  setActiveModal('UNDER_REVIEW');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Clock className="w-3.5 h-3.5" /> Start Officer Review
              </button>
            )}

            {isOfficer && claim.status === 'UNDER_REVIEW' && (
              <>
                <button
                  onClick={() => {
                    setOfficerRecommendation(eligibilityEvaluation?.eligible ? 'APPROVE' : 'REJECT');
                    setDecisionReason(
                      eligibilityEvaluation?.eligible
                        ? `Documents and incident verified. Recommendation to APPROVE with calculated payout ₹${(eligibilityEvaluation.suggestedPayoutAmount || 0).toLocaleString('en-IN')}.`
                        : `Recommendation to REJECT due to: ${eligibilityEvaluation?.primaryExplanation || 'policy violation'}.`
                    );
                    setActiveModal('PENDING_SUPERVISOR_REVIEW');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submit Recommendation to Supervisor
                </button>
                <button
                  onClick={() => {
                    setDecisionReason('Additional documentary evidence or incident clarification requested from policyholder.');
                    setActiveModal('ADDITIONAL_INFO_REQUIRED');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Request Info
                </button>
              </>
            )}

            {/* 2. SUPERVISOR ACTIONS */}
            {(isSupervisor || isAdmin) && (claim.status === 'PENDING_SUPERVISOR_REVIEW' || claim.status === 'UNDER_REVIEW') && (
              <>
                <button
                  disabled={hasHardEligibilityFailure || isDuplicate}
                  onClick={() => {
                    setDecisionReason(
                      `Supervisor final approval granted after reviewing officer recommendation ('${claim.officerRecommendation || 'APPROVE'}') and confirming deterministic eligibility.`
                    );
                    setActiveModal('APPROVED');
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                    hasHardEligibilityFailure || isDuplicate
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title={hasHardEligibilityFailure || isDuplicate ? 'Cannot approve: Claim failed hard eligibility rules' : 'Approve claim'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Claim
                </button>
                <button
                  onClick={() => {
                    setDecisionReason(
                      eligibilityEvaluation?.primaryExplanation ||
                      claim.duplicateReason ||
                      'Rejected following supervisor policy compliance review.'
                    );
                    setActiveModal('REJECTED');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Claim
                </button>
                <button
                  onClick={() => {
                    setDecisionReason('Supervisor requested additional investigation notes.');
                    setActiveModal('ADDITIONAL_INFO_REQUIRED');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Request Info
                </button>
              </>
            )}

            {/* 3. INSURER ADMIN SETTLEMENT ACTIONS */}
            {isAdmin && claim.status === 'APPROVED' && (
              <button
                onClick={() => {
                  setDecisionReason('Administrative settlement processing completed. Direct disbursement executed.');
                  setSettlementReference(`NEFT-${Date.now().toString().slice(-8)}`);
                  setActiveModal('PAID');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <DollarSign className="w-3.5 h-3.5" /> Process & Issue Settlement Payment
              </button>
            )}

            {/* Terminal State Badges */}
            {claim.status === 'PAID' && (
              <span className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Settled & Paid ({claim.settlementReference || 'Disbursed'})
              </span>
            )}

            {claim.status === 'REJECTED' && (
              <span className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" /> Claim Formally Rejected (Terminal)
              </span>
            )}
          </div>
        </div>

        {/* Hard Eligibility Failure Blocker Banner for Supervisors */}
        {(hasHardEligibilityFailure || isDuplicate) && (claim.status === 'PENDING_SUPERVISOR_REVIEW' || claim.status === 'UNDER_REVIEW') && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start gap-2.5">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-rose-900">
                HARD ELIGIBILITY FAILURE: Approval Strictly Prohibited by IRDAI Rules
              </strong>
              <span>
                {eligibilityEvaluation?.primaryExplanation || claim.duplicateReason || 'Claim violates deterministic policy requirements'}.
                Supervisors and administrators cannot bypass deterministic hard rule failures.
              </span>
            </div>
          </div>
        )}

        {/* Duplicate Warning */}
        {claim.duplicateSuspected && (
          <DuplicateWarningBanner
            fingerprint={claim.incidentFingerprint}
            reason={claim.duplicateReason}
          />
        )}
      </div>

      {/* Officer Recommendation Display Card (Visible to Supervisor & Admin) */}
      {claim.officerRecommendation && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              Claims Officer Review & Recommendation
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
              claim.officerRecommendation === 'APPROVE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              Recommended: {claim.officerRecommendation}
            </span>
          </div>
          <p className="text-xs text-[#0F172A] leading-relaxed">
            "{claim.officerRecommendationJustification || 'No justification text recorded.'}"
          </p>
          {claim.officerRecommendedAt && (
            <p className="text-[11px] font-mono text-slate-500">
              Submitted at: {new Date(claim.officerRecommendedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Supervisor Decision Display Card (Visible once decided) */}
      {claim.supervisorDecision && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Supervisor Final Adjudication
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
              claim.supervisorDecision === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              Decision: {claim.supervisorDecision}
            </span>
          </div>
          <p className="text-xs text-[#0F172A] leading-relaxed">
            "{claim.supervisorDecisionJustification || 'Decision justification recorded in audit log.'}"
          </p>
          {claim.supervisorDecidedAt && (
            <p className="text-[11px] font-mono text-slate-500">
              Decided at: {new Date(claim.supervisorDecidedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Modal: Workflow State Transition Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Execute Workflow Transition: <span className="font-mono text-blue-700">{activeModal}</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm px-2 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                  {actionError}
                </div>
              )}

              {/* Special Controls for Officer Recommendation */}
              {activeModal === 'PENDING_SUPERVISOR_REVIEW' && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="font-bold text-[#0F172A] block">
                    Select Recommendation to Supervisor (Mandatory)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOfficerRecommendation('APPROVE')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all ${
                        officerRecommendation === 'APPROVE'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✓ Recommend APPROVE
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfficerRecommendation('REJECT')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all ${
                        officerRecommendation === 'REJECT'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✕ Recommend REJECT
                    </button>
                  </div>
                </div>
              )}

              {/* Special Controls for Supervisor Approval Amount */}
              {activeModal === 'APPROVED' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#0F172A]">Authorized Payout Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono text-[#0F172A] bg-white font-bold"
                  />
                  <p className="text-[11px] text-[#64748B]">
                    Calculated by eligibility engine: ₹{eligibilityEvaluation?.suggestedPayoutAmount.toLocaleString('en-IN') || '0'} (Requested: ₹{claim.requestedAmount.toLocaleString('en-IN')})
                  </p>
                </div>
              )}

              {/* Special Controls for Admin Settlement Payment */}
              {activeModal === 'PAID' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="space-y-1">
                    <label className="font-bold text-teal-950">NEFT / UTR Transaction Reference *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NEFT-20261011-87654"
                      value={settlementReference}
                      onChange={(e) => setSettlementReference(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs font-mono font-bold text-teal-950 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-teal-950">Settlement Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Disbursed to policyholder verified SBI account"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs text-teal-950 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Mandatory Justification Text Area */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0F172A]">
                  Mandatory Decision Justification / Audit Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Comprehensive rationale for this transition..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-[#0F172A] bg-white resize-none font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-[#64748B]">
                  🔒 Stored permanently and immutably signed into the SHA-256 hash-chained audit ledger.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleExecuteTransition(activeModal)}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
              >
                {processing ? 'Signing Ledger…' : 'Confirm & Commit Action'}
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
              {auditLogs.map((log) => {
                const isRefused = log.action === 'ACTION_REFUSED';
                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded border text-xs transition-all ${
                      isRefused
                        ? 'border-rose-300 bg-rose-50/80 text-rose-900 ring-1 ring-rose-200'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono font-bold ${isRefused ? 'text-rose-700 flex items-center gap-1' : 'text-navy-700'}`}>
                        {isRefused && '⛔ '}
                        {log.action}
                      </span>
                      <span className="text-ink-faint font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={`font-medium ${isRefused ? 'text-rose-800' : 'text-ink-muted'}`}>
                      {log.actorEmail} ({log.actorRole})
                    </p>
                    {isRefused && log.previousState && (
                      <p className="text-[11px] font-mono text-rose-600 font-semibold mt-0.5">
                        Attempted Action: {log.previousState} [BLOCKED]
                      </p>
                    )}
                    {log.decisionReason && (
                      <p className={`mt-1 text-[11px] leading-relaxed ${isRefused ? 'text-rose-900 font-medium' : 'text-ink-muted italic'}`}>
                        {log.decisionReason}
                      </p>
                    )}
                    <div className="mt-1 pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Seq #{log.sequenceNumber}</span>
                      <span title={log.currentHash}>Hash: {log.currentHash.substring(0, 12)}...</span>
                    </div>
                  </div>
                );
              })}
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
