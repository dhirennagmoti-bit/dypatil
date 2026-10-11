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
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">Loading claim details...</div>;
  }

  if (error || !detail) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Claim not found'}</p>
        <Link to="/policyholder/dashboard" className="text-xs text-indigo-400 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { claim, policy, evidence, eligibilityEvaluation, aiExtraction, auditLogs } = detail;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Back Navigation */}
      <Link
        to="/policyholder/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to My Claims
      </Link>

      {/* Claim Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {claim.claimReference}
              </h1>
              <StatusBadge status={claim.status} size="lg" />
            </div>
            <p className="text-xs text-slate-400">
              Policy: <strong className="text-slate-200">{claim.policyTitle}</strong> ({claim.insurerName}) • Category: <strong className="text-slate-200">{claim.category}</strong>
            </p>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">Claim Amount</span>
            <span className="text-2xl font-bold font-mono text-white">
              ${claim.requestedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            {claim.approvedAmount !== null && claim.approvedAmount !== undefined && (
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Approved: ${claim.approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1">
          <span className="text-slate-500 block">Incident Date</span>
          <span className="font-mono font-semibold text-slate-200 text-sm">{claim.incidentDate}</span>
          <span className="text-[11px] text-slate-400 block">Filing Date: {claim.filingDate}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1">
          <span className="text-slate-500 block">Policy Coverage Limit</span>
          <span className="font-mono font-semibold text-slate-200 text-sm">
            ${policy?.coverageLimit.toLocaleString() || 'N/A'}
          </span>
          <span className="text-[11px] text-slate-400 block">Deductible: ${policy?.deductible || 0}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1">
          <span className="text-slate-500 block">Incident Location</span>
          <span className="font-semibold text-slate-200 text-sm">{claim.incidentLocation || 'Not specified'}</span>
          <span className="text-[11px] text-indigo-400 block font-mono">Fingerprint Verified</span>
        </div>
      </div>

      {/* Incident Narrative */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Incident Narrative & Description:
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          {claim.narrative}
        </p>
      </div>

      {/* Supporting Evidence Documents */}
      {evidence.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-indigo-400" />
            Supporting Evidence References ({evidence.length}):
          </h3>
          <div className="grid gap-2">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">{item.fileName}</span>
                  <span className="text-slate-400 text-[11px]">{item.description || 'Uploaded proof'}</span>
                </div>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium"
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
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Cryptographic Claim Audit Trail ({auditLogs.length} Events):
        </h3>
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-indigo-300">{log.action}</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-300">{log.decisionReason}</p>
              <div className="pt-1 flex items-center gap-3 text-[10px] font-mono text-slate-500">
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
