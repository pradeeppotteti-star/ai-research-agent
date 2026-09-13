import { describe, it, expect } from 'vitest';
import { verificationService } from '../src/services/research/verification.service';

describe('VerificationService Tests', () => {
  it('should classify high-overlap claim as supported', () => {
    const claim = 'Multi-stage query decomposition reduces claim hallucination in AI agents.';
    const evidence = 'In this paper, we demonstrate that multi-stage query decomposition significantly reduces claim hallucination across scientific benchmark evaluation sets.';

    const result = verificationService.verifyClaim(claim, evidence);

    expect(result.status).toBe('supported');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('should classify weak-overlap claim as uncertain', () => {
    const claim = 'Quantum computing chip topology accelerates neural training speed by 100x.';
    const evidence = 'We evaluate a standard CPU benchmark on linear regression data.';

    const result = verificationService.verifyClaim(claim, evidence);

    expect(result.status).toBe('uncertain');
    expect(result.confidence).toBeLessThan(0.5);
  });
});
