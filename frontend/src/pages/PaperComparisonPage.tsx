import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PaperComparisonItem } from '@research-agent/shared';
import { GitCompare, ArrowLeft, Download, Table, Layers, Printer, Copy, Check } from 'lucide-react';

interface LiteratureSurveyRow {
  reference: string;
  year: number | string;
  title: string;
  contribution: string;
  limitation: string;
}

const DEFAULT_SURVEY_PAPERS: LiteratureSurveyRow[] = [
  {
    reference: 'Wenlin Zhang, Xiaopeng Li, Yingyi Zhang et al.',
    year: 2025,
    title: 'Deep Research: A Survey of Autonomous Research Agents',
    contribution:
      'Provides a systematic survey of autonomous research agents and organizes the deep-research pipeline into planning, question development, web exploration, and report generation. It also identifies challenges and research directions for trustworthy research agents.',
    limitation:
      'Survey paper rather than a complete implemented research-agent system; it identifies open challenges but does not itself provide the proposed multi-source evidence-grounding workstation.',
  },
  {
    reference: 'Chengwei Liu, Chong Wang, Jiayue Cao, Jingquan Ge, Kun Wang, Lyuye Zhang et al.',
    year: 2025,
    title: 'A Vision for Auto Research with LLM Agents',
    contribution:
      'Introduces Agent-Based Auto Research, a structured multi-agent framework using LLMs and modular agent collaboration to automate and coordinate the full research lifecycle, including literature review, ideation, methodology planning, experimentation, paper writing, and peer-review response.',
    limitation:
      'Presents an early-stage vision and preliminary framework rather than a fully validated system; it does not provide the evidence-grounded, multi-repository citation-verification pipeline proposed in this project.',
  },
  {
    reference: 'Yutaro Yamada, Robert Tjarko Lange, Cong Lu et al.',
    year: 2025,
    title: 'The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic Tree Search',
    contribution:
      'Presents an end-to-end agentic scientific workflow using hypothesis generation, experiment design, execution, analysis, manuscript writing, and iterative peer-review feedback.',
    limitation:
      'Focuses on automated scientific discovery and experimentation rather than evidence-grounded literature retrieval, cross-repository citation auditing, and paragraph-level claim verification.',
  },
  {
    reference: 'Yuxiang Zheng, Dayuan Fu, Xiangkun Hu et al.',
    year: 2025,
    title: 'DeepResearcher: Scaling Deep Research via Reinforcement Learning in Real-World Environments',
    contribution:
      'Develops deep-research agents that plan, browse real-world web sources, cross-validate information, self-reflect, and generate research results through multi-agent web interaction.',
    limitation:
      'Targets open-web deep research and reinforcement-learning-based agent training; it is not specialized for scholarly repositories, scientific PDF evidence anchors, or structured citation auditing.',
  },
  {
    reference: 'Haoyang Su, Renqi Chen, Shixiang Tang, Zhenfei Yin, Xinzhe Zheng, Jinzhe Li et al.',
    year: 2025,
    title: 'Many Heads Are Better Than One: Improved Scientific Idea Generation by a LLM-Based Multi-Agent System',
    contribution:
      'Proposes VirSci, an LLM-based multi-agent system that mimics real-world scientific teamwork through collaborator selection, topic discussion, idea generation, novelty assessment, and abstract generation to improve scientific idea generation.',
    limitation:
      'Focuses on simulating collaborative idea generation and novelty assessment rather than literature retrieval, PDF-grounded evidence extraction, or the citation-audit verification central to this project.',
  },
  {
    reference: 'Samuel Schmidgall, Yusheng Su, Ze Wang et al.',
    year: 2025,
    title: 'Agent Laboratory: Using LLM Agents as Research Assistants',
    contribution:
      'Provides an autonomous research workflow covering literature review, experimentation, and report writing, with multiple LLM-driven agents and optional human feedback.',
    limitation:
      'Broader end-to-end research automation is emphasized, while detailed scholarly retrieval, evidence anchoring, citation correctness, and claim-consensus analysis are not the central focus.',
  },
  {
    reference: 'Chris Lu, Cong Lu, Robert Tjarko Lange et al.',
    year: 2024,
    title: 'The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery',
    contribution:
      'Introduces a framework that autonomously generates research ideas, writes code, runs experiments, analyzes results, produces scientific papers, and performs simulated peer review.',
    limitation:
      'Strong on autonomous discovery and experimentation but not designed specifically for multi-repository academic search, PDF-grounded claim verification, or citation metadata auditing.',
  },
  {
    reference: 'Yidong Wang, Qi Guo, Wenjin Yao et al.',
    year: 2024,
    title: 'AutoSurvey: Large Language Models Can Automatically Write Surveys',
    contribution:
      'Automates literature-survey generation through retrieval, outline generation, specialized subsection drafting, integration, refinement, and evaluation, with emphasis on citation and content quality.',
    limitation:
      'Focuses on survey generation and evaluation; it does not provide the project\'s explicit Supported/Inferred/Uncertain evidence states or multi-source citation-audit architecture.',
  },
  {
    reference: 'Jinheon Baek, Sujay Kumar Jauhar, Silviu Cucerzan, Sung Ju Hwang',
    year: 2024,
    title: 'ResearchAgent: Iterative Research Idea Generation over Scientific Literature with Large Language Models',
    contribution:
      'Uses scientific literature, academic graphs, knowledge stores, and multiple reviewing agents to generate and iteratively refine research problems, methods, and experiment designs.',
    limitation:
      'Primarily targets research-idea generation and iterative review rather than a complete literature workstation for multi-source retrieval, citation auditing, evidence extraction, and survey synthesis.',
  },
  {
    reference: 'Shubham Agarwal, Issam H. Laradji, Laurent Charlin, Christopher Pal',
    year: 2024,
    title: 'LitLLM: A Toolkit for Scientific Literature Review',
    contribution:
      'Uses web search, LLM-generated search keywords, retrieval, re-ranking, and RAG-style generation to automate related-work and literature-review creation from scientific papers.',
    limitation:
      'Provides an efficient literature-review toolkit but does not fully address multi-repository equal representation, paragraph-level evidence anchors, claim topology, or explicit citation-verification states.',
  },
];

