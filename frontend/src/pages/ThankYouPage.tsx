import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight, Home, Headphones, FileText } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const ThankYouPage: React.FC = () => {
  usePageMeta({
    title: 'Thank You | InsureChain Bharat',
    description: 'Your insurance request or inquiry has been received and verified under IRDAI guidelines.',
  });

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-50">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Request Confirmed & Encrypted
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Thank You for Trusting InsureChain!
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Your inquiry or policy transition has been securely logged on our SHA-256 cryptographic ledger. A confirmation receipt has been dispatched to your email.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span>Next Step:</span>
            <strong className="text-[#0F172A]">Claims Specialist Review</strong>
          </div>
          <div className="flex items-center justify-between text-[#64748B]">
            <span>Turnaround Time:</span>
            <strong className="text-emerald-700">Under 2 hours</strong>
          </div>
          <div className="flex items-center justify-between text-[#64748B]">
            <span>Support Desk:</span>
            <a href="mailto:insureclaimsupport@gmail.com" className="text-blue-600 font-mono font-semibold">
              insureclaimsupport@gmail.com
            </a>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/policyholder/dashboard"
            className="flex-1 py-3 px-4 rounded-xl bg-[#003B73] hover:bg-[#002952] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            Go to My Dashboard
          </Link>
          <Link
            to="/help"
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Headphones className="w-4 h-4 text-orange-500" />
            Talk to Expert
          </Link>
        </div>
      </div>
    </div>
  );
};
