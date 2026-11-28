import { Paper, PeerReviewPanel, EvidenceItem, CandidateResearchGap } from '@research-agent/shared';

export class PeerReviewService {
  evaluateSurvey(query: string, papers: Paper[], claims: EvidenceItem[], gaps: CandidateResearchGap[]): PeerReviewPanel {
    const totalPapers = Math.max(1, papers.length);
    const totalClaims = Math.max(1, claims.length);
    const supportedCount = claims.filter((c) => c.verificationStatus === 'supported').length;
    const verifiedRatio = supportedCount / totalClaims;
    const openAccessRatio = papers.filter((p) => p.openAccess || p.pdfAvailable).length / totalPapers;
    const sourceCount = new Set(papers.map((p) => p.source).filter(Boolean)).size;

    const methodologyScore = Math.min(9.6, Number((6.8 + Math.min(1, sourceCount / 4) * 1.6 + Math.min(1, papers.length / 10) * 1.0).toFixed(1)));
    const noveltyScore = Math.min(9.5, Number((6.9 + Math.min(1, gaps.length / 4) * 1.8 + openAccessRatio * 0.6).toFixed(1)));
    const factualityScore = Math.min(9.8, Number((6.6 + verifiedRatio * 2.8).toFixed(1)));
    const overallScore = Number(((methodologyScore + noveltyScore + factualityScore) / 3).toFixed(1));

    let overallDecision: PeerReviewPanel['overallDecision'] = 'Accept';
    if (overallScore >= 9.0) overallDecision = 'Strong Accept';
    else if (overallScore >= 8.0) overallDecision = 'Accept';
    else if (overallScore >= 7.0) overallDecision = 'Weak Accept';
    else overallDecision = 'Borderline';

    return {
      overallDecision,
      overallScore,
      reviewers: [
        {
          reviewerRole: 'Reviewer 1 (Methodology)',
          score: methodologyScore,
          summary: `Survey covers ${papers.length} works across ${sourceCount} repository source(s) for "${query}".`,
          strengths: [
            `Cross-provider coverage across ${sourceCount} academic source(s).`,
            'Structured side-by-side comparison across methodology, datasets, and limitations.',
          ],
          weaknesses: [
            openAccessRatio < 1
              ? `${papers.length - Math.round(openAccessRatio * papers.length)} non-open-access paper(s) rely on abstract metadata.`
              : 'Additional longitudinal baselines could further broaden historical context.',
          ],
        },
        {
          reviewerRole: 'Reviewer 2 (Novelty & Gaps)',
          score: noveltyScore,
          summary: `Identified ${gaps.length} candidate research gap(s) grounded in the retrieved corpus for "${query}".`,
          strengths: [
            `Explicitly isolates ${gaps.length} underexplored research direction(s).`,
            'Links each gap directly to supporting paper titles and evidence.',
          ],
          weaknesses: [
            gaps.length < 3
              ? 'Expanding the target paper count may surface additional niche research gaps.'
              : 'Experimental validation of proposed future directions remains open work.',
          ],
        },
        {
          reviewerRole: 'Reviewer 3 (Factuality Auditor)',
          score: factualityScore,
          summary: `${supportedCount} of ${claims.length} extracted claims (${Math.round(verifiedRatio * 100)}%) are directly supported by retrieved paper text.`,
          strengths: [
            'Claims are categorized into Supported, Inferred, and Uncertain states.',
            'Each finding links back to its source paper title and section.',
          ],
          weaknesses: [
            verifiedRatio < 0.8
              ? 'Some claims are inferred or uncertain due to limited full-text availability.'
              : 'Automated PDF table/figure parsing depends on upstream publisher formatting.',
          ],
        },
      ],
    };
  }
}

export const peerReviewService = new PeerReviewService();
