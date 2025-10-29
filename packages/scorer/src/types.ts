/**
 * Resume Scoring Types
 *
 * Type definitions for resume-job fit scoring.
 */

/**
 * Rating levels for resume elements
 */
export type Rating = "low" | "medium" | "high";

/**
 * Scored resume element with rating and reason
 */
export interface ScoredElement {
  /**
   * Rating of the match (low=0, medium=50, high=100)
   */
  rating: Rating;

  /**
   * Human-readable explanation of the rating
   */
  reason: string;

  /**
   * Original element index (for tracking)
   */
  index?: number;
}

/**
 * Skills scoring result (skill name -> rating)
 */
export interface SkillsScore {
  [skillName: string]: Rating;
}

/**
 * Complete scoring result with scores and detailed breakdowns
 */
export interface ScoringResult {
  /**
   * Overall scores by category
   */
  scores: {
    education: number;    // 0-100
    experience: number;   // 0-100
    skills: number;       // 0-100
  };

  /**
   * Total weighted score
   */
  totalScore: number; // 0-100

  /**
   * Detailed breakdown by category
   */
  breakdown: {
    education: CategoryBreakdown<ScoredElement>;
    experience: CategoryBreakdown<ScoredElement>;
    skills: CategoryBreakdown<SkillsScore>;
  };
}

/**
 * Category breakdown with score and matched elements
 */
export interface CategoryBreakdown<T> {
  /**
   * Category score (0-100)
   */
  score: number;

  /**
   * Number of elements evaluated
   */
  count: number;

  /**
   * Detailed scoring data
   */
  data: T;
}

/**
 * Input data for the scoring process, typically rated by an LLM.
 */
export interface ScorableData {
  education: ScoredElement[];
  experience: ScoredElement[];
  skills: SkillsScore;
}

/**
 * Resume data for scoring
 */
export interface ResumeForScoring {
  /**
   * Work experience positions
   */
  positions?: Array<{
    org: string;
    title: string;
    summary: string;
    level?: string;
    start?: { year?: number | null; month?: number | null };
    end?: { year?: number | null; month?: number | null };
  }>;

  /**
   * Educational background
   */
  schools?: Array<{
    institution: string;
    degree: string;
    field: string;
    gpa?: number | null;
  }>;

  /**
   * Skills list
   */
  skills?: string[];
}

/**
 * Job description data for scoring
 */
export interface JobDescriptionForScoring {
  /**
   * Job title
   */
  title: string;

  /**
   * Required skills
   */
  requiredSkills?: string[];

  /**
   * Preferred skills
   */
  preferredSkills?: string[];

  /**
   * Job responsibilities
   */
  responsibilities?: string[];

  /**
   * Requirements
   */
  requirements?: string[];

  /**
   * Experience level required
   */
  experienceYears?: number;

  /**
   * Required education level
   */
  educationLevel?: string;
}

/**
 * Scoring configuration
 */
export interface ScoringConfig {
  /**
   * Weights for each category (must sum to 1.0)
   */
  weights?: {
    education?: number;   // Default: 0.25
    experience?: number;  // Default: 0.45
    skills?: number;      // Default: 0.30
  };

  /**
   * R-factor for diminishing returns (0-1)
   * Lower = more diminishing returns
   * Default: 0.25
   */
  rFactor?: number;

  /**
   * Use logarithmic scoring
   * Default: true
   */
  useLogarithmic?: boolean;
}
