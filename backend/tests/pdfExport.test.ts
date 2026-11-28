import { describe, it, expect, afterEach } from 'vitest';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { Paper, isZipHeader } from '@research-agent/shared';
import { pdfGeneratorService, sanitizeForWinAnsi } from '../src/services/research/pdfGenerator.service';
import {
  buildClientResearchZipBlob,
  isValidZipBlob,
} from '../../frontend/src/utils/paperZipExport';

function makeMockPapers(count: number): Paper[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `paper_${idx + 1}`,
    title:
      idx < 2
        ? 'Federated Learning for Chronic Kidney Disease Progression Prediction' // intentional duplicate title test
        : `Paper ${idx + 1}: Safe Deep RL with α-Divergence ≤ 0.05 for Clinical Decision Support — Cohort ${idx + 1}`,
    authors: ['Dr. Sarah Jenkins', 'Prof. Marcus Thorne', `Researcher ${idx + 1}`],
    abstract:
      `This study (#${idx + 1}) evaluates federated hybrid ML-DL architectures for longitudinal chronic kidney disease staging across heterogeneous hospital registries. ` +
      'Through constrained off-policy evaluation and privacy-preserving aggregation, the proposed approach improves calibration and clinical safety.',
    publicationDate: String(2021 + (idx % 6)),
    venue: idx % 2 === 0 ? 'IEEE Transactions on Biomedical Engineering' : 'Nature Digital Medicine',
    doi: `10.1109/TBME.2025.${1000 + idx}`,
    urls: {
      primary: `https://example.org/papers/${idx + 1}`,
      pdf: idx % 3 === 0 ? 'http://127.0.0.1:1/unreachable.pdf' : undefined,
    },
    source: idx % 2 === 0 ? 'IEEE Xplore' : 'Google Scholar',
    citationCount: 20 + idx * 3,
    pdfAvailable: true,
    openAccess: idx % 2 === 0,
    keywords: ['Federated Learning', 'Safe RL', 'CKD', 'Clinical Decision Support'],
    extractedSections: [
      {
        title: 'Introduction & Background',
        type: 'introduction',
        content: `Section 1 specific to Paper ${idx + 1}: decentralized clinical risk modeling requires strict privacy guarantees.`,
      },
      {
        title: 'Methodology',
        type: 'methodology',
        content: `Section 2 specific to Paper ${idx + 1}: primal-dual constrained optimization over federated cohorts.`,
      },
      {
        title: 'Empirical Results',
        type: 'results',
        content: `Section 3 specific to Paper ${idx + 1}: AUROC reached ${(0.88 + (idx % 7) * 0.01).toFixed(2)} across validation folds.`,
      },
    ],
    figuresAndTables: [
      { id: `fig_${idx + 1}`, type: 'figure', caption: `Figure 1: Pipeline overview for study ${idx + 1}.` },
    ],
    createdAt: new Date().toISOString(),
  }));
}

