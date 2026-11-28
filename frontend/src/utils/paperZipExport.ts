import JSZip from 'jszip';
import * as pdfLib from 'pdf-lib';
import {
  Paper,
  buildFolderSlug,
  buildPaperPdfFilename,
  buildBatchMetadataCsv,
  buildBatchBibTeX,
  buildBatchReadmeText,
  generatePaperPdfBytes,
  isZipHeader,
} from '@research-agent/shared';

export async function isValidZipBlob(blob: Blob | null | undefined): Promise<boolean> {
  if (!blob || blob.size < 22) return false;
  try {
    const headerBuffer = await blob.slice(0, 4).arrayBuffer();
    return isZipHeader(new Uint8Array(headerBuffer));
  } catch {
    return false;
  }
}

export function buildZipDownloadFilename(query: string, paperCount: number): string {
  const cleanName = buildFolderSlug(query || 'Research_Papers');
  return `Research_Papers_${cleanName}_${paperCount}_PDFs.zip`;
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1500);
}

/**
 * Generates a complete ZIP archive of all paper PDFs + CSV/BibTeX/README manifests
 * directly in the browser as a resilient fallback if the server export fails or times out.
 */
export async function buildClientResearchZipBlob(
  papers: Paper[],
  query: string,
  onProgress?: (completed: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `Research_Papers_${buildFolderSlug(query)}`;
  const folder = zip.folder(folderName) || zip;

  const usedNames = new Set<string>();
  const filenames = papers.map((p, idx) => buildPaperPdfFilename(p, idx, usedNames));

  for (let i = 0; i < papers.length; i++) {
    const pdfBytes = await generatePaperPdfBytes(pdfLib, papers[i]);
    folder.file(filenames[i], pdfBytes);
    if (onProgress) {
      onProgress(i + 1, papers.length);
    }
    // Yield periodically to keep browser UI responsive during 25-PDF packaging
    if ((i + 1) % 4 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  folder.file('00_TABLE_OF_CONTENTS_AND_METADATA.csv', buildBatchMetadataCsv(papers, filenames));
  folder.file('00_REFERENCES.bib', buildBatchBibTeX(papers));
  folder.file('00_README_CITATIONS.txt', buildBatchReadmeText(papers, query, filenames));

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return zipBlob;
}
