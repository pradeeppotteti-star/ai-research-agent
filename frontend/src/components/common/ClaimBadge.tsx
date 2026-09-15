import React from 'react';
import { VerificationStatus } from '@research-agent/shared';
import { CheckCircle2, HelpCircle, AlertTriangle } from 'lucide-react';

interface ClaimBadgeProps {
  status: VerificationStatus;
  confidence?: number;
  className?: string;
}

export const ClaimBadge: React.FC<ClaimBadgeProps> = ({ status, confidence, className = '' }) => {
  const confidencePct = confidence ? Math.round(confidence * 100) : null;

  if (status === 'supported') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 ${className}`}
        title={`Supported Claim (${confidencePct}% Grounding Score)`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Supported</span>
        {confidencePct && <span className="opacity-75 font-mono">({confidencePct}%)</span>}
      </span>
    );
  }

  if (status === 'inferred') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 ${className}`}
        title={`Inferred Claim (${confidencePct}% Grounding Score)`}
      >
        <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>Inferred</span>
        {confidencePct && <span className="opacity-75 font-mono">({confidencePct}%)</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30 ${className}`}
      title={`Uncertain Claim (${confidencePct}% Grounding Score)`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
      <span>Uncertain</span>
      {confidencePct && <span className="opacity-75 font-mono">({confidencePct}%)</span>}
    </span>
  );
};
