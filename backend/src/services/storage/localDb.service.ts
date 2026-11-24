import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { generate100PlusPapers } from '../../utils/paperGenerator';

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
    const candidates = [
      path.resolve(__dirname, '../../../data'),
      path.resolve(process.cwd(), 'backend/data'),
      path.resolve(process.cwd(), 'data'),
    ];

    for (const c of candidates) {
      try {
        if (!fs.existsSync(c)) {
          fs.mkdirSync(c, { recursive: true });
        }
        return c;
      } catch (err) {
        // try next
      }
    }
    const fallback = path.resolve(__dirname, '../../../data');
    if (!fs.existsSync(fallback)) {
      fs.mkdirSync(fallback, { recursive: true });
    }
    return fallback;
  }

  private init() {
    if (this.initialized) return;

    try {
      this.loadUsers();
      this.loadSessions();
      this.loadSavedPapers();
      this.initialized = true;
      console.log(`[LocalDatabase] Persistent database loaded successfully from: ${this.dataDir}`);
      console.log(`[LocalDatabase] Users: ${this.users.size}, Sessions: ${this.sessions.size}, Saved Papers: ${this.savedPapers.size}`);
    } catch (err: any) {
      console.error('[LocalDatabase Initialization Error]:', err.message);
    }
  }

  // ================= USERS =================
  private loadUsers() {
    if (fs.existsSync(this.usersFile)) {
      try {
        const raw = fs.readFileSync(this.usersFile, 'utf-8');
        const list: LocalUser[] = JSON.parse(raw);
        for (const u of list) {
          this.users.set(u.email.toLowerCase().trim(), u);
        }
      } catch (e) {
        console.warn('[LocalDatabase] users.json corrupt or unreadable, re-seeding defaults.');
      }
    }

    // Seed defaults if empty or file doesn't exist on disk
    if (this.users.size === 0 || !fs.existsSync(this.usersFile)) {
      this.seedDefaultUsers();
    }
  }

  private seedDefaultUsers() {
    const adminHash = bcrypt.hashSync('adminPassword123', 10);
    const testerHash = bcrypt.hashSync('testerPassword123', 10);
    const scholarHash = bcrypt.hashSync('studentPassword123', 10);

    const defaultUsers: LocalUser[] = [
      {
        id: '507f1f77bcf86cd799439011',
        _id: '507f1f77bcf86cd799439011',
        name: 'Shaik Fazullah',
        email: 'admin@research-agent.org',
        passwordHash: adminHash,
        role: 'Lead Researcher (Admin)',
        institution: 'Institute for Autonomous AI Research',
        preferences: {
          researchInterests: ['Autonomous Research Agents', 'Multi-Agent Frameworks', 'Citation Verification'],
          preferredDomains: ['Computer Science', 'Artificial Intelligence'],
          preferredYearRange: { start: 2020, end: 2026 },
          defaultPaperCount: 5,
          preferredSources: ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref', 'Google Scholar', 'IEEE Xplore'],
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: '507f1f77bcf86cd799439012',
        _id: '507f1f77bcf86cd799439012',
        name: 'Potteti Pradeep',
        email: 'tester@academic.org',
        passwordHash: testerHash,
        role: 'Peer Reviewer (Tester)',
        institution: 'Academic AI Research Lab',
        preferences: {
          researchInterests: ['LLM Factuality Benchmarks', 'Multimodal PDF Parsing', 'Gap Detection'],
          preferredDomains: ['Computer Science', 'Artificial Intelligence'],
          preferredYearRange: { start: 2020, end: 2026 },
          defaultPaperCount: 5,
          preferredSources: ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'],
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: '507f1f77bcf86cd799439013',
        _id: '507f1f77bcf86cd799439013',
        name: 'Puli Prabhas',
        email: 'student@university.edu',
        passwordHash: scholarHash,
        role: 'Research Scholar',
        institution: 'Data Science Research Lab',
        preferences: {
          researchInterests: ['Literature Surveys', 'arXiv Mining', 'Crossref DOI Indexing'],
          preferredDomains: ['Computer Science', 'Artificial Intelligence'],
          preferredYearRange: { start: 2020, end: 2026 },
          defaultPaperCount: 5,
          preferredSources: ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'],
        },
        createdAt: new Date().toISOString(),
      },
    ];

    for (const u of defaultUsers) {
      this.users.set(u.email.toLowerCase(), u);
    }
    this.saveUsersToDisk();
  }

  private saveUsersToDisk() {
    try {
      const list = Array.from(this.users.values());
      fs.writeFileSync(this.usersFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[LocalDatabase Error saving users]:', err.message);
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

  public async createUser(data: {
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
    const id = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

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
      } catch (e) {
        console.warn('[LocalDatabase] sessions.json corrupt or unreadable, re-seeding defaults.');
      }
    }

    if (this.sessions.size === 0 || !fs.existsSync(this.sessionsFile)) {
      this.seedDefaultSessions();
    }
  }

  private seedDefaultSessions() {
    const adminId = '507f1f77bcf86cd799439011';
    const corpus = generate100PlusPapers();

    const s1Id = 'session_career_01';
    const s2Id = 'session_agents_02';
    const s3Id = 'session_kidney_03';

    const defaultSessions: LocalSession[] = [
      {
        id: s1Id,
        _id: s1Id,
        userId: adminId,
        query: 'Design and implementation of an intelligent career guidance system using machine learning',
        domain: 'Interdisciplinary General Science & Educational Technology',
        keywords: ['Machine Learning', 'Career Guidance', 'Intelligent Tutoring', 'Decision Support'],
        targetPaperCount: 10,
        yearRange: { start: 2020, end: 2026 },
        preferredSources: ['arXiv', 'Semantic Scholar'],
        status: 'completed',
        currentStage: 'completed',
        stageProgressPercent: 100,
        selectedPapers: corpus.slice(0, 10),
        progressLogs: [
          { timestamp: '2026-11-24T12:00:00.000Z', stage: 'planning', message: 'Formulated grounded career guidance search strategy.' },
          { timestamp: '2026-11-24T12:01:00.000Z', stage: 'searching', message: 'Retrieved 10 papers across arXiv and Semantic Scholar.' },
          { timestamp: '2026-11-24T12:02:00.000Z', stage: 'completed', message: 'Literature survey report successfully generated.' },
        ],
        createdAt: '2026-11-24T12:00:00.000Z',
      },
      {
        id: s2Id,
        _id: s2Id,
        userId: adminId,
        query: 'What are the latest approaches for autonomous AI research agents and citation verification?',
        domain: 'Artificial Intelligence & Agentic Workflows',
        keywords: ['Autonomous Agents', 'Citation Verification', 'LLM Factuality', 'Multi-Agent Frameworks'],
        targetPaperCount: 25,
        yearRange: { start: 2020, end: 2026 },
        preferredSources: ['Google Scholar', 'IEEE Xplore'],
        status: 'completed',
        currentStage: 'completed',
        stageProgressPercent: 100,
        selectedPapers: corpus.slice(0, 25),
        progressLogs: [
          { timestamp: '2026-11-24T13:30:00.000Z', stage: 'planning', message: 'Initiated multi-agent query decomposition.' },
          { timestamp: '2026-11-24T13:31:00.000Z', stage: 'searching', message: 'Harvested 25 publication-grade papers.' },
          { timestamp: '2026-11-24T13:32:00.000Z', stage: 'completed', message: 'Survey completed and citation graph synthesized.' },
        ],
        createdAt: '2026-11-24T13:30:00.000Z',
      },
      {
        id: s3Id,
        _id: s3Id,
        userId: adminId,
        query: 'A Fair and Privacy-Preserving Federated Hybrid ML–DL Framework with Safe Deep Reinforcement Learning for Personalized Chronic Kidney Disease Progression Prediction and Clinical Decision Support',
        domain: 'Clinical Decision Support & Biomedical Health Information',
        keywords: ['Federated Learning', 'Differential Privacy', 'Safe Reinforcement Learning', 'Chronic Kidney Disease'],
        targetPaperCount: 25,
        yearRange: { start: 2020, end: 2026 },
        preferredSources: ['Google Scholar', 'IEEE Xplore', 'Crossref'],
        status: 'completed',
        currentStage: 'completed',
        stageProgressPercent: 100,
        selectedPapers: corpus.slice(0, 25),
        progressLogs: [
          { timestamp: '2026-11-24T15:00:00.000Z', stage: 'planning', message: 'Configured federated clinical decision research plan.' },
          { timestamp: '2026-11-24T15:01:00.000Z', stage: 'searching', message: 'Retrieved 25 peer-reviewed federated medical AI papers.' },
          { timestamp: '2026-11-24T15:02:00.000Z', stage: 'completed', message: 'Completed 11-section survey report and benchmark matrix.' },
        ],
        createdAt: '2026-11-24T15:00:00.000Z',
      },
    ];

    for (const s of defaultSessions) {
      this.sessions.set(s.id, s);
    }
    this.saveSessionsToDisk();
  }

  private saveSessionsToDisk() {
    try {
      const list = Array.from(this.sessions.values());
      fs.writeFileSync(this.sessionsFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[LocalDatabase Error saving sessions]:', err.message);
    }
  }

  public getSessionsByUserId(userId: string): LocalSession[] {
    const isAdmin = userId === '507f1f77bcf86cd799439011';
    const list: LocalSession[] = [];
    for (const s of this.sessions.values()) {
      if (isAdmin) {
        if (s.userId === userId || s.userId === 'mem_user' || !s.userId) {
          list.push(s);
        }
      } else {
        if (s.userId === userId) {
          list.push(s);
        }
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
      } catch (e) {
        console.warn('[LocalDatabase] saved_papers.json corrupt or unreadable, re-seeding defaults.');
      }
    }

    if (this.savedPapers.size === 0 || !fs.existsSync(this.savedPapersFile)) {
      this.seedDefaultSavedPapers();
    }
  }

  private seedDefaultSavedPapers() {
    const adminId = '507f1f77bcf86cd799439011';
    const corpus = generate100PlusPapers();

    const defaultPapers: LocalSavedPaper[] = [
      {
        id: 'sp_admin_1',
        userId: adminId,
        paperId: corpus[0].id,
        paper: corpus[0],
        notes: 'Primary reference on career guidance and automated decision support systems.',
        tags: ['Career Guidance', 'Recommendation System', 'Machine Learning'],
        createdAt: '2026-11-24T12:05:00.000Z',
      },
      {
        id: 'sp_admin_2',
        userId: adminId,
        paperId: corpus[1].id,
        paper: corpus[1],
        notes: 'Foundational benchmark paper on Reasoning and Acting in LLMs.',
        tags: ['ReAct', 'Tool Use', 'Autonomous AI'],
        createdAt: '2026-11-24T13:35:00.000Z',
      },
    ];

    for (const sp of defaultPapers) {
      this.savedPapers.set(sp.id, sp);
    }
    this.saveSavedPapersToDisk();
  }

  private saveSavedPapersToDisk() {
    try {
      const list = Array.from(this.savedPapers.values());
      fs.writeFileSync(this.savedPapersFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[LocalDatabase Error saving saved papers]:', err.message);
    }
  }

  public getSavedPapersByUserId(userId: string): LocalSavedPaper[] {
    const isAdmin = userId === '507f1f77bcf86cd799439011';
    const list: LocalSavedPaper[] = [];
    for (const sp of this.savedPapers.values()) {
      if (isAdmin) {
        if (sp.userId === userId || sp.userId === 'mem_user' || !sp.userId) {
          list.push(sp);
        }
      } else {
        if (sp.userId === userId) {
          list.push(sp);
        }
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
    // Check if already saved by this user
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
}

export const localDb = new LocalDbService();
