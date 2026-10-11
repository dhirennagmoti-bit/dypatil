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
  Zap,
} from 'lucide-react';

export const SubmitClaimPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [category, setCategory] = useState<string>('AUTO');
  const [requestedAmount, setRequestedAmount] = useState<number>(35000); // In Rupees
  const [incidentId, setIncidentId] = useState<string>('INC-55');
  const [incidentDate, setIncidentDate] = useState<string>(
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [incidentLocation, setIncidentLocation] = useState<string>('Andheri West, Mumbai, MH');
  const [narrative, setNarrative] = useState<string>(
    'Rear-ended at a traffic signal on Western Express Highway by a delivery tempo. Rear bumper cracked and reverse parking sensors damaged. Police FIR & repair estimate attached.'
  );
  const [evidenceName, setEvidenceName] = useState<string>('fir_police_report.pdf');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('https://storage.insurechain.in/evidence/mumbai_fir_9921.pdf');

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

  // Preset Scenario Loaders for hackathon judging in India
  const loadScenario = (type: 'eligible' | 'late' | 'excluded' | 'above_limit' | 'duplicate') => {
    if (!selectedPolicy) return;
    if (type === 'eligible') {
      setIncidentId('INC-' + Math.floor(100 + Math.random() * 900));
      setIncidentDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRequestedAmount(35000);
      setCategory(selectedPolicy.category);
      setIncidentLocation('Western Express Highway, Mumbai, MH');
      setNarrative('Rear-ended at a traffic signal. Repair estimate and police panchnama filed on scene.');
    } else if (type === 'duplicate') {
      // Problem Statement B-02 Feature 2: Same incident ID (INC-55) under same policy
      setIncidentId('INC-55');
      setIncidentDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRequestedAmount(20000);
      setCategory(selectedPolicy.category);
      setIncidentLocation('Outer Ring Road, Bengaluru, KA');
      setNarrative('Same collision incident INC-55 previously filed under claim reference CLM-101. Attempting duplicate submission under same policy POL-01.');
    } else if (type === 'late') {
      setIncidentId('INC-' + Math.floor(100 + Math.random() * 900));
      const lateDays = (selectedPolicy.filingWindowDays + 15) * 24 * 60 * 60 * 1000;
      setIncidentDate(new Date(Date.now() - lateDays).toISOString().split('T')[0]);
      setRequestedAmount(18500);
      setCategory(selectedPolicy.category);
      setIncidentLocation('Outer Ring Road, Bengaluru, KA');
      setNarrative('Minor bumper dent occurred last month. Delayed filing due to emergency out-of-station travel.');
    } else if (type === 'excluded') {
      setIncidentId('INC-' + Math.floor(100 + Math.random() * 900));
      setIncidentDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRequestedAmount(150000);
      setCategory(selectedPolicy.category);
      setIncidentLocation('Off-road track, Greater Noida, UP');
      setNarrative('Vehicle engine cracked during unauthorized off-road speed racing contest.');
    } else if (type === 'above_limit') {
      setIncidentId('INC-' + Math.floor(100 + Math.random() * 900));
      setIncidentDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRequestedAmount(selectedPolicy.coverageLimit + 250000);
      setCategory(selectedPolicy.category);
      setIncidentLocation('Mumbai-Pune Expressway, MH');
      setNarrative('Severe multi-car collision on wet expressway resulting in catastrophic vehicle destruction.');
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
        incidentId: incidentId.trim() || undefined,
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
                description: 'Police FIR & authorized garage repair estimate',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4.5 h-4.5" />
          </div>
          Submit Insurance Claim (India)
        </h1>
        <p className="text-xs text-[#64748B]">
          Enter incident parameters below. The deterministic eligibility engine evaluates IRDAI rules instantly with cryptographic audit logging.
        </p>
      </div>

      {/* Preset Demo Scenarios Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-orange-500" />
            1-Click IRDAI Evaluation Scenarios:
          </span>
          <span className="text-[11px] font-mono text-[#64748B]">Live deterministic pre-check</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <button
            type="button"
            onClick={() => loadScenario('eligible')}
            className="p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 border border-emerald-200 text-left font-medium transition-all shadow-2xs hover:shadow-xs"
          >
            <div className="font-bold text-xs flex items-center gap-1">✅ Eligible</div>
            <div className="text-[10px] text-emerald-700/80 mt-0.5">₹35,000 within limits</div>
          </button>
          <button
            type="button"
            onClick={() => loadScenario('duplicate')}
            className="p-3 rounded-xl bg-purple-50/80 hover:bg-purple-100 text-purple-900 border border-purple-300 text-left font-medium transition-all shadow-2xs hover:shadow-xs ring-1 ring-purple-300"
          >
            <div className="font-bold text-xs flex items-center gap-1">🔁 Duplicate INC-55</div>
            <div className="text-[10px] text-purple-700/90 mt-0.5">Collision demo (CLM-101/205)</div>
          </button>
          <button
            type="button"
            onClick={() => loadScenario('late')}
            className="p-3 rounded-xl bg-rose-50/60 hover:bg-rose-100/70 text-rose-800 border border-rose-200 text-left font-medium transition-all shadow-2xs hover:shadow-xs"
          >
            <div className="font-bold text-xs flex items-center gap-1">⏰ Late Filing</div>
            <div className="text-[10px] text-rose-700/80 mt-0.5">Deadline exceeded</div>
          </button>
          <button
            type="button"
            onClick={() => loadScenario('excluded')}
            className="p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 border border-amber-200 text-left font-medium transition-all shadow-2xs hover:shadow-xs"
          >
            <div className="font-bold text-xs flex items-center gap-1">⛔ Excluded Peril</div>
            <div className="text-[10px] text-amber-700/80 mt-0.5">Racing / unauthorized</div>
          </button>
          <button
            type="button"
            onClick={() => loadScenario('above_limit')}
            className="p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 border border-blue-200 text-left font-medium transition-all shadow-2xs hover:shadow-xs"
          >
            <div className="font-bold text-xs flex items-center gap-1">📈 Above-Limit Cap</div>
            <div className="text-[10px] text-blue-700/80 mt-0.5">Capped at policy limit</div>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Claim Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-card">
          
          {/* Policy Selector & Rule Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0F172A]">Select Enrolled Policy</label>
              {selectedPolicy && (
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Policy ID: {selectedPolicy.policyNumber}
                </span>
              )}
            </div>
            <select
              value={selectedPolicyId}
              onChange={(e) => {
                setSelectedPolicyId(e.target.value);
                const p = policies.find((pol) => pol.id === e.target.value);
                if (p) setCategory(p.category);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] font-medium shadow-2xs"
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.insurerName}) — Limit: ₹{p.coverageLimit.toLocaleString('en-IN')} | Window: {p.filingWindowDays}d
                </option>
              ))}
            </select>

            {/* Configured Policy Rules Breakdown */}
            {selectedPolicy && (
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Coverage Limit</span>
                  <span className="font-mono font-bold text-[#0F172A]">₹{selectedPolicy.coverageLimit.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Deductible</span>
                  <span className="font-mono font-bold text-[#0F172A]">₹{selectedPolicy.deductible.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Filing Window</span>
                  <span className="font-mono font-bold text-[#0F172A]">{selectedPolicy.filingWindowDays} Days</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Excluded Perils</span>
                  <span className="font-mono font-medium text-rose-700 truncate block" title={selectedPolicy.excludedCategories}>
                    {selectedPolicy.excludedCategories}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stable Incident Identifier & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
                <span>Simulated Incident ID</span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-semibold">
                  Stable Matcher
                </span>
              </label>
              <input
                type="text"
                required
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                placeholder="e.g. INC-55"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] font-mono font-bold shadow-2xs uppercase"
              />
              <p className="text-[10px] text-[#64748B]">
                Used with Policy ID to prevent double payments (e.g. CLM-101 and CLM-205 on INC-55).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Incident Category</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] shadow-2xs font-medium"
              />
              <p className="text-[10px] text-[#64748B]">
                Must match covered policy scope (e.g. AUTO, PROPERTY, HEALTH).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Claim Requested Amount (₹)</label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] font-mono font-bold shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Incident Occurrence Date</label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] font-mono shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Incident Location in India</label>
              <input
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] shadow-2xs placeholder:text-slate-400 font-medium"
                placeholder="Area, City, State (e.g. Bandra, Mumbai)"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Incident Narrative & Damage Description</label>
            <textarea
              rows={4}
              required
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] shadow-2xs leading-relaxed font-normal"
              placeholder="Describe what occurred, vehicle registration or hospital details..."
            />
          </div>

          {/* Supporting Evidence Proof Input */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-blue-600" />
              Supporting Evidence Attachment (FIR / Hospital Discharge Summary)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={evidenceName}
                onChange={(e) => setEvidenceName(e.target.value)}
                placeholder="File name (e.g. fir_report.pdf)"
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] shadow-2xs font-medium"
              />
              <input
                type="text"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="Document URI or cloud storage link"
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] shadow-2xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? 'Evaluating & Chaining to Audit Ledger...' : 'Submit Claim with Cryptographic SHA-256 Audit Log'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live Deterministic Pre-Check Simulator */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono">
                Live Eligibility Simulator
              </h3>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Real-time mathematical evaluation of IRDAI policy rules prior to official submission.
            </p>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              
              {/* Filing Window Rule */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
                <span className="text-[#64748B] font-medium">Filing Window:</span>
                <span className={`font-mono font-bold ${isLate ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {daysElapsed}d / {selectedPolicy?.filingWindowDays || 30}d {isLate ? '❌ Late' : '✅ Compliant'}
                </span>
              </div>

              {/* Excluded Peril Rule */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
                <span className="text-[#64748B] font-medium">Peril Status:</span>
                <span className={`font-mono font-bold ${isExcluded ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isExcluded ? '⛔ Peril Excluded' : '✅ Covered'}
                </span>
              </div>

              {/* Coverage Limit Rule */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
                <span className="text-[#64748B] font-medium">Coverage Limit:</span>
                <span className={`font-mono font-bold ${exceedsLimit ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {exceedsLimit ? '⚠️ Exceeds Limit (Capped)' : '✅ Within Limit'}
                </span>
              </div>

              {/* Deductible in Rupees */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
                <span className="text-[#64748B] font-medium">Policy Deductible:</span>
                <span className="font-mono text-[#0F172A] font-semibold">
                  -₹{(selectedPolicy?.deductible || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Estimated Payout */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[#0F172A] font-bold text-xs">Estimated Payout:</span>
                <span className={`text-lg font-bold font-mono ${eligiblePayout > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{eligiblePayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-[#334155] space-y-1">
            <span className="text-blue-900 font-bold block">Cryptographic Guarantee</span>
            <p className="leading-relaxed">
              Upon clicking submit, this claim generates an immutable SHA-256 incident fingerprint recorded immediately to the audit ledger.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
