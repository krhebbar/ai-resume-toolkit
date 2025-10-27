/**
 * Complete Resume Processing Workflow
 *
 * This example demonstrates the full end-to-end workflow:
 * 1. Extract text from resume PDF
 * 2. Parse text to structured JSON using LLM
 * 3. Score resume against job description
 *
 * Prerequisites:
 * - Set OPENAI_API_KEY environment variable
 * - Have a sample resume PDF file
 */

import { ResumeParser, OpenAIProvider } from '@ai-resume-toolkit/json-parser';
import { ResumeScorer } from '@ai-resume-toolkit/scorer';
import type { Resume } from '@ai-resume-toolkit/json-parser';
import type { Rating, ScoredElement, SkillsScore } from '@ai-resume-toolkit/scorer';

// Sample resume text (in production, this would come from text-extractor)
const SAMPLE_RESUME_TEXT = `
John Doe
Senior Software Engineer
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
San Francisco, CA

EXPERIENCE

Senior Software Engineer, Google Inc.
San Francisco, CA | January 2020 - Present
- Led development of microservices architecture handling 10M+ requests/day
- Implemented real-time analytics pipeline using Kafka and Apache Flink
- Mentored team of 5 junior engineers, improved code quality by 40%
- Reduced infrastructure costs by 30% through optimization and auto-scaling

Software Engineer, Facebook
Menlo Park, CA | June 2017 - December 2019
- Built React-based internal tools used by 1,000+ employees
- Implemented GraphQL API serving 100K+ queries/day
- Improved page load times by 60% through performance optimizations
- Contributed to open-source projects (React, GraphQL)

Software Development Intern, Microsoft
Redmond, WA | Summer 2016
- Developed features for Azure Portal using TypeScript and React
- Collaborated with cross-functional teams on feature specifications
- Presented project demos to senior leadership

EDUCATION

Bachelor of Science in Computer Science
Stanford University, Stanford, CA
GPA: 3.8/4.0 | Graduated: May 2017
Relevant Coursework: Algorithms, Distributed Systems, Machine Learning

SKILLS

Languages: TypeScript, Python, JavaScript, Go, Java
Frameworks: React, Node.js, Express, Django, FastAPI
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
Cloud: AWS (EC2, S3, Lambda), Google Cloud Platform, Docker, Kubernetes
Tools: Git, CI/CD, Grafana, Prometheus, Kafka

CERTIFICATIONS

- AWS Certified Solutions Architect - Professional
- Google Cloud Professional Cloud Architect
`;

// Sample job description
const SAMPLE_JOB_DESCRIPTION = {
  title: 'Staff Software Engineer - Backend',
  company: 'Acme Corp',
  requiredSkills: [
    'TypeScript',
    'Node.js',
    'PostgreSQL',
    'AWS',
    'Microservices',
    'Distributed Systems',
  ],
  preferredSkills: [
    'Kafka',
    'GraphQL',
    'Docker',
    'Kubernetes',
  ],
  experienceYears: 7,
  responsibilities: [
    'Design and implement scalable backend services',
    'Lead technical initiatives and mentor engineers',
    'Optimize system performance and reliability',
  ],
  requirements: [
    '7+ years of software engineering experience',
    'Strong background in distributed systems',
    'Experience with cloud platforms (AWS/GCP)',
    'Bachelor\'s degree in Computer Science or related field',
  ],
};

/**
 * Step 1: Parse resume to structured JSON
 */
async function parseResume(text: string): Promise<Resume> {
  console.log('\n📄 Step 1: Parsing Resume to JSON...\n');

  const provider = new OpenAIProvider({
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.3, // Lower temperature for more consistent extraction
  });

  const parser = new ResumeParser(provider);
  const result = await parser.parseResume(text);

  console.log('✅ Resume parsed successfully');
  console.log(`   Name: ${result.data.basics.firstName} ${result.data.basics.lastName}`);
  console.log(`   Current Role: ${result.data.basics.currentJobTitle}`);
  console.log(`   Skills: ${result.data.skills.length} skills found`);
  console.log(`   Experience: ${result.data.positions.length} positions`);
  console.log(`   Education: ${result.data.schools.length} schools`);
  console.log(`   Tokens Used: ${result.tokens.totalTokens}`);

  return result.data;
}

