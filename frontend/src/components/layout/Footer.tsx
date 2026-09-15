import React from 'react';
import { BrainCircuit, BookOpen, ShieldCheck, GitBranch, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-brand-400" />
              <span className="font-bold text-slate-100 text-[15px]">
                AI SMART RESEARCH AGENT: EVIDENCE-GROUNDED MULTI-SOURCE LITERATURE SURVEY SYNTHESIS
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Inspired by the survey paper <i>"Deep Research: A Survey of Autonomous Research Agents"</i>. Built to solve key limitations in multi-tool search, citation verification, paper comparison, gap detection, and literature survey generation.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Supported Sources
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-brand-400" /> arXiv Preprint Server
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Semantic Scholar API
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" /> OpenAlex Global Graph
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Crossref DOI Registry
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Key Standards
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Legal Open Metadata
              </li>
              <li className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-brand-400" /> Modular Monorepo Architecture
              </li>
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" /> Grounded Evidence Anchors
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AI Smart Research Agent. All rights reserved.</p>
          <p className="font-mono">Production Ready • React 18 + Node Express + MongoDB</p>
        </div>
      </div>
    </footer>
  );
};
