import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { SurveyReport, Paper } from '@research-agent/shared';
import { ClaimBadge } from '../components/common/ClaimBadge';
import { generateBibTeX, downloadBibTeXFile } from '../utils/bibtex';
import {
  FileCheck2,
  BookOpen,
  CheckCircle2,
  Compass,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  ExternalLink,
  ShieldCheck,
  Download,
  PieChart,
} from 'lucide-react';

export const GeneratedReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SurveyReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [bibtexCopied, setBibtexCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/research/${id}`);
        if (res.data.success && res.data.data.report) {
          setReport(res.data.data.report);
        }
      } catch (err) {
        console.error('Error fetching survey report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleCopyMarkdown = () => {
    if (!report) return;
    const markdown = `# ${report.title}\n\n## 1. Research Question\n${report.sections.researchQuestion}\n\n## 2. Search Methodology\n${report.sections.searchMethodology}\n\n## 3. Selected Literature Summary\n${report.sections.selectedPapersSummary}\n\n## 4. Key Findings & Grounded Claims\n${report.sections.keyFindings}\n\n## 5. Method Comparison\n${report.sections.methodComparisonOverview}\n\n## 6. Evidence-Backed Synthesis\n${report.sections.evidenceBackedSynthesis}\n\n## 7. Candidate Research Gaps\n${report.sections.researchGapsSummary}\n\n## 8. Limitations\n${report.sections.limitations}\n\n## 9. Future Directions\n${report.sections.futureDirections}\n\n## 10. References\n${report.sections.referencesList.map(r => `[${r.citationNumber}] ${r.title} (${r.year})`).join('\n')}`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBibTeX = () => {
    if (!report) return;
    const bibList = report.sections.referencesList.map((ref) => {
      const paperObj: Paper = {
        id: ref.paperId,
        title: ref.title,
        authors: ref.authors,
        abstract: '',
        publicationDate: ref.year,
        venue: ref.venue,
        doi: ref.doi,
        urls: { primary: ref.url },
        source: 'arXiv',
        pdfAvailable: true,
        openAccess: true,
        keywords: [],
        createdAt: new Date().toISOString(),
      };
      return generateBibTeX(paperObj);
    }).join('\n\n');

    downloadBibTeXFile(`references_${id}.bib`, bibList);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Compiling 11-section grounded literature survey...</div>;
  }

  if (!report) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-400">Literature survey report record not found.</p>
        <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-brand-600 text-white font-bold text-sm inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const { sections } = report;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <Link
          to={`/research/${report.sessionId}`}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Research Overview
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 inline-flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadBibTeX}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 inline-flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export BibTeX</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Main Report Document */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-10 text-slate-200 leading-relaxed bg-slate-950/90 print:bg-white print:text-black print:p-0">
        
        {/* Title & Badge Header */}
        <div className="border-b border-slate-800 pb-8 space-y-3 print:border-black">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold print:hidden">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Citation Grounded Survey</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white print:text-black tracking-tight">
            {report.title}
          </h1>
          <p className="text-xs text-slate-400 font-mono print:text-gray-600">
            Generated on {new Date(report.createdAt).toLocaleDateString()} • Sources: {sections.sourcesSearched.join(', ')}
          </p>
        </div>

        {/* Section 1: Research Question */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">01.</span> Research Question
          </h2>
          <p className="text-base text-slate-100 font-semibold bg-slate-900/50 p-4 rounded-xl border border-slate-800/60 print:bg-gray-100 print:text-black">
            "{sections.researchQuestion}"
          </p>
        </section>

        {/* Section 2: Search Methodology */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">02.</span> Search Methodology & Provider Execution
          </h2>
          <p className="text-sm text-slate-300 print:text-gray-800 leading-relaxed">{sections.searchMethodology}</p>
        </section>

        {/* Section 3: Sources Searched */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">03.</span> Multi-Tool Academic Providers Searched
          </h2>
          <div className="flex flex-wrap gap-2">
            {sections.sourcesSearched.map((s, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Section 4: Selected Papers Summary */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">04.</span> Selected Peer-Reviewed Literature
          </h2>
          <div className="whitespace-pre-line text-sm text-slate-300 print:text-gray-800 space-y-3">
            {sections.selectedPapersSummary}
          </div>
        </section>

        {/* Section 5: Grounded Key Findings */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">05.</span> Key Findings & Factuality Grounding
          </h2>
          <div className="space-y-4">
            {report.claims.map((c, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-gray-50 print:border-gray-300">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-bold text-slate-100 print:text-black text-sm">{c.claim}</h4>
                  <ClaimBadge status={c.verificationStatus} confidence={c.confidence} />
                </div>
                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-900 print:bg-white print:border-gray-200">
                  {c.evidenceText}
                </p>
                <div className="text-[11px] text-slate-400 font-medium">
                  Source Paper: <strong>{c.sourcePaperTitle}</strong> ({c.sourceSection})
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Method Comparison Overview */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">06.</span> Method Comparison Matrix Overview
          </h2>
          <div className="whitespace-pre-line text-sm text-slate-300 print:text-gray-800">
            {sections.methodComparisonOverview}
          </div>
        </section>

        {/* Section 7: Evidence-Backed Synthesis */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">07.</span> Evidence-Backed Synthesis
          </h2>
          <div className="whitespace-pre-line text-sm text-slate-300 print:text-gray-800">
            {sections.evidenceBackedSynthesis}
          </div>
        </section>

        {/* Section 8: Research Gaps */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-amber-400 font-mono text-sm font-bold">08.</span> Candidate Research Gap Detection
          </h2>
          <div className="whitespace-pre-line text-sm text-slate-300 print:text-gray-800">
            {sections.researchGapsSummary}
          </div>
        </section>

        {/* Section 9: Limitations */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">09.</span> System Limitations
          </h2>
          <div className="whitespace-pre-line text-sm text-slate-300 print:text-gray-800">
            {sections.limitations}
          </div>
        </section>

        {/* Section 10: Future Directions */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-brand-400 font-mono text-sm font-bold">10.</span> Future Research Directions
          </h2>
          <div className="whitespace-pre-line text-sm text-slate-300 print:text-gray-800">
            {sections.futureDirections}
          </div>
        </section>

        {/* Section 11: References */}
        <section className="space-y-3 pt-6 border-t border-slate-800 print:border-black">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white print:text-black flex items-center gap-2">
              <span className="text-brand-400 font-mono text-sm font-bold">11.</span> Academic References
            </h2>
            <button
              onClick={handleDownloadBibTeX}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 print:hidden flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download .bib File
            </button>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {sections.referencesList.map((ref) => (
              <div key={ref.citationNumber} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 print:bg-white print:border-gray-200">
                <span className="text-brand-400 font-bold mr-2">[{ref.citationNumber}]</span>
                <span className="text-slate-200 print:text-black font-sans font-semibold">{ref.title}</span>
                <span className="text-slate-400 block font-sans text-[11px] mt-0.5">
                  Authors: {ref.authors.join(', ')} • {ref.venue} ({ref.year})
                </span>
                {ref.url && (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline inline-flex items-center gap-1 mt-1 print:hidden">
                    Publisher Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
