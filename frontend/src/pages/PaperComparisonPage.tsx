import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PaperComparisonItem } from '@research-agent/shared';
import { ArrowLeft, Printer, Copy, Check } from 'lucide-react';

interface LiteratureSurveyRow {
  reference: string;
  year: number;
  title: string;
  contribution: string;
  limitation: string;
}

const DEFAULT_SURVEY_PAPERS: LiteratureSurveyRow[] = [
  // 2026 Papers
  {
    reference: 'Aishwarya Gurram',
    year: 2026,
    title: 'Engineering Trustworthy Autonomous AI Agents: Architectural Patterns for Self-Planning, Tool-Oriented Reasoning, and Enterprise Task Completion',
    contribution: 'Proposes robust architectural blueprints and safety boundaries for autonomous agent self-planning, multi-tool execution, and task verification.',
    limitation: 'Focuses on enterprise system architecture and compliance boundaries rather than automated academic literature synthesis and cross-paper citation auditing.',
  },
  {
    reference: 'Will Hawkins, Nancie Calder',
    year: 2026,
    title: 'Understanding Agency—What Makes Agentic AI a Teammate, Not a Tool',
    contribution: 'Provides a conceptual and empirical framework evaluating collaborative agent autonomy, decision delegation, and human-agent interaction patterns.',
    limitation: 'Focuses on human-agent team dynamics and cognitive trust models rather than full-text PDF parsing, evidence snippet extraction, or literature report generation.',
  },
  {
    reference: 'Farrukh Zaheer',
    year: 2026,
    title: 'The Closed Intent Loop: Identity and Authorization in Autonomous Tool-using AI Agents',
    contribution: 'Introduces identity verification protocols and closed-loop authorization models for multi-tool LLM agents operating in open API environments.',
    limitation: 'Targets security, authorization, and intent verification rather than scientific literature retrieval, citation factuality scoring, and gap detection.',
  },

  // 2025 Papers
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

  // 2024 Papers
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

  // 2023 Papers
  {
    reference: 'Joon Sung Park, Joseph C. O\'Brien, Carrie J. Cai et al.',
    year: 2023,
    title: 'Generative Agents: Interactive Simulacra of Human Behavior',
    contribution: 'Demonstrates believable human behavior simulations by populating interactive agent architectures with persistent memory, reflection, and planning capabilities.',
    limitation: 'Designed for sandbox social simulations rather than multi-source academic paper retrieval, grounded citation auditing, or scientific report synthesis.',
  },
  {
    reference: 'Noah Shinn, Federico Cassano, Edward Berman et al.',
    year: 2023,
    title: 'Reflexion: Language Agents with Verbal Reinforcement Learning',
    contribution: 'Uses verbal self-reflection memory to enable autonomous agents to evaluate trial outcomes and refine action trajectories without weight updates.',
    limitation: 'Focuses on task trajectory self-correction rather than multi-repository scholarly search, PDF section parsing, or candidate research gap formulation.',
  },

  // 2022 Papers
  {
    reference: 'Yupan Huang, Tengchao Lv, Lei Cui et al.',
    year: 2022,
    title: 'LayoutLMv3: Pre-training for Document AI with Unstructured PDF Text and Image Masking',
    contribution: 'Presents a multimodal transformer pre-training strategy unifying text layout and visual document structure for automated PDF parsing.',
    limitation: 'Serves as a underlying document representation layer rather than an end-to-end autonomous research agent pipeline for literature survey synthesis.',
  },
];

export const PaperComparisonPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { paperIds?: string[]; query?: string } | undefined;

  const [comparison, setComparison] = useState<PaperComparisonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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

  const rawRows: LiteratureSurveyRow[] =
    comparison.length > 0
      ? comparison.map((item) => ({
          reference: item.authors.slice(0, 3).join(', ') + (item.authors.length > 3 ? ' et al.' : ''),
          year: typeof item.year === 'number' ? item.year : parseInt(String(item.year), 10) || 2025,
          title: item.paperTitle,
          contribution: item.methodology || item.keyResults || item.researchProblem,
          limitation: item.limitations,
        }))
      : DEFAULT_SURVEY_PAPERS;

  // SORT CHRONOLOGICALLY IN DESCENDING ORDER BY YEAR (2026 -> 2025 -> 2024 -> 2023 -> 2022)
  const surveyRows = [...rawRows].sort((a, b) => {
    const yearA = typeof a.year === 'number' ? a.year : parseInt(String(a.year), 10) || 0;
    const yearB = typeof b.year === 'number' ? b.year : parseInt(String(b.year), 10) || 0;
    return yearB - yearA;
  });

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
    return (
      <div className="py-20 text-center text-slate-600 dark:text-slate-300 font-mono text-sm">
        Constructing literature survey matrix across papers...
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 max-w-7xl mx-auto">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 no-print">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied TSV' : 'Copy Table'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Dual Theme Publication Academic Document Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white text-slate-900 dark:bg-slate-900/95 dark:text-slate-100 font-sans tracking-tight">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Project Title: <span className="text-brand-600 dark:text-brand-400 font-extrabold">AI Smart Research Agent</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Literature Survey
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Side-by-side literature survey matrix ordered chronologically year-wise (2026 to 2022).
          </p>
        </div>

        {/* 5-Column Table with Dual Theme Styling */}
        <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-800 shadow-inner">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100">
                <th className="p-3.5 font-bold border-r border-slate-300 dark:border-slate-800 w-[20%] uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Reference
                </th>
                <th className="p-3.5 font-bold border-r border-slate-300 dark:border-slate-800 w-[7%] text-center uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Year
                </th>
                <th className="p-3.5 font-bold border-r border-slate-300 dark:border-slate-800 w-[24%] uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Title
                </th>
                <th className="p-3.5 font-bold border-r border-slate-300 dark:border-slate-800 w-[25%] uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Contribution
                </th>
                <th className="p-3.5 font-bold w-[24%] uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Limitation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {surveyRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200 dark:border-slate-800/90"
                >
                  <td className="p-3.5 font-normal text-slate-800 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/90 leading-relaxed align-top">
                    {row.reference}
                  </td>
                  <td className="p-3.5 font-bold text-brand-600 dark:text-brand-300 border-r border-slate-200 dark:border-slate-800/90 text-center align-top font-mono text-sm">
                    {row.year}
                  </td>
                  <td className="p-3.5 font-bold text-slate-950 dark:text-white border-r border-slate-200 dark:border-slate-800/90 leading-snug align-top">
                    {row.title}
                  </td>
                  <td className="p-3.5 leading-relaxed text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800/90 align-top">
                    {row.contribution}
                  </td>
                  <td className="p-3.5 leading-relaxed text-amber-700 dark:text-amber-300/95 align-top">
                    {row.limitation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
