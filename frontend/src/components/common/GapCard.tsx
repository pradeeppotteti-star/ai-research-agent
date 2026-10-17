import React from 'react';
import { CandidateResearchGap } from '@research-agent/shared';
import { Compass, FileText, ArrowRight } from 'lucide-react';

interface GapCardProps {
  gap: CandidateResearchGap;
}

export const GapCard: React.FC<GapCardProps> = ({ gap }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-[#E8E2D8] bg-white relative overflow-hidden shadow-xs hover:border-[#D8D0C4] transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D97706]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
          <Compass className="w-5 h-5 text-[#B45309]" />
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#92400E]">
            Candidate Research Gap
          </span>
          <h4 className="text-lg font-bold text-[#1E1C1A] mt-1">{gap.gap}</h4>
        </div>
      </div>

      <div className="space-y-3 my-4">
        <div className="bg-[#F5F1EA] p-3.5 rounded-xl border border-[#E8E2D8]">
          <span className="text-xs font-bold text-[#766E65] block mb-1">Why Underexplored</span>
          <p className="text-sm text-[#433E38] leading-relaxed font-sans">{gap.whyUnderexplored}</p>
        </div>

        <div className="bg-[#F5F1EA] p-3.5 rounded-xl border border-[#E8E2D8]">
          <span className="text-xs font-bold text-[#1E3A8A] block mb-1">Actionable Research Direction</span>
          <p className="text-sm text-[#1E1C1A] font-medium leading-relaxed flex items-start gap-2 font-sans">
            <ArrowRight className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
            <span>{gap.possibleResearchDirection}</span>
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#E8E2D8] text-xs text-[#766E65]">
        <span className="font-bold text-[#1E1C1A] flex items-center gap-1.5 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" /> Supporting Literature:
        </span>
        <ul className="list-disc list-inside space-y-1 text-[#433E38] pl-1 font-sans">
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
