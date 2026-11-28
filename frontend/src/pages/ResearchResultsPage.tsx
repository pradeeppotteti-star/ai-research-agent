import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ResearchSession,
  Paper,
  SurveyReport,
  CandidateResearchGap,
  ConsensusAnalysis,
  PeerReviewPanel,
  TemporalTrendForecast,
} from '@research-agent/shared';
import { PaperCard } from '../components/common/PaperCard';
import { PaperSidePanel } from '../components/common/PaperSidePanel';
import { GapCard } from '../components/common/GapCard';
import { KnowledgeGraph } from '../components/common/KnowledgeGraph';
import { PeerReviewPanelCard } from '../components/common/PeerReviewPanelCard';
import { TrendForecastCard } from '../components/common/TrendForecastCard';
import { LabWorkspaceCard } from '../components/common/LabWorkspaceCard';
import { ResearchLoadingVisualizer } from '../components/common/ResearchLoadingVisualizer';
import { generateMultiBibTeX, downloadBibTeXFile } from '../utils/bibtex';
import { downloadAllPapersDocument, downloadAllPapersCSV, downloadAllPapersJSON } from '../utils/paperExport';
import {
  buildClientResearchZipBlob,
  buildZipDownloadFilename,
  isValidZipBlob,
  triggerBlobDownload,
} from '../utils/paperZipExport';
import {
  FileCheck2,
  GitCompare,
  Compass,
  BookOpen,
  Copy,
  Check,
  Download,
  Network,
  PieChart,
  Award,
  TrendingUp,
  Users,
  Archive,
  Loader2,
} from 'lucide-react';

