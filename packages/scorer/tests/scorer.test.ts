import { describe, it, expect } from 'vitest';
import { ResumeScorer, scoreResume } from '../src/scorer';
import { ScoredElement, SkillsScore } from '../src/types';

describe('ResumeScorer', () => {
  it('should initialize with default config', () => {
    const scorer = new ResumeScorer();
    const config = scorer.getConfig();
    expect(config.weights.education).toBe(0.25);
    expect(config.weights.experience).toBe(0.45);
    expect(config.weights.skills).toBe(0.3);
    expect(config.rFactor).toBe(0.25);
  });

  it('should throw an error if weights do not sum to 1.0', () => {
    expect(() => new ResumeScorer({ weights: { education: 0.5, experience: 0.6, skills: 0.1 } })).toThrow();
  });

  it('should calculate a total score', () => {
    const scorer = new ResumeScorer();
    const scoredData = {
      education: [{ rating: 'high', reason: 'CS Degree' }] as ScoredElement[],
      experience: [{ rating: 'high', reason: '5 years' }] as ScoredElement[],
      skills: { 'TypeScript': 'high', 'React': 'high' } as SkillsScore,
    };
    const result = scorer.score(scoredData);
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  it('should score a single category', () => {
    const scorer = new ResumeScorer();
    const elements = [{ rating: 'high', reason: '' }, { rating: 'medium', reason: '' }] as ScoredElement[];
    const score = scorer.scoreCategory(elements);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should score skills', () => {
    const scorer = new ResumeScorer();
    const skills = { 'Python': 'high', 'Django': 'medium' } as SkillsScore;
    const score = scorer.scoreSkills(skills);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('scoreResume convenience function', () => {
  it('should return a valid score', () => {
    const scoredData = {
      education: [{ rating: 'medium', reason: '' }] as ScoredElement[],
      experience: [{ rating: 'low', reason: '' }] as ScoredElement[],
      skills: { 'JavaScript': 'low' } as SkillsScore,
    };
    const result = scoreResume(scoredData);
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});