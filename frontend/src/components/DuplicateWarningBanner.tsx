import React from 'react';
import { AlertTriangle, Fingerprint } from 'lucide-react';

interface Props {
  fingerprint: string;
  reason?: string | null;
}

export const DuplicateWarningBanner: React.FC<Props> = ({ fingerprint, reason }) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs space-y-2">
      <div className="flex items-center gap-2 text-rose-800 font-bold">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>Duplicate Incident Collision Detected</span>
      </div>
      <p className="text-rose-700 leading-relaxed">
        {reason || 'System detected an identical incident fingerprint match across policies or prior submissions.'}
      </p>
      <div className="flex items-center gap-2 text-[11px] font-mono text-[#5C6470] pt-1">
        <Fingerprint className="w-3.5 h-3.5 text-[#5C6470]" />
        <span>Incident Fingerprint:</span>
        <code className="text-[#183153] bg-white px-2 py-0.5 rounded border border-rose-200 font-medium">
          {fingerprint ? `${fingerprint.substring(0, 16)}...${fingerprint.substring(fingerprint.length - 8)}` : 'N/A'}
        </code>
      </div>
    </div>
  );
};
