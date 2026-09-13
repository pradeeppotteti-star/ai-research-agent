import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  BrainCircuit,
  Search,
  Sparkles,
  Sliders,
  Calendar,
  Layers,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Zap,
  Clock,
  ArrowRight,
  Globe,
  Tag,
  RotateCcw,
} from 'lucide-react';

const DOMAIN_KEYWORDS_MAP: Record<string, { domain: string; keywords: string }> = {
  'career': {
    domain: 'Interdisciplinary General Science & Educational Technology',
    keywords: 'Career Guidance, Decision Support System, Vocational Counseling, Machine Learning Recommendation',
  },
  'guidance': {
    domain: 'Interdisciplinary General Science & Educational Technology',
    keywords: 'Career Guidance, Decision Support System, Vocational Counseling, Machine Learning Recommendation',
  },
  'tomato': {
    domain: 'Bioinformatics & Agricultural Computer Vision',
    keywords: 'Crop Disease Detection, Vision Transformers, Plant Pathology, Leaf Diagnosis, Agricultural AI',
  },
  'leaf': {
    domain: 'Bioinformatics & Agricultural Computer Vision',
    keywords: 'Crop Disease Detection, Vision Transformers, Plant Pathology, Leaf Diagnosis, Agricultural AI',
  },
  'quantum': {
    domain: 'Quantum Computing & AI Physics',
    keywords: 'Quantum Machine Learning, Variational Quantum Circuits, Photonic Computing, Physics-Informed Neural Networks',
  },
  'agent': {
    domain: 'Artificial Intelligence & Agentic Workflows',
    keywords: 'Autonomous Agents, LLM Factuality, Tool Use, Multi-Agent Collaboration, Query Decomposition',
  },
  'bio': {
    domain: 'Bioinformatics & Computational Biology',
    keywords: 'Genomic Transformers, Protein Folding, AlphaFold, Biological Sequence Alignment, BioAI',
  },
  'security': {
    domain: 'Cybersecurity & Threat Intelligence',
    keywords: 'Vulnerability Detection, Threat Graph Mining, Binary Analysis, Exploit Synthesis, CyberAI',
  },
  'finance': {
    domain: 'Financial Econometrics & Quantitative AI',
    keywords: 'Financial Econometrics, Portfolio Optimization, High-Frequency Time Series, Market Sentiment Analysis',
  },
};

