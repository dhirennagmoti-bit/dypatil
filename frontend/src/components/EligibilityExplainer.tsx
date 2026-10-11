import React from 'react';
import { EligibilityResult } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';

interface Props {
  evaluation: EligibilityResult;
}

export const EligibilityExplainer: React.FC<Props> = ({ evaluation }) => {
  const isCapped = evaluation.primaryExplanation.includes('CAPPED');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-navy-50 text-navy-700 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Deterministic Eligibility Evaluation</h3>
            <p className="text-xs text-ink-muted">Backend rules engine, no AI involvement.</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-ink-muted block">Suggested Payout</span>
          <span className={`text-base font-semibold font-mono ${evaluation.eligible ? 'text-accent-success' : 'text-ink-muted'}`}>
            ₹{evaluation.suggestedPayoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Verdict */}
      <div
        className={`p-3 rounded border text-sm flex items-start gap-2.5 ${
          evaluation.eligible
            ? isCapped
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        {evaluation.eligible ? (
          isCapped ? (
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          )
        ) : (
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
        )}
        <div>
          <span className="font-medium block text-xs">
            {evaluation.eligible
              ? isCapped ? 'Partially Eligible (Coverage Capped)' : 'Fully Eligible'
              : 'Disqualified by Policy Rules'}
          </span>
          <p className="text-xs mt-0.5 opacity-90">{evaluation.primaryExplanation}</p>
        </div>
      </div>

      {/* Rules Breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Rule Breakdown</h4>
        <div className="space-y-1.5">
          {evaluation.rules.map((rule, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border text-xs flex items-start gap-2.5 ${
                rule.passed
                  ? 'bg-gray-50 border-gray-100 text-ink'
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}
            >
              {rule.passed ? (
                <CheckCircle2 className="w-4 h-4 text-accent-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-accent-error shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{rule.rule}</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                      rule.passed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {rule.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <p className="text-ink-muted mt-0.5">{rule.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
