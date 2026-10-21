import React from 'react';
import { BrainCircuit, BookOpen, ShieldCheck, GitBranch, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E8E2D8] bg-[#F5F1EA] py-10 mt-20 text-[#5C554E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-[#1E3A8A]" />
              <span className="font-extrabold text-[#1E1C1A] text-[15px]">
                AI Powered Research Paper Analysis and Recommendation System
              </span>
            </div>
            <p className="text-sm text-[#5C554E] max-w-md leading-relaxed">
              Inspired by the survey paper <i>"Deep Research: A Survey of Autonomous Research Agents"</i>. Built to solve key limitations in multi-tool search, citation verification, paper comparison, gap detection, and literature survey generation.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1C1A] mb-3">
              Supported Sources
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li className="flex items-center gap-1.5 text-[#5C554E]">
                <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" /> arXiv Preprint Server
              </li>
              <li className="flex items-center gap-1.5 text-[#5C554E]">
                <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" /> Semantic Scholar API
              </li>
              <li className="flex items-center gap-1.5 text-[#5C554E]">
                <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" /> OpenAlex Global Graph
              </li>
              <li className="flex items-center gap-1.5 text-[#5C554E]">
                <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" /> Crossref DOI Registry
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1C1A] mb-3">
              Key Standards
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li className="flex items-center gap-1.5 text-[#5C554E]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> 100% Legal Open Metadata
              </li>
              <li className="flex items-center gap-1.5 text-[#5C554E]">
                <GitBranch className="w-3.5 h-3.5 text-[#1E3A8A]" /> Modular Monorepo Architecture
              </li>
              <li className="flex items-center gap-1.5 text-[#5C554E]">
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" /> Grounded Evidence Anchors
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#766E65] gap-4">
          <p>© {new Date().getFullYear()} AI Powered Research Paper Analysis and Recommendation System. All rights reserved.</p>
          <p className="font-mono">Production Ready • React 18 + Node Express + MongoDB</p>
        </div>
      </div>
    </footer>
  );
};
