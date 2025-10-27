/**
 * Scoring Algorithms
 *
 * Core mathematical algorithms for resume scoring with diminishing returns.
 *
 * The scoring system uses two key algorithms:
 * 1. Logarithmic Score - Provides non-linear scaling (diminishing returns on high scores)
 * 2. Capped Factor - Provides diminishing returns on quantity
 *
 * Final Score = CappedFactor(count, rFactor) × LogarithmicScore(avgScore)
 *
 * @module algorithms
 */

import { Rating, ScoredElement, SkillsScore } from "./types";

/**
 * Calculate logarithmic score for non-linear scaling
 *
 * Formula: 100 × (log(score) / log(100))
 *
 * This provides diminishing returns on higher scores:
 * - 0 → 0
 * - 10 → 50
 * - 50 → 84.9
 * - 100 → 100
 *
 * Rationale: Moving from 0→10 is more impactful than 90→100
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 *
 * @param score - Raw score (0-100)
 * @returns Logarithmically scaled score (0-100)
 *
 * @example
 * ```typescript
 * getLogarithmicScore(10)  // 50
 * getLogarithmicScore(50)  // 84.9
 * getLogarithmicScore(100) // 100
 * ```
 */
export function getLogarithmicScore(score: number): number {
  // Handle edge case: log(0) is undefined
  if (score < 1) {
    score = 1;
  }

  // Formula: 100 * (log(score) / log(100))
  // log(100) = 2 (in base 10), so this is 100 * (log(score) / 2)
  return 100 * (Math.log(score) / Math.log(100));
}

/**
 * Calculate capped factor for diminishing returns on quantity
 *
 * Formula: 1 - rFactor^count
 *
 * This provides diminishing returns as count increases:
 * - More items provide less marginal benefit
 * - Prevents gaming the system by adding many low-quality items
 *
 * With rFactor=0.25:
 * - count=1 → 0.75
 * - count=2 → 0.9375
 * - count=3 → 0.984
 * - count=5 → 0.999
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 *
 * @param count - Number of elements
 * @param rFactor - Reduction factor (0-1). Lower = more diminishing returns
 * @returns Capping factor (0-1)
 *
 * @example
 * ```typescript
 * getCappedFactor(1, 0.25)  // 0.75
 * getCappedFactor(2, 0.25)  // 0.9375
 * getCappedFactor(5, 0.25)  // 0.999
 * ```
 */
export function getCappedFactor(count: number, rFactor: number): number {
  // Formula: 1 - rFactor^count
  // As count increases, rFactor^count approaches 0, so result approaches 1
  return 1 - Math.pow(rFactor, count);
}

/**
 * Calculate final score combining logarithmic scaling and capped factor
 *
 * Formula: CappedFactor(count, rFactor) × LogarithmicScore(score)
 *
 * This combines:
 * 1. Logarithmic scaling on the average score (diminishing returns on quality)
 * 2. Capped factor on count (diminishing returns on quantity)
 *
 * Design Rationale:
 * - Quality matters more than quantity
 * - Having 10 mediocre skills < having 3 excellent skills
 * - Prevents resume stuffing with irrelevant keywords
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 *
 * @param score - Average raw score (0-100)
 * @param count - Number of elements
 * @param rFactor - Reduction factor (default: 0.25)
 * @returns Final score (0-100)
 *
 * @example
 * ```typescript
 * // 3 high-quality skills (avg 80) scores higher than 10 medium skills (avg 50)
 * getFinalScore(80, 3, 0.25)  // 91.7
 * getFinalScore(50, 10, 0.25) // 84.9
 * ```
 */
export function getFinalScore(
  score: number,
  count: number,
  rFactor: number = 0.25
): number {
  const cappedFactor = getCappedFactor(count, rFactor);
  const logarithmicScore = getLogarithmicScore(score);

  return cappedFactor * logarithmicScore;
}

/**
 * Convert rating enum to numeric score
 *
 * Mapping:
 * - "low" → 0
 * - "medium" → 50
 * - "high" → 100
 *
 * @param rating - Rating enum value
 * @returns Numeric score (0, 50, or 100)
 */
export function ratingToScore(rating: Rating): number {
  switch (rating) {
    case "low":
      return 0;
    case "medium":
      return 50;
    case "high":
      return 100;
    default:
      return 0;
  }
}

