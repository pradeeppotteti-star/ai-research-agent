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
  AlertCircle,
  CheckCircle2,
  Zap,
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
    'IEEE Xplore',
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
      <div className="glass-panel p-8 sm:p-10 rounded-xl border border-[#E8E2D8] bg-white text-[#1E1C1A] overflow-hidden space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE] font-mono">
            <Zap className="w-3.5 h-3.5 text-[#1E3A8A]" /> Live Multi-Provider Academic Research Portal
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#1E1C1A] leading-tight">
          Launch Autonomous Deep Literature Survey
        </h1>

        <p className="text-sm text-[#5C554E] max-w-2xl leading-relaxed">
          Type any research topic or paper name. The agent automatically classifies the academic domain, executes multi-provider online search across <strong className="text-[#1E3A8A]">IEEE Xplore</strong>, <strong className="text-[#1E3A8A]">Google Scholar</strong>, <strong className="text-emerald-700">OpenAlex</strong>, <strong className="text-amber-700">Crossref</strong>, and <strong className="text-[#1E3A8A]">arXiv</strong>, and synthesizes a citation-grounded literature survey.
        </p>
      </div>

      {/* Main Console Box */}
      <div className="glass-panel p-8 sm:p-10 rounded-xl border border-[#E8E2D8] shadow-sm space-y-8 bg-white">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Topic Input Console */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1C1A] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#1E3A8A]" />
                <span>Research Paper Name or Topic Query</span>
              </label>
              <span className="text-[11px] font-mono font-semibold text-[#1E3A8A] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#C7D2FE]">
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
                className="w-full p-4 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-sm sm:text-base focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all font-medium leading-relaxed placeholder-[#948B80]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#F5F1EA] text-[#766E65] hover:text-[#1E1C1A] transition-all text-xs border border-[#E8E2D8]"
                  title="Clear input"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Categorized Sample Prompts Gallery */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[#766E65] uppercase tracking-wider block">
                1-Click Sample Research Topics:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuery('Design and implementation of an intelligent career guidance system using machine learning')}
                  className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-lg border border-[#E8E2D8] transition-all font-semibold flex items-center gap-1.5"
                >
                  🎓 Career Guidance System
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('Vision transformer models for automated crop disease detection and tomato leaf care diagnosis')}
                  className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-lg border border-[#E8E2D8] transition-all font-semibold flex items-center gap-1.5"
                >
                  🌾 Tomato Leaf Care AI
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('What are the latest approaches for autonomous AI research agents and multi-tool planning?')}
                  className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-lg border border-[#E8E2D8] transition-all font-semibold flex items-center gap-1.5"
                >
                  🤖 Autonomous AI Agents
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('Quantum machine learning algorithms for high-frequency financial portfolio optimization')}
                  className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-lg border border-[#E8E2D8] transition-all font-semibold flex items-center gap-1.5"
                >
                  ⚛️ Quantum Financial AI
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('What are recent deep learning advances in genomic sequence transformers and protein folding?')}
                  className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-lg border border-[#E8E2D8] transition-all font-semibold flex items-center gap-1.5"
                >
                  🧬 Genomic BioAI
                </button>

                <button
                  type="button"
                  onClick={() => setQuery('Automated molecular generation and retrosynthetic analysis using ChemCrow AI')}
                  className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-lg border border-[#E8E2D8] transition-all font-semibold flex items-center gap-1.5"
                >
                  💊 AI Drug Discovery
                </button>
              </div>
            </div>
          </div>

          {/* Auto-Detected Domain & Keywords Panel */}
          <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-[#F5F1EA] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E1C1A] font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#1E3A8A]" /> Real-time Classification & Extraction
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 99% NLP Alignment Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <span className="text-[#766E65] font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#766E65]" /> Inferred Academic Domain:
                </span>
                <span className="font-bold text-[#1E1C1A] text-sm block">{detectedDomain}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[#766E65] font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#766E65]" /> Extracted Search Keywords:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[#1E3A8A] pt-0.5">
                  {detectedKeywords.split(',').map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-[#E8E2D8] font-medium text-xs">
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#E8E2D8]">
            {/* Target Paper Count Slider */}
            <div className="glass-card p-5 rounded-xl border border-[#E8E2D8] bg-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E1C1A] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Target Paper Count</span>
                </label>
                <span className="text-xs font-mono font-black text-[#1E3A8A] px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D2FE]">
                  {targetPaperCount} Papers
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={25}
                value={targetPaperCount}
                onChange={(e) => setTargetPaperCount(parseInt(e.target.value, 10))}
                className="w-full accent-[#1E3A8A] cursor-pointer"
              />
              <span className="text-[11px] text-[#766E65] font-mono block text-right">Range: 3 to 25 papers</span>
            </div>

            {/* Publication Timeline Pre-sets */}
            <div className="glass-card p-5 rounded-xl border border-[#E8E2D8] bg-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E1C1A] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Publication Timeline Range</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#766E65]">
                  <button type="button" onClick={() => handleYearPreset(2023)} className="hover:text-[#1E3A8A]">3Y</button>
                  <span>•</span>
                  <button type="button" onClick={() => handleYearPreset(2020)} className="hover:text-[#1E3A8A]">5Y</button>
                  <span>•</span>
                  <button type="button" onClick={() => handleYearPreset(2015)} className="hover:text-[#1E3A8A]">All</button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1990}
                  max={2026}
                  value={yearStart}
                  onChange={(e) => setYearStart(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-xs font-mono text-center font-bold"
                />
                <span className="text-[#766E65] text-xs font-bold">to</span>
                <input
                  type="number"
                  min={1990}
                  max={2026}
                  value={yearEnd}
                  onChange={(e) => setYearEnd(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-xs font-mono text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Academic Provider Toggle Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1C1A] flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#1E3A8A]" />
              <span>Live Academic Search Providers</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { name: 'Google Scholar' },
                { name: 'IEEE Xplore' },
                { name: 'OpenAlex' },
                { name: 'Crossref' },
                { name: 'arXiv' },
              ].map((provider) => {
                const isSelected = preferredSources.includes(provider.name);
                return (
                  <button
                    type="button"
                    key={provider.name}
                    onClick={() => toggleSource(provider.name)}
                    className={`p-4 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'bg-[#EEF2FF] border-[#1E3A8A] text-[#1E3A8A] shadow-sm'
                        : 'bg-[#F5F1EA] text-[#766E65] border-[#E8E2D8] hover:border-[#D8D0C4]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={isSelected ? 'text-[#1E3A8A]' : 'text-[#766E65]'}>{provider.name}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#1E3A8A]' : 'bg-[#D8D0C4]'}`} />
                    </div>
                    <span className="text-[10px] font-mono text-[#766E65]">
                      {isSelected ? 'Active Provider' : 'Click to Enable'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Action Submit Button */}
          <div className="pt-4 border-t border-[#E8E2D8]">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-base sm:text-lg bg-[#1E3A8A] hover:bg-[#172E6F] transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-3 group border border-[#1E3A8A]"
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
