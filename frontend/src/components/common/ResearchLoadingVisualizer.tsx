import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Search,
  Globe,
  Database,
  Zap,
  Cpu,
} from 'lucide-react';

interface ResearchLoadingVisualizerProps {
  query?: string;
}

export const ResearchLoadingVisualizer: React.FC<ResearchLoadingVisualizerProps> = ({ query }) => {
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);
  const [discoveredCount, setDiscoveredCount] = useState<number>(1);
  const [currentStepText, setCurrentStepText] = useState<string>('Querying arXiv Preprint API & Semantic Scholar Graph...');

  const sources = [
    { name: 'arXiv Preprint Server' },
    { name: 'Google Scholar API' },
    { name: 'OpenAlex Global Graph' },
    { name: 'Crossref DOI Registry' },
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Central Orbital Radar Animation */}
      <div className="relative flex items-center justify-center py-8">
        {/* Outer Ring 1 */}
        <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-[#1E3A8A]/20 animate-ping opacity-25" />
        
        {/* Outer Ring 2 (Spinning) */}
        <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-[#1E3A8A]/30 animate-spin" style={{ animationDuration: '15s' }} />

        {/* Outer Ring 3 (Reverse Spin) */}
        <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-[#E8E2D8] animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />

        {/* Center Pulse Card */}
        <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 shadow-md border border-[#E8E2D8]">
          <div className="w-full h-full bg-[#EEF2FF] rounded-xl flex items-center justify-center relative overflow-hidden">
            <BrainCircuit className="w-10 h-10 text-[#1E3A8A] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Status Text */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#1E3A8A] text-xs font-bold font-mono">
          <Zap className="w-3.5 h-3.5" /> Real-Time Live Online Search Active
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#1E1C1A]">
          Searching Live Literature for Topic
        </h2>

        {query && (
          <p className="text-sm sm:text-base font-bold text-[#1E3A8A] font-mono max-w-xl mx-auto line-clamp-2 px-4 py-2 rounded-xl bg-white border border-[#E8E2D8] shadow-sm">
            "{query}"
          </p>
        )}
      </div>

      {/* Live Discovered Source Ticker */}
      <div className="glass-panel p-6 rounded-xl border border-[#E8E2D8] bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#766E65] flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#1E3A8A]" /> Active Provider Scan
          </span>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
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
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col justify-between h-20 ${
                  isActive
                    ? 'bg-[#EEF2FF] border-[#1E3A8A] text-[#1E3A8A] shadow-sm scale-102'
                    : 'bg-[#F5F1EA] border-[#E8E2D8] text-[#766E65]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Database className={`w-3.5 h-3.5 ${isActive ? 'text-[#1E3A8A]' : 'text-[#948B80]'}`} />
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-ping" />}
                </div>
                <span className={`block font-semibold ${isActive ? 'text-[#1E1C1A]' : 'text-[#766E65]'}`}>
                  {src.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Step Progress Ticker */}
        <div className="p-4 rounded-xl bg-[#F5F1EA] border border-[#E8E2D8] flex items-center gap-3">
          <Cpu className="w-5 h-5 text-[#1E3A8A] shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
          <p className="text-xs font-mono text-[#433E38] font-medium leading-relaxed">
            {currentStepText}
          </p>
        </div>

        {/* Animated Equalizer Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1 pt-2">
          <span className="w-1.5 h-4 bg-[#1E3A8A] rounded animate-bounce" />
          <span className="w-1.5 h-7 bg-[#3B69DE] rounded animate-bounce delay-75" />
          <span className="w-1.5 h-5 bg-amber-600 rounded animate-bounce delay-150" />
          <span className="w-1.5 h-8 bg-emerald-600 rounded animate-bounce delay-100" />
          <span className="w-1.5 h-3 bg-[#1E3A8A] rounded animate-bounce delay-200" />
          <span className="w-1.5 h-6 bg-amber-600 rounded animate-bounce delay-300" />
        </div>
      </div>
    </div>
  );
};
