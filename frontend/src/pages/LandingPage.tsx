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
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Inspired by "Deep Research: A Survey of Autonomous Research Agents"</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
          AI Smart Research Agent: <br />
          <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 dark:from-cyan-400 dark:via-teal-300 dark:to-sky-400 bg-clip-text text-transparent">
            Evidence-Grounded Multi-Source Literature Survey Synthesis
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          An autonomous research agent designed to solve traditional LLM limitations: multi-tool search integration, grounded citation verification, paper comparison matrices, and candidate research-gap detection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-500 hover:to-teal-600 shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Autonomous Research</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Try Demo Account</span>
          </Link>
        </div>
      </section>





      {/* 8 Limitations Solved Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Addressing Core Autonomous Agent Limitations
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Engineered to overcome bottlenecks documented in contemporary AI literature surveys.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-cyan-900/10 dark:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">1. Multi-Tool Integration</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Concurrent querying across arXiv, Semantic Scholar, OpenAlex, and Crossref APIs with deduplication and ranking.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-cyan-900/10 dark:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">2. Citation Verification</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Validates generated claims against extracted PDF evidence snippets, labeling claims as Supported, Inferred, or Uncertain.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-cyan-900/10 dark:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">3. Multimodal Reasoning</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Supports full-text PDF section parsing, figure caption detection, and table structure metadata extraction.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-cyan-900/10 dark:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">4. Adaptive Workflow</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Decomposes complex queries into distinct planning, search, extraction, verification, and synthesis stages.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-cyan-900/10 dark:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 border border-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">5. Efficient Optimization</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Levenshtein title fuzzy deduplication and term overlap scoring maximize precision per token.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-cyan-900/10 dark:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 border border-pink-500/20">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">6. Personalization</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              User research profile stores domain preferences, default search windows, and saved paper libraries.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-cyan-900/10 dark:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">7. Research Gap Detection</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Isolates unaddressed limitations across literature and highlights candidate directions for future work.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-cyan-900/10 dark:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">8. Literature Surveys</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Generates structured 11-section surveys complete with comparison matrices and explicit reference anchors.
            </p>
          </div>
        </div>

      </section>

      {/* Paywall Safety Banner */}
      <section className="glass-panel p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-center gap-6">
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-300">
            Ethical & Legal Scientific Access Guarantee
          </h3>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Our agent operates strictly within public metadata boundaries. For paywalled papers, we present legal publisher links and abstracts without bypassing access controls, ensuring full compliance with scientific publishing standards.
          </p>
        </div>
      </section>
    </div>
  );
};
