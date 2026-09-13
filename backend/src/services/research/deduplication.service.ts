import { Paper } from '@research-agent/shared';

export class DeduplicationService {
  deduplicate(papers: Partial<Paper>[]): Partial<Paper>[] {
    const uniquePapers: Partial<Paper>[] = [];
    const seenDois = new Set<string>();
    const seenTitles = new Set<string>();

    for (const paper of papers) {
      if (!paper.title) continue;

      const normalizedTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedDoi = paper.doi ? paper.doi.toLowerCase().trim() : null;

      if (normalizedDoi && seenDois.has(normalizedDoi)) {
        continue;
      }

      if (seenTitles.has(normalizedTitle)) {
        continue;
      }

      // Check fuzzy similarity with existing titles
      let isDuplicate = false;
      for (const seen of Array.from(seenTitles)) {
        if (this.calculateLevenshteinSimilarity(normalizedTitle, seen) > 0.88) {
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) continue;

      if (normalizedDoi) seenDois.add(normalizedDoi);
      seenTitles.add(normalizedTitle);
      uniquePapers.push(paper);
    }

    return uniquePapers;
  }

  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    if (len1 === 0) return len2 === 0 ? 1.0 : 0.0;
    if (len2 === 0) return 0.0;

    const maxLength = Math.max(len1, len2);
    if (Math.abs(len1 - len2) / maxLength > 0.3) return 0.0;

    const matrix: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    return 1 - distance / maxLength;
  }
}

export const deduplicationService = new DeduplicationService();
