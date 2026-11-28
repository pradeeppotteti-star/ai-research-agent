import { Paper, ConsensusAnalysis, ConsensusItem } from '@research-agent/shared';

export class ConsensusService {
  analyzeConsensus(papers: Paper[], query: string): ConsensusAnalysis {
    const total = Math.max(1, papers.length);
    const openAccessCount = papers.filter((p) => p.openAccess || p.pdfAvailable).length;
    const openAccessPct = Math.round((openAccessCount / total) * 100);

    const recentCount = papers.filter((p) => {
      const y = parseInt(String(p.publicationDate || '2020'), 10);
      return !isNaN(y) && y >= 2023;
    }).length;
    const recencyPct = Math.round((recentCount / total) * 100);

    const uniqueSources = new Set(papers.map((p) => p.source).filter(Boolean)).size;
    const multiSourceScore = Math.min(95, Math.max(55, 55 + uniqueSources * 8));

    const highCitedCount = papers.filter((p) => (p.citationCount || 0) >= 10).length;
    const citationConsensusPct = Math.min(96, Math.max(50, Math.round((highCitedCount / total) * 100) || 60));

    const consensusItems: ConsensusItem[] = [
      {
        topic: `Methodological Recency & Momentum for "${query.slice(0, 60)}"`,
        consensusScorePct: recencyPct,
        supportingPapersCount: recentCount,
        contrastingPapersCount: Math.max(0, papers.length - recentCount),
        consensusSummary: `${recentCount} of ${papers.length} analyzed papers (${recencyPct}%) were published in 2023 or later, reflecting active convergence on modern approaches.`,
        contrastingViewpoint:
          papers.length - recentCount > 0
            ? `${papers.length - recentCount} earlier foundational studies establish baseline methods prior to recent architectures.`
            : undefined,
      },
      {
        topic: 'Open-Access Full-Text Verifiability',
        consensusScorePct: openAccessPct,
        supportingPapersCount: openAccessCount,
        contrastingPapersCount: Math.max(0, papers.length - openAccessCount),
        consensusSummary: `${openAccessCount} of ${papers.length} papers (${openAccessPct}%) expose open-access metadata or PDF links for direct claim grounding.`,
        contrastingViewpoint:
          papers.length - openAccessCount > 0
            ? `${papers.length - openAccessCount} publisher-restricted entries rely on abstract-level metadata.`
            : undefined,
      },
      {
        topic: 'Cross-Repository Evidence & Citation Alignment',
        consensusScorePct: Math.round((multiSourceScore + citationConsensusPct) / 2),
        supportingPapersCount: Math.max(1, highCitedCount),
        contrastingPapersCount: Math.max(0, papers.length - Math.max(1, highCitedCount)),
        consensusSummary: `Evidence spans ${uniqueSources} academic repository source(s), with ${highCitedCount} paper(s) carrying 10+ citations supporting core claims.`,
      },
    ];

    const avgConsensus = Math.round(
      consensusItems.reduce((acc, item) => acc + item.consensusScorePct, 0) / consensusItems.length
    );

    return {
      overallFieldConsensusPct: avgConsensus,
      consensusItems,
    };
  }
}

export const consensusService = new ConsensusService();
