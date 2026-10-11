import React from 'react';
import { EligibilityResult } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';

interface Props {
  evaluation: EligibilityResult;
}

export const EligibilityExplainer: React.FC<Props> = ({ evaluation }) => {
  const isCapped = evaluation.primaryExplanation.includes('CAPPED');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Deterministic Rules Engine Evaluation
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                Rule B-02
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated mathematically by backend business logic with deterministic rule guarantees.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Suggested Payout</span>
          <span className={`text-lg font-bold font-mono ${evaluation.eligible ? 'text-emerald-400' : 'text-slate-500'}`}>
            ${evaluation.suggestedPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Primary Verdict Banner */}
      <div
        className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
          evaluation.eligible
            ? isCapped
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
        }`}
      >
        {evaluation.eligible ? (
          isCapped ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          )
        ) : (
          <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
        )}
        <div className="space-y-0.5">
          <span className="font-semibold block">
            {evaluation.eligible
              ? isCapped
                ? 'Partially Eligible (Coverage Capped)'
                : 'Fully Eligible for Claim Settlement'
              : 'Claim Disqualified by Policy Rules'}
          </span>
          <p className="opacity-90 leading-relaxed">{evaluation.primaryExplanation}</p>
        </div>
      </div>

      {/* Itemized Rule Check Table */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
          Itemized Policy Rule Breakdown:
        </h4>
        <div className="grid gap-2">
          {evaluation.rules.map((rule, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                rule.passed
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                  : 'bg-rose-950/10 border-rose-900/40 text-rose-200'
              }`}
            >
              {rule.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-200">{rule.rule}</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                      rule.passed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {rule.passed ? 'PASSED' : 'VIOLATION'}
                  </span>
                </div>
                <p className="mt-1 text-slate-400 leading-normal">{rule.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
