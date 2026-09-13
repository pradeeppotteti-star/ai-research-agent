import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Search,
  Globe,
  Database,
  FileText,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';

interface ResearchLoadingVisualizerProps {
  query?: string;
}

export const ResearchLoadingVisualizer: React.FC<ResearchLoadingVisualizerProps> = ({ query }) => {
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);
  const [discoveredCount, setDiscoveredCount] = useState<number>(1);
  const [currentStepText, setCurrentStepText] = useState<string>('Querying arXiv Preprint API & Semantic Scholar Graph...');

  const sources = [
    { name: 'arXiv Preprint Server', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    { name: 'Google Scholar API', color: 'text-brand-400', border: 'border-brand-500/30', bg: 'bg-brand-500/10' },
    { name: 'OpenAlex Global Graph', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
    { name: 'Crossref DOI Registry', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  ];

  const steps = [
    'Decomposing search concept into sub-query vectors...',
    'Scanning live online databases across arXiv & Google Scholar...',
    'Filtering titles and abstracts for query term relevance...',
    'Extracting direct PDF anchor paragraphs and citation metadata...',
    'Constructing 11-section evidence-grounded literature survey...',
    'Building interactive claim topology graph & peer review matrix...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSourceIndex((prev) => (prev + 1) % sources.length);
      setDiscoveredCount((prev) => (prev < 10 ? prev + 1 : 10));
    }, 1800);

    const stepInterval = setInterval(() => {
      setCurrentStepText((prev) => {
        const nextIdx = (steps.indexOf(prev) + 1) % steps.length;
        return steps[nextIdx];
      });
    }, 2500);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  const activeSource = sources[activeSourceIndex];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      {/* Central Orbital Radar Animation */}
      <div className="relative flex items-center justify-center py-8">
        {/* Outer Ring 1 */}
        <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-brand-500/20 animate-ping opacity-25" />
        
        {/* Outer Ring 2 (Spinning) */}
        <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-indigo-500/30 animate-spin" style={{ animationDuration: '15s' }} />

        {/* Outer Ring 3 (Reverse Spin) */}
        <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-sky-500/40 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />

        {/* Glowing Center Pulse */}
        <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 p-0.5 shadow-2xl shadow-brand-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
            <BrainCircuit className="w-10 h-10 text-brand-400 animate-pulse" />
            <div className="absolute inset-0 bg-brand-500/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Status Text */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold font-mono">
          <Zap className="w-3.5 h-3.5 animate-bounce" /> Real-Time Live Online Search Active
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Searching Live Literature for Topic
        </h2>

        {query && (
          <p className="text-base font-bold text-brand-300 font-mono max-w-xl mx-auto line-clamp-2 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            "{query}"
          </p>
        )}
      </div>

      {/* Live Discovered Source Ticker */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-brand-400" /> Active Provider Scan
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {discoveredCount} / 10 Papers Discovered
          </span>
        </div>

        {/* Live Provider Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sources.map((src, idx) => {
            const isActive = idx === activeSourceIndex;
            return (
              <div
                key={src.name}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col justify-between h-20 ${
                  isActive
                    ? `${src.bg} ${src.border} shadow-lg shadow-brand-500/10 scale-105`
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Database className={`w-3.5 h-3.5 ${isActive ? src.color : 'text-slate-600'}`} />
                  {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                </div>
                <span className={`block font-semibold ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                  {src.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Step Progress Ticker */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-indigo-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
          <p className="text-xs font-mono text-slate-300 font-medium leading-relaxed">
            {currentStepText}
          </p>
        </div>

        {/* Animated Equalizer Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1 pt-2">
          <span className="w-1.5 h-4 bg-brand-400 rounded animate-bounce" />
          <span className="w-1.5 h-7 bg-indigo-400 rounded animate-bounce delay-75" />
          <span className="w-1.5 h-5 bg-sky-400 rounded animate-bounce delay-150" />
          <span className="w-1.5 h-8 bg-purple-400 rounded animate-bounce delay-100" />
          <span className="w-1.5 h-3 bg-emerald-400 rounded animate-bounce delay-200" />
          <span className="w-1.5 h-6 bg-amber-400 rounded animate-bounce delay-300" />
        </div>
      </div>
    </div>
  );
};
