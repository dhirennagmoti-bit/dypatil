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
    <div className="rounded-xl border border-indigo-900/40 bg-gradient-to-b from-indigo-950/20 to-slate-900/60 p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">AI Narrative Extraction & Consistency Advisory</h3>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Confidence: {(aiExtraction.confidenceScore * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated entity extraction and timeline cross-referencing.
            </p>
          </div>
        </div>

        {aiExtraction.hasInconsistency ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Advisory Review Flag
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Info className="w-3.5 h-3.5" />
            Narrative Consistent
          </span>
        )}
      </div>

      {/* Mandatory Official Hackathon Separation Notice */}
      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/60 text-xs flex items-start gap-2.5 text-slate-300">
        <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-indigo-200">B-02 Mandate Compliance Notice: </span>
          <span className="text-slate-400">
            AI review prompts are strictly advisory tools for claims officers. They do not constitute proof of fraud and do not independently determine claim eligibility or alter workflow states.
          </span>
        </div>
      </div>

      {/* Extracted Summary */}
      <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
        <span className="font-semibold text-slate-200 block mb-1">Extracted Summary:</span>
        <p className="text-slate-400 leading-relaxed">{aiExtraction.extractedSummary}</p>
      </div>

      {/* Extracted Entities */}
      {Object.keys(entities).length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Corroborated Entities:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {entities.location && (
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                📍 {entities.location}
              </span>
            )}
            {entities.amounts_mentioned && entities.amounts_mentioned.length > 0 && (
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                💵 {entities.amounts_mentioned.join(', ')}
              </span>
            )}
            {entities.detected_keywords && entities.detected_keywords.map((kw: string, i: number) => (
              <span key={i} className="px-2 py-1 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 font-mono text-[11px]">
                🏷️ {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inconsistency Flags */}
      {flags.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Detected Advisory Discrepancies:
          </span>
          <div className="grid gap-2">
            {flags.map((flag, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200 flex items-start gap-2">
                <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                  {flag.severity || 'REVIEW'}
                </span>
                <p className="text-amber-300/90 leading-relaxed">{flag.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
