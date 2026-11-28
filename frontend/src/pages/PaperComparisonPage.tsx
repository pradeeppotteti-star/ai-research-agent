import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Paper, PaperComparisonItem } from '@research-agent/shared';
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Pencil,
  RotateCcw,
  Download,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  LiteratureSurveyRow,
  buildMatrixCsvBlob,
  buildMatrixDocBlob,
  buildMatrixExportFilename,
  buildMatrixPdfBlob,
} from '../utils/matrixExport';
import { triggerBlobDownload } from '../utils/paperZipExport';

const DEFAULT_SURVEY_PAPERS: LiteratureSurveyRow[] = [
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
  {
    reference: 'Wenlin Zhang, Xiaopeng Li, Yingyi Zhang et al.',
    year: 2025,
    title: 'Deep Research: A Survey of Autonomous Research Agents',
    contribution: 'Provides a systematic survey of autonomous research agents and organizes the deep-research pipeline into planning, question development, web exploration, and report generation.',
    limitation: 'Survey paper rather than a complete implemented research-agent system; it identifies open challenges but does not itself provide the proposed multi-source evidence-grounding workstation.',
  },
  {
    reference: 'Chengwei Liu, Chong Wang, Jiayue Cao et al.',
    year: 2025,
    title: 'A Vision for Auto Research with LLM Agents',
    contribution: 'Introduces Agent-Based Auto Research, a structured multi-agent framework using LLMs and modular agent collaboration to automate the full research lifecycle.',
    limitation: 'Presents an early-stage vision and preliminary framework rather than a fully validated system with multi-repository citation auditing.',
  },
  {
    reference: 'Yutaro Yamada, Robert Tjarko Lange, Cong Lu et al.',
    year: 2025,
    title: 'The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic Tree Search',
    contribution: 'Presents an end-to-end agentic scientific workflow using hypothesis generation, experiment design, execution, analysis, and manuscript writing.',
    limitation: 'Focuses on automated scientific discovery and experimentation rather than evidence-grounded literature retrieval and paragraph-level claim verification.',
  },
  {
    reference: 'Yidong Wang, Qi Guo, Wenjin Yao et al.',
    year: 2024,
    title: 'AutoSurvey: Large Language Models Can Automatically Write Surveys',
    contribution: 'Automates literature-survey generation through retrieval, outline generation, specialized subsection drafting, integration, and refinement.',
    limitation: 'Focuses on survey generation rather than explicit Supported/Inferred/Uncertain evidence states or multi-source citation-audit verification.',
  },
  {
    reference: 'Jinheon Baek, Sujay Kumar Jauhar, Silviu Cucerzan, Sung Ju Hwang',
    year: 2024,
    title: 'ResearchAgent: Iterative Research Idea Generation over Scientific Literature with Large Language Models',
    contribution: 'Uses scientific literature, academic graphs, knowledge stores, and multiple reviewing agents to iteratively refine research problems and experiment designs.',
    limitation: 'Primarily targets research-idea generation rather than a complete multi-source literature workstation with citation auditing.',
  },
  {
    reference: 'Shubham Agarwal, Issam H. Laradji, Laurent Charlin, Christopher Pal',
    year: 2024,
    title: 'LitLLM: A Toolkit for Scientific Literature Review',
    contribution: 'Uses web search, LLM-generated search keywords, retrieval, re-ranking, and RAG-style generation to automate related-work creation.',
    limitation: 'Does not fully address multi-repository equal representation, paragraph-level evidence anchors, or explicit citation-verification states.',
  },
  {
    reference: 'Noah Shinn, Federico Cassano, Edward Berman et al.',
    year: 2023,
    title: 'Reflexion: Language Agents with Verbal Reinforcement Learning',
    contribution: 'Uses verbal self-reflection memory to enable autonomous agents to evaluate trial outcomes and refine action trajectories without weight updates.',
    limitation: 'Focuses on task trajectory self-correction rather than multi-repository scholarly search, PDF section parsing, or candidate research gap formulation.',
  },
  {
    reference: 'Yupan Huang, Tengchao Lv, Lei Cui et al.',
    year: 2022,
    title: 'LayoutLMv3: Pre-training for Document AI with Unstructured PDF Text and Image Masking',
    contribution: 'Presents a multimodal transformer pre-training strategy unifying text layout and visual document structure for automated PDF parsing.',
    limitation: 'Serves as an underlying document representation layer rather than an end-to-end autonomous research agent pipeline.',
  },
];

const DEFAULT_PROJECT_TITLE = 'PAPERINSIGHT: RESEARCH ANALYSIS AND LITERATURE REVIEW GENERATION SYSTEM';

