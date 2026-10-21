import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PaperComparisonItem } from '@research-agent/shared';
import { ArrowLeft, Printer, Copy, Check, Pencil, RotateCcw, Sparkles } from 'lucide-react';

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

const DEFAULT_PROJECT_TITLE = 'AI POWERED RESEARCH PAPER ANALYSIS AND RECOMMENDATION SYSTEM';

export const PaperComparisonPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { paperIds?: string[]; query?: string } | undefined;

  const [comparison, setComparison] = useState<PaperComparisonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  // Editable Project Title state with localStorage persistence
  const [projectTitle, setProjectTitle] = useState<string>(() => {
    const saved = localStorage.getItem('survey_matrix_custom_title');
    if (saved) return saved;
    if (state?.query) return state.query;
    return DEFAULT_PROJECT_TITLE;
  });
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(projectTitle);

  const handleSaveTitle = () => {
    const finalVal = tempTitle.trim() || DEFAULT_PROJECT_TITLE;
    setProjectTitle(finalVal);
    localStorage.setItem('survey_matrix_custom_title', finalVal);
    setIsEditingTitle(false);
  };

  const handleResetTitle = () => {
    setProjectTitle(DEFAULT_PROJECT_TITLE);
    setTempTitle(DEFAULT_PROJECT_TITLE);
    localStorage.removeItem('survey_matrix_custom_title');
    setIsEditingTitle(false);
  };

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
    let tsv = `PROJECT TITLE: ${projectTitle}\nLITERATURE SURVEY MATRIX\n\nReference\tYear\tTitle\tContribution\tLimitation\n`;
    surveyRows.forEach((r) => {
      tsv += `${r.reference}\t${r.year}\t${r.title}\t${r.contribution}\t${r.limitation}\n`;
    });
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const originalDocTitle = document.title;
    document.title = `${projectTitle} - Literature Survey Matrix`;
    window.print();
    setTimeout(() => {
      document.title = originalDocTitle;
    }, 1000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#766E65] font-mono text-sm">
        Constructing literature survey matrix across papers...
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 max-w-7xl mx-auto">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-[#1E1C1A] border border-[#E8E2D8] hover:bg-[#F5F1EA] text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Edit Title Button in Toolbar */}
          <button
            onClick={() => {
              setTempTitle(projectTitle);
              setIsEditingTitle((prev) => !prev);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E2D8] text-xs font-bold text-[#1E3A8A] hover:bg-[#EEF2FF] hover:border-[#C7D2FE] transition-all shadow-sm"
            title="Edit project title for document and PDF export"
          >
            <Pencil className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>{isEditingTitle ? 'Close Title Editor' : 'Edit Project Title'}</span>
          </button>

          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E2D8] text-xs font-bold text-[#1E1C1A] hover:bg-[#F5F1EA] transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#1E3A8A]" />}
            <span>{copied ? 'Copied TSV' : 'Copy Table'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-[#172E6F] transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Academic Publication Document Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-xl border border-[#E8E2D8] shadow-sm bg-white text-[#1E1C1A] font-sans tracking-tight">
        {/* Header */}
        <div className="border-b border-[#E8E2D8] pb-4 mb-6">
          {/* Static Title for Print Media */}
          <div className="hidden print:block text-xs font-mono font-bold text-[#766E65] uppercase tracking-wider mb-2">
            Project Title: <span className="text-[#1E3A8A] font-extrabold">{projectTitle}</span>
          </div>

          {/* Screen Title Display & Edit Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 print:hidden">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xs font-mono font-bold text-[#766E65] uppercase tracking-wider shrink-0">
                Project Title:
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#1E3A8A] font-sans tracking-tight">
                {projectTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTempTitle(projectTitle);
                  setIsEditingTitle(!isEditingTitle);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F5F1EA] text-[#1E3A8A] border border-[#E8E2D8] hover:bg-[#EEF2FF] hover:border-[#C7D2FE] transition-all shadow-xs"
                title="Change project title for PDF export and printing"
              >
                <Pencil className="w-3 h-3 text-[#1E3A8A]" />
                <span>{isEditingTitle ? 'Close Editor' : 'Change Title'}</span>
              </button>

              {projectTitle !== DEFAULT_PROJECT_TITLE && (
                <button
                  type="button"
                  onClick={handleResetTitle}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#766E65] hover:text-[#991B1B] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                  title="Reset title to default system title"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Title Editor Box when active */}
          {isEditingTitle && (
            <div className="mb-4 p-4 rounded-xl bg-[#F5F1EA] border border-[#C7D2FE] shadow-sm space-y-3 print:hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold font-mono text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" />
                  Customize Title for PDF / Print Output
                </span>
                <span className="text-[11px] text-[#766E65]">Press Enter to Save • Esc to Cancel</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="Enter your custom project or thesis title..."
                  className="flex-1 px-3.5 py-2 text-xs font-bold text-[#1E1C1A] bg-white border border-[#C7D2FE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveTitle}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Title</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(false)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-[#5C554E] bg-white border border-[#E8E2D8] hover:bg-[#EBE5DC] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {state?.query && state.query !== projectTitle && (
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-[#766E65]">Quick Suggestion:</span>
                  <button
                    type="button"
                    onClick={() => setTempTitle(state.query!)}
                    className="text-[11px] font-bold text-[#1E3A8A] hover:underline bg-white px-2 py-0.5 rounded border border-[#E8E2D8]"
                  >
                    Use Research Query: "{state.query}"
                  </button>
                </div>
              )}
            </div>
          )}

          <h1 className="text-3xl font-black text-[#1E1C1A] mt-1 tracking-tight">
            Literature Survey
          </h1>
          <p className="text-xs text-[#766E65] mt-1">
            Side-by-side literature survey matrix ordered chronologically year-wise (2026 to 2022).
          </p>
        </div>

        {/* 5-Column Table with Academic Atelier Styling */}
        <div className="overflow-x-auto rounded-xl border border-[#E8E2D8] shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F1EA] border-b border-[#E8E2D8] text-[#1E1C1A]">
                <th className="p-3.5 font-bold border-r border-[#E8E2D8] w-[20%] uppercase tracking-wider text-[#1E1C1A]">
                  Reference
                </th>
                <th className="p-3.5 font-bold border-r border-[#E8E2D8] w-[7%] text-center uppercase tracking-wider text-[#1E1C1A]">
                  Year
                </th>
                <th className="p-3.5 font-bold border-r border-[#E8E2D8] w-[24%] uppercase tracking-wider text-[#1E1C1A]">
                  Title
                </th>
                <th className="p-3.5 font-bold border-r border-[#E8E2D8] w-[25%] uppercase tracking-wider text-[#1E1C1A]">
                  Contribution
                </th>
                <th className="p-3.5 font-bold w-[24%] uppercase tracking-wider text-[#1E1C1A]">
                  Limitation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D8]">
              {surveyRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#FBF9F5] transition-colors border-b border-[#E8E2D8]"
                >
                  <td className="p-3.5 font-normal text-[#433E38] border-r border-[#E8E2D8] leading-relaxed align-top">
                    {row.reference}
                  </td>
                  <td className="p-3.5 font-bold text-[#1E3A8A] border-r border-[#E8E2D8] text-center align-top font-mono text-sm">
                    {row.year}
                  </td>
                  <td className="p-3.5 font-bold text-[#1E1C1A] border-r border-[#E8E2D8] leading-snug align-top">
                    {row.title}
                  </td>
                  <td className="p-3.5 leading-relaxed text-[#433E38] border-r border-[#E8E2D8] align-top">
                    {row.contribution}
                  </td>
                  <td className="p-3.5 leading-relaxed text-[#92400E] font-medium align-top">
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
