import React from 'react';
import { Scale, ShieldCheck, AlertCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const TermsPage: React.FC = () => {
  usePageMeta({
    title: 'Terms of Use & Regulatory Solicitation | InsureChain Bharat',
    description: 'Terms of service, deterministic claim rules, and statutory IRDAI solicitation disclosures.',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
          <Scale className="w-4 h-4 text-orange-600" />
          Statutory Disclosure • Section 41 of Insurance Act, 1938
        </div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-[#64748B]">
          Governing the use of InsureChain Multi-Insurer Claims & Cryptographic Ledger Network
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#475569] space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0F172A]">1. Solicitation Disclaimer</h2>
          <p>
            *Insurance is the subject matter of solicitation. InsureChain Bharat Technologies Ltd. operates as a digital aggregator and multi-insurer adjudication software platform under the IRDAI Sandbox framework. Product information, deductibles, and benefits displayed on this portal are governed by the respective underwriter policies (including Apex Mutual, Star Health, Vortex Shield, and HDFC ERGO).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0F172A]">2. Deterministic Eligibility & Duplicate Incident Rules</h2>
          <p>
            All claim determinations are governed by deterministic rule models as specified in VORTEXA 3.0 Problem Statement B-02. Submission of duplicate claims for the same stable incident under the same policy is prohibited under IRDAI anti-double-dipping guidelines and will be blocked automatically by our fraud prevention filters.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0F172A]">3. Cryptographic Tamper-Detection</h2>
          <p>
            Every user action, state progression, and supervisory review is hashed into our SHA-256 parent-chained audit log. Users acknowledge that these cryptographic audit trails are tamper-evident and serve as admissible digital evidence for compliance reviews.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0F172A]">4. Official Contact & Jurisdiction</h2>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div><strong>Corporate Entity:</strong> InsureChain Bharat Technologies Limited (CIN: U66010MH2026PLC987654)</div>
            <div><strong>Registered Office:</strong> Level 7, Maker Maxity, Bandra Kurla Complex (BKC), Bandra East, Mumbai, Maharashtra 400051</div>
            <div><strong>Official Email:</strong> <a href="mailto:insureclaimsupport@gmail.com" className="text-blue-600 font-mono">insureclaimsupport@gmail.com</a></div>
            <div><strong>Toll-Free Helpline:</strong> 1800-258-4433</div>
            <div><strong>Jurisdiction:</strong> Courts of Mumbai, Maharashtra, India</div>
          </div>
        </section>
      </div>
    </div>
  );
};
