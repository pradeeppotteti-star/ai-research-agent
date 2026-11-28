import fs from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export interface LocalUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  institution: string;
  preferences: {
    researchInterests: string[];
    preferredDomains: string[];
    preferredYearRange: { start: number; end: number };
    defaultPaperCount: number;
    preferredSources: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

export interface LocalSavedPaper {
  id: string;
  userId: string;
  paperId: string;
  paper: any;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface LocalSession {
  id: string;
  _id: string;
  userId: string;
  query: string;
  domain?: string;
  keywords?: string[];
  targetPaperCount: number;
  yearRange?: { start: number; end: number };
  preferredSources?: string[];
  status: 'active' | 'completed' | 'failed';
  currentStage: string;
  stageProgressPercent: number;
  selectedPapers?: any[];
  progressLogs?: any[];
  comparisonMatrix?: any[];
  researchGaps?: any[];
  report?: any;
  createdAt: string;
  updatedAt?: string;
}

class LocalDbService {
  private dataDir: string;
  private usersFile: string;
  private sessionsFile: string;
  private savedPapersFile: string;

  private users: Map<string, LocalUser> = new Map();
  private sessions: Map<string, LocalSession> = new Map();
  private savedPapers: Map<string, LocalSavedPaper> = new Map();
  private initialized = false;

  constructor() {
    this.dataDir = this.resolveDataDir();
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.sessionsFile = path.join(this.dataDir, 'sessions.json');
    this.savedPapersFile = path.join(this.dataDir, 'saved_papers.json');
    this.init();
  }

  private resolveDataDir(): string {
    const isServerless = !!(
      process.env.NETLIFY ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.VERCEL
    );

    // In serverless cloud environments (AWS Lambda / Netlify), os.tmpdir() is the ONLY writable directory
    if (isServerless) {
      try {
        const tmpTarget = path.join(os.tmpdir(), 'paperinsight_data');
        if (!fs.existsSync(tmpTarget)) {
          fs.mkdirSync(tmpTarget, { recursive: true });
        }
        return tmpTarget;
      } catch (err) {
        return os.tmpdir();
      }
    }

    // Local development candidates
    const baseData = path.basename(process.cwd()) === 'backend'
      ? path.resolve(process.cwd(), 'data')
      : path.resolve(process.cwd(), 'backend/data');

    const candidates = [
      baseData,
      path.resolve(process.cwd(), 'data'),
      path.resolve(__dirname, '../../../data'),
      path.resolve(__dirname, '../../data'),
      path.join(os.tmpdir(), 'paperinsight_data'),
    ];

    for (const c of candidates) {
      try {
        if (!fs.existsSync(c)) {
          fs.mkdirSync(c, { recursive: true });
        }
        // Test write permission safely
        const testFile = path.join(c, `.probe_${Date.now()}`);
        fs.writeFileSync(testFile, '1', 'utf-8');
        fs.unlinkSync(testFile);
        return c;
      } catch (err) {
        // try next candidate
      }
    }

    try {
      const fallback = path.join(os.tmpdir(), 'paperinsight_data');
      if (!fs.existsSync(fallback)) {
        fs.mkdirSync(fallback, { recursive: true });
      }
      return fallback;
    } catch (e) {
      return os.tmpdir();
    }
  }

  private init() {
    if (this.initialized) return;

    try {
      this.loadUsers();
      this.loadSessions();
      this.loadSavedPapers();
      this.initialized = true;
      console.log(`[LocalDatabase] Resilient database initialized at: ${this.dataDir}`);
      console.log(
        `[LocalDatabase] Active Users: ${this.users.size}, Active Sessions: ${this.sessions.size}, Saved Papers: ${this.savedPapers.size}`
      );
    } catch (err: any) {
      console.error('[LocalDatabase Initialization Warning]:', err.message);
    }
  }

  // ================= USERS =================
  private loadUsers() {
    // 1. Try reading from active writable dataDir
    if (fs.existsSync(this.usersFile)) {
      try {
        const raw = fs.readFileSync(this.usersFile, 'utf-8');
        const list: LocalUser[] = JSON.parse(raw);
        for (const u of list) {
          this.users.set(u.email.toLowerCase().trim(), u);
        }
        return;
      } catch (e) {
        console.warn('[LocalDatabase] users.json unreadable in dataDir, starting empty.');
      }
    }

    // 2. Try copying from bundled read-only seed files if available
    const baseDir = path.basename(process.cwd()) === 'backend'
      ? path.resolve(process.cwd(), 'data')
      : path.resolve(process.cwd(), 'backend/data');

    const seedCandidates = [
      path.resolve(baseDir, 'users.json'),
      path.resolve(process.cwd(), 'data/users.json'),
      path.resolve(__dirname, '../../../data/users.json'),
      path.resolve(__dirname, '../../data/users.json'),
    ];

    for (const sc of seedCandidates) {
      try {
        if (fs.existsSync(sc)) {
          const raw = fs.readFileSync(sc, 'utf-8');
          const list: LocalUser[] = JSON.parse(raw);
          for (const u of list) {
            this.users.set(u.email.toLowerCase().trim(), u);
          }
          break;
        }
      } catch (e) {
        // continue
      }
    }

    this.saveUsersToDisk();
  }

  private saveUsersToDisk() {
    try {
      const list = Array.from(this.users.values());
      fs.writeFileSync(this.usersFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err: any) {
      console.warn('[LocalDatabase Warning] Cannot write users to disk, keeping in-memory store:', err.message);
    }
  }

  public getUserByEmail(email: string): LocalUser | null {
    if (!email) return null;
    return this.users.get(email.toLowerCase().trim()) || null;
  }

  public getUserById(id: string): LocalUser | null {
    if (!id) return null;
    for (const u of this.users.values()) {
      if (u.id === id || u._id === id) return u;
    }
    return null;
  }

  public restoreUserFromToken(data: {
    id: string;
    email: string;
    name: string;
    role?: string;
    institution?: string;
  }): LocalUser {
    const cleanEmail = data.email.toLowerCase().trim();
    const existing = this.getUserByEmail(cleanEmail);
    if (existing) return existing;

    const restoredUser: LocalUser = {
      id: data.id,
      _id: data.id,
      name: data.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash: '',
      role: data.role || 'Researcher',
      institution: data.institution || 'Academic Institution',
      preferences: {
        researchInterests: ['Autonomous AI Agents', 'LLM Factuality'],
        preferredDomains: ['Computer Science', 'Artificial Intelligence'],
        preferredYearRange: { start: 2020, end: 2026 },
        defaultPaperCount: 5,
        preferredSources: ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref', 'Google Scholar', 'IEEE Xplore'],
      },
      createdAt: new Date().toISOString(),
    };

    this.users.set(cleanEmail, restoredUser);
    this.saveUsersToDisk();
    return restoredUser;
  }

  public async updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.getUserByEmail(cleanEmail);
    if (!user) return false;
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    this.saveUsersToDisk();
    return true;
  }

  public async createUser(data: {
    id?: string;
    name: string;
    email: string;
    password: string;
    institution?: string;
    role?: string;
    researchInterests?: string[];
  }): Promise<LocalUser> {
    const cleanEmail = data.email.toLowerCase().trim();
    if (this.users.has(cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const id = data.id || new mongoose.Types.ObjectId().toString();

    const newUser: LocalUser = {
      id,
      _id: id,
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash,
      role: data.role || 'Researcher',
      institution: data.institution || 'Academic Institution',
      preferences: {
        researchInterests: data.researchInterests || ['Autonomous AI Agents', 'LLM Factuality'],
        preferredDomains: ['Computer Science', 'Artificial Intelligence'],
        preferredYearRange: { start: 2020, end: 2026 },
        defaultPaperCount: 5,
        preferredSources: ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref', 'Google Scholar', 'IEEE Xplore'],
      },
      createdAt: new Date().toISOString(),
    };

    this.users.set(cleanEmail, newUser);
    this.saveUsersToDisk();
    return newUser;
  }

  public async updateUser(
    id: string,
    updates: { name?: string; institution?: string; preferences?: any }
  ): Promise<LocalUser | null> {
    const user = this.getUserById(id);
    if (!user) return null;

    if (updates.name) user.name = updates.name.trim();
    if (updates.institution) user.institution = updates.institution.trim();
    if (updates.preferences) {
      user.preferences = {
        ...user.preferences,
        ...updates.preferences,
      };
    }
    user.updatedAt = new Date().toISOString();

    this.users.set(user.email.toLowerCase().trim(), user);
    this.saveUsersToDisk();
    return user;
  }

  // ================= SESSIONS =================
  private loadSessions() {
    if (fs.existsSync(this.sessionsFile)) {
      try {
        const raw = fs.readFileSync(this.sessionsFile, 'utf-8');
        const list: LocalSession[] = JSON.parse(raw);
        for (const s of list) {
          const sid = s.id || s._id;
          this.sessions.set(sid, s);
        }
        return;
      } catch (e) {
        console.warn('[LocalDatabase] sessions.json unreadable in dataDir, starting empty.');
      }
    }

    const baseDir = path.basename(process.cwd()) === 'backend'
      ? path.resolve(process.cwd(), 'data')
      : path.resolve(process.cwd(), 'backend/data');

    const seedCandidates = [
      path.resolve(baseDir, 'sessions.json'),
      path.resolve(process.cwd(), 'data/sessions.json'),
      path.resolve(__dirname, '../../../data/sessions.json'),
      path.resolve(__dirname, '../../data/sessions.json'),
    ];

    for (const sc of seedCandidates) {
      try {
        if (fs.existsSync(sc)) {
          const raw = fs.readFileSync(sc, 'utf-8');
          const list: LocalSession[] = JSON.parse(raw);
          for (const s of list) {
            const sid = s.id || s._id;
            this.sessions.set(sid, s);
          }
          break;
        }
      } catch (e) {
        // continue
      }
    }

    this.saveSessionsToDisk();
  }

  private saveSessionsToDisk() {
    try {
      const list = Array.from(this.sessions.values());
      fs.writeFileSync(this.sessionsFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err: any) {
      console.warn('[LocalDatabase Warning] Cannot write sessions to disk, keeping in-memory store:', err.message);
    }
  }

  public getSessionsByUserId(userId: string): LocalSession[] {
    if (!userId) return [];
    const list: LocalSession[] = [];
    for (const s of this.sessions.values()) {
      if (s.userId === userId) {
        list.push(s);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getSessionById(sessionId: string): LocalSession | null {
    if (!sessionId) return null;
    return this.sessions.get(sessionId) || null;
  }

  public saveSession(session: LocalSession | any): void {
    const id = session.id || session._id || 'session_' + Math.random().toString(36).substring(2, 9);
    session.id = id;
    session._id = id;
    if (!session.createdAt) session.createdAt = new Date().toISOString();
    session.updatedAt = new Date().toISOString();

    this.sessions.set(id, session);
    this.saveSessionsToDisk();
  }

  public deleteSession(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      this.saveSessionsToDisk();
      return true;
    }
    return false;
  }

  // ================= SAVED PAPERS =================
  private loadSavedPapers() {
    if (fs.existsSync(this.savedPapersFile)) {
      try {
        const raw = fs.readFileSync(this.savedPapersFile, 'utf-8');
        const list: LocalSavedPaper[] = JSON.parse(raw);
        for (const sp of list) {
          this.savedPapers.set(sp.id, sp);
        }
        return;
      } catch (e) {
        console.warn('[LocalDatabase] saved_papers.json unreadable in dataDir, starting empty.');
      }
    }

    const baseDir = path.basename(process.cwd()) === 'backend'
      ? path.resolve(process.cwd(), 'data')
      : path.resolve(process.cwd(), 'backend/data');

    const seedCandidates = [
      path.resolve(baseDir, 'saved_papers.json'),
      path.resolve(process.cwd(), 'data/saved_papers.json'),
      path.resolve(__dirname, '../../../data/saved_papers.json'),
      path.resolve(__dirname, '../../data/saved_papers.json'),
    ];

    for (const sc of seedCandidates) {
      try {
        if (fs.existsSync(sc)) {
          const raw = fs.readFileSync(sc, 'utf-8');
          const list: LocalSavedPaper[] = JSON.parse(raw);
          for (const sp of list) {
            this.savedPapers.set(sp.id, sp);
          }
          break;
        }
      } catch (e) {
        // continue
      }
    }

    this.saveSavedPapersToDisk();
  }

  private saveSavedPapersToDisk() {
    try {
      const list = Array.from(this.savedPapers.values());
      fs.writeFileSync(this.savedPapersFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err: any) {
      console.warn('[LocalDatabase Warning] Cannot write saved papers to disk, keeping in-memory store:', err.message);
    }
  }

  public getSavedPapersByUserId(userId: string): LocalSavedPaper[] {
    if (!userId) return [];
    const list: LocalSavedPaper[] = [];
    for (const sp of this.savedPapers.values()) {
      if (sp.userId === userId) {
        list.push(sp);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public savePaperForUser(
    userId: string,
    paperId: string,
    paperData: any,
    notes?: string,
    tags?: string[]
  ): LocalSavedPaper {
    for (const sp of this.savedPapers.values()) {
      if (sp.userId === userId && sp.paperId === paperId) {
        sp.notes = notes || sp.notes;
        sp.tags = tags || sp.tags;
        this.saveSavedPapersToDisk();
        return sp;
      }
    }

    const id = 'sp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newSaved: LocalSavedPaper = {
      id,
      userId,
      paperId,
      paper: paperData,
      notes: notes || '',
      tags: tags || [],
      createdAt: new Date().toISOString(),
    };

    this.savedPapers.set(id, newSaved);
    this.saveSavedPapersToDisk();
    return newSaved;
  }

  public removeSavedPaper(userId: string, paperId: string): boolean {
    let foundId: string | null = null;
    for (const [id, sp] of this.savedPapers.entries()) {
      if (sp.userId === userId && (sp.paperId === paperId || sp.id === paperId)) {
        foundId = id;
        break;
      }
    }

    if (foundId) {
      this.savedPapers.delete(foundId);
      this.saveSavedPapersToDisk();
      return true;
    }
    return false;
  }

  public isPaperSaved(userId: string, paperId: string): boolean {
    for (const sp of this.savedPapers.values()) {
      if (sp.userId === userId && (sp.paperId === paperId || sp.id === paperId)) {
        return true;
      }
    }
    return false;
  }

  public clearAllData(): void {
    this.users.clear();
    this.sessions.clear();
    this.savedPapers.clear();
    this.saveUsersToDisk();
    this.saveSessionsToDisk();
    this.saveSavedPapersToDisk();
  }
}

export const localDb = new LocalDbService();
