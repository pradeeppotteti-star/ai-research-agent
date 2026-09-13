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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Accept':
        return 'bg-brand-500/10 text-brand-400 border-brand-500/30';
      case 'Weak Accept':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>NeurIPS / ICML Benchmark Standard</span>
          </div>
          <h3 className="text-2xl font-black text-white">Simulated AI Peer-Reviewer Panel</h3>
          <p className="text-xs text-slate-400 mt-1">
            Automated evaluation across methodology rigor, candidate gap novelty, and citation factuality.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold block">Panel Recommendation</span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border mt-1 ${getDecisionBadge(panel.overallDecision)}`}>
              {panel.overallDecision}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-mono font-black text-xl flex items-center justify-center">
            {panel.overallScore}/10
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {panel.reviewers.map((rev, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{rev.reviewerRole}</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 text-brand-400 border border-slate-800">
                Score: {rev.score}/10
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{rev.summary}</p>

            <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
              <div>
                <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <ThumbsUp className="w-3.5 h-3.5" /> Key Strengths:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  {rev.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-amber-400 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Peer Suggestions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
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
