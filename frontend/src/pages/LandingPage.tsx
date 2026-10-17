import React from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Search,
  CheckCircle2,
  GitCompare,
  Compass,
  FileCheck2,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="text-center relative max-w-4xl mx-auto pt-8">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#F5F1EA] rounded-full blur-3xl pointer-events-none opacity-60" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] border border-[#E8E2D8] text-[#5C554E] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>Inspired by "Deep Research: A Survey of Autonomous Research Agents"</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1E1C1A] leading-tight mb-6">
          AI Smart Research Agent
        </h1>

        <p className="text-lg sm:text-xl text-[#5C554E] max-w-2xl mx-auto leading-relaxed mb-8">
          An autonomous research agent designed to solve traditional LLM limitations: multi-tool search integration, grounded citation verification, paper comparison matrices, and candidate research-gap detection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] shadow-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Autonomous Research</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-[#1E1C1A] bg-white border border-[#E8E2D8] hover:bg-[#F5F1EA] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="w-4 h-4 text-[#1E3A8A]" />
            <span>Try Demo Account</span>
          </Link>
        </div>
      </section>

      {/* 8 Limitations Solved Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1C1A]">
            Addressing Core Autonomous Agent Limitations
          </h2>
          <p className="text-[#766E65] text-sm mt-2">
            Engineered to overcome bottlenecks documented in contemporary AI literature surveys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1E3A8A] flex items-center justify-center mb-4 border border-[#C7D2FE]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1E1C1A] text-lg mb-2">1. Multi-Tool Integration</h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              Concurrent querying across arXiv, Semantic Scholar, OpenAlex, and Crossref APIs with deduplication and ranking.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-bold text-[#1E1C1A] text-lg mb-2">2. Citation Verification</h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              Validates generated claims against extracted PDF evidence snippets, labeling claims as Supported, Inferred, or Uncertain.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1E3A8A] flex items-center justify-center mb-4 border border-[#C7D2FE]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1E1C1A] text-lg mb-2">3. Multimodal Reasoning</h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              Supports full-text PDF section parsing, figure caption detection, and table structure metadata extraction.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#F5F1EA] text-[#766E65] flex items-center justify-center mb-4 border border-[#E8E2D8]">
              <BrainCircuit className="w-5 h-5 text-[#1E3A8A]" />
            </div>
            <h3 className="font-bold text-[#1E1C1A] text-lg mb-2">4. Adaptive Workflow</h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              Decomposes complex queries into distinct planning, search, extraction, verification, and synthesis stages.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1E3A8A] flex items-center justify-center mb-4 border border-[#C7D2FE]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1E1C1A] text-lg mb-2">5. Efficient Optimization</h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              Levenshtein title fuzzy deduplication and term overlap scoring maximize precision per token.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#F5F1EA] text-[#766E65] flex items-center justify-center mb-4 border border-[#E8E2D8]">
              <Search className="w-5 h-5 text-[#1E3A8A]" />
            </div>
            <h3 className="font-bold text-[#1E1C1A] text-lg mb-2">6. Personalization</h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              User research profile stores domain preferences, default search windows, and saved paper libraries.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4 border border-amber-200">
              <Compass className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-bold text-[#1E1C1A] text-lg mb-2">7. Research Gap Detection</h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              Isolates unaddressed limitations across literature and highlights candidate directions for future work.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1E3A8A] flex items-center justify-center mb-4 border border-[#C7D2FE]">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1E1C1A] text-lg mb-2">8. Literature Surveys</h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              Generates structured 11-section surveys complete with comparison matrices and explicit reference anchors.
            </p>
          </div>
        </div>
      </section>

      {/* Paywall Safety Banner */}
      <section className="glass-panel p-8 rounded-xl border border-amber-200 bg-[#FFFBEB] text-[#78350F] flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="p-3 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#92400E]">
            Ethical & Legal Scientific Access Guarantee
          </h3>
          <p className="text-sm text-[#78350F] mt-1 leading-relaxed">
            Our agent operates strictly within public metadata boundaries. For paywalled papers, we present legal publisher links and abstracts without bypassing access controls, ensuring full compliance with scientific publishing standards.
          </p>
        </div>
      </section>
    </div>
  );
};
