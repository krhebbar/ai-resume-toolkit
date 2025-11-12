/**
 * Resume Scorer
 *
 * High-level API for scoring resume-job fit using sophisticated algorithms.
 */

import {
  ScoringResult,
  ScoringConfig,
  ScoredElement,
  SkillsScore,
  ScorableData,
} from "./types";
import { getScore, getSkillScore, getWeightedScore } from "./algorithms";

/**
 * Resume Scorer with configurable weights and algorithms
 *
 * @example
 * ```typescript
 * const scorer = new ResumeScorer({
 *   weights: {
 *     education: 0.25,
 *     experience: 0.45,
 *     skills: 0.30,
 *   },
 *   rFactor: 0.25, // Diminishing returns factor
 * });
 *
 * const result = scorer.score(scoredData);
 * console.log(result.totalScore); // 85
 * ```
 */
export class ResumeScorer {
  private config: Required<ScoringConfig>;

  constructor(config: ScoringConfig = {}) {
    this.config = {
      weights: {
        education: config.weights?.education ?? 0.25,
        experience: config.weights?.experience ?? 0.45,
        skills: config.weights?.skills ?? 0.30,
      },
      rFactor: config.rFactor ?? 0.25,
      useLogarithmic: config.useLogarithmic ?? true,
    };

    // Validate weights
    const weightSum =
      this.config.weights.education +
      this.config.weights.experience +
      this.config.weights.skills;

    if (Math.abs(weightSum - 1.0) > 0.001) {
      throw new Error(
        `Weights must sum to 1.0, got ${weightSum}. Please adjust your weights configuration.`
      );
    }
  }

  /**
   * Score a resume against a job description
   *
   * Input should be pre-rated by an LLM or manual review.
   *
   * @param scoredData - Pre-rated resume elements
   * @returns Complete scoring result with breakdown
   *
   * @example
   * ```typescript
   * const scoredData = {
   *   education: [
   *     { rating: 'high', reason: 'CS degree from top university' },
   *     { rating: 'medium', reason: 'Relevant coursework' },
   *   ],
   *   experience: [
   *     { rating: 'high', reason: 'Senior role at FAANG' },
   *     { rating: 'high', reason: '5+ years relevant' },
   *   ],
   *   skills: {
   *     'TypeScript': 'high',
   *     'React': 'high',
   *     'Node.js': 'medium',
   *   },
   * };
   *
   * const result = scorer.score(scoredData);
   * console.log(result.totalScore); // 85
   * console.log(result.scores.experience); // 91
   * ```
   */
  score(scoredData: ScorableData): ScoringResult {
    // Calculate scores for each category
    const educationScore = getScore(
      scoredData.education,
      this.config.rFactor
    );
    const experienceScore = getScore(
      scoredData.experience,
      this.config.rFactor
    );
    const skillsScore = getSkillScore(scoredData.skills, this.config.rFactor);

    // Calculate weighted total
    const totalScore = getWeightedScore(
      {
        education: educationScore,
        experience: experienceScore,
        skills: skillsScore,
      },
      this.config.weights
    );

    return {
      scores: {
        education: educationScore,
        experience: experienceScore,
        skills: skillsScore,
      },
      totalScore,
      breakdown: {
        education: {
          score: educationScore,
          count: scoredData.education.length,
          data: scoredData.education,
        },
        experience: {
          score: experienceScore,
          count: scoredData.experience.length,
          data: scoredData.experience,
        },
        skills: {
          score: skillsScore,
          count: Object.keys(scoredData.skills).length,
          data: scoredData.skills,
        },
      },
    };
  }

  /**
   * Score a single category
   *
   * @param elements - Scored elements for the category
   * @returns Category score (0-100)
   *
   * @example
   * ```typescript
   * const experienceScore = scorer.scoreCategory([
   *   { rating: 'high', reason: 'Relevant experience' },
   *   { rating: 'medium', reason: 'Some gaps' },
   * ]);
   * // 73
   * ```
   */
  scoreCategory(elements: ScoredElement[]): number {
    return getScore(elements, this.config.rFactor);
  }

  /**
   * Score skills
   *
   * @param skills - Skill ratings object
   * @returns Skills score (0-100)
   *
   * @example
   * ```typescript
   * const skillsScore = scorer.scoreSkills({
   *   'Python': 'high',
   *   'Django': 'medium',
   *   'PostgreSQL': 'high',
   * });
   * // 82
   * ```
   */
  scoreSkills(skills: SkillsScore): number {
    return getSkillScore(skills, this.config.rFactor);
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<ScoringConfig> {
    return { ...this.config };
  }
}

/**
 * Convenience function for quick scoring with default configuration
 *
 * @param scoredData - Pre-rated resume elements
 * @returns Scoring result
 *
 * @example
 * ```typescript
 * const result = scoreResume({
 *   education: [{ rating: 'high', reason: 'Relevant degree' }],
 *   experience: [{ rating: 'high', reason: 'Senior role' }],
 *   skills: { 'TypeScript': 'high', 'React': 'medium' },
 * });
 *
 * console.log(result.totalScore);
 * ```
 */
export function scoreResume(scoredData: ScorableData): ScoringResult {
  const scorer = new ResumeScorer();
  return scorer.score(scoredData);
}
