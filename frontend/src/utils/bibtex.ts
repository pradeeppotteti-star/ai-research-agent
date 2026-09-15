import { Paper } from '@research-agent/shared';

export function generateBibTeX(paper: Paper): string {
  const firstAuthorLastName = paper.authors && paper.authors.length > 0
    ? paper.authors[0].split(' ').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'author'
    : 'author';
  const year = paper.publicationDate || '2024';
  const titleSlug = paper.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 2)
    .join('');

  const citeKey = `${firstAuthorLastName}${year}${titleSlug}`;

  const authorsString = paper.authors ? paper.authors.join(' and ') : 'Anonymous';
  const journal = paper.venue || 'arXiv Preprint Server';
  const doiStr = paper.doi ? `  doi = {${paper.doi}},\n` : '';
  const urlStr = paper.urls?.primary ? `  url = {${paper.urls.primary}},\n` : '';

  return `@article{${citeKey},
  title = {${paper.title}},
  author = {${authorsString}},
  journal = {${journal}},
  year = {${year}},
${doiStr}${urlStr}  note = {AI Smart Research Agent: Evidence-Grounded Multi-Source Literature Survey Synthesis}
}`;
}

export function generateMultiBibTeX(papers: Paper[]): string {
  return papers.map((p) => generateBibTeX(p)).join('\n\n');
}

export function downloadBibTeXFile(filename: string, textContent: string): void {
  const element = document.createElement('a');
  const file = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename.endsWith('.bib') ? filename : `${filename}.bib`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