/**
 * Step 2: Rate resume elements against job description
 *
 * In production, this would use an LLM. For this demo, we'll use rule-based logic.
 */
function rateResumeAgainstJob(
  resume: Resume,
  jobDescription: typeof SAMPLE_JOB_DESCRIPTION
): {
  education: ScoredElement[];
  experience: ScoredElement[];
  skills: SkillsScore;
} {
  console.log('\n⚖️  Step 2: Rating Resume Against Job Description...\n');

  // Rate education
  const educationRatings: ScoredElement[] = resume.schools.map((school, index) => {
    let rating: Rating = 'low';
    let reason = '';

    if (school.field.toLowerCase().includes('computer science')) {
      if (school.institution.toLowerCase().includes('stanford') ||
          school.institution.toLowerCase().includes('mit') ||
          school.institution.toLowerCase().includes('berkeley')) {
        rating = 'high';
        reason = `Top-tier CS degree from ${school.institution}`;
      } else {
        rating = 'medium';
        reason = `Relevant CS degree from ${school.institution}`;
      }
    } else {
      rating = 'low';
      reason = `Degree in ${school.field} - less relevant for this role`;
    }

    return { rating, reason, index };
  });

  // Rate experience
  const experienceRatings: ScoredElement[] = resume.positions.map((position, index) => {
    let rating: Rating = 'low';
    let reason = '';

    const isFAANG = ['google', 'facebook', 'amazon', 'apple', 'microsoft'].some(
      company => position.org.toLowerCase().includes(company)
    );

    const isSenior = position.level === 'Senior-level' || position.level === 'Executive-level';
    const summary = position.summary.toLowerCase();

    // Check for relevant keywords
    const hasDistributedSystems = summary.includes('microservices') ||
                                   summary.includes('distributed') ||
                                   summary.includes('scalable');
    const hasLeadership = summary.includes('led') ||
                          summary.includes('mentored') ||
                          summary.includes('team');

    if (isFAANG && isSenior && hasDistributedSystems && hasLeadership) {
      rating = 'high';
      reason = `Senior role at ${position.org} with strong distributed systems and leadership experience`;
    } else if (isFAANG && (hasDistributedSystems || hasLeadership)) {
      rating = 'high';
      reason = `Relevant experience at ${position.org} in backend development`;
    } else if (hasDistributedSystems || hasLeadership) {
      rating = 'medium';
      reason = `Some relevant experience at ${position.org}`;
    } else {
      rating = 'low';
      reason = `Less relevant role at ${position.org}`;
    }

    return { rating, reason, index };
  });

  // Rate skills
  const skillsRatings: SkillsScore = {};
  const requiredSet = new Set(jobDescription.requiredSkills.map(s => s.toLowerCase()));
  const preferredSet = new Set(jobDescription.preferredSkills.map(s => s.toLowerCase()));

  for (const skill of resume.skills) {
    const skillLower = skill.toLowerCase();

    if (requiredSet.has(skillLower)) {
      skillsRatings[skill] = 'high';
    } else if (preferredSet.has(skillLower)) {
      skillsRatings[skill] = 'medium';
    } else {
      // Check for partial matches (e.g., "React" in required, "React Native" in resume)
      const isPartialRequired = Array.from(requiredSet).some(req => skillLower.includes(req));
      const isPartialPreferred = Array.from(preferredSet).some(pref => skillLower.includes(pref));

      if (isPartialRequired) {
        skillsRatings[skill] = 'medium';
      } else if (isPartialPreferred) {
        skillsRatings[skill] = 'low';
      }
      // If no match at all, we don't include it in scoring
    }
  }

  console.log('✅ Rating completed');
  console.log(`   Education: ${educationRatings.filter(e => e.rating === 'high').length} high, ${educationRatings.filter(e => e.rating === 'medium').length} medium`);
  console.log(`   Experience: ${experienceRatings.filter(e => e.rating === 'high').length} high, ${experienceRatings.filter(e => e.rating === 'medium').length} medium`);
  console.log(`   Skills: ${Object.values(skillsRatings).filter(r => r === 'high').length} high, ${Object.values(skillsRatings).filter(r => r === 'medium').length} medium`);

  return {
    education: educationRatings,
    experience: experienceRatings,
    skills: skillsRatings,
  };
}

