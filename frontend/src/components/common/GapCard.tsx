import React from 'react';
import { CandidateResearchGap } from '@research-agent/shared';
import { Compass, FileText, ArrowRight } from 'lucide-react';

interface GapCardProps {
  gap: CandidateResearchGap;
}

export const GapCard: React.FC<GapCardProps> = ({ gap }) => {
  return (
    <div className="glass-card p-6 rounded-xl border border-slate-800 bg-slate-900/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Compass className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Candidate Research Gap
          </span>
          <h4 className="text-lg font-bold text-slate-100 mt-1">{gap.gap}</h4>
        </div>
      </div>

      <div className="space-y-3 my-4">
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Why Underexplored</span>
          <p className="text-sm text-slate-300 leading-relaxed">{gap.whyUnderexplored}</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <span className="text-xs font-semibold text-brand-400 block mb-1">Actionable Research Direction</span>
          <p className="text-sm text-slate-200 font-medium leading-relaxed flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <span>{gap.possibleResearchDirection}</span>
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <span className="font-semibold text-slate-400 flex items-center gap-1 mb-1">
          <FileText className="w-3.5 h-3.5" /> Supporting Literature:
        </span>
        <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
          {gap.supportingPaperTitles.map((title, i) => (
            <li key={i} className="line-clamp-1">
              {title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