describe('PdfGeneratorService & Batch 25-PDF ZIP Export', () => {
  const originalNetlify = process.env.NETLIFY;

  afterEach(() => {
    if (originalNetlify === undefined) {
      delete process.env.NETLIFY;
    } else {
      process.env.NETLIFY = originalNetlify;
    }
  });

  it('sanitizes Unicode and Greek symbols safely for WinAnsi', () => {
    const sanitized = sanitizeForWinAnsi('α-RL ≥ 0.95 — “Clinical” ± 0.01 → Next');
    expect(sanitized).toContain('alpha-RL >= 0.95 - "Clinical" +/- 0.01 -> Next');
  });

  it('packages all 25 papers with unique filenames, valid PDFs, CSV, BibTeX, and README', async () => {
    const papers = makeMockPapers(25);
    const zipBuffer = await pdfGeneratorService.generateBatchZipBuffer(
      papers,
      'Federated Hybrid ML-DL Framework for CKD',
      { includeExternalPdfs: false }
    );

    expect(isZipHeader(new Uint8Array(zipBuffer))).toBe(true);
    // Compact serverless-safe payload (well under Netlify 6 MB limit)
    expect(zipBuffer.length).toBeLessThan(1024 * 1024);

    const zip = await JSZip.loadAsync(zipBuffer);
    const entryNames = Object.keys(zip.files).filter((name) => !zip.files[name].dir);

    const pdfEntries = entryNames.filter((name) => name.toLowerCase().endsWith('.pdf'));
    expect(pdfEntries).toHaveLength(25);
    expect(new Set(pdfEntries).size).toBe(25);

    expect(entryNames.some((n) => n.endsWith('00_TABLE_OF_CONTENTS_AND_METADATA.csv'))).toBe(true);
    expect(entryNames.some((n) => n.endsWith('00_REFERENCES.bib'))).toBe(true);
    expect(entryNames.some((n) => n.endsWith('00_README_CITATIONS.txt'))).toBe(true);

    // Spot-check and parse all 25 PDFs with pdf-lib to ensure every PDF is structurally valid
    for (const pdfEntry of pdfEntries) {
      const bytes = await zip.files[pdfEntry].async('uint8array');
      expect(Buffer.from(bytes.slice(0, 5)).toString('ascii')).toBe('%PDF-');
      const parsed = await PDFDocument.load(bytes);
      expect(parsed.getPageCount()).toBeGreaterThanOrEqual(1);
    }

    const csvEntry = entryNames.find((n) => n.endsWith('00_TABLE_OF_CONTENTS_AND_METADATA.csv'))!;
    const csvText = await zip.files[csvEntry].async('string');
    expect(csvText).toContain('Paper 25:');
    expect(csvText).toContain('01_Federated_Learning');
  });

  it('dynamically paginates long papers across multiple pages without truncation', async () => {
    const longAbstract = Array.from(
      { length: 28 },
      (_, i) => `Sentence ${i + 1}: Comprehensive multi-site clinical evaluation demonstrates strong calibration and safety.`
    ).join(' ');

    const pdfBuf = await pdfGeneratorService.generatePaperPdfBuffer({
      id: 'long_paper',
      title: 'Very Long Multi-Page Academic Survey on Federated Clinical Decision Support',
      authors: ['Dr. A', 'Dr. B'],
      abstract: longAbstract,
      extractedSections: Array.from({ length: 6 }, (_, s) => ({
        title: `Section ${s + 1}: Extended Analysis`,
        type: 'methodology',
        content: longAbstract,
      })),
    });

    const parsed = await PDFDocument.load(pdfBuf);
    expect(parsed.getPageCount()).toBeGreaterThanOrEqual(2);
  });

  it('stays fast and compact in Netlify serverless mode even if papers have external PDF URLs', async () => {
    process.env.NETLIFY = 'true';
    const papers = makeMockPapers(25);
    const start = Date.now();
    const zipBuffer = await pdfGeneratorService.generateBatchZipBuffer(papers, 'CKD Safe RL');
    const elapsedMs = Date.now() - start;

    expect(isZipHeader(new Uint8Array(zipBuffer))).toBe(true);
    expect(zipBuffer.length).toBeLessThan(1024 * 1024);
    expect(elapsedMs).toBeLessThan(5000);
  });

  it('client-side fallback ZIP builder produces a valid 25-PDF Blob with progress callbacks', async () => {
    const papers = makeMockPapers(25);
    const progressCalls: Array<[number, number]> = [];

    const blob = await buildClientResearchZipBlob(
      papers,
      'Federated Hybrid ML-DL Framework',
      (done, total) => progressCalls.push([done, total])
    );

    expect(progressCalls).toHaveLength(25);
    expect(progressCalls[24]).toEqual([25, 25]);
    expect(await isValidZipBlob(blob)).toBe(true);

    const invalidBlob = new Blob([JSON.stringify({ error: '502 Bad Gateway' })], {
      type: 'application/json',
    });
    expect(await isValidZipBlob(invalidBlob)).toBe(false);

    const arrayBuf = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuf);
    const pdfs = Object.keys(zip.files).filter((n) => n.endsWith('.pdf'));
    expect(pdfs).toHaveLength(25);
  });
});
