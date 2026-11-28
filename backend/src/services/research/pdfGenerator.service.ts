import * as pdfLib from 'pdf-lib';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import axios from 'axios';
import {
  Paper,
  sanitizeForWinAnsi,
  buildFolderSlug,
  buildPaperPdfFilename,
  buildBatchMetadataCsv,
  buildBatchReadmeText,
  buildBatchBibTeX,
  generatePaperPdfBytes,
} from '@research-agent/shared';

export { sanitizeForWinAnsi };

export interface BatchZipOptions {
  includeExternalPdfs?: boolean;
  externalTimeoutMs?: number;
  maxSingleExternalPdfBytes?: number;
  maxTotalExternalBytes?: number;
  concurrency?: number;
}

export interface SinglePdfOptions {
  includeExternalPdf?: boolean;
  externalTimeoutMs?: number;
  maxBytes?: number;
  filename?: string;
}

const DEFAULT_SINGLE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB cap per external PDF
const DEFAULT_BATCH_MAX_EXTERNAL_BYTES = 18 * 1024 * 1024; // 18 MB local budget

export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.VERCEL
  );
}

export class PdfGeneratorService {
  /**
   * Generates a dynamically paginated, publication-formatted academic PDF
   * grounded in the paper's actual metadata, abstract, and extracted sections.
   */
  async generatePaperPdfBuffer(paper: Partial<Paper>): Promise<Buffer> {
    const pdfBytes = await generatePaperPdfBytes(pdfLib, paper);
    return Buffer.from(pdfBytes);
  }

  /**
   * Fetches genuine publisher PDF if open-access & within budget, or generates a publication-grade PDF buffer.
   * Guaranteed never to throw an unhandled rejection.
   */
  async fetchOrGeneratePaperPdf(
    paper: Partial<Paper>,
    index?: number,
    options?: SinglePdfOptions
  ): Promise<{ buffer: Buffer; filename: string; usedExternal: boolean }> {
    const filename = options?.filename || buildPaperPdfFilename(paper, index);
    const allowExternal = options?.includeExternalPdf !== false;
    const timeoutMs = options?.externalTimeoutMs ?? 3000;
    const maxBytes = options?.maxBytes ?? DEFAULT_SINGLE_MAX_BYTES;

    const directPdfUrl = paper.urls?.pdf;
    const looksLikePdfEndpoint =
      typeof directPdfUrl === 'string' &&
      /^https?:\/\//i.test(directPdfUrl) &&
      (directPdfUrl.includes('arxiv.org/pdf') || /\.pdf(\?|$)/i.test(directPdfUrl));

    if (allowExternal && looksLikePdfEndpoint && directPdfUrl) {
      try {
        const response = await axios.get(directPdfUrl, {
          responseType: 'arraybuffer',
          timeout: timeoutMs,
          maxContentLength: maxBytes,
          maxBodyLength: maxBytes,
          headers: {
            'User-Agent': 'PaperInsightResearchAgent/1.0 (mailto:scholar@research-agent.org)',
            Accept: 'application/pdf,*/*',
          },
        });

        const buf = Buffer.from(response.data);
        if (
          buf.length > 1000 &&
          buf.length <= maxBytes &&
          buf.subarray(0, 5).toString('ascii') === '%PDF-'
        ) {
          return { buffer: buf, filename, usedExternal: true };
        }
      } catch {
        // Fall back gracefully to synthesized publication PDF
      }
    }

    try {
      const generatedBuffer = await this.generatePaperPdfBuffer(paper);
      return { buffer: generatedBuffer, filename, usedExternal: false };
    } catch (genErr) {
      console.error('[PDF Generator] Primary generation error, using safe fallback:', genErr);
      const minimalDoc = await PDFDocument.create();
      const page = minimalDoc.addPage([595.28, 841.89]);
      const font = await minimalDoc.embedFont(StandardFonts.Helvetica);
      page.drawText(sanitizeForWinAnsi(paper.title || 'Academic Research Publication').slice(0, 80), {
        x: 50,
        y: 750,
        size: 13,
        font,
      });
      const bytes = await minimalDoc.save();
      return { buffer: Buffer.from(bytes), filename, usedExternal: false };
    }
  }

  /**
   * Packages all papers into a single organized ZIP archive.
   * Uses bounded concurrency, unique filename allocation, and serverless-safe size budgets.
   */
  async generateBatchZipBuffer(
    papers: Partial<Paper>[],
    query: string,
    options?: BatchZipOptions
  ): Promise<Buffer> {
    const zip = new JSZip();
    const folderName = `Research_Papers_${buildFolderSlug(query)}`;
    const folder = zip.folder(folderName) || zip;

    const serverless = isServerlessRuntime();
    const includeExternalPdfs = options?.includeExternalPdfs ?? !serverless;
    const externalTimeoutMs = options?.externalTimeoutMs ?? 3000;
    const maxSingleExternalPdfBytes = options?.maxSingleExternalPdfBytes ?? DEFAULT_SINGLE_MAX_BYTES;
    const maxTotalExternalBytes =
      options?.maxTotalExternalBytes ?? (serverless ? 0 : DEFAULT_BATCH_MAX_EXTERNAL_BYTES);
    const concurrency = Math.max(1, options?.concurrency ?? 5);

    // Pre-allocate guaranteed-unique filenames so ZIP entries, CSV, and README match 100%
    const usedNames = new Set<string>();
    const filenames = papers.map((paper, idx) => buildPaperPdfFilename(paper, idx, usedNames));

    const results: Array<{ buffer: Buffer; filename: string }> = new Array(papers.length);
    let externalBytesUsed = 0;
    let nextIdx = 0;

    const worker = async () => {
      while (nextIdx < papers.length) {
        const idx = nextIdx++;
        const paper = papers[idx];
        const filename = filenames[idx];
        const canFetchExternal =
          includeExternalPdfs && externalBytesUsed < maxTotalExternalBytes;

        try {
          const item = await this.fetchOrGeneratePaperPdf(paper, idx, {
            filename,
            includeExternalPdf: canFetchExternal,
            externalTimeoutMs,
            maxBytes: maxSingleExternalPdfBytes,
          });

          if (item.usedExternal) {
            if (externalBytesUsed + item.buffer.length <= maxTotalExternalBytes) {
              externalBytesUsed += item.buffer.length;
              results[idx] = { buffer: item.buffer, filename: item.filename };
            } else {
              // Budget reached: keep archive size fast and safe using synthesized PDF
              const compactBuf = await this.generatePaperPdfBuffer(paper);
              results[idx] = { buffer: compactBuf, filename };
            }
          } else {
            results[idx] = { buffer: item.buffer, filename: item.filename };
          }
        } catch (err) {
          console.warn(`[Batch ZIP] Recovering gracefully for paper #${idx + 1}:`, err);
          const fallbackBuf = await this.generatePaperPdfBuffer(paper);
          results[idx] = { buffer: fallbackBuf, filename };
        }
      }
    };

    const workerCount = Math.min(concurrency, Math.max(1, papers.length));
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    results.forEach(({ buffer, filename }) => {
      folder.file(filename, buffer);
    });

    folder.file('00_TABLE_OF_CONTENTS_AND_METADATA.csv', buildBatchMetadataCsv(papers, filenames));
    folder.file('00_REFERENCES.bib', buildBatchBibTeX(papers));
    folder.file('00_README_CITATIONS.txt', buildBatchReadmeText(papers, query, filenames));

    return zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }
}

export const pdfGeneratorService = new PdfGeneratorService();