/**
 * Step 3: Calculate final score
 */
function scoreResume(
  scoredData: {
    education: ScoredElement[];
    experience: ScoredElement[];
    skills: SkillsScore;
  }
) {
  console.log('\n🎯 Step 3: Calculating Final Score...\n');

  const scorer = new ResumeScorer({
    weights: {
      education: 0.20,   // 20% - Education matters less for senior roles
      experience: 0.50,  // 50% - Experience is most important
      skills: 0.30,      // 30% - Technical skills are crucial
    },
    rFactor: 0.25, // Standard diminishing returns
  });

  const result = scorer.score(scoredData);

  console.log('✅ Scoring completed');
  console.log(`\n📊 FINAL RESULTS:\n`);
  console.log(`   Overall Score: ${result.totalScore}/100`);
  console.log(`   - Education:   ${result.scores.education}/100 (weight: 20%)`);
  console.log(`   - Experience:  ${result.scores.experience}/100 (weight: 50%)`);
  console.log(`   - Skills:      ${result.scores.skills}/100 (weight: 30%)`);

  console.log(`\n📋 BREAKDOWN:\n`);

  console.log(`   Education (${result.breakdown.education.count} items):`);
  result.breakdown.education.data.forEach((item, i) => {
    console.log(`     ${i + 1}. [${item.rating.toUpperCase()}] ${item.reason}`);
  });

  console.log(`\n   Experience (${result.breakdown.experience.count} items):`);
  result.breakdown.experience.data.forEach((item, i) => {
    console.log(`     ${i + 1}. [${item.rating.toUpperCase()}] ${item.reason}`);
  });

  console.log(`\n   Skills (${result.breakdown.skills.count} matched):`);
  const skillEntries = Object.entries(result.breakdown.skills.data);
  const highSkills = skillEntries.filter(([_, r]) => r === 'high');
  const medSkills = skillEntries.filter(([_, r]) => r === 'medium');

  if (highSkills.length > 0) {
    console.log(`     HIGH: ${highSkills.map(([s]) => s).join(', ')}`);
  }
  if (medSkills.length > 0) {
    console.log(`     MEDIUM: ${medSkills.map(([s]) => s).join(', ')}`);
  }

  return result;
}

/**
 * Main workflow
 */
async function main() {
  console.log('═'.repeat(70));
  console.log('  AI RESUME TOOLKIT - Complete Workflow Demo');
  console.log('═'.repeat(70));

  try {
    // Step 1: Parse resume
    const resume = await parseResume(SAMPLE_RESUME_TEXT);

    // Step 2: Rate against job description
    const ratings = rateResumeAgainstJob(resume, SAMPLE_JOB_DESCRIPTION);

    // Step 3: Calculate score
    const finalScore = scoreResume(ratings);

    // Decision
    console.log(`\n${'═'.repeat(70)}`);
    if (finalScore.totalScore >= 80) {
      console.log(`✅ RECOMMENDATION: STRONG CANDIDATE - Schedule interview`);
    } else if (finalScore.totalScore >= 60) {
      console.log(`⚠️  RECOMMENDATION: POTENTIAL CANDIDATE - Review manually`);
    } else {
      console.log(`❌ RECOMMENDATION: WEAK FIT - Consider other candidates`);
    }
    console.log(`${'═'.repeat(70)}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main, parseResume, rateResumeAgainstJob, scoreResume };
