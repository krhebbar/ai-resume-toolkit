/**
 * Resume Parser
 *
 * High-level API for parsing resumes and job descriptions using LLMs.
 */

import { z } from "zod";
import { LLMProvider, ParseResult } from "./providers/types";
import {
  resumeSchema,
  Resume,
  basicResumeSchema,
  BasicResume,
  jobDescriptionSchema,
  JobDescription,
} from "./schema";

/**
 * Main resume parser class with configurable LLM provider
 */
export class ResumeParser {
  constructor(private provider: LLMProvider) {}

  /**
   * Parse resume text into structured JSON
   *
   * @param text - Raw resume text
   * @param useBasicSchema - Use simplified schema (faster, fewer fields)
   * @param customPrompt - Optional custom prompt template
   * @returns Parsed resume data and token usage
   *
   * @example
   * ```typescript
   * const parser = new ResumeParser(new OpenAIProvider());
   * const result = await parser.parseResume(resumeText);
   * console.log(result.data.basics.firstName);
   * console.log(`Used ${result.tokens.totalTokens} tokens`);
   * ```
   */
  async parseResume(
    text: string,
    useBasicSchema: boolean = false,
    customPrompt?: string
  ): Promise<ParseResult<Resume | BasicResume>> {
    const schema = useBasicSchema ? basicResumeSchema : resumeSchema;
    return this.provider.parse(text, schema, customPrompt);
  }

  /**
   * Parse job description text into structured JSON
   *
   * @param text - Raw job description text
   * @param customPrompt - Optional custom prompt template
   * @returns Parsed job description data and token usage
   *
   * @example
   * ```typescript
   * const parser = new ResumeParser(new OpenAIProvider());
   * const result = await parser.parseJobDescription(jdText);
   * console.log(result.data.requirements.required);
   * ```
   */
  async parseJobDescription(
    text: string,
    customPrompt?: string
  ): Promise<ParseResult<JobDescription>> {
    return this.provider.parse(text, jobDescriptionSchema, customPrompt);
  }

  /**
   * Parse text using a custom schema
   *
   * @param text - Raw text to parse
   * @param schema - Custom Zod schema
   * @param customPrompt - Optional custom prompt template
   * @returns Parsed data and token usage
   *
   * @example
   * ```typescript
   * const customSchema = z.object({
   *   name: z.string(),
   *   skills: z.array(z.string()),
   * });
   *
   * const result = await parser.parseCustom(text, customSchema);
   * ```
   */
  async parseCustom<T>(
    text: string,
    schema: z.ZodType<T>,
    customPrompt?: string
  ): Promise<ParseResult<T>> {
    return this.provider.parse(text, schema, customPrompt);
  }

  /**
   * Get the provider name
   */
  get providerName(): string {
    return this.provider.name;
  }
}

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
