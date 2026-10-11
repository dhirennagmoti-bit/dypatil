import React from 'react';
import { ClaimStatus } from '../types';
import { Clock, AlertCircle, CheckCircle2, XCircle, DollarSign, HelpCircle } from 'lucide-react';

interface Props {
  status: ClaimStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  switch (status) {
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5" />
          Submitted
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
          Under Review
        </span>
      );
    case 'ADDITIONAL_INFO_REQUIRED':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium ${sizeClasses}`}>
          <HelpCircle className="w-3.5 h-3.5" />
          Info Requested
        </span>
      );
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    case 'PAID':
      return (
        <span className={`inline-flex items-center rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium ${sizeClasses}`}>
          <DollarSign className="w-3.5 h-3.5" />
          Settled / Paid
        </span>
      );
    default:
      return <span className={`inline-flex rounded-full bg-slate-800 text-slate-300 ${sizeClasses}`}>{status}</span>;
  }
};
