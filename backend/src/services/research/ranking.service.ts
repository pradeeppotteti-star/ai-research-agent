import { Paper } from '@research-agent/shared';

export class RankingService {
  rankPapers(papers: Partial<Paper>[], query: string, targetCount: number = 10): Partial<Paper>[] {
    if (!query || !query.trim()) {
      return papers.slice(0, targetCount);
    }

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
    const stopWords = new Set(['what', 'are', 'the', 'latest', 'approaches', 'for', 'with', 'using', 'how', 'can', 'and', 'in', 'of', 'on', 'a', 'an', 'to']);
    const queryTerms = cleanQuery.split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t));

    // STRICT FILTER: Keep ONLY papers that contain core keywords from the user's primary query
    const strictlyMatchingPapers = papers.filter((paper) => {
      const titleLower = (paper.title || '').toLowerCase();
      const abstractLower = (paper.abstract || '').toLowerCase();
      const keywordsLower = (paper.keywords || []).join(' ').toLowerCase();

      // Must match at least ONE core query term in title, abstract, or keywords
      return queryTerms.some(
        (term) =>
          titleLower.includes(term) ||
          abstractLower.includes(term) ||
          keywordsLower.includes(term)
      );
    });

    const pool = strictlyMatchingPapers.length > 0 ? strictlyMatchingPapers : papers;

    const scoredPapers = pool.map((paper) => {
      let score = 0;
      const titleLower = (paper.title || '').toLowerCase();
      const abstractLower = (paper.abstract || '').toLowerCase();
      const keywordsLower = (paper.keywords || []).join(' ').toLowerCase();

      // 1. Core Keyword overlap in Title (weight: 10)
      queryTerms.forEach((term) => {
        if (titleLower.includes(term)) score += 10;
      });

      // 2. Exact phrase match in Title bonus (weight: 20)
      if (titleLower.includes(cleanQuery)) {
        score += 20;
      }

      // 3. Keyword overlap in Abstract (weight: 4)
      queryTerms.forEach((term) => {
        if (abstractLower.includes(term)) score += 4;
      });

      // 4. Keyword overlap in Keywords tag (weight: 5)
      queryTerms.forEach((term) => {
        if (keywordsLower.includes(term)) score += 5;
      });

      // 5. Citation count boost
      if (paper.citationCount && paper.citationCount > 0) {
        score += Math.min(3, Math.log10(paper.citationCount + 1));
      }

      // 6. Open access / PDF available bonus
      if (paper.pdfAvailable) score += 1;
      if (paper.openAccess) score += 0.5;

      const normalizedScore = Number((Math.min(0.99, 0.75 + score * 0.02)).toFixed(2));

      return {
        ...paper,
        relevanceScore: normalizedScore,
      };
    });

    // Deduplicate papers by title slug
    const uniquePapersMap = new Map<string, Partial<Paper>>();
    scoredPapers.forEach((p) => {
      const slug = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!uniquePapersMap.has(slug) || (p.relevanceScore || 0) > (uniquePapersMap.get(slug)?.relevanceScore || 0)) {
        uniquePapersMap.set(slug, p);
      }
    });

    const uniquePapers = Array.from(uniquePapersMap.values());

    // Sort descending by relevance score
    uniquePapers.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return uniquePapers.slice(0, Math.max(1, targetCount));
  }
}

export const rankingService = new RankingService();