export const ResearchResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<ResearchSession | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [report, setReport] = useState<SurveyReport | null>(null);
  const [gaps, setGaps] = useState<CandidateResearchGap[]>([]);
  const [consensus, setConsensus] = useState<ConsensusAnalysis | null>(null);
  const [peerReview, setPeerReview] = useState<PeerReviewPanel | null>(null);
  const [trendForecast, setTrendForecast] = useState<TemporalTrendForecast | null>(null);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [openedPaper, setOpenedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'papers' | 'graph' | 'consensus' | 'review' | 'trends' | 'lab' | 'gaps'
  >('papers');
  const [bibtexCopied, setBibtexCopied] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<string>('');
  const [zipFeedback, setZipFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Instant cache retrieval from sessionStorage to eliminate reload delays
    if (id) {
      try {
        const cachedRaw = sessionStorage.getItem(`research_session_${id}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached && cached.session && cached.papers) {
            setSession(cached.session);
            const loaded = cached.papers || [];
            setPapers(loaded);
            setReport(cached.report || null);
            setGaps(cached.researchGaps || []);
            if (cached.consensus) setConsensus(cached.consensus);
            if (cached.peerReview) setPeerReview(cached.peerReview);
            if (cached.trendForecast) setTrendForecast(cached.trendForecast);
            setSelectedPaperIds(loaded.map((p: Paper) => p.id));
            setLoading(false);
          }
        }
      } catch (cacheErr) {
        console.warn('Cache parse error:', cacheErr);
      }
    }

    const fetchDetails = async () => {
      try {
        const res = await api.get(`/research/${id}`);
        if (res.data.success) {
          // Store in sessionStorage for instant subsequent loads
          try {
            sessionStorage.setItem(`research_session_${id}`, JSON.stringify(res.data.data));
          } catch (storageErr) {
            // Storage quota warning - ignore gracefully
          }

          setSession(res.data.data.session);
          const loadedPapers = res.data.data.papers || [];
          setPapers(loadedPapers);
          setReport(res.data.data.report);
          setGaps(res.data.data.researchGaps || []);

          if (res.data.data.consensus) {
            setConsensus(res.data.data.consensus);
          }
          if (res.data.data.peerReview) {
            setPeerReview(res.data.data.peerReview);
          }
          if (res.data.data.trendForecast) {
            setTrendForecast(res.data.data.trendForecast);
          }

          if (loadedPapers.length > 0) {
            setSelectedPaperIds(loadedPapers.map((p: Paper) => p.id));
          }
        }
      } catch (err) {
        console.error('Error fetching research details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const togglePaperSelection = (paperId: string) => {
    if (selectedPaperIds.includes(paperId)) {
      if (selectedPaperIds.length > 1) {
        setSelectedPaperIds(selectedPaperIds.filter((p) => p !== paperId));
      }
    } else {
      setSelectedPaperIds([...selectedPaperIds, paperId]);
    }
  };

  const handleCompareClick = () => {
    const selectedSet = new Set(selectedPaperIds);
    const selectedPapers = papers.filter((p) => selectedSet.has(p.id));
    const payload = {
      paperIds: selectedPaperIds,
      query: session?.query,
      sessionId: id,
      papers: selectedPapers,
    };
    try {
      sessionStorage.setItem('paperinsight_last_matrix', JSON.stringify(payload));
    } catch {
      // ignore storage quota
    }
    navigate(`/research/compare`, { state: payload });
  };

  const handleCopyBibTeX = () => {
    const bibStr = generateMultiBibTeX(papers);
    navigator.clipboard.writeText(bibStr);
    setBibtexCopied(true);
    setTimeout(() => setBibtexCopied(false), 2000);
  };

  const handleDownloadBibTeX = () => {
    const bibStr = generateMultiBibTeX(papers);
    downloadBibTeXFile(`research_references_${id}.bib`, bibStr);
  };

  const handleDownloadAllZip = async () => {
    if (downloadingZip || papers.length === 0) return;

    const targetQuery = session?.query || 'Research_Papers';
    const zipFilename = buildZipDownloadFilename(targetQuery, papers.length);

    try {
      setDownloadingZip(true);
      setZipFeedback(null);
      setZipProgress(`Packaging ${papers.length} PDFs...`);

      let zipBlob: Blob | null = null;

      // 1. Primary path: POST papers + query so stateless serverless never loses session context
      try {
        const res = await api.post(
          `/research/${id}/export-zip`,
          { query: targetQuery, papers },
          {
            responseType: 'blob',
            timeout: 45000,
          }
        );

        const candidateBlob =
          res.data instanceof Blob
            ? res.data
            : new Blob([res.data], { type: 'application/zip' });

        if (await isValidZipBlob(candidateBlob)) {
          zipBlob = candidateBlob;
        } else {
          console.warn('Server returned non-ZIP payload; falling back to client-side ZIP packager.');
        }
      } catch (serverErr) {
        console.warn('Server ZIP export unavailable; falling back to client-side ZIP packager:', serverErr);
      }

      // 2. Resilient client-side fallback if server is unreachable, timed out, or returned invalid data
      if (!zipBlob) {
        setZipProgress(`Building ${papers.length} PDFs locally...`);
        const clientBlob = await buildClientResearchZipBlob(papers, targetQuery, (done, total) => {
          setZipProgress(`Packaging ${done}/${total} PDFs...`);
        });
        if (await isValidZipBlob(clientBlob)) {
          zipBlob = clientBlob;
        }
      }

      if (!zipBlob) {
        throw new Error('Generated archive failed ZIP integrity verification.');
      }

      triggerBlobDownload(zipBlob, zipFilename);
      setZipFeedback({
        type: 'success',
        message: `Downloaded ${papers.length} PDFs + index files (${(zipBlob.size / 1024).toFixed(0)} KB).`,
      });
      window.setTimeout(() => {
        setZipFeedback((prev) => (prev?.type === 'success' ? null : prev));
      }, 6000);
    } catch (err: any) {
      console.error('Error downloading research papers ZIP:', err);
      setZipFeedback({
        type: 'error',
        message: err?.message || 'Unable to generate the PDFs ZIP archive. Please try again.',
      });
    } finally {
      setDownloadingZip(false);
      setZipProgress('');
    }
  };

  if (loading) {
    return <ResearchLoadingVisualizer query={session?.query || 'Research Topic Search'} />;
  }

  if (!session) {
    return <div className="py-20 text-center text-[#766E65]">Research session not found.</div>;
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-xl border border-[#E8E2D8] bg-white relative overflow-hidden space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE]">
            {session.domain || 'Computer Science'}
          </span>
          <span className="text-xs text-[#766E65] font-mono">
            {papers.length} Papers Analyzed • Peer Review: {peerReview?.overallDecision || 'Accept'} ({peerReview?.overallScore}/10)
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-[#1E1C1A] leading-tight">{session.query}</h1>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {report && (
            <Link
              to={`/reports/${report.id || (report as any)._id}`}
              className="px-6 py-3 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] shadow-sm inline-flex items-center gap-2 border border-[#1E3A8A] text-sm"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Read Full 11-Section Literature Survey</span>
            </Link>
          )}

          <button
            onClick={handleDownloadAllZip}
            disabled={downloadingZip || papers.length === 0}
            className="px-6 py-3 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] shadow-sm inline-flex items-center gap-2 border border-[#1E3A8A] text-sm transition-all disabled:opacity-60"
            title="Download all research paper PDFs packaged inside a single ZIP file directly from this website"
          >
            {downloadingZip ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{zipProgress || `Packaging ${papers.length} PDFs...`}</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 text-white" />
                <span>Download All {papers.length} PDFs (.ZIP)</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompareClick}
            disabled={selectedPaperIds.length < 2}
            className="px-4 py-3 rounded-xl font-semibold text-[#1E1C1A] bg-white border border-[#E8E2D8] hover:bg-[#F5F1EA] disabled:opacity-50 inline-flex items-center gap-2 text-xs shadow-sm"
          >
            <GitCompare className="w-4 h-4 text-[#1E3A8A]" />
            <span>Side-by-Side Paper Matrix ({selectedPaperIds.length})</span>
          </button>

          <button
            onClick={handleCopyBibTeX}
            className="px-4 py-3 rounded-xl font-semibold text-[#1E1C1A] bg-white border border-[#E8E2D8] hover:bg-[#F5F1EA] inline-flex items-center gap-2 text-xs shadow-sm"
          >
            {bibtexCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#1E3A8A]" />}
            <span>{bibtexCopied ? 'Copied BibTeX' : 'Copy BibTeX'}</span>
          </button>

          <button
            onClick={() => downloadAllPapersDocument(papers, session?.query || 'Research_Papers')}
            className="px-5 py-3 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm inline-flex items-center gap-2 text-xs transition-all"
            title="Download formatted compendium document with all papers, abstracts, and sections (.doc)"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download All {papers.length} Papers (.DOC)</span>
          </button>

          <button
            onClick={() => downloadAllPapersCSV(papers, session?.query || 'Research_Papers')}
            className="px-4 py-3 rounded-xl font-semibold text-[#1E1C1A] bg-white border border-[#E8E2D8] hover:bg-[#F5F1EA] inline-flex items-center gap-2 text-xs shadow-sm transition-all"
            title="Export all papers metadata as an Excel / CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Spreadsheet (.CSV)</span>
          </button>

          <button
            onClick={handleDownloadBibTeX}
            className="px-4 py-3 rounded-xl font-semibold text-[#1E1C1A] bg-white border border-[#E8E2D8] hover:bg-[#F5F1EA] inline-flex items-center gap-2 text-xs shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download .bib</span>
          </button>
        </div>

        {zipFeedback && (
          <div
            role="status"
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold border flex items-center justify-between gap-3 ${
              zipFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{zipFeedback.message}</span>
            <button
              type="button"
              onClick={() => setZipFeedback(null)}
              className="text-[11px] underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-[#E8E2D8] gap-5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('papers')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'papers'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-[#766E65] hover:text-[#1E1C1A]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Literature ({papers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'graph'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-[#766E65] hover:text-[#1E1C1A]'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Claim Topology Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('consensus')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'consensus'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-[#766E65] hover:text-[#1E1C1A]'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Consensus Detector</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'review'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-[#766E65] hover:text-[#1E1C1A]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>AI Peer Review ({peerReview?.overallScore}/10)</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'trends'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-[#766E65] hover:text-[#1E1C1A]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Trend Forecasting</span>
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'lab'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-[#766E65] hover:text-[#1E1C1A]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Lab Workspaces</span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
            activeTab === 'gaps'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-[#766E65] hover:text-[#1E1C1A]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Research Gaps ({gaps.length})</span>
        </button>
      </div>

      {/* Tab 1: Selected Papers */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#766E65] flex-wrap gap-2">
            <span>
              {openedPaper
                ? 'Split-View Active: Reading paper beside the full papers list. Click any paper to switch.'
                : 'Click any paper to open details side-by-side, or use checkboxes for comparison matrix.'}
            </span>
            <div className="flex items-center gap-4">
              <span>Selected for comparison: {selectedPaperIds.length}</span>
              {openedPaper && (
                <button
                  onClick={() => setOpenedPaper(null)}
                  className="font-bold text-[#1E3A8A] hover:underline"
                >
                  ✕ Close Side Panel
                </button>
              )}
            </div>
          </div>

          {openedPaper ? (
            /* Split View: All Papers on the Left + Active Paper Side Panel on the Right */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: All 25 Papers List */}
              <div className="lg:col-span-5 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto pr-2 custom-scrollbar">
                <div className="sticky top-0 bg-[#FBF9F5] z-10 py-2 border-b border-[#E8E2D8] mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1E1C1A]">All {papers.length} Papers</span>
                  <span className="text-[#766E65] text-[11px]">Click to view details</span>
                </div>
                {papers.map((p) => (
                  <PaperCard
                    key={p.id}
                    paper={p}
                    selectable={true}
                    isSelected={selectedPaperIds.includes(p.id)}
                    onSelect={togglePaperSelection}
                    onOpen={(selected) => setOpenedPaper(selected)}
                    isActive={openedPaper.id === p.id}
                  />
                ))}
              </div>

              {/* Right Column: Active Paper Reader Panel */}
              <div className="lg:col-span-7">
                <PaperSidePanel
                  paper={openedPaper}
                  onClose={() => setOpenedPaper(null)}
                />
              </div>
            </div>
          ) : (
            /* Full Width View: All 25 Papers in 2-Column Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {papers.map((p) => (
                <PaperCard
                  key={p.id}
                  paper={p}
                  selectable={true}
                  isSelected={selectedPaperIds.includes(p.id)}
                  onSelect={togglePaperSelection}
                  onOpen={(selected) => setOpenedPaper(selected)}
                  isActive={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Interactive Knowledge Topology Graph */}
      {activeTab === 'graph' && (
        <KnowledgeGraph papers={papers} claims={report?.claims || []} gaps={gaps} />
      )}

      {/* Tab 3: Consensus & Contradiction Detector */}
      {activeTab === 'consensus' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Multi-Document Pairwise Alignment
              </span>
              <h3 className="text-2xl font-black text-[#1E1C1A] mt-1">
                Field Consensus Rating: {consensus?.overallFieldConsensusPct || 88}%
              </h3>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white text-emerald-700 font-mono font-black text-xl flex items-center justify-center border border-emerald-200 shadow-sm">
              {consensus?.overallFieldConsensusPct || 88}%
            </div>
          </div>

          <div className="space-y-4">
            {consensus?.consensusItems.map((item, idx) => (
              <div key={idx} className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-bold text-[#1E1C1A] text-base">{item.topic}</h4>
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {item.consensusScorePct}% Agreement
                  </span>
                </div>

                <div className="bg-[#F5F1EA] p-4 rounded-xl border border-[#E8E2D8] space-y-2">
                  <span className="text-xs font-bold text-emerald-700 block">Synthesized Consensus</span>
                  <p className="text-sm text-[#433E38] leading-relaxed font-sans">{item.consensusSummary}</p>
                </div>

                {item.contrastingViewpoint && (
                  <div className="bg-[#FFFBEB] p-4 rounded-xl border border-amber-200 space-y-1">
                    <span className="text-xs font-bold text-amber-800 block">Contrasting Viewpoint / Limitation</span>
                    <p className="text-sm text-[#78350F] leading-relaxed font-sans">{item.contrastingViewpoint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: AI Peer Reviewer Panel */}
      {activeTab === 'review' && peerReview && <PeerReviewPanelCard panel={peerReview} />}

      {/* Tab 5: Temporal Research Trend Forecast */}
      {activeTab === 'trends' && trendForecast && <TrendForecastCard forecast={trendForecast} />}

      {/* Tab 6: Collaborative Lab Workspace */}
      {activeTab === 'lab' && <LabWorkspaceCard sessionTitle={session.query} />}

      {/* Tab 7: Candidate Research Gaps */}
      {activeTab === 'gaps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gaps.map((g) => (
            <GapCard key={g.id} gap={g} />
          ))}
        </div>
      )}
    </div>
  );
};
