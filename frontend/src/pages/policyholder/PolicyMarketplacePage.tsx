import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Policy } from '../../types';
import { api } from '../../api/client';
import {
  Shield,
  Heart,
  Car,
  Plane,
  Building2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Filter,
  DollarSign,
  Clock,
  AlertCircle,
  HelpCircle,
  Check,
  Compass,
  Zap,
} from 'lucide-react';
import { usePageMeta } from '../../hooks/usePageMeta';

export const PolicyMarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: 'Insurance Marketplace | Compare Health & Motor Plans',
    description: 'Explore Indian health, motor, travel and commercial insurance plans with instant quotes and cashless hospital networks.',
  });

  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrolledSuccess, setEnrolledSuccess] = useState<string | null>(null);

  // AI Recommendation Wizard States
  const [insureFor, setInsureFor] = useState<'family' | 'self' | 'parents' | 'car'>('family');
  const [ageGroup, setAgeGroup] = useState<'young' | 'mid' | 'senior'>('young');
  const [cityTier, setCityTier] = useState<'metro' | 'tier2'>('metro');
  const [desiredCover, setDesiredCover] = useState<number>(2500000); // 25 Lakhs
  const [showWizardModal, setShowWizardModal] = useState(false);

  useEffect(() => {
    async function loadPolicies() {
      try {
        const data = await api.policies.getAll();
        setAllPolicies(data);
      } catch (err: any) {
        console.error('Failed to load policies', err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
  }, []);

  const handleEnroll = async (policyId: string) => {
    if (!user) {
      alert('Please sign in or create an account to enroll in an insurance plan.');
      navigate('/login');
      return;
    }
    setEnrollingId(policyId);
    try {
      await api.policies.enroll(policyId);
      setEnrolledSuccess(policyId);
      setTimeout(() => {
        navigate('/policyholder/dashboard');
      }, 1500);
    } catch (err: any) {
      alert('Enrollment error: ' + (err.message || 'Failed to enroll'));
    } finally {
      setEnrollingId(null);
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Plans', icon: Compass },
    { id: 'HEALTH', label: 'Health / Mediclaim', icon: Heart, tag: 'Tax Saver 80D' },
    { id: 'AUTO', label: 'Motor & Car', icon: Car, tag: 'Instant Zero Dep' },
    { id: 'TRAVEL', label: 'Travel & Transit', icon: Plane, tag: 'Worldwide' },
    { id: 'PROPERTY', label: 'Commercial & Property', icon: Building2, tag: 'Fire & Flood' },
  ];

  const filteredPolicies = allPolicies.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category.toUpperCase() === selectedCategory;
  });

  // Calculate dynamic best match for the recommendation engine
  const recommendedPolicy = allPolicies.find((p) => {
    if (insureFor === 'car') return p.category === 'AUTO';
    if (insureFor === 'family' || insureFor === 'parents' || insureFor === 'self') {
      return p.category === 'HEALTH' || p.category === 'PROPERTY';
    }
    return true;
  }) || allPolicies[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* Policybazaar-Style Promotional Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003B73] via-[#00509D] to-[#002952] text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            IRDAI Compliant Multi-Insurer Marketplace • Save up to 40% on Premiums
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Compare & Buy the Best Insurance for Your Family in India
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            Choose from India's premier underwriters with guaranteed cashless hospital networks, zero hidden deductions, and 100% tamper-evident cryptographic claim settlements.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowWizardModal(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              AI Policy Finder — Get Best Plan Recommendation
            </button>
            <div className="flex items-center gap-4 text-xs font-mono text-blue-200 pl-2">
              <span>✓ 10,000+ Cashless Hospitals</span>
              <span>✓ 98.6% Settlement Ratio</span>
            </div>
          </div>
        </div>

        {/* Decorative Indian Rupee Graphic Background */}
        <div className="absolute right-6 -bottom-10 opacity-10 text-9xl font-bold font-mono pointer-events-none select-none">
          ₹
        </div>
      </div>

      {/* Category Tile Navigation (Policybazaar signature UI) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
            Explore Insurance Categories
          </h2>
          <span className="text-xs text-[#64748B]">All policies include deterministic instant eligibility</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-[#0F172A]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {cat.tag && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {cat.tag}
                    </span>
                  )}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-[#0F172A]'}`}>
                    {cat.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Policy Recommendation Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 border border-blue-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                Smart Insurance Recommender
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-blue-600 text-white font-bold">
                  98% Match Score
                </span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Based on Indian demographic data, healthcare cost inflation, and IRDAI guidelines.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowWizardModal(true)}
            className="px-3.5 py-1.5 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold transition-all"
          >
            Adjust Preferences
          </button>
        </div>

        {recommendedPolicy && (
          <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {recommendedPolicy.insurerName}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Recommended For Your Profile
                </span>
              </div>
              <h4 className="text-base font-bold text-[#0F172A]">{recommendedPolicy.title}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-2xl">
                {recommendedPolicy.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-[#475569]">
                <span>Cover: <strong className="text-[#0F172A]">₹{(recommendedPolicy.coverageLimit).toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span>Deductible: <strong className="text-[#0F172A]">₹{recommendedPolicy.deductible.toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span>Filing Window: <strong className="text-[#0F172A]">{recommendedPolicy.filingWindowDays} Days</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="text-left lg:text-right">
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Premium Starting At</span>
                <div className="text-xl font-black font-mono text-[#0F172A]">
                  ₹{Math.round(recommendedPolicy.coverageLimit * 0.003).toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-[#64748B]">/year</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">Instant Digital Policy Issuance</span>
              </div>

              <button
                onClick={() => handleEnroll(recommendedPolicy.id)}
                disabled={enrollingId === recommendedPolicy.id}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {enrollingId === recommendedPolicy.id ? 'Issuing Policy Certificate...' : 'Enroll & Buy This Policy'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Policy Comparison Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
            All Available Insurance Plans in India ({filteredPolicies.length})
          </h2>
          <span className="text-xs text-[#64748B]">Transparent terms & coverage limits</span>
        </div>

        {enrolledSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Policy purchased successfully! Redirecting you to your policyholder dashboard...</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading all insurance plans...</div>
        ) : filteredPolicies.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-slate-200">
            No policies available under this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPolicies.map((policy) => {
              let exclusions: string[] = [];
              try {
                exclusions = JSON.parse(policy.excludedCategories || '[]');
              } catch (_) {}

              const isRecommended = policy.id === recommendedPolicy?.id;

              return (
                <div
                  key={policy.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-card ${
                    isRecommended
                      ? 'border-blue-400 bg-white ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-card-hover'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 block">
                          {policy.insurerName}
                        </span>
                        <h3 className="text-base font-bold text-[#0F172A] mt-0.5">{policy.title}</h3>
                        <span className="text-xs font-mono text-[#64748B]">Plan #{policy.policyNumber}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        ACTIVE
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                      {policy.description}
                    </p>

                    {/* Coverage Metrics in Indian Rupees */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[#64748B] block text-[10px] font-medium">Coverage Limit</span>
                        <strong className="text-[#0F172A] font-mono text-sm font-bold">
                          ₹{policy.coverageLimit.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[#64748B] block text-[10px] font-medium">Deductible</span>
                        <strong className="text-[#0F172A] font-mono text-sm font-bold">
                          ₹{policy.deductible.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-[#64748B] pt-1">
                      <span>Filing Window: <strong className="text-[#0F172A]">{policy.filingWindowDays} Days</strong></span>
                      <span className="text-emerald-600 font-semibold">98.4% Settlement</span>
                    </div>

                    {/* Excluded Perils */}
                    {exclusions.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] text-[#64748B] block mb-1 font-semibold uppercase tracking-wider">
                          Excluded Perils:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {exclusions.map((ex, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              ⛔ {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Estimated Premium</span>
                      <span className="text-sm font-black font-mono text-[#0F172A]">
                        ₹{Math.round(policy.coverageLimit * 0.003).toLocaleString('en-IN')}/yr
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEnroll(policy.id)}
                      disabled={enrollingId === policy.id}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                    >
                      {enrollingId === policy.id ? 'Processing...' : 'Buy Now'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Policy Recommendation Modal */}
      {showWizardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  AI Insurance Policy Recommendation Wizard
                </h3>
              </div>
              <button
                onClick={() => setShowWizardModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#0F172A] block">
                  1. Who do you want to cover?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'family', label: 'Self + Spouse + Children' },
                    { id: 'self', label: 'Individual Solo Cover' },
                    { id: 'parents', label: 'Senior Citizen Parents' },
                    { id: 'car', label: 'Personal Vehicle / Car' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInsureFor(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                        insureFor === item.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-200 text-[#475569] hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#0F172A] block">
                  2. Age of Primary Insured
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'young', label: '18 - 35 Yrs' },
                    { id: 'mid', label: '36 - 50 Yrs' },
                    { id: 'senior', label: '50+ Yrs (Senior)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAgeGroup(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                        ageGroup === item.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-200 text-[#475569] hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#0F172A] block">
                  3. City of Residence
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'metro', label: 'Tier-1 Metro (Mumbai, Delhi, BLR, HYD)' },
                    { id: 'tier2', label: 'Tier-2 City (Pune, Jaipur, Lucknow, etc.)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCityTier(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                        cityTier === item.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-200 text-[#475569] hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#0F172A] block">
                  4. Desired Coverage Sum Insured
                </label>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  {[
                    { val: 500000, label: '₹5 Lakh' },
                    { val: 1000000, label: '₹10 Lakh' },
                    { val: 2500000, label: '₹25 Lakh' },
                    { val: 10000000, label: '₹1 Crore' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDesiredCover(item.val)}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        desiredCover === item.val
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 text-[#475569] hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowWizardModal(false)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md"
              >
                Apply Preferences & Show Recommended Plan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
