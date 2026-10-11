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
  PieChart,
  Pie,
  Cell,
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
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading insurer admin portal...</div>;
  }

  const chartData = metrics
    ? [
        { name: 'Submitted', count: metrics.submittedClaims, fill: '#3b82f6' },
        { name: 'Under Review', count: metrics.underReviewClaims, fill: '#f59e0b' },
        { name: 'Approved', count: metrics.approvedClaims, fill: '#10b981' },
        { name: 'Rejected', count: metrics.rejectedClaims, fill: '#f43f5e' },
        { name: 'Paid', count: metrics.paidClaims, fill: '#14b8a6' },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-400" />
              {insurer?.name || 'Insurer Administration'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Code: {insurer?.code}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Configure underwriting rules, manage organization staff, and oversee claims adjudication analytics.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Policy Plan
        </button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400">Total Claims Volume</span>
            <div className="text-2xl font-bold font-mono text-white">{metrics.totalClaims}</div>
            <span className="text-[11px] text-slate-500">Across {metrics.totalPolicies} active policies</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400">Total Claimed Value</span>
            <div className="text-2xl font-bold font-mono text-indigo-400">
              ${metrics.totalRequestedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">Submitted requested liability</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400">Approved Settlements</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ${metrics.totalApprovedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">{metrics.approvedClaims + metrics.paidClaims} claims authorized</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400">Settled & Paid</span>
            <div className="text-2xl font-bold font-mono text-teal-400">{metrics.paidClaims}</div>
            <span className="text-[11px] text-slate-500">{metrics.rejectedClaims} claims rejected</span>
          </div>
        </div>
      )}

      {/* Analytics Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Claim Adjudication Workflow Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Organization Personnel */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Authorized Organization Personnel ({employees.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {employees.map((emp) => (
              <div key={emp.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{emp.fullName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {emp.role}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">{emp.email}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Underwriting Policies Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Underwriting Policies & Rules ({policies.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => {
            let exclusions: string[] = [];
            try {
              exclusions = JSON.parse(p.excludedCategories || '[]');
            } catch (_) {}

            return (
              <div key={p.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{p.title}</h3>
                    <span className="text-xs font-mono text-slate-400">#{p.policyNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-800 pt-2">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Coverage Limit</span>
                    <strong className="text-slate-200 font-mono">${p.coverageLimit.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Deductible</span>
                    <strong className="text-slate-200 font-mono">${p.deductible.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Filing Window</span>
                    <strong className="text-slate-200 font-mono">{p.filingWindowDays} Days</strong>
                  </div>
                </div>

                {exclusions.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-500 block mb-1">Excluded Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {exclusions.map((ex, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/40 text-rose-300 border border-rose-900/40">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Insurance Policy Plan</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Policy Number</label>
                  <input
                    type="text"
                    required
                    value={newPolicy.policyNumber}
                    onChange={(e) => setNewPolicy({ ...newPolicy, policyNumber: e.target.value })}
                    placeholder="e.g. APEX-AUTO-202"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Policy Plan Title</label>
                  <input
                    type="text"
                    required
                    value={newPolicy.title}
                    onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                    placeholder="e.g. Comprehensive Commercial Shield"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Coverage Limit ($)</label>
                  <input
                    type="number"
                    required
                    value={newPolicy.coverageLimit}
                    onChange={(e) => setNewPolicy({ ...newPolicy, coverageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Deductible ($)</label>
                  <input
                    type="number"
                    required
                    value={newPolicy.deductible}
                    onChange={(e) => setNewPolicy({ ...newPolicy, deductible: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Filing Window (Days)</label>
                  <input
                    type="number"
                    required
                    value={newPolicy.filingWindowDays}
                    onChange={(e) => setNewPolicy({ ...newPolicy, filingWindowDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Excluded Perils (JSON Array)</label>
                <input
                  type="text"
                  required
                  value={newPolicy.excludedCategories}
                  onChange={(e) => setNewPolicy({ ...newPolicy, excludedCategories: e.target.value })}
                  placeholder='["WAR", "EARTHQUAKE", "RACING"]'
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPolicy}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
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
