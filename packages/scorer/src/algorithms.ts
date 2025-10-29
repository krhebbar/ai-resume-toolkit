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
 * Calculate logarithmic score for non-linear scaling.
 * This function implements the principle of diminishing returns for quality.
 * The impact of increasing a score is greater at lower values than at higher values.
 * For example, improving from a score of 10 to 20 is more significant than improving from 90 to 100.
 *
 * Formula: 100 * (log(score) / log(100))
 *
 * @param score - Raw score (0-100)
 * @returns Logarithmically scaled score (0-100)
 */
export function getLogarithmicScore(score: number): number {
  // Handle edge case: log(0) is undefined
  if (score < 1) {
    score = 1;
  }

  // The formula scales the score on a logarithmic curve, with 100 as the maximum.
  // The base of the logarithm does not matter as long as it is consistent.
  return 100 * (Math.log(score) / Math.log(100));
}

/**
 * Calculate capped factor for diminishing returns on quantity.
 * This function ensures that the number of items (e.g., skills, experiences)
 * has diminishing returns, preventing "keyword stuffing".
 *
 * Formula: 1 - rFactor^count
 *
 * @param count - Number of elements
 * @param rFactor - Reduction factor (0-1). Lower values mean more aggressive diminishing returns.
 * @returns Capping factor (0-1)
 */
export function getCappedFactor(count: number, rFactor: number): number {
  // As count increases, rFactor^count approaches 0, so the result approaches 1.
  // This means that each additional item provides a smaller marginal benefit.
  return 1 - Math.pow(rFactor, count);
}

/**
 * Calculate final score combining logarithmic scaling and capped factor.
 * This function combines the principles of diminishing returns for both quality and quantity.
 *
 * Formula: CappedFactor(count, rFactor) * LogarithmicScore(score)
 *
 * @param score - Average raw score (0-100)
 * @param count - Number of elements
 * @param rFactor - Reduction factor (default: 0.25)
 * @returns Final score (0-100)
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
 * Convert rating enum to numeric score.
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
 * Calculate score from an array of rated elements.
 *
 * @param elements - Array of scored elements with ratings
 * @param rFactor - Reduction factor for diminishing returns
 * @returns Final score (0-100)
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
 * Calculate score from skills object (skill name → rating).
 *
 * @param skills - Object mapping skill names to ratings
 * @param rFactor - Reduction factor for diminishing returns
 * @returns Final score (0-100)
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
 * Calculate weighted total score from category scores.
 *
 * @param categoryScores - Scores for each category
 * @param weights - Custom weights (must sum to 1.0)
 * @returns Weighted total score (0-100)
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