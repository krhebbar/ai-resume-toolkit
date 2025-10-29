import { ResumeParser } from './parser';
import { Resume } from './schema';

/**
 * Convenience function for quick resume parsing with OpenAI
 *
 * @param text - Resume text
 * @param apiKey - OpenAI API key (optional if OPENAI_API_KEY env var is set)
 * @returns Parsed resume data
 *
 * @example
 * ```typescript
 * const resume = await parseResumeWithOpenAI(resumeText);
 * console.log(resume.basics.email);
 * ```
 */
export async function parseResumeWithOpenAI(
  text: string,
  apiKey?: string
): Promise<Resume> {
  const { OpenAIProvider } = await import("./providers/openai");
  const provider = new OpenAIProvider({ apiKey });
  const parser = new ResumeParser(provider);
  const result = await parser.parseResume(text);
  return result.data as Resume;
}

/**
 * Convenience function for quick resume parsing with Anthropic
 *
 * @param text - Resume text
 * @param apiKey - Anthropic API key (optional if ANTHROPIC_API_KEY env var is set)
 * @returns Parsed resume data
 *
 * @example
 * ```typescript
 * const resume = await parseResumeWithAnthropic(resumeText);
 * console.log(resume.basics.email);
 * ```
 */
export async function parseResumeWithAnthropic(
  text: string,
  apiKey?: string
): Promise<Resume> {
  const { AnthropicProvider } = await import("./providers/anthropic");
  const provider = new AnthropicProvider({ apiKey });
  const parser = new ResumeParser(provider);
  const result = await parser.parseResume(text);
  return result.data as Resume;
}