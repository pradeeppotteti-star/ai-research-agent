import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { PipelineStage, ProgressLog } from '@research-agent/shared';
import { ResearchLoadingVisualizer } from '../components/common/ResearchLoadingVisualizer';
import {
  BrainCircuit,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  GitCompare,
  Compass,
  FileCheck2,
  Loader2,
} from 'lucide-react';

const STAGES: Array<{ key: PipelineStage; label: string; icon: React.ReactNode }> = [
  { key: 'planning', label: '1. Research Planning', icon: <BrainCircuit className="w-4 h-4" /> },
  { key: 'searching', label: '2. Multi-Source Search', icon: <Search className="w-4 h-4" /> },
  { key: 'filtering', label: '3. Deduplication & Ranking', icon: <Filter className="w-4 h-4" /> },
  { key: 'extracting', label: '4. Section Extraction', icon: <FileText className="w-4 h-4" /> },
  { key: 'verifying', label: '5. Citation Verification', icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: 'comparing', label: '6. Paper Comparison', icon: <GitCompare className="w-4 h-4" /> },
  { key: 'gap_detection', label: '7. Gap Detection', icon: <Compass className="w-4 h-4" /> },
  { key: 'synthesizing', label: '8. Survey Synthesis', icon: <FileCheck2 className="w-4 h-4" /> },
];

export const ResearchProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>('active');
  const [currentStage, setCurrentStage] = useState<PipelineStage>('planning');
  const [percent, setPercent] = useState<number>(10);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    let interval: any = null;

    const pollStatus = async () => {
      try {
        const res = await api.get(`/research/status/${id}`);
        if (res.data.success) {
          const data = res.data.data;
          setStatus(data.status);
          setCurrentStage(data.currentStage);
          setPercent(data.stageProgressPercent || 10);
          setLogs(data.progressLogs || []);
          if (data.query) setQuery(data.query);

          if (data.status === 'completed') {
            clearInterval(interval);
            setTimeout(() => {
              navigate(`/research/${id}`, { replace: true });
            }, 1800);
          } else if (data.status === 'failed') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling status error:', err);
      }
    };

    pollStatus();
    interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [id, navigate]);

  const getStageStatus = (stageKey: PipelineStage) => {
    const stageOrder: PipelineStage[] = [
      'planning',
      'searching',
      'filtering',
      'extracting',
      'verifying',
      'comparing',
      'gap_detection',
      'synthesizing',
      'completed',
    ];

    const currentIdx = stageOrder.indexOf(currentStage);
    const targetIdx = stageOrder.indexOf(stageKey);

    if (status === 'completed' || targetIdx < currentIdx) return 'completed';
    if (targetIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Interactive Orbital Search Radar Visualizer */}
      <ResearchLoadingVisualizer query={query || 'Academic Literature Topic Search'} />

      {/* Progress Bar */}
      <div className="glass-panel p-6 rounded-xl border border-[#E8E2D8] bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-[#1E1C1A] flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-[#1E3A8A] animate-spin" /> Total Autonomous Pipeline Execution
          </span>
          <span className="text-[#1E3A8A] font-mono text-sm font-black">{percent}%</span>
        </div>
        <div className="w-full h-3 bg-[#F5F1EA] rounded-full overflow-hidden p-0.5 border border-[#E8E2D8]">
          <div
            className="h-full bg-[#1E3A8A] rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Visual Pipeline Stages Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {STAGES.map((s) => {
          const st = getStageStatus(s.key);
          return (
            <div
              key={s.key}
              className={`p-4 rounded-xl border transition-all ${
                st === 'completed'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : st === 'active'
                  ? 'bg-[#EEF2FF] border-[#1E3A8A] text-[#1E3A8A] shadow-sm ring-1 ring-[#1E3A8A]/30'
                  : 'bg-[#F5F1EA] border-[#E8E2D8] text-[#766E65]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white border border-[#E8E2D8] text-[#1E1C1A]">{s.icon}</div>
                {st === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {st === 'active' && <Loader2 className="w-4 h-4 text-[#1E3A8A] animate-spin" />}
              </div>
              <span className="text-xs font-bold block">{s.label}</span>
              <span className="text-[10px] uppercase font-mono mt-1 block">
                {st === 'completed' ? 'Verified' : st === 'active' ? 'Executing...' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Execution Progress Logs */}
      <div className="glass-panel p-6 rounded-xl border border-[#E8E2D8] bg-white space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1C1A] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1E3A8A]" /> Live Backend Execution Trace
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {logs.map((log, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-xs font-mono flex items-start gap-3">
              <span className="text-[#948B80] text-[10px] shrink-0 pt-0.5">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-[#1E3A8A] font-bold shrink-0 uppercase">[{log.stage}]</span>
              <span className="text-[#433E38]">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