export const PaperComparisonPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { paperIds?: string[]; query?: string } | undefined;

  const [comparison, setComparison] = useState<PaperComparisonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'survey' | 'multidim'>('survey');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchComparison = async () => {
      if (!state?.paperIds || state.paperIds.length === 0) {
        return;
      }

      setLoading(true);
      try {
        const res = await api.post('/research/compare', {
          paperIds: state.paperIds,
          query: state.query,
        });

        if (res.data.success) {
          setComparison(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching paper comparison matrix:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [state]);

  // Convert custom comparison items to survey rows if custom papers are selected
  const surveyRows: LiteratureSurveyRow[] =
    comparison.length > 0
      ? comparison.map((item) => ({
          reference: item.authors.slice(0, 3).join(', ') + (item.authors.length > 3 ? ' et al.' : ''),
          year: item.year,
          title: item.paperTitle,
          contribution: item.methodology || item.keyResults || item.researchProblem,
          limitation: item.limitations,
        }))
      : DEFAULT_SURVEY_PAPERS;

  const handleCopyTable = () => {
    let tsv = 'Reference\tYear\tTitle\tContribution\tLimitation\n';
    surveyRows.forEach((r) => {
      tsv += `${r.reference}\t${r.year}\t${r.title}\t${r.contribution}\t${r.limitation}\n`;
    });
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 font-mono text-sm">Constructing literature survey matrix across papers...</div>;
  }

  return (
    <div className="space-y-6 py-4 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
              Project Title: <span className="text-brand-600 dark:text-brand-400">AI Smart Research Agent</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Literature Survey
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Side-by-side comparative analysis of state-of-the-art autonomous research agent frameworks.
            </p>
          </div>

          {/* Controls & Mode Switches */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setViewMode('survey')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'survey'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Survey Table</span>
              </button>
              <button
                onClick={() => setViewMode('multidim')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'multidim'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-Dimension</span>
              </button>
            </div>

            <button
              onClick={handleCopyTable}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              title="Copy table data as TSV"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Table'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              title="Print publication view"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print View</span>
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Literature Survey Matrix Table View */}
      {viewMode === 'survey' ? (
        <div className="glass-panel rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-2xl bg-white dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700">
                  <th className="p-3.5 font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-r border-slate-300 dark:border-slate-700 w-[20%]">
                    Reference
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-r border-slate-300 dark:border-slate-700 w-[7%] text-center">
                    Year
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-r border-slate-300 dark:border-slate-700 w-[25%]">
                    Title
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-r border-slate-300 dark:border-slate-700 w-[25%]">
                    Contribution
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 w-[23%]">
                    Limitation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
                {surveyRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors border-b border-slate-300 dark:border-slate-800"
                  >
                    <td className="p-3.5 font-normal text-slate-800 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700 leading-relaxed align-top">
                      {row.reference}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-300 dark:border-slate-700 text-center font-mono align-top">
                      {row.year}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white border-r border-slate-300 dark:border-slate-700 leading-snug align-top">
                      {row.title}
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700 leading-relaxed align-top">
                      {row.contribution}
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed align-top">
                      {row.limitation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Detailed Multi-Dimension Comparison View */
        <div className="glass-panel rounded-2xl border border-slate-300 dark:border-slate-800 overflow-x-auto shadow-2xl bg-white dark:bg-slate-950">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 w-48 sticky left-0 bg-slate-100 dark:bg-slate-900 z-10">
                  Dimension
                </th>
                {(comparison.length > 0 ? comparison : DEFAULT_SURVEY_PAPERS.map((p, idx) => ({
                  paperId: `p_${idx}`,
                  paperTitle: p.title,
                  authors: [p.reference],
                  year: typeof p.year === 'number' ? p.year : 2025,
                  researchProblem: p.title,
                  methodology: p.contribution,
                  modelArchitecture: 'LLM Multi-Agent System',
                  datasetUsed: 'ArXiv / Semantic Scholar / Web',
                  evaluationMetrics: 'Synthesis Quality & Hallucination Rate',
                  keyResults: 'Autonomous literature review & report synthesis',
                  strengths: p.contribution,
                  limitations: p.limitation,
                  futureWork: 'Multi-repository citation verification',
                }))).map((item, idx) => (
                  <th key={idx} className="p-4 text-sm font-bold text-slate-900 dark:text-white min-w-[280px]">
                    <div className="line-clamp-2 text-brand-600 dark:text-brand-300 font-extrabold">{item.paperTitle}</div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal block mt-1 font-mono">
                      {item.authors[0]} ({item.year})
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-4 font-bold text-slate-900 dark:text-slate-200 sticky left-0 bg-slate-50 dark:bg-slate-950 z-10">
                  Research Problem / Scope
                </td>
                {(comparison.length > 0 ? comparison : DEFAULT_SURVEY_PAPERS.map((p) => p.title)).map((item: any, idx) => (
                  <td key={idx} className="p-4 leading-relaxed">{typeof item === 'string' ? item : item.researchProblem}</td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-900 dark:text-slate-200 sticky left-0 bg-slate-50 dark:bg-slate-950 z-10">
                  Core Contribution & Methodology
                </td>
                {(comparison.length > 0 ? comparison : DEFAULT_SURVEY_PAPERS.map((p) => p.contribution)).map((item: any, idx) => (
                  <td key={idx} className="p-4 leading-relaxed">{typeof item === 'string' ? item : item.methodology}</td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-900 dark:text-slate-200 sticky left-0 bg-slate-50 dark:bg-slate-950 z-10">
                  Core Limitation
                </td>
                {(comparison.length > 0 ? comparison : DEFAULT_SURVEY_PAPERS.map((p) => p.limitation)).map((item: any, idx) => (
                  <td key={idx} className="p-4 leading-relaxed text-amber-600 dark:text-amber-300">{typeof item === 'string' ? item : item.limitations}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
