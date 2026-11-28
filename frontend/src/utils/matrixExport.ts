import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { sanitizeForWinAnsi, buildFolderSlug } from '@research-agent/shared';

export interface LiteratureSurveyRow {
  reference: string;
  year: number;
  title: string;
  contribution: string;
  limitation: string;
}

export function buildMatrixExportFilename(
  projectTitle: string,
  ext: 'pdf' | 'csv' | 'doc',
  rowCount: number
): string {
  const slug = buildFolderSlug(projectTitle || 'Literature_Survey_Matrix');
  return `Literature_Survey_Matrix_${slug}_${rowCount}_Papers.${ext}`;
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapCellText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
  const safe = sanitizeForWinAnsi(text || '');
  if (!safe) return ['-'];

  const measure = (s: string): number => {
    try {
      return font.widthOfTextAtSize(s, fontSize);
    } catch {
      return s.length * fontSize * 0.52;
    }
  };

  const lines: string[] = [];
  const paragraphs = safe.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (measure(candidate) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
        current = '';
      }

      if (measure(word) > maxWidth) {
        let chunk = '';
        for (const ch of word) {
          if (measure(chunk + ch) <= maxWidth) {
            chunk += ch;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  return lines.length > 0 ? lines : ['-'];
}

/**
 * Generates a landscape A4 multi-page PDF of the Side-by-Side Literature Survey Matrix.
 */
export async function buildMatrixPdfBlob(
  rows: LiteratureSurveyRow[],
  projectTitle: string
): Promise<Blob> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Landscape A4
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const margin = 36;
  const contentWidth = pageWidth - margin * 2; // 769.89 pt
  const bottomLimit = margin + 22;

  const colSpecs = [
    { label: '#', width: 24, align: 'center' as const },
    { label: 'Reference', width: 120, align: 'left' as const },
    { label: 'Year', width: 38, align: 'center' as const },
    { label: 'Title', width: 185, align: 'left' as const },
    { label: 'Contribution', width: 205, align: 'left' as const },
    { label: 'Limitation', width: 197.89, align: 'left' as const },
  ];

  const safeDraw = (page: any, text: string, opts: any) => {
    const clean = sanitizeForWinAnsi(text).replace(/\n/g, ' ');
    if (!clean) return;
    try {
      page.drawText(clean, opts);
    } catch {
      const ascii = clean.replace(/[^a-zA-Z0-9\s.,:;()'"\-_/[\]]/g, ' ').trim();
      if (ascii) {
        try {
          page.drawText(ascii, opts);
        } catch {
          // ignore
        }
      }
    }
  };

  const drawTableHeader = (page: any, topY: number): number => {
    const headerHeight = 22;
    page.drawRectangle({
      x: margin,
      y: topY - headerHeight,
      width: contentWidth,
      height: headerHeight,
      color: rgb(0.12, 0.23, 0.54),
    });

    let curX = margin;
    colSpecs.forEach((col) => {
      safeDraw(page, col.label.toUpperCase(), {
        x: curX + 5,
        y: topY - 14,
        size: 7.5,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });
      curX += col.width;
    });

    return topY - headerHeight;
  };

  const cleanTitle = sanitizeForWinAnsi(projectTitle || 'Literature Survey Matrix');
  const years = rows.map((r) => r.year).filter((y) => !Number.isNaN(y) && y > 1900);
  const yearSummary =
    years.length > 0
      ? `${Math.max(...years)} to ${Math.min(...years)}`
      : 'Chronological';

  let page = doc.addPage([pageWidth, pageHeight]);
  let curY = pageHeight - margin;

  // Top Header Banner
  page.drawRectangle({
    x: margin,
    y: curY - 22,
    width: contentWidth,
    height: 22,
    color: rgb(0.12, 0.23, 0.54),
  });
  safeDraw(page, 'PAPERINSIGHT - SIDE-BY-SIDE LITERATURE SURVEY MATRIX', {
    x: margin + 8,
    y: curY - 14.5,
    size: 8.5,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  safeDraw(page, `${rows.length} PAPERS | ${yearSummary.toUpperCase()}`, {
    x: pageWidth - margin - 145,
    y: curY - 14.5,
    size: 8,
    font: helveticaBold,
    color: rgb(0.88, 0.93, 1),
  });

  curY -= 36;

  // Project Title
  const titleLines = wrapCellText(cleanTitle, contentWidth, helveticaBold, 12.5);
  for (const tLine of titleLines) {
    safeDraw(page, tLine, {
      x: margin,
      y: curY,
      size: 12.5,
      font: helveticaBold,
      color: rgb(0.08, 0.12, 0.22),
    });
    curY -= 16;
  }

  safeDraw(
    page,
    `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} | Ordered chronologically descending by publication year`,
    {
      x: margin,
      y: curY,
      size: 8,
      font: helvetica,
      color: rgb(0.45, 0.43, 0.4),
    }
  );
  curY -= 14;

  curY = drawTableHeader(page, curY);

  const fontSize = 7.5;
  const lineHeight = 10;
  const cellPadX = 5;
  const cellPadY = 6;

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    const cellTexts = [
      String(idx + 1),
      row.reference || 'Authors',
      String(row.year || ''),
      row.title || '',
      row.contribution || '',
      row.limitation || '',
    ];

    const wrappedCells = cellTexts.map((txt, cIdx) => {
      const innerWidth = colSpecs[cIdx].width - cellPadX * 2;
      const font = cIdx === 2 || cIdx === 3 ? helveticaBold : helvetica;
      return wrapCellText(txt, innerWidth, font, fontSize);
    });

    const maxLines = Math.max(...wrappedCells.map((l) => l.length));
    const rowHeight = Math.max(22, maxLines * lineHeight + cellPadY * 2);

    // Page break if row won't fit
    if (curY - rowHeight < bottomLimit) {
      page = doc.addPage([pageWidth, pageHeight]);
      curY = pageHeight - margin;
      const snippet = cleanTitle.length > 90 ? `${cleanTitle.slice(0, 90)}...` : cleanTitle;
      safeDraw(page, `Literature Survey Matrix: ${snippet}`, {
        x: margin,
        y: curY - 4,
        size: 8,
        font: helveticaBold,
        color: rgb(0.35, 0.35, 0.35),
      });
      curY -= 14;
      curY = drawTableHeader(page, curY);
    }

    // Row background + outer border
    page.drawRectangle({
      x: margin,
      y: curY - rowHeight,
      width: contentWidth,
      height: rowHeight,
      color: idx % 2 === 0 ? rgb(1, 1, 1) : rgb(0.98, 0.97, 0.95),
      borderColor: rgb(0.85, 0.82, 0.78),
      borderWidth: 0.5,
    });

    // Vertical column dividers + text
    let cellX = margin;
    for (let cIdx = 0; cIdx < colSpecs.length; cIdx++) {
      const col = colSpecs[cIdx];
      if (cIdx > 0) {
        page.drawLine({
          start: { x: cellX, y: curY },
          end: { x: cellX, y: curY - rowHeight },
          thickness: 0.5,
          color: rgb(0.85, 0.82, 0.78),
        });
      }

      const font = cIdx === 2 || cIdx === 3 ? helveticaBold : helvetica;
      const color =
        cIdx === 2
          ? rgb(0.12, 0.23, 0.54)
          : cIdx === 5
          ? rgb(0.55, 0.25, 0.05)
          : rgb(0.12, 0.12, 0.12);

      let textY = curY - cellPadY - 6;
      for (const line of wrappedCells[cIdx]) {
        safeDraw(page, line, {
          x: cellX + cellPadX,
          y: textY,
          size: fontSize,
          font,
          color,
        });
        textY -= lineHeight;
      }

      cellX += col.width;
    }

    curY -= rowHeight;
  }

  // Footers across all pages
  const pages = doc.getPages();
  pages.forEach((p, idx) => {
    p.drawLine({
      start: { x: margin, y: margin + 10 },
      end: { x: pageWidth - margin, y: margin + 10 },
      thickness: 0.5,
      color: rgb(0.82, 0.82, 0.82),
    });
    safeDraw(p, 'PaperInsight: Research Analysis and Literature Review Generation System', {
      x: margin,
      y: margin - 2,
      size: 7.5,
      font: helvetica,
      color: rgb(0.45, 0.45, 0.45),
    });
    safeDraw(p, `Page ${idx + 1} of ${pages.length}`, {
      x: pageWidth - margin - 55,
      y: margin - 2,
      size: 7.5,
      font: helveticaBold,
      color: rgb(0.25, 0.25, 0.25),
    });
  });

  const pdfBytes = await doc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}

export function buildMatrixCsvBlob(
  rows: LiteratureSurveyRow[],
  projectTitle: string
): Blob {
  const headers = ['#', 'Reference', 'Year', 'Title', 'Contribution', 'Limitation'];
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`;

  const lines = [
    `"Project Title",${esc(projectTitle)}`,
    headers.join(','),
    ...rows.map((r, idx) =>
      [idx + 1, esc(r.reference), r.year, esc(r.title), esc(r.contribution), esc(r.limitation)].join(',')
    ),
  ];

  return new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
}

export function buildMatrixDocBlob(
  rows: LiteratureSurveyRow[],
  projectTitle: string
): Blob {
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(projectTitle)} - Literature Survey Matrix</title>
  <style>
    @page { size: landscape; margin: 0.6in; }
    body { font-family: Calibri, Arial, sans-serif; color: #1e1c1a; font-size: 10pt; }
    h1 { color: #1e3a8a; font-size: 16pt; margin-bottom: 4pt; }
    p.meta { color: #5c554e; font-size: 9pt; margin-top: 0; margin-bottom: 12pt; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1pt solid #d8d0c4; padding: 6pt; text-align: left; vertical-align: top; font-size: 9.5pt; }
    th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; }
    tr:nth-child(even) td { background-color: #fbf9f5; }
    td.year { color: #1e3a8a; font-weight: bold; text-align: center; }
    td.lim { color: #92400e; }
  </style>
</head>
<body>
  <h1>Literature Survey Matrix: ${escapeHtml(projectTitle)}</h1>
  <p class="meta">Total Papers: ${rows.length} | Generated by PaperInsight (${new Date().toLocaleDateString('en-US')})</p>
  <table>
    <thead>
      <tr>
        <th style="width:4%;">#</th>
        <th style="width:17%;">Reference</th>
        <th style="width:6%;">Year</th>
        <th style="width:23%;">Title</th>
        <th style="width:26%;">Contribution</th>
        <th style="width:24%;">Limitation</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(r.reference)}</td>
        <td class="year">${r.year}</td>
        <td><strong>${escapeHtml(r.title)}</strong></td>
        <td>${escapeHtml(r.contribution)}</td>
        <td class="lim">${escapeHtml(r.limitation)}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

  return new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
}
