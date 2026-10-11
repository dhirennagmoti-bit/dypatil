import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const PrivacyPolicyPage: React.FC = () => {
  usePageMeta({
    title: 'Privacy Policy | InsureChain Bharat',
    description: 'Privacy policy compliant with the Digital Personal Data Protection (DPDP) Act 2023 and IRDAI cyber security standards.',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Digital Personal Data Protection Act, 2023 (DPDP Act) Compliant
        </div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Privacy Policy & Data Security
        </h1>
        <p className="text-xs text-[#64748B]">
          Effective Date: October 11, 2026 • Registered under IRDAI Regulatory Sandbox (Problem B-02)
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#475569] space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0F172A]">1. Scope & Fiduciary Commitment</h2>
          <p>
            InsureChain Bharat Technologies Ltd. ("InsureChain", "we", "us") operates as a secure multi-insurer claims orchestration platform. We are committed to safeguarding personal identification numbers, health medical records, motor registration details, and financial transaction histories under the Digital Personal Data Protection Act, 2023 (DPDP Act) and IRDAI Information and Cyber Security Guidelines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0F172A]">2. Data Collected for Underwriting & Adjudication</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Identity Data:</strong> Full legal name, Indian mobile number (+91), email address, and demographic tier.</li>
            <li><strong>Policy & Claim Data:</strong> Active insurance contract IDs, claimed monetary amounts in ₹, hospital discharge summaries, FIR / police panchnama evidence, and stable Incident Identifiers.</li>
            <li><strong>Cryptographic Hashes:</strong> Digital SHA-256 fingerprints of workflow transitions and auditor verification signatures.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0F172A]">3. Cryptographic Storage & Multi-Tenant Isolation</h2>
          <p>
            Claim records are hosted in our sovereign Supabase PostgreSQL cluster located in the AWS Asia-Pacific (ap-northeast-1) region. Access is strictly partitioned using role-based row-level isolation so that competing Indian insurers cannot inspect or access claims from competing underwriters.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0F172A]">4. Grievance Redressal & Data Protection Officer (DPO)</h2>
          <p>
            In accordance with Rule 3 of the Information Technology (Intermediary Guidelines) Rules, you may address inquiries, consent withdrawals, or data correction requests to our Data Protection Officer:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div><strong>DPO Contact:</strong> Grievance Redressal Officer</div>
            <div><strong>Email:</strong> <a href="mailto:insureclaimsupport@gmail.com" className="text-blue-600 font-mono">insureclaimsupport@gmail.com</a></div>
            <div><strong>Toll-Free Helpline:</strong> 1800-258-4433</div>
            <div><strong>Address:</strong> Level 7, Maker Maxity, Bandra Kurla Complex (BKC), Mumbai, MH 400051</div>
          </div>
        </section>
      </div>
    </div>
  );
};
