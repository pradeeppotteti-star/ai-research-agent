import React from 'react';
import { PeerReviewPanel } from '@research-agent/shared';
import { ShieldCheck, Award, ThumbsUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PeerReviewPanelCardProps {
  panel: PeerReviewPanel;
}

export const PeerReviewPanelCard: React.FC<PeerReviewPanelCardProps> = ({ panel }) => {
  const getDecisionBadge = (decision: PeerReviewPanel['overallDecision']) => {
    switch (decision) {
      case 'Strong Accept':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Accept':
        return 'bg-[#EEF2FF] text-[#1E3A8A] border-[#C7D2FE]';
      case 'Weak Accept':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      default:
        return 'bg-[#F5F1EA] text-[#433E38] border-[#E8E2D8]';
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border border-[#E8E2D8] bg-white space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#1E3A8A] text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>NeurIPS / ICML Benchmark Standard</span>
          </div>
          <h3 className="text-2xl font-black text-[#1E1C1A]">Simulated AI Peer-Reviewer Panel</h3>
          <p className="text-xs text-[#766E65] mt-1 font-medium">
            Automated evaluation across methodology rigor, candidate gap novelty, and citation factuality.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-[#766E65] font-semibold block">Panel Recommendation</span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border mt-1 ${getDecisionBadge(panel.overallDecision)}`}>
              {panel.overallDecision}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] text-[#1E3A8A] font-mono font-black text-xl flex items-center justify-center shadow-xs">
            {panel.overallScore}/10
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {panel.reviewers.map((rev, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-[#E8E2D8] bg-[#FBF9F5] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E1C1A]">{rev.reviewerRole}</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white text-[#1E3A8A] border border-[#E8E2D8]">
                Score: {rev.score}/10
              </span>
            </div>

            <p className="text-xs text-[#433E38] leading-relaxed font-sans">{rev.summary}</p>

            <div className="space-y-2 pt-2 border-t border-[#E8E2D8] text-xs">
              <div>
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[#433E38] pl-1 font-sans">
                  {rev.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-[#92400E] flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#B45309]" /> Peer Suggestions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[#766E65] pl-1 font-sans">
                  {rev.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
