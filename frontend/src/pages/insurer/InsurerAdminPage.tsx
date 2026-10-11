import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Insurer, InsurerMetrics, Policy, User } from '../../types';
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
  Scale,
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
  const [loading, setLoading] = useState(true);

  // New Policy Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    policyNumber: '',
    title: '',
    description: '',
    category: 'PROPERTY',
    coverageLimit: 50000,
    deductible: 500,
    filingWindowDays: 30,
    excludedCategories: '["WAR", "INTENTIONAL_DAMAGE"]',
    policyRulesDescription: 'Standard commercial property underwriting rules.',
    effectiveDate: '2026-01-01',
    expiryDate: '2026-12-31',
  });
  const [savingPolicy, setSavingPolicy] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user?.insurerId) {
        setLoading(false);
        return;
      }
      try {
        const [ins, met, pols, staff] = await Promise.all([
          api.insurers.getById(user.insurerId),
          api.insurers.getMetrics(user.insurerId),
          api.policies.getByInsurer(user.insurerId),
          api.insurers.getUsers(user.insurerId),
        ]);
        setInsurer(ins);
        setMetrics(met);
        setPolicies(pols);
        setEmployees(staff);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.insurerId]);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPolicy(true);
    try {
      await api.policies.create(newPolicy);
      setShowCreateModal(false);
      if (user?.insurerId) {
        const updated = await api.policies.getByInsurer(user.insurerId);
        setPolicies(updated);
      }
    } catch (err: any) {
      alert('Error creating policy: ' + err.message);
    } finally {
      setSavingPolicy(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#5C6470]">Loading insurer admin portal...</div>;
  }

  const chartData = metrics
    ? [
        { name: 'Submitted', count: metrics.submittedClaims, fill: '#42658A' },
        { name: 'Under Review', count: metrics.underReviewClaims, fill: '#d97706' },
        { name: 'Approved', count: metrics.approvedClaims, fill: '#059669' },
        { name: 'Rejected', count: metrics.rejectedClaims, fill: '#dc2626' },
        { name: 'Paid', count: metrics.paidClaims, fill: '#0d9488' },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-white border border-[#DDE1E6] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#183153] tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#42658A]" />
              {insurer?.name || 'Insurer Administration'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-[#183153] border border-blue-200 font-semibold">
              Code: {insurer?.code}
            </span>
          </div>
          <p className="text-xs text-[#5C6470]">
            Configure underwriting rules, manage organization staff, and oversee claims adjudication analytics.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-lg bg-[#183153] hover:bg-[#12243d] text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Policy Plan
        </button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#DDE1E6] bg-white space-y-1 shadow-sm">
            <span className="text-xs text-[#5C6470]">Total Claims Volume</span>
            <div className="text-2xl font-bold font-mono text-[#183153]">{metrics.totalClaims}</div>
            <span className="text-[11px] text-[#5C6470]">Across {metrics.totalPolicies} active policies</span>
          </div>

          <div className="p-4 rounded-xl border border-[#DDE1E6] bg-white space-y-1 shadow-sm">
            <span className="text-xs text-[#5C6470]">Total Claimed Value</span>
            <div className="text-2xl font-bold font-mono text-[#42658A]">
              ₹{metrics.totalRequestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[#5C6470]">Submitted requested liability</span>
          </div>

          <div className="p-4 rounded-xl border border-[#DDE1E6] bg-white space-y-1 shadow-sm">
            <span className="text-xs text-[#5C6470]">Approved Settlements</span>
            <div className="text-2xl font-bold font-mono text-emerald-700">
              ₹{metrics.totalApprovedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[#5C6470]">{metrics.approvedClaims + metrics.paidClaims} claims authorized</span>
          </div>

          <div className="p-4 rounded-xl border border-[#DDE1E6] bg-white space-y-1 shadow-sm">
            <span className="text-xs text-[#5C6470]">Settled & Paid</span>
            <div className="text-2xl font-bold font-mono text-teal-700">{metrics.paidClaims}</div>
            <span className="text-[11px] text-[#5C6470]">{metrics.rejectedClaims} claims rejected</span>
          </div>
        </div>
      )}

      {/* Analytics Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-[#DDE1E6] bg-white space-y-4 shadow-sm">
          <h3 className="text-xs font-bold font-mono uppercase text-[#183153] tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#42658A]" />
            Claim Adjudication Workflow Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#5C6470" fontSize={11} />
                <YAxis stroke="#5C6470" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#DDE1E6', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Organization Personnel */}
        <div className="p-5 rounded-xl border border-[#DDE1E6] bg-white space-y-4 shadow-sm">
          <h3 className="text-xs font-bold font-mono uppercase text-[#183153] tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#42658A]" />
            Authorized Organization Personnel ({employees.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {employees.map((emp) => (
              <div key={emp.id} className="p-3 rounded-lg bg-[#F7F7F4] border border-[#DDE1E6] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#252B33]">{emp.fullName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-[#183153] border border-blue-200">
                    {emp.role}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#5C6470] block mt-0.5">{emp.email}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Underwriting Policies Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#183153] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#42658A]" />
          Underwriting Policies & Rules ({policies.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => {
            let exclusions: string[] = [];
            try {
              exclusions = JSON.parse(p.excludedCategories || '[]');
            } catch (_) {}

            return (
              <div key={p.id} className="p-5 rounded-xl border border-[#DDE1E6] bg-white space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#252B33]">{p.title}</h3>
                    <span className="text-xs font-mono text-[#5C6470]">#{p.policyNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs border-t border-[#F0F2F5] pt-3">
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
                    <span className="text-[11px] text-[#5C6470] block mb-1 font-medium">Excluded Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {exclusions.map((ex, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                          ⛔ {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl p-6 rounded-xl bg-white border border-[#DDE1E6] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-3">
              <h3 className="text-base font-bold text-[#183153]">Create New Insurance Policy Plan</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#5C6470] hover:text-[#252B33] text-xs font-semibold">
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#252B33]">Policy Number</label>
                  <input
                    type="text"
                    required
                    value={newPolicy.policyNumber}
                    onChange={(e) => setNewPolicy({ ...newPolicy, policyNumber: e.target.value })}
                    placeholder="e.g. APEX-AUTO-202"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDE1E6] text-xs text-[#252B33] focus:outline-none focus:border-[#183153]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#252B33]">Policy Plan Title</label>
                  <input
                    type="text"
                    required
                    value={newPolicy.title}
                    onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                    placeholder="e.g. Comprehensive Commercial Shield"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDE1E6] text-xs text-[#252B33] focus:outline-none focus:border-[#183153]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#252B33]">Coverage Limit (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPolicy.coverageLimit}
                    onChange={(e) => setNewPolicy({ ...newPolicy, coverageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDE1E6] text-xs text-[#252B33] font-mono focus:outline-none focus:border-[#183153]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#252B33]">Deductible (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPolicy.deductible}
                    onChange={(e) => setNewPolicy({ ...newPolicy, deductible: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDE1E6] text-xs text-[#252B33] font-mono focus:outline-none focus:border-[#183153]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#252B33]">Filing Window (Days)</label>
                  <input
                    type="number"
                    required
                    value={newPolicy.filingWindowDays}
                    onChange={(e) => setNewPolicy({ ...newPolicy, filingWindowDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDE1E6] text-xs text-[#252B33] font-mono focus:outline-none focus:border-[#183153]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#252B33]">Excluded Perils (JSON Array)</label>
                <input
                  type="text"
                  required
                  value={newPolicy.excludedCategories}
                  onChange={(e) => setNewPolicy({ ...newPolicy, excludedCategories: e.target.value })}
                  placeholder='["WAR", "EARTHQUAKE", "RACING"]'
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DDE1E6] text-xs text-[#252B33] font-mono focus:outline-none focus:border-[#183153]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#DDE1E6] bg-white text-[#5C6470] hover:bg-slate-50 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPolicy}
                  className="px-5 py-2 rounded-lg bg-[#183153] hover:bg-[#12243d] text-white text-xs font-medium shadow-sm transition-colors"
                >
                  {savingPolicy ? 'Saving...' : 'Deploy Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
