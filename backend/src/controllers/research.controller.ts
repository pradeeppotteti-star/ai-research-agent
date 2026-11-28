import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ResearchSession } from '../models/ResearchSession';
import { Paper as PaperModel } from '../models/Paper';
import { Report } from '../models/Report';
import { SavedPaper } from '../models/SavedPaper';
import { Paper } from '@research-agent/shared';
import { isMongoConnected } from '../config/db';
import { comparisonService } from '../services/research/comparison.service';
import { rankingService } from '../services/research/ranking.service';
import { searchService } from '../services/research/search.service';
import { domainClassifierService } from '../services/research/domainClassifier.service';
import { gapDetectionService } from '../services/research/gapDetection.service';
import { reportService } from '../services/research/report.service';
import { evidenceService } from '../services/research/evidence.service';
import { verificationService } from '../services/research/verification.service';
import { consensusService } from '../services/research/consensus.service';
import { peerReviewService } from '../services/research/peerReview.service';
import { trendForecastService } from '../services/research/trendForecast.service';
import { pdfGeneratorService } from '../services/research/pdfGenerator.service';
import { localDb } from '../services/storage/localDb.service';

// In-Memory Sessions Repository for instant fallback
export const IN_MEMORY_SESSIONS = new Map<string, any>();

function buildSessionArtifacts(
  sessionId: string,
  query: string,
  papers: Paper[],
  preferredSources: string[],
  keywords: string[] = []
) {
  const researchGaps = gapDetectionService.detectResearchGaps(papers, query);
  const comparisonMatrix = comparisonService.generateComparisonMatrix(papers, query);
  const rawClaims = evidenceService.extractEvidenceFromPapers(papers, query);
  const verifiedClaims = verificationService.verifyAll(rawClaims);
  const consensus = consensusService.analyzeConsensus(papers, query);
  const peerReview = peerReviewService.evaluateSurvey(query, papers, verifiedClaims, researchGaps);
  const trendForecast = trendForecastService.forecastTrends(query, papers, keywords);
  const report = reportService.generateReport(
    sessionId,
    query,
    papers,
    verifiedClaims,
    researchGaps,
    comparisonMatrix,
    preferredSources,
    consensus
  );

  return {
    researchGaps,
    comparisonMatrix,
    verifiedClaims,
    consensus,
    peerReview,
    trendForecast,
    report,
  };
}

