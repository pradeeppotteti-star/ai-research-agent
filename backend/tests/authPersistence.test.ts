import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Isolate localDb to os.tmpdir() during tests so repo seed files stay untouched
vi.hoisted(() => {
  process.env.NETLIFY = 'true';
});

import app from '../src/server';
import { env } from '../src/config/env';
import { localDb } from '../src/services/storage/localDb.service';

describe('Auth, Profile, Saved Papers, and Research Flow', () => {
  beforeEach(() => {
    localDb.clearAllData();
  });

  it('supports signup, login, me, profile update, and verified password reset', async () => {
    const email = `researcher_${Date.now()}@example.edu`;

    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Ada Lovelace',
      email,
      password: 'initialPassword123',
      institution: 'Analytical Lab',
    });

    expect(signupRes.status).toBe(201);
    expect(signupRes.body.success).toBe(true);
    const token = signupRes.body.data.token;
    expect(token).toBeTruthy();

    // Duplicate signup must return 409
    const dupRes = await request(app).post('/api/auth/signup').send({
      name: 'Ada Duplicate',
      email,
      password: 'otherPassword123',
    });
    expect(dupRes.status).toBe(409);

    // Login succeeds with correct password
    const loginRes = await request(app).post('/api/auth/login').send({
      email,
      password: 'initialPassword123',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.email).toBe(email);

    // /me returns authenticated user
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.name).toBe('Ada Lovelace');

    // Profile update updates name & preferences
    const profileRes = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Ada King',
        institution: 'Oxford',
        preferences: { defaultPaperCount: 8 },
      });
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.name).toBe('Ada King');
    expect(profileRes.body.data.preferences.defaultPaperCount).toBe(8);

    // Unverified password reset without currentPassword is rejected
    const badResetRes = await request(app).post('/api/auth/reset-password').send({
      email,
      newPassword: 'hackedPassword123',
    });
    expect(badResetRes.status).toBe(400);

    // Password reset with wrong currentPassword is rejected
    const wrongResetRes = await request(app).post('/api/auth/reset-password').send({
      email,
      currentPassword: 'wrongPassword',
      newPassword: 'newPassword456',
    });
    expect(wrongResetRes.status).toBe(401);

    // Password reset with valid currentPassword succeeds
    const okResetRes = await request(app).post('/api/auth/reset-password').send({
      email,
      currentPassword: 'initialPassword123',
      newPassword: 'newPassword456',
    });
    expect(okResetRes.status).toBe(200);

    // Login with new password works
    const newLoginRes = await request(app).post('/api/auth/login').send({
      email,
      password: 'newPassword456',
    });
    expect(newLoginRes.status).toBe(200);
  });

  it('does not auto-create ghost passwordless users from JWT on /auth/me', async () => {
    const ghostToken = jwt.sign(
      { userId: 'ghost_123', email: 'ghost@example.edu', name: 'Ghost' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${ghostToken}`);

    expect(res.status).toBe(401);
    expect(localDb.getUserByEmail('ghost@example.edu')).toBeNull();
  });

  it('returns 404 for unknown research session IDs and saves/removes papers cleanly', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Grace Hopper',
      email: 'grace@example.edu',
      password: 'compilerPassword1',
    });
    const token = signupRes.body.data.token;

    const missingRes = await request(app)
      .get('/api/research/nonexistent_session_id')
      .set('Authorization', `Bearer ${token}`);
    expect(missingRes.status).toBe(404);

    const samplePaper = {
      id: 'paper_custom_1',
      title: 'Compilers and Verification',
      authors: ['Grace Hopper'],
      abstract: 'Foundational compiler design study.',
      publicationDate: '2024',
      source: 'arXiv',
      pdfAvailable: true,
      openAccess: true,
      keywords: ['Compilers'],
      urls: {},
      createdAt: new Date().toISOString(),
    };

    const saveRes = await request(app)
      .post('/api/papers/paper_custom_1/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ paper: samplePaper, tags: ['Compilers'] });
    expect(saveRes.status).toBe(201);

    const listRes = await request(app)
      .get('/api/papers/saved')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].paper.title).toBe('Compilers and Verification');

    const delRes = await request(app)
      .delete('/api/papers/paper_custom_1/save')
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);
  });
});
