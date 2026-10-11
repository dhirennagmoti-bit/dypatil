import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, HelpCircle, ShoppingBag } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const NotFoundPage: React.FC = () => {
  usePageMeta({
    title: '404 - Page Not Found',
    description: 'The requested insurance page or claim record was not found on the InsureChain Bharat network.',
  });

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
            Error 404 • Resource Not Found
          </span>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Claim or Page Not Found
          </h1>
          <p className="text-xs text-[#64748B] leading-relaxed">
            The link you followed may be expired, or the policy/claim record ID does not exist in our active Supabase registry.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="flex-1 py-3 px-4 rounded-xl bg-[#003B73] hover:bg-[#002952] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/help"
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Help Center
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-[#94A3B8]">
          Need immediate support? Email{' '}
          <a href="mailto:insureclaimsupport@gmail.com" className="text-blue-600 font-bold underline">
            insureclaimsupport@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};
