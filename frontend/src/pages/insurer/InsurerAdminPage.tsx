import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Insurer, InsurerMetrics, Policy, User, Claim } from '../../types';
import { api } from '../../api/client';
import {
  Building2,
  Shield,
  Users,
  DollarSign,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Sliders,
  FileCheck,
  CreditCard,
  Edit2,
  UserCheck,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const InsurerAdminPage: React.FC = () => {
  const { user } = useAuth();

  const [insurer, setInsurer] = useState<Insurer | null>(null);
  const [metrics, setMetrics] = useState<InsurerMetrics | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [approvedClaims, setApprovedClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'POLICIES' | 'SETTLEMENTS' | 'STAFF' | 'SETTINGS'>('OVERVIEW');

  // High-Value Threshold Configuration State
  const [thresholdInput, setThresholdInput] = useState<number>(500000);
  const [thresholdReason, setThresholdReason] = useState<string>('');
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [thresholdMessage, setThresholdMessage] = useState<string | null>(null);

  // Settlement Processing Modal State
  const [settlingClaim, setSettlingClaim] = useState<Claim | null>(null);
  const [settlementRef, setSettlementRef] = useState('');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [settlementError, setSettlementError] = useState<string | null>(null);

  // Policy Modal State (Create & Edit)
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState({
    policyNumber: '',
    title: '',
    description: '',
    category: 'PROPERTY',
    coverageLimit: 500000,
    deductible: 5000,
    filingWindowDays: 30,
    excludedCategories: '["WAR", "INTENTIONAL_DAMAGE"]',
    policyRulesDescription: 'Standard commercial property underwriting terms.',
    effectiveDate: '2026-01-01',
    expiryDate: '2026-12-31',
  });
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);

  // Staff Role Update Modal State
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('CLAIMS_OFFICER');
  const [roleJustification, setRoleJustification] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?.insurerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [ins, met, pols, staff, allClaims] = await Promise.all([
        api.insurers.getById(user.insurerId),
        api.insurers.getMetrics(user.insurerId),
        api.policies.getByInsurer(user.insurerId),
        api.insurers.getUsers(user.insurerId),
        api.claims.getAll(),
      ]);
      setInsurer(ins);
      setMetrics(met);
      setPolicies(pols);
      setEmployees(staff);
      setThresholdInput(ins.highValueThreshold || met.highValueThreshold || 500000);
      setApprovedClaims(allClaims.filter((c) => c.status === 'APPROVED'));
    } catch (err: any) {
      console.error('Failed to load insurer admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.insurerId]);

  const handleUpdateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.insurerId) return;
    if (thresholdInput < 0) {
      setThresholdMessage('Error: Threshold must be non-negative.');
      return;
    }
    if (!thresholdReason.trim()) {
      setThresholdMessage('Error: Change reason justification is mandatory for audit logging.');
      return;
    }

    setSavingThreshold(true);
    setThresholdMessage(null);
    try {
      await api.insurers.updateThreshold(user.insurerId, thresholdInput, thresholdReason.trim());
      setThresholdMessage('High-value threshold updated and cryptographically audited successfully.');
      setThresholdReason('');
      await loadData();
    } catch (err: any) {
      setThresholdMessage('Failed to update threshold: ' + err.message);
    } finally {
      setSavingThreshold(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPolicy(true);
    setPolicyError(null);
    try {
      if (editingPolicyId) {
        await api.policies.update(editingPolicyId, policyForm);
      } else {
        await api.policies.create(policyForm);
      }
      setShowPolicyModal(false);
      setEditingPolicyId(null);
      await loadData();
    } catch (err: any) {
      setPolicyError(err.message || 'Failed to save policy');
    } finally {
      setSavingPolicy(false);
    }
  };

  const openEditPolicy = (p: Policy) => {
    setEditingPolicyId(p.id);
    setPolicyForm({
      policyNumber: p.policyNumber,
      title: p.title,
      description: p.description || '',
      category: p.category,
      coverageLimit: p.coverageLimit,
      deductible: p.deductible,
      filingWindowDays: p.filingWindowDays,
      excludedCategories: p.excludedCategories || '[]',
      policyRulesDescription: p.policyRulesDescription || '',
      effectiveDate: p.effectiveDate,
      expiryDate: p.expiryDate,
    });
    setPolicyError(null);
    setShowPolicyModal(true);
  };

  const handleExecuteSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingClaim || !settlementRef.trim()) {
      setSettlementError('Settlement / NEFT reference is mandatory.');
      return;
    }

    setProcessingPayment(true);
    setSettlementError(null);
    try {
      await api.claims.transition(settlingClaim.id, {
        targetStatus: 'PAID',
        decisionReason: `Settlement disbursement completed via NEFT ${settlementRef.trim()}`,
        settlementReference: settlementRef.trim(),
        notes: settlementNotes.trim() || undefined,
      });
      setSettlingClaim(null);
      setSettlementRef('');
      setSettlementNotes('');
      await loadData();
    } catch (err: any) {
      setSettlementError(err.message || 'Settlement execution failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser || !user?.insurerId) return;

    setSavingRole(true);
    setRoleError(null);
    try {
      await api.insurers.updateUserRole(
        user.insurerId,
        roleModalUser.id,
        newRole,
        roleJustification.trim() || undefined
      );
      setRoleModalUser(null);
      setRoleJustification('');
      await loadData();
    } catch (err: any) {
      setRoleError(err.message || 'Failed to update user role');
    } finally {
      setSavingRole(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[#5C6470]">Loading insurer administration portal...</div>;
  }

  const chartData = metrics
    ? [
        { name: 'Submitted', count: metrics.submittedClaims, fill: '#42658A' },
        { name: 'Under Review', count: metrics.underReviewClaims, fill: '#d97706' },
        { name: 'Pending Sup.', count: metrics.pendingSupervisorDecisions, fill: '#2563eb' },
        { name: 'Approved', count: metrics.approvedClaims, fill: '#059669' },
        { name: 'Settled Paid', count: metrics.paidClaims, fill: '#0d9488' },
        { name: 'Rejected', count: metrics.rejectedClaims, fill: '#dc2626' },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DDE1E6] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#183153] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#183153] tracking-tight">
              {insurer?.name || 'Insurer Administration'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-[#183153] border border-blue-200 font-semibold">
              Code: {insurer?.code}
            </span>
          </div>
          <p className="text-xs text-[#5C6470]">
            Underwriting rules management, high-value escalation thresholds, approved claim settlements, and authorized staff directory.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl border border-[#DDE1E6] bg-white hover:bg-slate-50 text-xs font-semibold text-[#252B33] flex items-center gap-2 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#5C6470]" />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingPolicyId(null);
              setPolicyForm({
                policyNumber: '',
                title: '',
                description: '',
                category: 'HEALTH',
                coverageLimit: 500000,
                deductible: 5000,
                filingWindowDays: 30,
                excludedCategories: '["PRE_EXISTING", "COSMETIC"]',
                policyRulesDescription: 'Standard retail medical coverage underwriting terms.',
                effectiveDate: '2026-01-01',
                expiryDate: '2026-12-31',
              });
              setShowPolicyModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#183153] hover:bg-[#12243d] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Policy Plan
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#DDE1E6] pb-3">
        {[
          { id: 'OVERVIEW', label: 'System Overview', icon: BarChart3 },
          { id: 'SETTLEMENTS', label: `Settlement Queue (${approvedClaims.length})`, icon: CreditCard },
          { id: 'POLICIES', label: `Policy Rules (${policies.length})`, icon: Shield },
          { id: 'STAFF', label: `Staff & Roles (${employees.length})`, icon: Users },
          { id: 'SETTINGS', label: 'High-Value Threshold', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#183153] text-white shadow-xs'
                  : 'bg-white text-[#5C6470] border border-[#DDE1E6] hover:bg-slate-50 hover:text-[#183153]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* KPI Metrics Strip */}
          {metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-xl border border-[#DDE1E6] bg-white space-y-1 shadow-sm">
                <span className="text-xs text-[#5C6470]">Total Claims</span>
                <div className="text-2xl font-bold font-mono text-[#183153]">{metrics.totalClaims}</div>
                <span className="text-[11px] text-[#5C6470]">{metrics.totalPolicies} active policies</span>
              </div>

              <div className="p-4 rounded-xl border border-[#DDE1E6] bg-white space-y-1 shadow-sm">
                <span className="text-xs text-amber-600 font-medium">Pending Officer</span>
                <div className="text-2xl font-bold font-mono text-amber-600">{metrics.pendingOfficerReviews}</div>
                <span className="text-[11px] text-[#5C6470]">Under review by officers</span>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-white space-y-1 shadow-sm">
                <span className="text-xs text-blue-600 font-bold">Pending Supervisor</span>
                <div className="text-2xl font-bold font-mono text-blue-700">{metrics.pendingSupervisorDecisions}</div>
                <span className="text-[11px] text-[#5C6470]">{metrics.highValuePendingClaims} high-value (₹{(metrics.highValueThreshold || 500000).toLocaleString('en-IN')}+)</span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-white space-y-1 shadow-sm">
                <span className="text-xs text-emerald-700 font-bold">Approved Ready</span>
                <div className="text-2xl font-bold font-mono text-emerald-700">{metrics.approvedClaims}</div>
                <span className="text-[11px] text-[#5C6470]">Awaiting admin settlement</span>
              </div>

              <div className="p-4 rounded-xl border border-teal-200 bg-white space-y-1 shadow-sm">
                <span className="text-xs text-teal-700 font-bold">Paid Settlements</span>
                <div className="text-2xl font-bold font-mono text-teal-700">{metrics.paidClaims}</div>
                <span className="text-[11px] text-rose-600 font-medium">{metrics.refusedViolationsCount} refused violations</span>
              </div>
            </div>
          )}

          {/* Analytics Chart & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl border border-[#DDE1E6] bg-white space-y-4 shadow-sm">
              <h3 className="text-xs font-bold font-mono uppercase text-[#183153] tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#42658A]" />
                Adjudication Lifecycle Distribution
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#5C6470" fontSize={11} />
                    <YAxis stroke="#5C6470" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#DDE1E6', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-5 rounded-2xl border border-[#DDE1E6] bg-white space-y-4 shadow-sm">
              <h3 className="text-xs font-bold font-mono uppercase text-[#183153] tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#42658A]" />
                Financial Liability
              </h3>
              <dl className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <dt className="text-[#5C6470] mb-0.5">Total Requested Liability</dt>
                  <dd className="font-mono text-base font-bold text-[#183153]">
                    ₹{(metrics?.totalRequestedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <dt className="text-emerald-800 mb-0.5">Total Authorized Payout</dt>
                  <dd className="font-mono text-base font-bold text-emerald-900">
                    ₹{(metrics?.totalApprovedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <dt className="text-amber-800 mb-0.5">High-Value Escalation Threshold</dt>
                  <dd className="font-mono text-base font-bold text-amber-900">
                    ₹{(insurer?.highValueThreshold || 500000).toLocaleString('en-IN')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVED CLAIMS SETTLEMENT QUEUE */}
      {activeTab === 'SETTLEMENTS' && (
        <div className="p-6 rounded-2xl border border-[#DDE1E6] bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#183153] flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-teal-600" />
                Approved Claims Administrative Settlement Queue
              </h2>
              <p className="text-xs text-[#5C6470]">
                Claims approved by the supervisor that require administrative verification and NEFT / direct disbursement execution.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {approvedClaims.length} Pending Settlement
            </span>
          </div>

          {approvedClaims.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
              <p className="text-xs font-semibold text-[#183153]">All approved claims have been settled and disbursed.</p>
              <p className="text-[11px] text-[#5C6470]">Claims approved by supervisors will appear here for payment execution.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[#5C6470]">
                    <th className="py-3 px-3 font-mono">Reference</th>
                    <th className="py-3 px-3">Policyholder</th>
                    <th className="py-3 px-3">Policy Plan</th>
                    <th className="py-3 px-3 text-right">Approved Amount</th>
                    <th className="py-3 px-3">Supervisor Decision</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        {claim.claimReference}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#252B33]">
                        {claim.policyholderName}
                      </td>
                      <td className="py-3 px-3 text-[#5C6470]">
                        {claim.policyTitle}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        ₹{(claim.approvedAmount || claim.requestedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          APPROVED
                        </span>
                        {claim.supervisorDecisionJustification && (
                          <span className="text-[11px] text-[#5C6470] block truncate max-w-xs mt-0.5" title={claim.supervisorDecisionJustification}>
                            "{claim.supervisorDecisionJustification}"
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSettlingClaim(claim);
                            setSettlementRef(`NEFT-${Date.now().toString().slice(-8)}`);
                            setSettlementNotes('');
                            setSettlementError(null);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                        >
                          Disburse Settlement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: POLICY RULES & CONFIGURATION */}
      {activeTab === 'POLICIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#183153] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#42658A]" />
              Configured Insurance Policies ({policies.length})
            </h2>
            <p className="text-xs text-[#5C6470]">
              Historical evaluations are immutably protected via rule snapshots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((p) => {
              let exclusions: string[] = [];
              try {
                exclusions = JSON.parse(p.excludedCategories || '[]');
              } catch (_) {}

              return (
                <div key={p.id} className="p-5 rounded-2xl border border-[#DDE1E6] bg-white space-y-3 shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#252B33]">{p.title}</h3>
                      <span className="text-xs font-mono text-[#5C6470]">#{p.policyNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        ACTIVE
                      </span>
                      <button
                        onClick={() => openEditPolicy(p)}
                        className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                        title="Edit Policy Parameters"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-[#5C6470] block text-[11px]">Coverage Limit</span>
                      <strong className="text-[#252B33] font-mono">₹{p.coverageLimit.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[#5C6470] block text-[11px]">Deductible</span>
                      <strong className="text-[#252B33] font-mono">₹{p.deductible.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[#5C6470] block text-[11px]">Filing Window</span>
                      <strong className="text-[#252B33] font-mono">{p.filingWindowDays} Days</strong>
                    </div>
                  </div>

                  {exclusions.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] text-[#5C6470] block mb-1 font-medium">Excluded Perils:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {exclusions.map((ex, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                            ⛔ {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-1 text-[11px] font-mono text-slate-400">
                    Validity: {p.effectiveDate} to {p.expiryDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: STAFF & ROLE MANAGEMENT */}
      {activeTab === 'STAFF' && (
        <div className="p-6 rounded-2xl border border-[#DDE1E6] bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#183153] flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-[#42658A]" />
                Authorized Insurer Personnel & Roles ({employees.length})
              </h2>
              <p className="text-xs text-[#5C6470]">
                Assign and manage workflow roles. Role modifications are cryptographically audited into the ledger.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#252B33]">{emp.fullName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#183153] border border-blue-200">
                    {emp.role}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#5C6470] block">{emp.email}</span>
                <button
                  onClick={() => {
                    setRoleModalUser(emp);
                    setNewRole(emp.role);
                    setRoleJustification('');
                    setRoleError(null);
                  }}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Reassign Role
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HIGH-VALUE THRESHOLD CONFIGURATION */}
      {activeTab === 'SETTINGS' && (
        <div className="p-6 rounded-2xl border border-[#DDE1E6] bg-white shadow-sm space-y-6 max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-[#183153] flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-amber-600" />
              Configure High-Value Claim Escalation Threshold
            </h2>
            <p className="text-xs text-[#5C6470] mt-1">
              Claims with requested amounts equal to or exceeding this threshold are prioritized in the supervisor decision queue.
            </p>
          </div>

          {thresholdMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-medium border ${
              thresholdMessage.startsWith('Error')
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
              {thresholdMessage}
            </div>
          )}

          <form onSubmit={handleUpdateThreshold} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#252B33]">
                Monetary Threshold (₹ INR) *
              </label>
              <input
                type="number"
                min="0"
                max="100000000"
                step="1000"
                required
                value={thresholdInput}
                onChange={(e) => setThresholdInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-[#183153] bg-white"
              />
              <p className="text-[11px] text-[#5C6470]">
                Current active threshold: ₹{(insurer?.highValueThreshold || 500000).toLocaleString('en-IN')}. Max ceiling: ₹10,00,00,000.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#252B33]">
                Administrative Reason for Modification *
              </label>
              <textarea
                rows={3}
                required
                value={thresholdReason}
                onChange={(e) => setThresholdReason(e.target.value)}
                placeholder="e.g. Annual risk calibration for FY2026-27 per IRDAI solvency norms..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-[#252B33] bg-white resize-none"
              />
              <p className="text-[11px] text-[#5C6470]">
                🔒 Stored permanently in the SHA-256 hash-chained audit ledger with admin identity and timestamp.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingThreshold}
              className="px-5 py-2.5 rounded-xl bg-[#183153] hover:bg-[#12243d] text-white font-semibold text-xs disabled:opacity-50 transition-all shadow-sm"
            >
              {savingThreshold ? 'Saving to Database…' : 'Update & Audit Threshold'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: DISBURSE SETTLEMENT */}
      {settlingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#183153]">
                Execute Settlement: <span className="font-mono text-teal-700">{settlingClaim.claimReference}</span>
              </h3>
              <button onClick={() => setSettlingClaim(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {settlementError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800">
                {settlementError}
              </div>
            )}

            <form onSubmit={handleExecuteSettlement} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                <span className="text-[#5C6470] block text-[11px]">Authorized Payout Amount:</span>
                <span className="font-mono text-lg font-bold text-teal-900 block">
                  ₹{(settlingClaim.approvedAmount || settlingClaim.requestedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-teal-800 block">
                  Beneficiary: {settlingClaim.policyholderName}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#252B33]">NEFT / UTR Settlement Reference Number *</label>
                <input
                  type="text"
                  required
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  placeholder="e.g. NEFT-20261011-98765"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#252B33]">Disbursement Notes (Optional)</label>
                <input
                  type="text"
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  placeholder="e.g. Paid via ICICI Core Banking batch 41"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettlingClaim(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all shadow-sm"
                >
                  {processingPayment ? 'Processing…' : 'Confirm Disbursement (PAID)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT POLICY */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#183153]">
                {editingPolicyId ? 'Edit Underwriting Policy Parameters' : 'Deploy New Insurance Policy Plan'}
              </h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {policyError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800">
                {policyError}
              </div>
            )}

            <form onSubmit={handleSavePolicy} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#252B33]">Policy Code *</label>
                  <input
                    type="text"
                    required
                    value={policyForm.policyNumber}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                    placeholder="e.g. ICICI-HEALTH-500"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#252B33]">Policy Plan Title *</label>
                  <input
                    type="text"
                    required
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                    placeholder="e.g. Comprehensive Arogya Sanjeevani"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#252B33]">Coverage Limit (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={policyForm.coverageLimit}
                    onChange={(e) => setPolicyForm({ ...policyForm, coverageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs bg-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#252B33]">Deductible (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={policyForm.deductible}
                    onChange={(e) => setPolicyForm({ ...policyForm, deductible: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#252B33]">Filing Window (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={policyForm.filingWindowDays}
                    onChange={(e) => setPolicyForm({ ...policyForm, filingWindowDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#252B33]">Effective Date *</label>
                  <input
                    type="date"
                    required
                    value={policyForm.effectiveDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#252B33]">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={policyForm.expiryDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#252B33]">Excluded Perils (JSON Array) *</label>
                <input
                  type="text"
                  required
                  value={policyForm.excludedCategories}
                  onChange={(e) => setPolicyForm({ ...policyForm, excludedCategories: e.target.value })}
                  placeholder='["WAR", "EARTHQUAKE", "RACING"]'
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPolicy}
                  className="px-5 py-2 rounded-xl bg-[#183153] hover:bg-[#12243d] text-white font-semibold transition-all shadow-sm"
                >
                  {savingPolicy ? 'Saving…' : editingPolicyId ? 'Update Policy' : 'Deploy Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REASSIGN USER ROLE */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#183153]">
                Manage Staff Role: <span className="font-bold">{roleModalUser.fullName}</span>
              </h3>
              <button onClick={() => setRoleModalUser(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {roleError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800">
                {roleError}
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-[#252B33]">Target Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="CLAIMS_OFFICER">Claims Officer</option>
                  <option value="SUPERVISOR">Claims Supervisor</option>
                  <option value="INSURER_ADMIN">Insurer Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#252B33]">Justification / Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={roleJustification}
                  onChange={(e) => setRoleJustification(e.target.value)}
                  placeholder="e.g. Promotion to senior supervisor queue handler..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="px-5 py-2 rounded-xl bg-[#183153] hover:bg-[#12243d] text-white font-semibold transition-all shadow-sm"
                >
                  {savingRole ? 'Saving…' : 'Commit Role Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