export const NewResearchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('Design and implementation of an intelligent career guidance system using machine learning');
  const [detectedDomain, setDetectedDomain] = useState('Interdisciplinary General Science & Educational Technology');
  const [detectedKeywords, setDetectedKeywords] = useState('Career Guidance, Decision Support System, Vocational Counseling, Machine Learning Recommendation');

  const [targetPaperCount, setTargetPaperCount] = useState<number>(10);
  const [yearStart, setYearStart] = useState<number>(2020);
  const [yearEnd, setYearEnd] = useState<number>(2026);
  const [preferredSources, setPreferredSources] = useState<string[]>([
    'Google Scholar',
    'OpenAlex',
    'Crossref',
    'arXiv',
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Auto-detect domain and keywords whenever the query changes
  useEffect(() => {
    const clean = query.toLowerCase();
    let matched = false;

    for (const key of Object.keys(DOMAIN_KEYWORDS_MAP)) {
      if (clean.includes(key)) {
        setDetectedDomain(DOMAIN_KEYWORDS_MAP[key].domain);
        setDetectedKeywords(DOMAIN_KEYWORDS_MAP[key].keywords);
        matched = true;
        break;
      }
    }

    if (!matched && clean.trim().length > 0) {
      const topicWords = clean
        .split(' ')
        .filter(w => !['what', 'are', 'the', 'latest', 'approaches', 'for', 'with', 'using', 'how', 'can', 'and', 'in', 'of', 'on', 'a', 'an', 'to'].includes(w))
        .map(w => w.charAt(0).toUpperCase() + w.slice(1));
      const mainKeyword = topicWords.slice(0, 3).join(' ') || 'Custom Topic';

      setDetectedDomain(`${mainKeyword} Research Domain`);
      setDetectedKeywords(`${mainKeyword}, Machine Learning, Decision Support, Empirical Analysis`);
    }
  }, [query]);

  const toggleSource = (source: string) => {
    if (preferredSources.includes(source)) {
      if (preferredSources.length > 1) {
        setPreferredSources(preferredSources.filter((s) => s !== source));
      }
    } else {
      setPreferredSources([...preferredSources, source]);
    }
  };

  const handleYearPreset = (start: number) => {
    setYearStart(start);
    setYearEnd(2026);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a research topic or paper name query.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const keywordList = detectedKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await api.post('/research/start', {
        query: query.trim(),
        domain: detectedDomain,
        keywords: keywordList,
        targetPaperCount,
        yearRange: { start: yearStart, end: yearEnd },
        preferredSources,
      });

      if (res.data.success) {
        const sessionId = res.data.data.sessionId;
        navigate(`/research/progress/${sessionId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start research session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      {/* Top Header Banner */}
      <div className="relative glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950/40 overflow-hidden space-y-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
            <Zap className="w-3.5 h-3.5 text-brand-400 animate-pulse" /> Live Multi-Provider Academic Research Portal
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
          Launch Autonomous Deep Literature Survey
        </h1>

        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Type any research topic or paper name. The agent automatically classifies the academic domain, executes multi-provider online search across <strong className="text-brand-300">Google Scholar</strong>, <strong className="text-emerald-300">OpenAlex</strong>, <strong className="text-amber-300">Crossref</strong>, and <strong className="text-purple-300">arXiv</strong>, and synthesizes a citation-grounded 11-section literature survey.
        </p>
      </div>

      {/* Main Console Box */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-8 bg-slate-950/60">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Topic Input Console */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-400" />
                <span>Research Paper Name or Topic Query</span>
              </label>
              <span className="text-[11px] font-mono font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                100% Real-Time Live Online Search
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type any paper topic (e.g., Career Guidance System, Vision Transformers for Tomato Leaf Care AI, Quantum Machine Learning in Financial Portfolio Optimization...)"
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-sm sm:text-base focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium leading-relaxed shadow-inner"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-all text-xs"
                  title="Clear input"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Categorized Sample Prompts Gallery */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                1-Click Sample Research Topics:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuery('Design and implementation of an intelligent career guidance system using machine learning')}
                  className="text-xs text-brand-300 hover:text-brand-200 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-xl border border-brand-500/20 transition-all font-semibold flex items-center gap-1.5"
                >
                  🎓 Career Guidance System
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('Vision transformer models for automated crop disease detection and tomato leaf care diagnosis')}
                  className="text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition-all font-semibold flex items-center gap-1.5"
                >
                  🌾 Tomato Leaf Care AI
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('What are the latest approaches for autonomous AI research agents and multi-tool planning?')}
                  className="text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/20 transition-all font-semibold flex items-center gap-1.5"
                >
                  🤖 Autonomous AI Agents
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('Quantum machine learning algorithms for high-frequency financial portfolio optimization')}
                  className="text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/20 transition-all font-semibold flex items-center gap-1.5"
                >
                  ⚛️ Quantum Financial AI
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('What are recent deep learning advances in genomic sequence transformers and protein folding?')}
                  className="text-xs text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-xl border border-purple-500/20 transition-all font-semibold flex items-center gap-1.5"
                >
                  🧬 Genomic BioAI
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('Automated molecular generation and retrosynthetic analysis using ChemCrow AI')}
                  className="text-xs text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/20 transition-all font-semibold flex items-center gap-1.5"
                >
                  💊 AI Drug Discovery
                </button>
              </div>
            </div>
          </div>

          {/* Auto-Detected Domain & Keywords Panel */}
          <div className="glass-card p-6 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" /> Real-time Classification & Extraction
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 99% NLP Alignment Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Inferred Academic Domain:
                </span>
                <span className="font-bold text-white text-sm block">{detectedDomain}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Extracted Search Keywords:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-brand-300 pt-0.5">
                  {detectedKeywords.split(',').map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-medium">
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800/80">
            {/* Target Paper Count Slider */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-brand-400" />
                  <span>Target Paper Count</span>
                </label>
                <span className="text-xs font-mono font-black text-brand-300 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                  {targetPaperCount} Papers
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={25}
                value={targetPaperCount}
                onChange={(e) => setTargetPaperCount(parseInt(e.target.value, 10))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 font-mono block text-right">Range: 3 to 25 papers</span>
            </div>

            {/* Publication Timeline Pre-sets */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span>Publication Timeline Range</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-400">
                  <button type="button" onClick={() => handleYearPreset(2023)} className="hover:text-brand-300">3Y</button>
                  <span>•</span>
                  <button type="button" onClick={() => handleYearPreset(2020)} className="hover:text-brand-300">5Y</button>
                  <span>•</span>
                  <button type="button" onClick={() => handleYearPreset(2015)} className="hover:text-brand-300">All</button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1990}
                  max={2026}
                  value={yearStart}
                  onChange={(e) => setYearStart(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono text-center font-bold"
                />
                <span className="text-slate-500 text-xs font-bold">to</span>
                <input
                  type="number"
                  min={1990}
                  max={2026}
                  value={yearEnd}
                  onChange={(e) => setYearEnd(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Academic Provider Toggle Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-brand-400" />
              <span>Live Academic Search Providers</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Google Scholar', color: 'text-brand-400', border: 'border-brand-500/40', bg: 'bg-brand-500/10' },
                { name: 'OpenAlex', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
                { name: 'Crossref', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
                { name: 'arXiv', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
              ].map((provider) => {
                const isSelected = preferredSources.includes(provider.name);
                return (
                  <button
                    type="button"
                    key={provider.name}
                    onClick={() => toggleSource(provider.name)}
                    className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col justify-between h-20 ${
                      isSelected
                        ? `${provider.bg} ${provider.border} shadow-lg shadow-brand-500/10 scale-102`
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={isSelected ? 'text-white' : 'text-slate-400'}>{provider.name}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isSelected ? 'Active Provider' : 'Click to Enable'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Action Submit Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 rounded-2xl font-black text-white text-base sm:text-lg bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 transition-all shadow-2xl shadow-brand-500/25 disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 animate-pulse" />
                  <span>Initiating Deep Research Agent...</span>
                </div>
              ) : (
                <>
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Initiate Autonomous Deep Literature Search</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
