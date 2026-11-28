import { Paper, TemporalTrendForecast, TopicTrend } from '@research-agent/shared';

export class TrendForecastService {
  forecastTrends(query: string, papers: Paper[] = [], keywords: string[] = []): TemporalTrendForecast {
    const years = [2022, 2023, 2024, 2025, 2026];

    // Collect top keywords from papers and query
    const freq = new Map<string, number>();
    for (const kw of keywords) {
      const clean = kw.trim();
      if (clean.length > 2) freq.set(clean, (freq.get(clean) || 0) + 2);
    }
    for (const p of papers) {
      for (const kw of p.keywords || []) {
        const clean = kw.trim();
        if (clean.length > 2) freq.set(clean, (freq.get(clean) || 0) + 1);
      }
    }

    let topTopics = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k]) => k);

    if (topTopics.length === 0) {
      topTopics = [query.trim().slice(0, 40) || 'Core Research Topic'];
    }

    const emergingTopics: TopicTrend[] = topTopics.map((topic) => {
      const lower = topic.toLowerCase();
      const matchingPapers = papers.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.abstract.toLowerCase().includes(lower) ||
          (p.keywords || []).some((k) => k.toLowerCase().includes(lower))
      );
      const pool = matchingPapers.length > 0 ? matchingPapers : papers;

      const historicalCounts = years.map((year) => ({
        year,
        paperCount: pool.filter((p) => parseInt(String(p.publicationDate || '2024'), 10) === year).length,
      }));

      const earlier = historicalCounts.slice(0, 2).reduce((s, c) => s + c.paperCount, 0);
      const recent = historicalCounts.slice(3).reduce((s, c) => s + c.paperCount, 0);
      const growthPct = earlier === 0 ? (recent > 0 ? recent * 50 : 0) : Math.round(((recent - earlier) / earlier) * 100);

      let momentum: TopicTrend['momentum'] = 'stable';
      if (growthPct >= 50) momentum = 'high_growth';
      else if (growthPct > 10) momentum = 'emerging';
      else if (growthPct < -10) momentum = 'declining';

      return {
        keyword: topic,
        momentum,
        growthPct,
        historicalCounts,
      };
    });

    const avgGrowth =
      emergingTopics.length > 0
        ? Math.round(emergingTopics.reduce((s, t) => s + t.growthPct, 0) / emergingTopics.length)
        : 0;

    const leadTopic = emergingTopics[0]?.keyword || query;
    return {
      projectedGrowthPct: avgGrowth,
      emergingTopics,
      recommendation: `Based on ${papers.length} retrieved paper(s), "${leadTopic}" shows the strongest representation (${avgGrowth >= 0 ? '+' : ''}${avgGrowth}% trend shift across 2022–2026).`,
    };
  }
}

export const trendForecastService = new TrendForecastService();
