/**
 * LLM Provider Types
 *
 * Common interfaces for LLM providers used in structured data extraction.
 */

import { z } from "zod";

/**
 * Token usage statistics from LLM calls
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Result from LLM-based parsing
 */
export interface ParseResult<T> {
  data: T;
  tokens: TokenUsage;
}

/**
 * Configuration for LLM providers
 */
export interface LLMConfig {
  /**
   * API key for the provider
   */
  apiKey?: string;

  /**
   * Model name to use (e.g., "gpt-3.5-turbo", "claude-3-sonnet")
   */
  model?: string;

  /**
   * Temperature for generation (0-1)
   */
  temperature?: number;

  /**
   * Maximum tokens to generate
   */
  maxTokens?: number;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Custom base URL for the API
   */
  baseURL?: string;
}

/**
 * Base interface for LLM providers
 */
export interface LLMProvider {
  /**
   * Parse text into structured data using the provided schema
   *
   * @param text - Input text to parse
   * @param schema - Zod schema defining the output structure
   * @param prompt - Optional custom prompt template
   * @returns Parsed data and token usage
   */
  parse<T>(
    text: string,
    schema: z.ZodType<T>,
    prompt?: string
  ): Promise<ParseResult<T>>;

  /**
   * Provider name
   */
  readonly name: string;
}
