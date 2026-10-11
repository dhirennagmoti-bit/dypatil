import React, { useState, useEffect } from 'react';
import { Cookie, X, Check, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('insurechain_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('insurechain_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('insurechain_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A]">Cookie & Security Notice</h4>
              <span className="text-[10px] text-[#64748B]">DPDP Act 2023 Compliant</span>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          We use essential and cryptographic verification cookies to ensure multi-insurer claim integrity and seamless sessions. Read our{' '}
          <Link to="/privacy" className="text-blue-600 font-semibold underline">
            Privacy Policy
          </Link>.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-2 px-3 rounded-xl bg-[#003B73] hover:bg-[#002952] text-white text-xs font-bold transition-all shadow-xs"
          >
            Accept Cookies
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#475569] transition-all"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};
