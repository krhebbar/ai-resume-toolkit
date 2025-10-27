/**
 * Anthropic Provider
 *
 * LLM provider implementation using Anthropic Claude with tool use for structured output.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { LLMProvider, LLMConfig, ParseResult, TokenUsage } from "./types";

const DEFAULT_PROMPT = `Extract the requested fields from the input text only.
Do not add or generate extra information - use only the given text.
If a field is not present in the text, use null or an empty value as appropriate.

Input:

{input}`;

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private config: Required<Omit<LLMConfig, "apiKey" | "baseURL">>;

  constructor(config: LLMConfig = {}) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Anthropic API key is required. Provide it via config or ANTHROPIC_API_KEY environment variable."
      );
    }

    this.client = new Anthropic({
      apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 60000,
    });

    this.config = {
      model: config.model || "claude-3-5-sonnet-20241022",
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
      const jsonSchema = zodToJsonSchema(schema);

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        tools: [
          {
            name: "output_formatter",
            description: "Format the extracted data according to the schema",
            input_schema: jsonSchema as Anthropic.Tool.InputSchema,
          },
        ],
        tool_choice: { type: "tool", name: "output_formatter" },
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      const toolUse = response.content.find(
        (block): block is Anthropic.Messages.ToolUseBlock =>
          block.type === "tool_use"
      );

      if (!toolUse) {
        throw new Error("No tool use returned from Anthropic");
      }

      // Validate against schema
      const validatedData = schema.parse(toolUse.input);

      const tokens: TokenUsage = {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
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
        throw new Error(`Anthropic parsing failed: ${error.message}`);
      }

      throw error;
    }
  }
}
