import React from 'react';
import { ClaimStatus } from '../types';
import { Clock, AlertCircle, CheckCircle2, XCircle, DollarSign, HelpCircle } from 'lucide-react';

interface Props {
  status: ClaimStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  ClaimStatus,
  { label: string; badgeClass: string; dotClass: string; icon: React.FC<{ className?: string }> }
> = {
  SUBMITTED: {
    label: 'Submitted',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    icon: AlertCircle,
  },
  ADDITIONAL_INFO_REQUIRED: {
    label: 'Info Requested',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
    icon: HelpCircle,
  },
  APPROVED: {
    label: 'Approved',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    icon: XCircle,
  },
  PAID: {
    label: 'Settled & Paid',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    dotClass: 'bg-teal-500',
    icon: DollarSign,
  },
};

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.SUBMITTED;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono border font-medium transition-all ${config.badgeClass} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}></span>
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
};
