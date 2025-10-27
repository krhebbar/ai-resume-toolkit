/**
 * OpenAI Provider
 *
 * LLM provider implementation using OpenAI's function calling for structured output.
 */

import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { LLMProvider, LLMConfig, ParseResult, TokenUsage } from "./types";

const DEFAULT_PROMPT = `Extract the requested fields from the input text only.
Do not add or generate extra information - use only the given text.
If a field is not present in the text, use null or an empty value as appropriate.

Input:

{input}`;

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private client: OpenAI;
  private config: Required<Omit<LLMConfig, "apiKey" | "baseURL">>;

  constructor(config: LLMConfig = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OpenAI API key is required. Provide it via config or OPENAI_API_KEY environment variable."
      );
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 60000,
    });

    this.config = {
      model: config.model || "gpt-3.5-turbo-1106",
      temperature: config.temperature ?? 0.5,
      maxTokens: config.maxTokens || 4096,
      timeout: config.timeout || 60000,
    };
  }

  async parse<T>(
    text: string,
    schema: z.ZodType<T>,
    customPrompt?: string
  ): Promise<ParseResult<T>> {
    const prompt = customPrompt || DEFAULT_PROMPT;
    const userMessage = prompt.replace("{input}", text);

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
        functions: [
          {
            name: "output_formatter",
            description: "Format the extracted data according to the schema",
            parameters: zodToJsonSchema(schema) as Record<string, unknown>,
          },
        ],
        function_call: { name: "output_formatter" },
      });

      const functionCall = response.choices[0]?.message?.function_call;

      if (!functionCall || !functionCall.arguments) {
        throw new Error("No function call returned from OpenAI");
      }

      const parsedData = JSON.parse(functionCall.arguments);

      // Validate against schema
      const validatedData = schema.parse(parsedData);

      const tokens: TokenUsage = {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      };

      return {
        data: validatedData,
        tokens,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Schema validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
        );
      }

      if (error instanceof Error) {
        throw new Error(`OpenAI parsing failed: ${error.message}`);
      }

      throw error;
    }
  }
}
