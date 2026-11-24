import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E8E2D8] bg-[#F5F1EA] py-8 mt-16 text-[#5C554E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-5 h-5 text-[#1E3A8A]" />
              <span className="font-black text-[#1E1C1A] text-lg">
                PaperInsight
              </span>
            </div>
            <p className="text-xs font-bold text-[#1E3A8A] mb-2">
              Research Analysis and Literature Review Generation System
            </p>
            <p className="text-sm text-[#5C554E] max-w-2xl leading-relaxed">
              Inspired by the survey paper <i>"Deep Research: A Survey of Autonomous Research Agents"</i>. Built to solve key limitations in multi-tool search, citation verification, paper comparison, gap detection, and literature survey generation.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#766E65] gap-4">
          <p>© {new Date().getFullYear()} PaperInsight. All rights reserved.</p>
          <p className="font-mono">Production Ready • React 18 + Node Express + MongoDB</p>
        </div>
      </div>
    </footer>
  );
};
