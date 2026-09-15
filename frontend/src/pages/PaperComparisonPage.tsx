import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PaperComparisonItem } from '@research-agent/shared';
import { ArrowLeft, Printer, Copy, Check } from 'lucide-react';

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
    return (
      <div className="py-20 text-center text-slate-400 font-mono text-sm">
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
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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

      {/* Publication Academic Document Card */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-300 font-sans tracking-tight">
        {/* Header matching sample image */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <h3 className="text-base font-bold text-slate-900 tracking-normal">
            Project Title: <span className="font-normal text-slate-800">AI Smart Research Agent</span>
          </h3>
          <h1 className="text-3xl font-extrabold text-slate-950 mt-1">
            Literature Survey
          </h1>
        </div>

        {/* 5-Column Table matching sample image */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-400 text-xs text-slate-900">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-400">
                <th className="p-3 font-bold border-r border-slate-400 w-[21%] text-slate-950">
                  Reference
                </th>
                <th className="p-3 font-bold border-r border-slate-400 w-[7%] text-center text-slate-950">
                  Year
                </th>
                <th className="p-3 font-bold border-r border-slate-400 w-[24%] text-slate-950">
                  Title
                </th>
                <th className="p-3 font-bold border-r border-slate-400 w-[25%] text-slate-950">
                  Contribution
                </th>
                <th className="p-3 font-bold w-[23%] text-slate-950">
                  Limitation
                </th>
              </tr>
            </thead>
            <tbody>
              {surveyRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3 font-normal border-r border-slate-400 leading-snug align-top text-slate-900">
                    {row.reference}
                  </td>
                  <td className="p-3 font-semibold border-r border-slate-400 text-center align-top text-slate-900">
                    {row.year}
                  </td>
                  <td className="p-3 font-bold border-r border-slate-400 leading-snug align-top text-slate-950">
                    {row.title}
                  </td>
                  <td className="p-3 leading-relaxed border-r border-slate-400 align-top text-slate-900">
                    {row.contribution}
                  </td>
                  <td className="p-3 leading-relaxed align-top text-slate-900">
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