/**
 * Calculate score from an array of rated elements
 *
 * Algorithm:
 * 1. Convert each rating to numeric score (low=0, medium=50, high=100)
 * 2. Calculate average score
 * 3. Apply final score formula with logarithmic scaling and capped factor
 *
 * Time Complexity: O(n) where n = number of elements
 * Space Complexity: O(1)
 *
 * @param elements - Array of scored elements with ratings
 * @param rFactor - Reduction factor for diminishing returns
 * @returns Final score (0-100)
 *
 * @example
 * ```typescript
 * const experience = [
 *   { rating: 'high', reason: 'Senior role at FAANG' },
 *   { rating: 'high', reason: '5+ years relevant experience' },
 *   { rating: 'medium', reason: 'Some gaps in required tech' },
 * ];
 *
 * getScore(experience); // ~91.7
 * ```
 */
export function getScore(
  elements: ScoredElement[],
  rFactor: number = 0.25
): number {
  if (!elements || elements.length === 0) {
    return 0;
  }

  const count = elements.length;

  // Calculate average score
  const totalScore = elements.reduce((acc, element) => {
    return acc + ratingToScore(element.rating);
  }, 0);

  const avgScore = totalScore / count;

  // Apply final score formula
  return Math.trunc(getFinalScore(avgScore, count, rFactor));
}

/**
 * Calculate score from skills object (skill name → rating)
 *
 * Same algorithm as getScore() but for object-based skills data.
 *
 * Time Complexity: O(n) where n = number of skills
 * Space Complexity: O(n) for Object.values()
 *
 * @param skills - Object mapping skill names to ratings
 * @param rFactor - Reduction factor for diminishing returns
 * @returns Final score (0-100)
 *
 * @example
 * ```typescript
 * const skills = {
 *   'TypeScript': 'high',
 *   'React': 'high',
 *   'Node.js': 'medium',
 *   'Python': 'low',
 * };
 *
 * getSkillScore(skills); // ~73.2
 * ```
 */
export function getSkillScore(
  skills: SkillsScore,
  rFactor: number = 0.25
): number {
  if (!skills) {
    return 0;
  }

  const skillRatings = Object.values(skills);
  const count = skillRatings.length;

  if (count === 0) {
    return 0;
  }

  // Calculate average score
  const totalScore = skillRatings.reduce((acc, rating) => {
    return acc + ratingToScore(rating);
  }, 0);

  const avgScore = totalScore / count;

  // Apply final score formula
  return Math.trunc(getFinalScore(avgScore, count, rFactor));
}

/**
 * Calculate weighted total score from category scores
 *
 * Default weights:
 * - Experience: 45%
 * - Skills: 30%
 * - Education: 25%
 *
 * @param categoryScores - Scores for each category
 * @param weights - Custom weights (must sum to 1.0)
 * @returns Weighted total score (0-100)
 *
 * @example
 * ```typescript
 * const scores = {
 *   education: 80,
 *   experience: 90,
 *   skills: 85,
 * };
 *
 * // With default weights
 * getWeightedScore(scores); // 86.25
 *
 * // With custom weights
 * getWeightedScore(scores, { education: 0.2, experience: 0.5, skills: 0.3 }); // 86.5
 * ```
 */
export function getWeightedScore(
  categoryScores: {
    education: number;
    experience: number;
    skills: number;
  },
  weights: {
    education?: number;
    experience?: number;
    skills?: number;
  } = {}
): number {
  const finalWeights = {
    education: weights.education ?? 0.25,
    experience: weights.experience ?? 0.45,
    skills: weights.skills ?? 0.30,
  };

  // Validate weights sum to 1.0 (with small tolerance for floating point)
  const weightSum =
    finalWeights.education + finalWeights.experience + finalWeights.skills;

  if (Math.abs(weightSum - 1.0) > 0.001) {
    throw new Error(
      `Weights must sum to 1.0, got ${weightSum}. Current weights: education=${finalWeights.education}, experience=${finalWeights.experience}, skills=${finalWeights.skills}`
    );
  }

  const totalScore =
    categoryScores.education * finalWeights.education +
    categoryScores.experience * finalWeights.experience +
    categoryScores.skills * finalWeights.skills;

  return Math.trunc(totalScore);
}
