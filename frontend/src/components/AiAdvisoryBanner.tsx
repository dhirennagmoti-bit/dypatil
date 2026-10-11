import React from 'react';
import { AiExtraction, AiInconsistencyFlag } from '../types';
import { Sparkles, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface Props {
  aiExtraction: AiExtraction;
}

export const AiAdvisoryBanner: React.FC<Props> = ({ aiExtraction }) => {
  let flags: AiInconsistencyFlag[] = [];
  try {
    flags = JSON.parse(aiExtraction.inconsistencyFlagsJson || '[]');
  } catch (_) {}

  let entities: Record<string, any> = {};
  try {
    entities = JSON.parse(aiExtraction.extractedEntitiesJson || '{}');
  } catch (_) {}

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-ink">AI Narrative Advisory</h3>
              <span className="text-[10px] font-mono bg-gray-100 text-ink-muted px-1.5 py-0.5 rounded border border-gray-200">
                {(aiExtraction.confidenceScore * 100).toFixed(0)}% confidence
              </span>
            </div>
            <p className="text-xs text-ink-muted">Entity extraction and consistency check.</p>
          </div>
        </div>

        {aiExtraction.hasInconsistency ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Review Flag
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
            <Info className="w-3.5 h-3.5" />
            Consistent
          </span>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="p-3 rounded border border-blue-200 bg-blue-50 text-xs flex items-start gap-2 text-blue-800">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>B-02 Compliance:</strong> AI review prompts are advisory only. They do not constitute
          proof of fraud and do not determine eligibility or alter workflow states.
        </p>
      </div>

      {/* Summary */}
      <div className="p-3 rounded border border-gray-100 bg-gray-50 text-xs">
        <span className="font-medium text-ink block mb-1">Extracted Summary</span>
        <p className="text-ink-muted leading-relaxed">{aiExtraction.extractedSummary}</p>
      </div>

      {/* Entities */}
      {Object.keys(entities).length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider block">
            Extracted Entities
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {entities.location && (
              <span className="px-2 py-1 rounded bg-gray-100 text-ink border border-gray-200 font-mono">
                📍 {entities.location}
              </span>
            )}
            {entities.amounts_mentioned && entities.amounts_mentioned.length > 0 && (
              <span className="px-2 py-1 rounded bg-gray-100 text-ink border border-gray-200 font-mono">
                💵 {entities.amounts_mentioned.join(', ')}
              </span>
            )}
            {entities.detected_keywords && entities.detected_keywords.map((kw: string, i: number) => (
              <span key={i} className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[11px]">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inconsistency Flags */}
      {flags.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Advisory Discrepancies
          </span>
          <div className="space-y-1.5">
            {flags.map((flag, i) => (
              <div key={i} className="p-2.5 rounded border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-start gap-2">
                <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200">
                  {flag.severity || 'REVIEW'}
                </span>
                <p className="leading-relaxed">{flag.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
