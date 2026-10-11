import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Policy } from '../../types';
import { api } from '../../api/client';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  Paperclip,
  Scale,
  ShieldAlert,
} from 'lucide-react';

export const SubmitClaimPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [category, setCategory] = useState<string>('AUTO');
  const [requestedAmount, setRequestedAmount] = useState<number>(3200);
  const [incidentDate, setIncidentDate] = useState<string>(
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [incidentLocation, setIncidentLocation] = useState<string>('Seattle, WA');
  const [narrative, setNarrative] = useState<string>(
    'Rear-ended at a red light by a delivery van. Rear bumper cracked and parking sensors disabled. Police report filed.'
  );
  const [evidenceName, setEvidenceName] = useState<string>('police_report.pdf');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('https://storage.insurechain.io/evidence/report_01.pdf');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolicies() {
      try {
        const userPolicies = await api.policies.getMy();
        setPolicies(userPolicies);
        if (userPolicies.length > 0) {
          setSelectedPolicyId(userPolicies[0].id);
          setCategory(userPolicies[0].category);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
    loadPolicies();
  }, []);

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);

  // Live Deterministic Pre-check Simulation
  const daysElapsed = Math.max(
    0,
    Math.floor((Date.now() - new Date(incidentDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  let isLate = false;
  if (selectedPolicy) {
    isLate = daysElapsed > selectedPolicy.filingWindowDays;
  }

  let isExcluded = false;
  let excludedCategories: string[] = [];
  if (selectedPolicy) {
    try {
      excludedCategories = JSON.parse(selectedPolicy.excludedCategories || '[]');
      isExcluded = excludedCategories.some(
        (ex) =>
          category.toUpperCase().includes(ex.toUpperCase()) ||
          narrative.toLowerCase().includes(ex.toLowerCase())
      );
    } catch (_) {}
  }

  let exceedsLimit = false;
  let eligiblePayout = 0;
  if (selectedPolicy) {
    exceedsLimit = requestedAmount > selectedPolicy.coverageLimit;
    const capped = Math.min(requestedAmount, selectedPolicy.coverageLimit);
    eligiblePayout = Math.max(0, capped - selectedPolicy.deductible);
    if (isLate || isExcluded) {
      eligiblePayout = 0;
    }
  }

  // Preset Scenario Loaders for hackathon judging
  const loadScenario = (type: 'eligible' | 'late' | 'excluded' | 'above_limit') => {
    if (!selectedPolicy) return;
    if (type === 'eligible') {
      setIncidentDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRequestedAmount(3200);
      setCategory(selectedPolicy.category);
      setNarrative('Rear-ended at a traffic light. Repair invoice and police report filed on scene.');
    } else if (type === 'late') {
      const lateDays = (selectedPolicy.filingWindowDays + 15) * 24 * 60 * 60 * 1000;
      setIncidentDate(new Date(Date.now() - lateDays).toISOString().split('T')[0]);
      setRequestedAmount(2100);
      setCategory(selectedPolicy.category);
      setNarrative('Minor dent occurred last month. Delayed filing due to international travel.');
    } else if (type === 'excluded') {
      setIncidentDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRequestedAmount(8000);
      setCategory(selectedPolicy.category);
      setNarrative('Structural warehouse cracks developed immediately after localized earthquake tremor.');
    } else if (type === 'above_limit') {
      setIncidentDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRequestedAmount(selectedPolicy.coverageLimit + 10000);
      setCategory(selectedPolicy.category);
      setNarrative('Severe multi-car collision resulting in catastrophic total vehicle destruction.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicyId) return;

    setError(null);
    setSubmitting(true);
    try {
      const response = await api.claims.submit({
        policyId: selectedPolicyId,
        category,
        requestedAmount: Number(requestedAmount),
        incidentDate,
        narrative,
        incidentLocation,
        evidence: evidenceName
          ? [
              {
                fileName: evidenceName,
                fileType: 'application/pdf',
                fileUrl: evidenceUrl,
                fileSizeBytes: 245000,
                description: 'Initial supporting proof and damage report',
              },
            ]
          : [],
      });

      navigate(`/policyholder/claims/${response.claim.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          Submit Insurance Claim
        </h1>
        <p className="text-xs text-slate-400">
          Enter incident parameters below. The deterministic eligibility engine evaluates rules instantly with cryptographic audit logging.
        </p>
      </div>

      {/* Preset Demo Scenarios */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <span className="text-xs font-semibold text-indigo-400 block">
          ⚡ 1-Click Hackathon Test Scenarios:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => loadScenario('eligible')}
            className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 text-left font-medium"
          >
            ✅ Standard Eligible Claim
          </button>
          <button
            type="button"
            onClick={() => loadScenario('late')}
            className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 text-left font-medium"
          >
            ⏰ Late Filing Violation
          </button>
          <button
            type="button"
            onClick={() => loadScenario('excluded')}
            className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/50 text-left font-medium"
          >
            ⛔ Excluded Peril Peril Check
          </button>
          <button
            type="button"
            onClick={() => loadScenario('above_limit')}
            className="p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/50 text-left font-medium"
          >
            📈 Above-Limit Payout Cap
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Claim Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          
          {/* Policy Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Enrolled Policy</label>
            <select
              value={selectedPolicyId}
              onChange={(e) => {
                setSelectedPolicyId(e.target.value);
                const p = policies.find((pol) => pol.id === e.target.value);
                if (p) setCategory(p.category);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.insurerName}) — Limit: ${p.coverageLimit.toLocaleString()} | Window: {p.filingWindowDays}d
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Incident Category</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Requested Amount ($)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Incident Occurrence Date</label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Incident Location</label>
              <input
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Detailed Incident Narrative</label>
            <textarea
              rows={4}
              required
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Describe exactly what happened, damages sustained, and any third parties involved..."
            />
          </div>

          {/* Supporting Evidence Proof Input */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
              Supporting Evidence Attachment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={evidenceName}
                onChange={(e) => setEvidenceName(e.target.value)}
                placeholder="File name (e.g. police_report.pdf)"
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="Storage URL or document URI"
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {submitting ? 'Evaluating & Chaining to Audit Ledger...' : 'Submit Claim with Cryptographic Audit Log'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live Deterministic Pre-Check Simulator */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Live Eligibility Simulator
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time preview of deterministic rule checks prior to official submission.
            </p>

            <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
              
              {/* Filing Window Rule */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400">Filing Window:</span>
                <span className={`font-mono font-semibold ${isLate ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {daysElapsed}d / {selectedPolicy?.filingWindowDays || 30}d {isLate ? '❌ Late' : '✅ Compliant'}
                </span>
              </div>

              {/* Excluded Peril Rule */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400">Peril Status:</span>
                <span className={`font-mono font-semibold ${isExcluded ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isExcluded ? '⛔ Peril Excluded' : '✅ Covered Category'}
                </span>
              </div>

              {/* Coverage Limit Rule */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400">Coverage Limit:</span>
                <span className={`font-mono font-semibold ${exceedsLimit ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {exceedsLimit ? '⚠️ Exceeds Limit (Capped)' : '✅ Within Limit'}
                </span>
              </div>

              {/* Deductible */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400">Policy Deductible:</span>
                <span className="font-mono text-slate-300">
                  -${selectedPolicy?.deductible || 0}
                </span>
              </div>

              {/* Estimated Payout */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Estimated Payout:</span>
                <span className={`text-base font-bold font-mono ${eligiblePayout > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${eligiblePayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <span className="text-indigo-300 font-semibold block">Blockchain Guarantee:</span>
            <p className="leading-relaxed">
              Upon clicking submit, this claim will receive an immutable SHA-256 incident fingerprint and will be recorded into the cryptographic hash-chained audit ledger.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
