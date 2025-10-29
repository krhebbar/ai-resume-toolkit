# Resume Scorer

A sophisticated resume-job fit scoring engine with logarithmic scaling and diminishing returns algorithms.

## Features

- **Logarithmic Scoring**: Implements non-linear scaling to reward quality over quantity.
- **Configurable Weights**: Customize the importance of education, experience, and skills.
- **Type-Safe**: Full TypeScript support with comprehensive type definitions.
- **Zero Dependencies**: Pure TypeScript with no external runtime dependencies.

## Installation

```bash
npm install @ai-resume-toolkit/scorer
```

## Quick Start

```typescript
import { scoreResume, ScorableData } from '@ai-resume-toolkit/scorer';

// Input data, typically rated by an LLM or manual review
const scoredData: ScorableData = {
  education: [
    { rating: 'high', reason: 'CS degree from a top university' },
    { rating: 'medium', reason: 'Relevant coursework in AI/ML' },
  ],
  experience: [
    { rating: 'high', reason: 'Senior Engineer at a FAANG company' },
    { rating: 'high', reason: '5+ years in the required tech stack' },
  ],
  skills: {
    'TypeScript': 'high',
    'React': 'high',
    'Node.js': 'high',
  },
};

const result = scoreResume(scoredData);

console.log(`Total Score: ${result.totalScore}`); // e.g., 88
console.log(`Experience Score: ${result.scores.experience}`); // e.g., 93
```

## Algorithm Design

The scoring system is designed to be fair and transparent, avoiding common pitfalls of resume scoring.

### 1. Logarithmic Score (Diminishing Returns on Quality)

The `getLogarithmicScore` function scales scores on a curve, so improvements at lower scores are more impactful than improvements at higher scores.

**Formula**: `100 * (log(score) / log(100))`

### 2. Capped Factor (Diminishing Returns on Quantity)

The `getCappedFactor` function ensures that adding more items (e.g., skills) provides diminishing returns, preventing "keyword stuffing".

**Formula**: `1 - rFactor^count`

## API Reference

### `ResumeScorer`

The main scorer class for advanced configuration.

#### `new ResumeScorer(config?: ScoringConfig)`

Creates a new scorer instance.

- `config.weights`: An object to set the weight for `education`, `experience`, and `skills`. Must sum to 1.0.
- `config.rFactor`: A number between 0 and 1 to control the diminishing returns on quantity. Lower values are more aggressive.

#### `score(scoredData: ScorableData): ScoringResult`

Calculates the score for a given set of rated data.

### `scoreResume(scoredData: ScorableData): ScoringResult`

A convenience function that uses the default scoring configuration.

### Types

#### `ScorableData`
The input data for the scoring process.
```typescript
interface ScorableData {
  education: ScoredElement[];
  experience: ScoredElement[];
  skills: SkillsScore;
}
```

#### `ScoredElement`
Represents a single rated item.
```typescript
interface ScoredElement {
  rating: 'low' | 'medium' | 'high';
  reason: string;
}
```

#### `SkillsScore`
An object mapping skill names to their ratings.
```typescript
interface SkillsScore {
  [skillName: string]: 'low' | 'medium' | 'high';
}
```

#### `ScoringResult`
The output of the scoring process, containing the total score, category scores, and a detailed breakdown.

## Advanced Usage

### Custom Weights

Prioritize certain categories by adjusting their weights.

```typescript
const scorer = new ResumeScorer({
  weights: {
    education: 0.15,
    experience: 0.60, // Emphasize experience
    skills: 0.25,
  },
});
```

### Direct Algorithm Access

You can use the core algorithms directly for custom calculations.

```typescript
import { getFinalScore, getWeightedScore } from '@ai-resume-toolkit/scorer';

const finalScore = getFinalScore(80, 3, 0.25); // 91
const weightedScore = getWeightedScore({ education: 80, experience: 90, skills: 85 }); // 86
```