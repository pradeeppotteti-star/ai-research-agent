import { describe, it, expect, afterEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import JSZip from 'jszip';
import { isZipHeader } from '@research-agent/shared';

// Isolate localDb to os.tmpdir() during tests so tracked backend/data/*.json files stay clean
vi.hoisted(() => {
  process.env.NETLIFY = 'true';
});

import app from '../src/server';
import { env } from '../src/config/env';
import { IN_MEMORY_SESSIONS } from '../src/controllers/research.controller';
import { handler as netlifyHandler } from '../../netlify/functions/api';

function buildAuthToken() {
  return jwt.sign(
    {
      userId: 'usr_test_export',
      email: 'test@paperinsight.edu',
      name: 'Test Researcher',
      role: 'Scholar',
    },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function build25Papers() {
  return Array.from({ length: 25 }, (_, i) => ({
    id: `p_${i + 1}`,
    title: `Research Study ${i + 1}: Federated Hybrid ML-DL for Clinical Decision Support`,
    authors: ['Dr. Elena Vance', 'Prof. Marcus Thorne'],
    abstract: `Abstract for paper ${i + 1} evaluating safe reinforcement learning and federated modeling.`,
    publicationDate: '2026',
    venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    doi: `10.1109/TPAMI.2026.${2000 + i}`,
    urls: { primary: `https://example.org/${i + 1}` },
    source: 'IEEE Xplore' as const,
    citationCount: 40 + i,
    pdfAvailable: true,
    openAccess: true,
    keywords: ['Federated Learning', 'Safe RL'],
    createdAt: new Date().toISOString(),
  }));
}

describe('Research 25-PDF ZIP Export Endpoints & Netlify Serverless Handler', () => {
  const originalNetlify = process.env.NETLIFY;

  afterEach(() => {
    if (originalNetlify === undefined) {
      delete process.env.NETLIFY;
    } else {
      process.env.NETLIFY = originalNetlify;
    }
  });

  it('POST /api/research/:id/export-zip returns a valid 25-PDF ZIP archive', async () => {
    const token = buildAuthToken();
    const papers = build25Papers();

    const res = await request(app)
      .post('/api/research/session_c5r8u3y/export-zip')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'Federated Hybrid ML-DL Framework for CKD',
        papers,
        includeExternalPdfs: false,
      })
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/zip');
    expect(res.headers['x-paper-count']).toBe('25');

    const bodyBuf = res.body as Buffer;
    expect(isZipHeader(new Uint8Array(bodyBuf))).toBe(true);

    const zip = await JSZip.loadAsync(bodyBuf);
    const pdfs = Object.keys(zip.files).filter((f) => f.endsWith('.pdf'));
    expect(pdfs).toHaveLength(25);
  });

  it('GET /api/research/:id/export-zip uses cached session papers and returns a valid ZIP', async () => {
    const token = buildAuthToken();
    const papers = build25Papers();
    IN_MEMORY_SESSIONS.set('session_cached_25', {
      id: 'session_cached_25',
      query: 'Cached Clinical Decision Support',
      selectedPapers: papers,
    });

    const res = await request(app)
      .get('/api/research/session_cached_25/export-zip?mode=fast')
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    const bodyBuf = res.body as Buffer;
    expect(isZipHeader(new Uint8Array(bodyBuf))).toBe(true);
    const zip = await JSZip.loadAsync(bodyBuf);
    const pdfs = Object.keys(zip.files).filter((f) => f.endsWith('.pdf'));
    expect(pdfs).toHaveLength(25);
  });

  it('Netlify serverless handler base64-encodes the ZIP binary cleanly', async () => {
    process.env.NETLIFY = 'true';
    const token = buildAuthToken();
    const papers = build25Papers();

    const event: any = {
      httpMethod: 'POST',
      path: '/.netlify/functions/api/research/session_c5r8u3y/export-zip',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      queryStringParameters: {},
      body: JSON.stringify({
        query: 'Federated Hybrid ML-DL Framework',
        papers,
      }),
      isBase64Encoded: false,
    };

    const result: any = await netlifyHandler(event, {} as any);
    expect(result.statusCode).toBe(200);
    expect(result.isBase64Encoded).toBe(true);

    const decoded = Buffer.from(result.body, 'base64');
    expect(isZipHeader(new Uint8Array(decoded))).toBe(true);

    const zip = await JSZip.loadAsync(decoded);
    const pdfs = Object.keys(zip.files).filter((f) => f.endsWith('.pdf'));
    expect(pdfs).toHaveLength(25);
  });
});
