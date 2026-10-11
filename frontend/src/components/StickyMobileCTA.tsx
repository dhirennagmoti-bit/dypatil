import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, PhoneCall, Headphones } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const StickyMobileCTA: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  // Don't show sticky bar on login, register, or submit pages to avoid blocking keyboard inputs
  if (
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/policyholder/submit'
  ) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-lg">
      <div className="flex items-center gap-2">
        <Link
          to="/policyholder/marketplace"
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t('stickyCompare') || 'Compare Plans'}</span>
        </Link>

        <Link
          to="/help"
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#003B73] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <Headphones className="w-3.5 h-3.5 text-orange-400" />
          <span>{t('stickyExpert') || 'Talk to Expert'}</span>
        </Link>

        <a
          href="tel:18002584433"
          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-emerald-700 active:bg-emerald-50"
          title="Call Helpline"
          aria-label="Call 24x7 Toll-Free Helpline"
        >
          <PhoneCall className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