interface MatrixNavigationState {
  paperIds?: string[];
  query?: string;
  sessionId?: string;
  papers?: Paper[];
}

function loadInitialMatrixState(locationState: MatrixNavigationState | undefined): MatrixNavigationState | undefined {
  if (locationState && ((locationState.paperIds && locationState.paperIds.length > 0) || (locationState.papers && locationState.papers.length > 0))) {
    return locationState;
  }
  try {
    const cached = sessionStorage.getItem('paperinsight_last_matrix');
    if (cached) {
      return JSON.parse(cached) as MatrixNavigationState;
    }
  } catch {
    // ignore
  }
  return locationState;
}

export const PaperComparisonPage: React.FC = () => {
  const location = useLocation();
  const state = loadInitialMatrixState(location.state as MatrixNavigationState | undefined);

  const [comparison, setComparison] = useState<PaperComparisonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [projectTitle, setProjectTitle] = useState<string>(() => {
    if (state?.query) return state.query;
    const saved = localStorage.getItem('survey_matrix_custom_title');
    if (saved) return saved;
    return DEFAULT_PROJECT_TITLE;
  });
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(projectTitle);

  useEffect(() => {
    if (state?.query) {
      setProjectTitle(state.query);
      setTempTitle(state.query);
    }
  }, [state?.query]);

  const handleSaveTitle = () => {
    const finalVal = tempTitle.trim() || state?.query || DEFAULT_PROJECT_TITLE;
    setProjectTitle(finalVal);
    localStorage.setItem('survey_matrix_custom_title', finalVal);
    setIsEditingTitle(false);
  };

  const handleResetTitle = () => {
    const fallback = state?.query || DEFAULT_PROJECT_TITLE;
    setProjectTitle(fallback);
    setTempTitle(fallback);
    localStorage.removeItem('survey_matrix_custom_title');
    setIsEditingTitle(false);
  };

  useEffect(() => {
    const fetchComparison = async () => {
      if ((!state?.paperIds || state.paperIds.length === 0) && (!state?.papers || state.papers.length === 0)) {
        return;
      }

      setLoading(true);
      try {
        const res = await api.post('/research/compare', {
          paperIds: state.paperIds,
          query: state.query,
          sessionId: state.sessionId,
          papers: state.papers,
        });

        if (res.data.success) {
          setComparison(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching paper comparison matrix:', err);
        if (state?.papers && state.papers.length > 0) {
          setComparison(
            state.papers.map((p) => ({
              paperId: p.id,
              paperTitle: p.title,
              authors: p.authors || ['Research Authors'],
              year: parseInt(String(p.publicationDate || '2024'), 10) || 2024,
              researchProblem: p.abstract || p.title,
              methodology: p.extractedSections?.find((s) => s.type === 'methodology')?.content || p.abstract || p.title,
              modelArchitecture: (p.keywords || []).slice(0, 3).join(', ') || p.source,
              datasetUsed: p.venue || p.source,
              evaluationMetrics: 'Accuracy, Precision, F1-Score',
              keyResults: p.extractedSections?.find((s) => s.type === 'results')?.content || p.abstract || '',
              strengths: p.venue || p.source,
              limitations: p.extractedSections?.find((s) => s.type === 'conclusion')?.content || 'Further multi-cohort validation needed.',
              futureWork: 'Cross-domain generalization.',
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [state?.sessionId, state?.query, state?.paperIds?.length, state?.papers?.length]);

  const rawRows: LiteratureSurveyRow[] =
    comparison.length > 0
      ? comparison.map((item) => ({
          reference:
            item.authors && item.authors.length > 0
              ? item.authors.slice(0, 3).join(', ') + (item.authors.length > 3 ? ' et al.' : '')
              : 'Research Authors',
          year: typeof item.year === 'number' ? item.year : parseInt(String(item.year), 10) || 2024,
          title: item.paperTitle,
          contribution: item.methodology || item.keyResults || item.researchProblem,
          limitation: item.limitations,
        }))
      : DEFAULT_SURVEY_PAPERS;

  const surveyRows = [...rawRows].sort((a, b) => {
    const yearA = typeof a.year === 'number' ? a.year : parseInt(String(a.year), 10) || 0;
    const yearB = typeof b.year === 'number' ? b.year : parseInt(String(b.year), 10) || 0;
    return yearB - yearA;
  });

  const years = surveyRows.map((r) => r.year).filter((y) => !Number.isNaN(y) && y > 1900);
  const yearRangeLabel =
    years.length > 0 ? `${Math.max(...years)} to ${Math.min(...years)}` : 'chronological';

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setExportFeedback({ type, message });
    if (type === 'success') {
      window.setTimeout(() => {
        setExportFeedback((prev) => (prev?.type === 'success' ? null : prev));
      }, 6000);
    }
  };

  const handleCopyTable = () => {
    let tsv = `PROJECT TITLE: ${projectTitle}\nLITERATURE SURVEY MATRIX\n\nReference\tYear\tTitle\tContribution\tLimitation\n`;
    surveyRows.forEach((r) => {
      tsv += `${r.reference}\t${r.year}\t${r.title}\t${r.contribution}\t${r.limitation}\n`;
    });
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf || surveyRows.length === 0) return;
    try {
      setDownloadingPdf(true);
      setExportFeedback(null);
      const pdfBlob = await buildMatrixPdfBlob(surveyRows, projectTitle);
      const header = new Uint8Array(await pdfBlob.slice(0, 5).arrayBuffer());
      const sig = String.fromCharCode(...header);
      if (sig !== '%PDF-' || pdfBlob.size < 500) {
        throw new Error('Generated PDF failed integrity check.');
      }
      const filename = buildMatrixExportFilename(projectTitle, 'pdf', surveyRows.length);
      triggerBlobDownload(pdfBlob, filename);
      showFeedback('success', `Downloaded ${filename} (${(pdfBlob.size / 1024).toFixed(0)} KB).`);
    } catch (err: any) {
      console.error('Error generating matrix PDF:', err);
      showFeedback('error', err?.message || 'Failed to generate Literature Survey Matrix PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadCsv = () => {
    try {
      const csvBlob = buildMatrixCsvBlob(surveyRows, projectTitle);
      const filename = buildMatrixExportFilename(projectTitle, 'csv', surveyRows.length);
      triggerBlobDownload(csvBlob, filename);
      showFeedback('success', `Downloaded ${filename}.`);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to export CSV.');
    }
  };

  const handleDownloadDoc = () => {
    try {
      const docBlob = buildMatrixDocBlob(surveyRows, projectTitle);
      const filename = buildMatrixExportFilename(projectTitle, 'doc', surveyRows.length);
      triggerBlobDownload(docBlob, filename);
      showFeedback('success', `Downloaded ${filename}.`);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to export Word document.');
    }
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
        Constructing literature survey matrix across {state?.paperIds?.length || ''} papers...
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 max-w-7xl mx-auto">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print print:hidden">
        <Link
          to={state?.sessionId ? `/research/${state.sessionId}` : '/dashboard'}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-[#1E1C1A] border border-[#E8E2D8] hover:bg-[#F5F1EA] text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{state?.sessionId ? 'Back to Research Results' : 'Back to Dashboard'}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
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
            onClick={handleDownloadCsv}
            disabled={surveyRows.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E2D8] text-xs font-bold text-[#1E1C1A] hover:bg-[#F5F1EA] transition-all shadow-sm disabled:opacity-60"
            title="Download Side-by-Side Matrix as Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download .CSV</span>
          </button>

          <button
            onClick={handleDownloadDoc}
            disabled={surveyRows.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all shadow-sm disabled:opacity-60"
            title="Download Side-by-Side Matrix as Word Document (.DOC)"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>Download .DOC</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || surveyRows.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-[#172E6F] transition-all shadow-sm disabled:opacity-60"
            title="Directly download landscape PDF of the Literature Survey Matrix"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Matrix (.PDF)</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E2D8] text-xs font-bold text-[#1E1C1A] hover:bg-[#F5F1EA] transition-all shadow-sm"
            title="Open browser print preview"
          >
            <Printer className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {exportFeedback && (
        <div
          role="status"
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold border flex items-center justify-between gap-3 no-print print:hidden ${
            exportFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{exportFeedback.message}</span>
          <button
            type="button"
            onClick={() => setExportFeedback(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Academic Publication Document Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-xl border border-[#E8E2D8] shadow-sm bg-white text-[#1E1C1A] font-sans tracking-tight">
        {/* Header */}
        <div className="border-b border-[#E8E2D8] pb-4 mb-6">
          <div className="hidden print:block text-xs font-mono font-bold text-[#766E65] uppercase tracking-wider mb-2">
            Project Title: <span className="text-[#1E3A8A] font-extrabold">{projectTitle}</span>
          </div>

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
                  title="Reset title"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

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
            </div>
          )}

          <h1 className="text-3xl font-black text-[#1E1C1A] mt-1 tracking-tight">
            Literature Survey ({surveyRows.length} Papers)
          </h1>
          <p className="text-xs text-[#766E65] mt-1">
            Side-by-side literature survey matrix ordered chronologically year-wise ({yearRangeLabel}).
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
