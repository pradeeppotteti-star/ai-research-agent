import { EvidenceItem, VerificationStatus } from '@research-agent/shared';

export class VerificationService {
  verifyClaim(claimText: string, sourceEvidenceText: string): {
    status: VerificationStatus;
    confidence: number;
  } {
    const cleanClaim = claimText.toLowerCase();
    const cleanEvidence = sourceEvidenceText.toLowerCase();

    // Check keyword overlap
    const claimWords = cleanClaim.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    if (claimWords.length === 0) return { status: 'uncertain', confidence: 0.4 };

    let matches = 0;
    for (const word of claimWords) {
      if (cleanEvidence.includes(word)) matches++;
    }

    const ratio = matches / claimWords.length;

    if (ratio >= 0.65) {
      return { status: 'supported', confidence: Number((0.8 + ratio * 0.18).toFixed(2)) };
    } else if (ratio >= 0.35) {
      return { status: 'inferred', confidence: Number((0.55 + ratio * 0.2).toFixed(2)) };
    } else {
      return { status: 'uncertain', confidence: Number((0.2 + ratio * 0.25).toFixed(2)) };
    }
  }

  verifyAll(evidenceList: EvidenceItem[]): EvidenceItem[] {
    return evidenceList.map((item) => {
      const { status, confidence } = this.verifyClaim(item.claim, item.evidenceText);
      return {
        ...item,
        verificationStatus: status,
        confidence,
      };
    });
  }
}

export const verificationService = new VerificationService();
