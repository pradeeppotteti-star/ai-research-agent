import { ResearchSession, IResearchSessionDocument } from '../../models/ResearchSession';
import { Paper as PaperModel, IPaperDocument } from '../../models/Paper';
import { Report } from '../../models/Report';
import { Paper } from '@research-agent/shared';
import { plannerService } from './planner.service';
import { searchService } from './search.service';
import { deduplicationService } from './deduplication.service';
import { rankingService } from './ranking.service';
import { extractionService } from './extraction.service';
import { evidenceService } from './evidence.service';
import { verificationService } from './verification.service';
import { comparisonService } from './comparison.service';
import { gapDetectionService } from './gapDetection.service';
import { reportService } from './report.service';

export class OrchestratorService {
  async executeResearchPipeline(sessionId: string): Promise<void> {
    try {
      const session = await ResearchSession.findById(sessionId);
      if (!session) throw new Error(`Research session ${sessionId} not found.`);

      // Stage 1: Planning & Question Decomposition
      await this.updateStage(session, 'planning', 10, 'Formulating adaptive research plan and decomposing query...');
      const plan = await plannerService.createPlan(session.query, session.domain, session.keywords);
      session.researchPlan = plan;
      await session.save();

      // Stage 2: Multi-Source Search
      await this.updateStage(session, 'searching', 25, `Querying sources: ${session.preferredSources.join(', ')}...`);
      const rawCandidates = await searchService.searchMultiProvider(
        session.query,
        plan.decomposedQuestions,
        session.preferredSources,
        {
          limit: Math.max(5, session.targetPaperCount * 2),
          yearStart: session.yearRange.start,
          yearEnd: session.yearRange.end,
        }
      );

      // Stage 3 & 4: Deduplication & Relevance Ranking
      await this.updateStage(session, 'filtering', 40, `Deduplicating ${rawCandidates.length} candidate papers and ranking by relevance...`);
      const deduplicated = deduplicationService.deduplicate(rawCandidates);
      const topSelected = rankingService.rankPapers(deduplicated, session.query, session.targetPaperCount);

      // Save/Upsert Papers into database
      const savedPaperDocs: any[] = [];
      for (const p of topSelected) {
        let existing = await PaperModel.findOne({ title: p.title });
        if (!existing) {
          existing = await PaperModel.create({
            title: p.title,
            authors: p.authors || [],
            abstract: p.abstract || '',
            publicationDate: p.publicationDate || '2024',
            venue: p.venue || 'Academic Venue',
            doi: p.doi,
            urls: p.urls || {},
            source: p.source || 'arXiv',
            citationCount: p.citationCount || 0,
            pdfAvailable: p.pdfAvailable || false,
            openAccess: p.openAccess || false,
            keywords: p.keywords || [],
            relevanceScore: p.relevanceScore || 0.85,
          });
        }
        savedPaperDocs.push(existing);
      }

      session.selectedPaperIds = savedPaperDocs.map((doc) => doc._id);

      // Stage 5: PDF / Section Content Extraction
      await this.updateStage(session, 'extracting', 55, `Extracting sections, tables, and figures from ${savedPaperDocs.length} selected papers...`);
      for (const doc of savedPaperDocs) {
        const extracted = await extractionService.extractContent(doc.toObject());
        doc.extractedSections = extracted.extractedSections;
        doc.figuresAndTables = extracted.figuresAndTables;
        doc.pdfAvailable = extracted.pdfAvailable;
        await doc.save();
      }

      // Stage 6: Evidence Extraction & Citation Verification
      await this.updateStage(session, 'verifying', 70, 'Extracting claim grounding snippets and executing verification checks...');
      const plainPapers = savedPaperDocs.map((doc) => ({
        ...doc.toObject(),
        id: doc._id.toString(),
      })) as unknown as Paper[];

      const rawClaims = evidenceService.extractEvidenceFromPapers(plainPapers, session.query);
      const verifiedClaims = verificationService.verifyAll(rawClaims);

      // Stage 7: Paper Comparison Matrix
      await this.updateStage(session, 'comparing', 80, 'Constructing comparative matrix across methodology, datasets, and results...');
      const comparisonMatrix = comparisonService.generateComparisonMatrix(plainPapers, session.query);
      session.comparisonMatrix = comparisonMatrix as any;

      // Stage 8: Candidate Research Gap Detection
      await this.updateStage(session, 'gap_detection', 90, 'Identifying candidate research gaps and underexplored areas...');
      const researchGaps = gapDetectionService.detectResearchGaps(plainPapers, session.query);
      session.researchGaps = researchGaps as any;

      // Stage 9: Final Report Synthesis
      await this.updateStage(session, 'synthesizing', 95, 'Synthesizing 11-section literature survey report with verified citations...');
      const reportData = reportService.generateReport(
        session._id.toString(),
        session.query,
        plainPapers,
        verifiedClaims,
        researchGaps,
        comparisonMatrix,
        session.preferredSources
      );

      const reportDoc = await Report.create({
        sessionId: session._id,
        userId: session.userId,
        title: reportData.title,
        sections: reportData.sections,
        claims: reportData.claims,
      });

      session.reportId = reportDoc._id;
      session.status = 'completed';
      await this.updateStage(session, 'completed', 100, 'Research pipeline successfully completed!');
    } catch (err: any) {
      console.error(`[Orchestrator Error] Session ${sessionId} failed:`, err);
      const session = await ResearchSession.findById(sessionId);
      if (session) {
        session.status = 'failed';
        session.currentStage = 'failed';
        session.progressLogs.push({
          timestamp: new Date().toISOString(),
          stage: 'failed',
          message: `Pipeline error: ${err.message}`,
        });
        await session.save();
      }
    }
  }

  private async updateStage(
    session: IResearchSessionDocument,
    stage: string,
    percent: number,
    message: string
  ): Promise<void> {
    session.currentStage = stage;
    session.stageProgressPercent = percent;
    session.progressLogs.push({
      timestamp: new Date().toISOString(),
      stage,
      message,
    });
    await session.save();
  }
}

export const orchestratorService = new OrchestratorService();
