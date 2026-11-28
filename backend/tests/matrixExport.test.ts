import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PDFDocument } from 'pdf-lib';

vi.hoisted(() => {
  process.env.NETLIFY = 'true';
});

import app from '../src/server';
import { env } from '../src/config/env';
import { comparisonService } from '../src/services/research/comparison.service';
import {
  buildMatrixPdfBlob,
  buildMatrixCsvBlob,
  buildMatrixDocBlob,
  LiteratureSurveyRow,
} from '../../frontend/src/utils/matrixExport';

function build25MockPapers() {
  return Array.from({ length: 25 }, (_, i) => ({
    id: `m_${i + 1}`,
    title: `Study ${i + 1}: α-Fair Federated Learning for CKD Staging (Cohort ${i + 1})`,
    authors: ['Dr. Sarah Jenkins', 'Prof. Marcus Thorne'],
    abstract: `Study ${i + 1} proposes privacy-preserving federated risk modeling for chronic kidney disease.`,
    publicationDate: String(2021 + (i % 6)),
    venue: 'IEEE Transactions on Biomedical Engineering',
    urls: { primary: `https://example.org/${i + 1}` },
    source: 'IEEE Xplore' as const,
    citationCount: 15 + i,
    pdfAvailable: true,
    openAccess: true,
    keywords: ['Federated Learning', 'CKD', 'Clinical AI'],
    extractedSections: [
      {
        title: 'Methodology',
        type: 'methodology' as const,
        content: `Custom federated methodology #${i + 1} using differentially private aggregation.`,
      },
      {
        title: 'Results',
        type: 'results' as const,
        content: `Achieved AUROC ${(0.88 + (i % 8) * 0.01).toFixed(2)} in study ${i + 1}.`,
      },
      {
        title: 'Conclusion',
        type: 'conclusion' as const,
        content: `Limitation #${i + 1}: retrospective hospital registry cohorts require prospective trials.`,
      },
    ],
    createdAt: new Date().toISOString(),
  }));
}

describe('Side-by-Side Matrix Service, Endpoint, and PDF/CSV/DOC Exports', () => {
  it('ComparisonService extracts paper-specific methodology and limitations', () => {
    const papers = build25MockPapers();
    const matrix = comparisonService.generateComparisonMatrix(papers, 'Federated CKD');

    expect(matrix).toHaveLength(25);
    expect(matrix[0].methodology).toContain('Custom federated methodology #1');
    expect(matrix[24].methodology).toContain('Custom federated methodology #25');
    expect(matrix[0].limitations).toContain('Limitation #1');
  });

  it('POST /api/research/compare returns comparison matrix for provided 25 papers', async () => {
    const token = jwt.sign(
      { userId: 'usr_matrix_test', email: 'matrix@paperinsight.edu', name: 'Tester' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const papers = build25MockPapers();
    const res = await request(app)
      .post('/api/research/compare')
      .set('Authorization', `Bearer ${token}`)
      .send({
        paperIds: papers.map((p) => p.id),
        query: 'Federated Learning for CKD',
        papers,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(25);
    expect(res.body.data[5].methodology).toContain('Custom federated methodology #6');
  });

  it('buildMatrixPdfBlob creates a valid multi-page landscape PDF for 25 papers', async () => {
    const rows: LiteratureSurveyRow[] = build25MockPapers().map((p, idx) => ({
      reference: p.authors.join(', '),
      year: parseInt(p.publicationDate, 10),
      title: p.title,
      contribution: p.extractedSections![0].content,
      limitation: p.extractedSections![2].content + ` Extended note for row ${idx + 1}.`,
    }));

    const pdfBlob = await buildMatrixPdfBlob(rows, 'Federated Hybrid ML-DL Framework — CKD');
    const buf = new Uint8Array(await pdfBlob.arrayBuffer());
    expect(Buffer.from(buf.slice(0, 5)).toString('ascii')).toBe('%PDF-');

    const parsed = await PDFDocument.load(buf);
    expect(parsed.getPageCount()).toBeGreaterThanOrEqual(2);
    const firstPageSize = parsed.getPage(0).getSize();
    expect(firstPageSize.width).toBeGreaterThan(firstPageSize.height); // landscape
  });

  it('buildMatrixCsvBlob and buildMatrixDocBlob include all 25 rows cleanly', async () => {
    const rows: LiteratureSurveyRow[] = build25MockPapers().map((p) => ({
      reference: p.authors.join(', '),
      year: parseInt(p.publicationDate, 10),
      title: p.title,
      contribution: p.extractedSections![0].content,
      limitation: p.extractedSections![2].content,
    }));

    const csvText = await buildMatrixCsvBlob(rows, 'CKD Matrix').text();
    expect(csvText).toContain('Study 1:');
    expect(csvText).toContain('Study 25:');

    const docText = await buildMatrixDocBlob(rows, 'CKD <Matrix> & Study').text();
    expect(docText).toContain('CKD &lt;Matrix&gt; &amp; Study');
    expect(docText).toContain('Study 25:');
  });
});