export const startResearch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const { query, targetPaperCount, yearRange, preferredSources } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Research topic query is required.',
        code: 'VALIDATION_ERROR',
      });
    }

    const cleanQuery = query.replace(/^\s*\d+[\.\-\)]\s*/, '').trim();
    const classification = domainClassifierService.classify(cleanQuery);
    const domain = req.body.domain || classification.domain;
    const keywords = req.body.keywords && req.body.keywords.length > 0 ? req.body.keywords : classification.keywords;
    const sources = preferredSources && preferredSources.length > 0
      ? preferredSources
      : ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'];

    const startYear = yearRange?.start ? parseInt(String(yearRange.start), 10) : 2020;
    const endYear = yearRange?.end ? parseInt(String(yearRange.end), 10) : 2026;
    const paperLimit = targetPaperCount || 10;

    const rawPapers = await searchService.searchMultiProvider(
      cleanQuery,
      classification.decomposedQuestions,
      sources,
      {
        limit: paperLimit,
        yearStart: startYear,
        yearEnd: endYear,
      }
    );

    const rankedPapers = rankingService.rankPapers(
      rawPapers,
      cleanQuery,
      paperLimit,
      { start: startYear, end: endYear }
    ) as Paper[];

    const progressLogs = [
      { timestamp: new Date().toISOString(), stage: 'planning', message: `Auto-classified domain: "${domain}". Formulating adaptive research plan...` },
      { timestamp: new Date().toISOString(), stage: 'searching', message: `Retrieved ${rankedPapers.length} papers matching "${cleanQuery}".` },
      { timestamp: new Date().toISOString(), stage: 'completed', message: 'Literature survey report generated.' },
    ];

    if (isMongoConnected()) {
      const session = await ResearchSession.create({
        userId,
        query: cleanQuery,
        domain,
        keywords,
        targetPaperCount: paperLimit,
        yearRange: { start: startYear, end: endYear },
        preferredSources: sources,
        status: 'completed',
        currentStage: 'completed',
        stageProgressPercent: 100,
        selectedPapers: rankedPapers,
        progressLogs,
      });

      const sessionId = session._id.toString();
      const artifacts = buildSessionArtifacts(sessionId, cleanQuery, rankedPapers, sources, keywords);

      const reportDoc = await Report.create({
        sessionId,
        userId,
        title: artifacts.report.title || `AI Smart Research Survey: ${cleanQuery}`,
        sections: artifacts.report.sections,
        claims: artifacts.report.claims || [],
      });

      session.comparisonMatrix = artifacts.comparisonMatrix as any;
      session.researchGaps = artifacts.researchGaps as any;
      session.reportId = reportDoc._id.toString();
      await session.save();

      const fullSession = {
        ...session.toObject(),
        id: sessionId,
        report: {
          ...artifacts.report,
          id: reportDoc._id.toString(),
          _id: reportDoc._id.toString(),
          createdAt: reportDoc.createdAt,
        },
      };
      IN_MEMORY_SESSIONS.set(sessionId, fullSession);

      return res.status(201).json({
        success: true,
        message: 'Research pipeline completed.',
        data: {
          sessionId,
          status: 'completed',
          currentStage: 'completed',
          domain,
          keywords,
        },
      });
    }

    const sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    const artifacts = buildSessionArtifacts(sessionId, cleanQuery, rankedPapers, sources, keywords);

    const localSession = {
      id: sessionId,
      _id: sessionId,
      userId,
      query: cleanQuery,
      domain,
      keywords,
      targetPaperCount: paperLimit,
      yearRange: { start: startYear, end: endYear },
      preferredSources: sources,
      status: 'completed' as const,
      currentStage: 'completed',
      stageProgressPercent: 100,
      selectedPapers: rankedPapers,
      comparisonMatrix: artifacts.comparisonMatrix,
      researchGaps: artifacts.researchGaps,
      report: artifacts.report,
      progressLogs,
      createdAt: new Date().toISOString(),
    };

    IN_MEMORY_SESSIONS.set(sessionId, localSession);
    localDb.saveSession(localSession);

    return res.status(201).json({
      success: true,
      message: 'Research pipeline completed.',
      data: {
        sessionId,
        status: 'completed',
        currentStage: 'completed',
        domain,
        keywords,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to start research session.',
    });
  }
};

