import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClaimDetailResponse } from '../../types';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { EligibilityExplainer } from '../../components/EligibilityExplainer';
import { AiAdvisoryBanner } from '../../components/AiAdvisoryBanner';
import { DuplicateWarningBanner } from '../../components/DuplicateWarningBanner';
import {
  FileText,
  Calendar,
  DollarSign,
  ArrowLeft,
  Paperclip,
  Clock,
  User,
  Shield,
  Building2,
} from 'lucide-react';

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ClaimDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      try {
        const resp = await api.claims.getById(id);
        setDetail(resp);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch claim details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-[#5C6470]">Loading claim details...</div>;
  }

  if (error || !detail) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-600 text-sm">{error || 'Claim not found'}</p>
        <Link to="/policyholder/dashboard" className="text-xs text-blue-600 hover:underline font-medium">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { claim, policy, evidence, eligibilityEvaluation, aiExtraction, auditLogs } = detail;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Back Navigation */}
      <Link
        to="/policyholder/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6470] hover:text-[#0F172A] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to My Claims
      </Link>

      {/* Claim Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#0F172A] tracking-tight">
                {claim.claimReference}
              </h1>
              <StatusBadge status={claim.status} size="lg" />
            </div>
            <p className="text-xs text-[#5C6470]">
              Policy: <strong className="text-[#0F172A]">{claim.policyTitle}</strong> ({claim.insurerName}) • Category: <strong className="text-[#0F172A]">{claim.category}</strong>
            </p>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <span className="text-[11px] text-[#5C6470] uppercase tracking-wider font-mono font-bold">Claimed Amount</span>
            <span className="text-2xl font-bold font-mono text-[#0F172A]">
              ₹{claim.requestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            {claim.approvedAmount !== null && claim.approvedAmount !== undefined && (
              <span className="text-xs font-mono text-emerald-700 font-bold">
                Approved: ₹{claim.approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
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

      {/* Key Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-card">
          <span className="text-[#5C6470] block">Incident Date</span>
          <span className="font-mono font-semibold text-[#0F172A] text-sm">{claim.incidentDate}</span>
          <span className="text-[11px] text-[#5C6470] block">Filing Date: {claim.filingDate}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-card">
          <span className="text-[#5C6470] block">Policy Coverage Limit</span>
          <span className="font-mono font-bold text-[#0F172A] text-sm">
            {policy ? `₹${policy.coverageLimit.toLocaleString('en-IN')}` : 'N/A'}
          </span>
          <span className="text-[11px] text-[#5C6470] block">Deductible: ₹{policy?.deductible?.toLocaleString('en-IN') || 0}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-card">
          <span className="text-[#5C6470] block">Incident Location</span>
          <span className="font-semibold text-[#0F172A] text-sm">{claim.incidentLocation || 'India'}</span>
          <span className="text-[11px] text-blue-600 block font-mono font-bold">SHA-256 Fingerprint Verified</span>
        </div>
      </div>

      {/* Incident Narrative */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono">
          Incident Narrative & Description:
        </h3>
        <p className="text-xs text-[#0F172A] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-slate-200">
          {claim.narrative}
        </p>
      </div>

      {/* Supporting Evidence Documents */}
      {evidence.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-blue-600" />
            Supporting Evidence References ({evidence.length}):
          </h3>
          <div className="grid gap-2">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-[#0F172A] block">{item.fileName}</span>
                  <span className="text-[#5C6470] text-[11px]">{item.description || 'Uploaded proof document'}</span>
                </div>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors"
                >
                  View Attachment
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deterministic Rules Engine Evaluation */}
      {eligibilityEvaluation && (
        <EligibilityExplainer evaluation={eligibilityEvaluation} />
      )}

      {/* AI Narrative Extraction & Consistency Advisory */}
      {aiExtraction && (
        <AiAdvisoryBanner aiExtraction={aiExtraction} />
      )}

      {/* Audit History Timeline */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Cryptographic Claim Audit Trail ({auditLogs.length} Events):
        </h3>
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-700">{log.action}</span>
                <span className="text-[#5C6470] font-mono text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-[#0F172A]">{log.decisionReason}</p>
              <div className="pt-1 flex items-center gap-3 text-[10px] font-mono text-[#5C6470]">
                <span>By: {log.actorEmail} ({log.actorRole})</span>
                <span className="truncate">Hash: {log.currentHash.substring(0, 16)}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
