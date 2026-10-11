import React from 'react';
import { AlertTriangle, Fingerprint } from 'lucide-react';

interface Props {
  fingerprint: string;
  reason?: string | null;
}

export const DuplicateWarningBanner: React.FC<Props> = ({ fingerprint, reason }) => {
  return (
    <div className="rounded-xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 to-slate-900/80 p-4 text-xs space-y-2">
      <div className="flex items-center gap-2 text-rose-300 font-bold">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>Duplicate Incident Collision Detected</span>
      </div>
      <p className="text-rose-200/90 leading-relaxed">
        {reason || 'System detected an identical incident fingerprint match across policies or prior submissions.'}
      </p>
      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
        <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
        <span>Incident Fingerprint:</span>
        <code className="text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {fingerprint ? `${fingerprint.substring(0, 16)}...${fingerprint.substring(fingerprint.length - 8)}` : 'N/A'}
        </code>
      </div>
    </div>
  );
};