export const getResearchStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const session = await ResearchSession.findById(id);
      if (session) {
        return res.json({
          success: true,
          data: {
            id: session._id.toString(),
            query: session.query,
            status: session.status,
            currentStage: session.currentStage,
            stageProgressPercent: session.stageProgressPercent,
            progressLogs: session.progressLogs,
            reportId: session.reportId,
          },
        });
      }
      return res.status(404).json({ success: false, message: 'Research session not found.' });
    }

    const session = localDb.getSessionById(id) || IN_MEMORY_SESSIONS.get(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Research session not found.' });
    }

    return res.json({
      success: true,
      data: session,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getResearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (isMongoConnected()) {
      const sessions = await ResearchSession.find({ userId })
        .sort({ createdAt: -1 })
        .populate('selectedPaperIds');

      return res.json({
        success: true,
        data: sessions.map((s: any) => ({
          ...s.toObject(),
          id: s._id.toString(),
        })),
      });
    }

    const userSessions = localDb.getSessionsByUserId(userId);
    return res.json({
      success: true,
      data: userSessions,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getResearchDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let dbSession = await ResearchSession.findById(id).populate('selectedPaperIds');
      let reportDoc: any = null;

      // Support lookup by reportId as well (e.g., when navigating to /reports/:reportId)
      if (!dbSession) {
        reportDoc = await Report.findById(id);
        if (reportDoc?.sessionId) {
          dbSession = await ResearchSession.findById(reportDoc.sessionId).populate('selectedPaperIds');
        }
      }

      if (!dbSession) {
        return res.status(404).json({ success: false, message: 'Research session not found.' });
      }

      if (!reportDoc && dbSession.reportId) {
        reportDoc = await Report.findById(dbSession.reportId);
      }

      const sessionPapers: Paper[] =
        dbSession.selectedPapers && dbSession.selectedPapers.length > 0
          ? (dbSession.selectedPapers as Paper[])
          : ((dbSession.selectedPaperIds as any[]) || []).map((p: any) =>
              typeof p?.toObject === 'function' ? { ...p.toObject(), id: p._id.toString() } : p
            );

      const sessionIdStr = dbSession._id.toString();
      const artifacts = buildSessionArtifacts(
        sessionIdStr,
        dbSession.query,
        sessionPapers,
        dbSession.preferredSources || ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'],
        dbSession.keywords || []
      );

      const formattedReport = reportDoc
        ? {
            ...reportDoc.toObject(),
            id: reportDoc._id.toString(),
          }
        : artifacts.report;

      return res.json({
        success: true,
        data: {
          session: { ...dbSession.toObject(), id: sessionIdStr },
          papers: sessionPapers,
          comparisonMatrix: dbSession.comparisonMatrix?.length ? dbSession.comparisonMatrix : artifacts.comparisonMatrix,
          researchGaps: dbSession.researchGaps?.length ? dbSession.researchGaps : artifacts.researchGaps,
          report: formattedReport,
          consensus: artifacts.consensus,
          peerReview: artifacts.peerReview,
          trendForecast: artifacts.trendForecast,
        },
      });
    }

    const sessionObj = localDb.getSessionById(id) || IN_MEMORY_SESSIONS.get(id);
    if (!sessionObj) {
      return res.status(404).json({ success: false, message: 'Research session not found.' });
    }

    let finalPapers: Paper[] =
      sessionObj.selectedPapers && sessionObj.selectedPapers.length > 0 ? sessionObj.selectedPapers : [];
    const targetQuery = sessionObj.query;
    const sources = sessionObj.preferredSources || ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'];

    if (finalPapers.length === 0) {
      const classification = domainClassifierService.classify(targetQuery);
      const fetchedPapers = await searchService.searchMultiProvider(
        targetQuery,
        classification.decomposedQuestions,
        sources,
        { limit: sessionObj.targetPaperCount || 10 }
      );
      finalPapers = rankingService.rankPapers(
        fetchedPapers,
        targetQuery,
        sessionObj.targetPaperCount || 10
      ) as Paper[];
      sessionObj.selectedPapers = finalPapers;
    }

    const artifacts = buildSessionArtifacts(id, targetQuery, finalPapers, sources, sessionObj.keywords || []);
    if (!sessionObj.researchGaps) sessionObj.researchGaps = artifacts.researchGaps;
    if (!sessionObj.comparisonMatrix) sessionObj.comparisonMatrix = artifacts.comparisonMatrix;
    if (!sessionObj.report) sessionObj.report = artifacts.report;

    IN_MEMORY_SESSIONS.set(id, sessionObj);
    localDb.saveSession(sessionObj);

    return res.json({
      success: true,
      data: {
        session: sessionObj,
        papers: finalPapers,
        comparisonMatrix: sessionObj.comparisonMatrix,
        researchGaps: sessionObj.researchGaps,
        report: sessionObj.report,
        consensus: artifacts.consensus,
        peerReview: artifacts.peerReview,
        trendForecast: artifacts.trendForecast,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const comparePapers = async (req: AuthRequest, res: Response) => {
  try {
    const { paperIds, query, sessionId, papers: bodyPapers } = req.body;

    if ((!paperIds || !Array.isArray(paperIds) || paperIds.length === 0) && (!Array.isArray(bodyPapers) || bodyPapers.length === 0)) {
      return res.status(400).json({ success: false, message: 'Array of paperIds or papers required for comparison.' });
    }

    const targetQuery = query || 'Academic Literature Comparison';

    // 1. Direct papers passed from the client UI (fastest and 100% consistent on serverless)
    if (Array.isArray(bodyPapers) && bodyPapers.length > 0) {
      const selectedSet = Array.isArray(paperIds) && paperIds.length > 0 ? new Set(paperIds) : null;
      const filtered = selectedSet
        ? bodyPapers.filter((p: any) => selectedSet.has(p.id || p._id))
        : bodyPapers;
      const sourcePapers = (filtered.length > 0 ? filtered : bodyPapers) as Paper[];
      const comparison = comparisonService.generateComparisonMatrix(sourcePapers, targetQuery);
      return res.json({ success: true, data: comparison });
    }

    // 2. Check cached session in localDb / in-memory store
    const idSet = new Set(paperIds || []);
    const cachedSession = sessionId ? (localDb.getSessionById(sessionId) || IN_MEMORY_SESSIONS.get(sessionId)) : null;
    if (cachedSession?.selectedPapers && cachedSession.selectedPapers.length > 0) {
      const matched = cachedSession.selectedPapers.filter((p: any) => idSet.has(p.id || p._id));
      const sourcePapers = (matched.length > 0 ? matched : cachedSession.selectedPapers) as Paper[];
      const comparison = comparisonService.generateComparisonMatrix(sourcePapers, cachedSession.query || targetQuery);
      return res.json({ success: true, data: comparison });
    }

    // 3. MongoDB lookup when connected
    if (isMongoConnected()) {
      try {
        const papers = await PaperModel.find({ _id: { $in: paperIds } });
        if (papers.length > 0) {
          const plainPapers = papers.map((p) => ({ ...p.toObject(), id: p._id.toString() })) as unknown as Paper[];
          const comparison = comparisonService.generateComparisonMatrix(plainPapers, targetQuery);
          return res.json({ success: true, data: comparison });
        }
      } catch {
        console.warn('[DB Error comparePapers] Fallback matrix.');
      }
    }

    // 4. Fallback multi-provider lookup
    const fallbackQuery = query || 'Academic Literature Research';
    const classification = domainClassifierService.classify(fallbackQuery);
    const fetched = await searchService.searchMultiProvider(
      fallbackQuery,
      classification.decomposedQuestions,
      ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'],
      { limit: Math.max(paperIds?.length || 5, 5) }
    );
    const fallbackPapers = rankingService.rankPapers(fetched, fallbackQuery, paperIds?.length || 5) as Paper[];

    const comparison = comparisonService.generateComparisonMatrix(fallbackPapers, fallbackQuery);
    return res.json({ success: true, data: comparison });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getResearchStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (isMongoConnected()) {
      const [totalSessions, completedSessions, totalSavedPapers, reports, sessions] = await Promise.all([
        ResearchSession.countDocuments({ userId }),
        ResearchSession.countDocuments({ userId, status: 'completed' }),
        SavedPaper.countDocuments({ userId }),
        Report.find({ userId }),
        ResearchSession.find({ userId }).select('domain'),
      ]);

      let totalVerifiedClaims = 0;
      reports.forEach((r) => {
        totalVerifiedClaims += (r.claims || []).length;
      });

      const domains = Array.from(new Set(sessions.map((s) => s.domain).filter(Boolean))) as string[];

      return res.json({
        success: true,
        data: {
          totalSessions,
          completedSessions,
          totalSavedPapers,
          totalVerifiedClaims,
          favoriteDomains: domains.length > 0 ? domains : ['Computer Science', 'Artificial Intelligence'],
        },
      });
    }

    const userSessions = localDb.getSessionsByUserId(userId || '');
    const userSaved = localDb.getSavedPapersByUserId(userId || '');

    let verifiedClaimsCount = 0;
    userSessions.forEach((s: any) => {
      if (s.report?.claims) verifiedClaimsCount += s.report.claims.length;
      else if (s.selectedPapers) verifiedClaimsCount += Math.min(s.selectedPapers.length, 3);
    });

    const domains = Array.from(new Set(userSessions.map((s: any) => s.domain).filter(Boolean)));

    return res.json({
      success: true,
      data: {
        totalSessions: userSessions.length,
        completedSessions: userSessions.filter((s: any) => s.status === 'completed').length,
        totalSavedPapers: userSaved.length,
        totalVerifiedClaims: verifiedClaimsCount,
        favoriteDomains: domains.length > 0 ? domains : ['Computer Science', 'Artificial Intelligence'],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const exportResearchZip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const rawQuery = (req.body?.query as string) || (req.query.query as string);
    const queryParam = rawQuery ? rawQuery.replace(/^\s*\d+[\.\-\)]\s*/, '').trim() : undefined;
    const bodyPapers = Array.isArray(req.body?.papers) ? (req.body.papers as Paper[]) : [];

    let sessionObj = localDb.getSessionById(id) || IN_MEMORY_SESSIONS.get(id);

    if (!sessionObj && isMongoConnected()) {
      try {
        const dbSession = await ResearchSession.findById(id).populate('selectedPaperIds');
        if (dbSession) {
          sessionObj = {
            id: dbSession._id.toString(),
            query: dbSession.query,
            targetPaperCount: dbSession.targetPaperCount,
            yearRange: dbSession.yearRange,
            preferredSources: dbSession.preferredSources,
            selectedPapers: dbSession.selectedPaperIds,
          };
        }
      } catch {
        // Fallback
      }
    }

    if (!sessionObj) {
      sessionObj = {
        id,
        query: queryParam || 'Academic Literature Research',
        selectedPapers: bodyPapers.length > 0 ? bodyPapers : [],
      };
      IN_MEMORY_SESSIONS.set(id, sessionObj);
      localDb.saveSession(sessionObj);
    } else {
      if (queryParam && (!sessionObj.query || sessionObj.query === 'Academic Literature Research')) {
        sessionObj.query = queryParam;
      }
      if (bodyPapers.length > 0) {
        sessionObj.selectedPapers = bodyPapers;
      }
    }

    let papers: Paper[] =
      bodyPapers.length > 0
        ? bodyPapers
        : sessionObj.selectedPapers && sessionObj.selectedPapers.length > 0
        ? sessionObj.selectedPapers
        : [];

    if (papers.length === 0) {
      const targetQuery = sessionObj.query || 'Academic Research';
      const targetLimit = sessionObj.targetPaperCount || 25;
      const classification = domainClassifierService.classify(targetQuery);
      const fetched = await searchService.searchMultiProvider(
        targetQuery,
        classification.decomposedQuestions,
        sessionObj.preferredSources || ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'],
        {
          limit: targetLimit,
          yearStart: sessionObj.yearRange?.start,
          yearEnd: sessionObj.yearRange?.end,
        }
      );
      papers = rankingService.rankPapers(fetched, targetQuery, targetLimit) as Paper[];
      sessionObj.selectedPapers = papers;
    }

    if (!papers || papers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No research papers found to include in the ZIP archive.',
      });
    }

    const isServerless = Boolean(
      process.env.NETLIFY ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.LAMBDA_TASK_ROOT ||
        process.env.VERCEL
    );
    const includeExternalPdfs =
      !isServerless &&
      req.query.mode !== 'fast' &&
      req.body?.includeExternalPdfs !== false;

    const targetQuery = sessionObj.query || queryParam || 'Research_Papers';
    const zipBuffer = await pdfGeneratorService.generateBatchZipBuffer(papers, targetQuery, {
      includeExternalPdfs,
    });

    const cleanSlug = targetQuery
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .trim()
      .slice(0, 35)
      .replace(/\s+/g, '_') || 'Research_Papers';
    const zipFilename = `Research_Papers_${cleanSlug}_${papers.length}_Papers.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Content-Length', zipBuffer.length);
    res.setHeader('X-Paper-Count', String(papers.length));
    res.setHeader('X-Archive-Mode', includeExternalPdfs ? 'hybrid' : 'synthesized');
    return res.status(200).send(zipBuffer);
  } catch (err: any) {
    console.error('Error generating research ZIP:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate ZIP archive.',
    });
  }
};
