/**
 * Resume Scoring Algorithm Demo
 *
 * This example demonstrates the sophisticated scoring algorithms:
 * - Logarithmic scaling for diminishing returns
 * - Capped factor to prevent keyword stuffing
 * - Weighted scoring across categories
 */

import { ResumeScorer, getLogarithmicScore, getCappedFactor, getFinalScore } from '@ai-resume-toolkit/scorer';

console.log('═'.repeat(70));
console.log('  SCORING ALGORITHM DEMONSTRATION');
console.log('═'.repeat(70));

// ============================================================================
// Part 1: Understanding Logarithmic Scaling
// ============================================================================

console.log('\n📐 Part 1: Logarithmic Scaling\n');
console.log('Formula: 100 × (log(score) / log(100))\n');
console.log('Effect: Diminishing returns on higher scores\n');

const testScores = [0, 10, 20, 50, 75, 90, 100];
console.log('Input → Output | Marginal Gain');
console.log('-'.repeat(40));

let prevScore = 0;
for (const score of testScores) {
  const output = getLogarithmicScore(score);
  const gain = output - prevScore;
  console.log(`${score.toString().padStart(3)} → ${output.toFixed(1).padStart(5)} | +${gain.toFixed(1)}`);
  prevScore = output;
}

console.log('\n💡 Insight: Going from 0→10 gives +50 points, but 90→100 only gives +5.4 points');

// ============================================================================
// Part 2: Understanding Capped Factor
// ============================================================================

console.log('\n\n📊 Part 2: Capped Factor (Quantity Diminishing Returns)\n');
console.log('Formula: 1 - rFactor^count\n');
console.log('Effect: More items give less marginal benefit\n');

const rFactor = 0.25;
const testCounts = [1, 2, 3, 4, 5, 10];
console.log('Count → Factor | Marginal Gain');
console.log('-'.repeat(40));

let prevFactor = 0;
for (const count of testCounts) {
  const factor = getCappedFactor(count, rFactor);
  const gain = factor - prevFactor;
  console.log(`${count.toString().padStart(2)} → ${factor.toFixed(4)} | +${gain.toFixed(4)}`);
  prevFactor = factor;
}

console.log('\n💡 Insight: 1st item adds 0.75, but 10th item only adds 0.0001');

// ============================================================================
// Part 3: Quality vs Quantity Comparison
// ============================================================================

console.log('\n\n⚖️  Part 3: Quality vs Quantity\n');

console.log('Candidate A: 3 high-quality skills (avg score: 100)');
const scoreA = getFinalScore(100, 3, rFactor);
console.log(`Final Score: ${scoreA.toFixed(1)}\n`);

console.log('Candidate B: 10 medium-quality skills (avg score: 50)');
const scoreB = getFinalScore(50, 10, rFactor);
console.log(`Final Score: ${scoreB.toFixed(1)}\n`);

console.log(`💡 Result: Candidate A scores ${(scoreA - scoreB).toFixed(1)} points higher!`);
console.log('   Quality beats quantity ✅\n');

// ============================================================================
// Part 4: Real-World Resume Scoring
// ============================================================================

console.log('\n\n🎯 Part 4: Complete Resume Scoring Example\n');

const scorer = new ResumeScorer({
  weights: {
    education: 0.25,
    experience: 0.45,
    skills: 0.30,
  },
  rFactor: 0.25,
});

const candidateData = {
  education: [
    { rating: 'high' as const, reason: 'CS degree from Stanford University' },
    { rating: 'medium' as const, reason: 'Relevant coursework in distributed systems' },
  ],
  experience: [
    { rating: 'high' as const, reason: 'Senior Engineer at Google - 4 years' },
    { rating: 'high' as const, reason: 'Led team of 5, built scalable systems' },
    { rating: 'medium' as const, reason: 'Previous role at Facebook - 3 years' },
    { rating: 'medium' as const, reason: 'Internship at Microsoft' },
  ],
  skills: {
    'TypeScript': 'high' as const,
    'Node.js': 'high' as const,
    'React': 'high' as const,
    'PostgreSQL': 'high' as const,
    'AWS': 'medium' as const,
    'Docker': 'medium' as const,
    'Kubernetes': 'low' as const,
  },
};

const result = scorer.score(candidateData);

console.log('Candidate Profile:');
console.log(`  Education: ${result.breakdown.education.count} items`);
console.log(`  Experience: ${result.breakdown.experience.count} positions`);
console.log(`  Skills: ${result.breakdown.skills.count} matched skills\n`);

console.log('Category Scores:');
console.log(`  Education:   ${result.scores.education}/100`);
console.log(`  Experience:  ${result.scores.experience}/100`);
console.log(`  Skills:      ${result.scores.skills}/100\n`);

console.log(`Total Score: ${result.totalScore}/100`);
console.log(`  Calculation: (${result.scores.education} × 0.25) + (${result.scores.experience} × 0.45) + (${result.scores.skills} × 0.30)`);
console.log(`  = ${(result.scores.education * 0.25).toFixed(1)} + ${(result.scores.experience * 0.45).toFixed(1)} + ${(result.scores.skills * 0.30).toFixed(1)}`);
console.log(`  = ${result.totalScore}\n`);

// ============================================================================
// Part 5: Algorithm Sensitivity Analysis
// ============================================================================

console.log('\n📈 Part 5: R-Factor Sensitivity Analysis\n');
console.log('How does rFactor affect scoring?\n');

const testData = {
  education: [{ rating: 'high' as const, reason: 'Test' }],
  experience: [
    { rating: 'high' as const, reason: 'Test' },
    { rating: 'high' as const, reason: 'Test' },
  ],
  skills: {
    'Skill1': 'high' as const,
    'Skill2': 'high' as const,
    'Skill3': 'high' as const,
  },
};

console.log('rFactor | Education | Experience | Skills | Total');
console.log('-'.repeat(55));

for (const r of [0.10, 0.25, 0.40, 0.60]) {
  const s = new ResumeScorer({
    weights: { education: 0.25, experience: 0.45, skills: 0.30 },
    rFactor: r,
  });
  const res = s.score(testData);

  console.log(
    `${r.toFixed(2).padStart(4)}    | ` +
    `${res.scores.education.toString().padStart(4)}      | ` +
    `${res.scores.experience.toString().padStart(5)}      | ` +
    `${res.scores.skills.toString().padStart(4)}   | ` +
    `${res.totalScore}`
  );
}

console.log('\n💡 Insight:');
console.log('   Lower rFactor = More aggressive diminishing returns');
console.log('   Higher rFactor = Quantity matters more\n');

console.log('═'.repeat(70));
console.log('  DEMO COMPLETE');
console.log('═'.repeat(70));
console.log('\n✨ Key Takeaways:');
console.log('   1. Logarithmic scaling rewards quality over perfect scores');
console.log('   2. Capped factor prevents resume stuffing');
console.log('   3. Combined algorithm balances quality AND quantity');
console.log('   4. Configurable weights allow role-specific tuning\n');
