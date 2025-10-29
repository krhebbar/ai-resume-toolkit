# Resume JSON Parser

LLM-based structured data extraction from resumes and job descriptions with full type safety.

## Features

- **Multi-Provider Support**: OpenAI, Anthropic, or any custom LLM provider.
- **Type-Safe Schemas**: Zod-based validation ensures reliable, structured output.
- **Comprehensive Data Model**: Extracts all key resume sections, including contact info, experience, education, and skills.
- **Job Description Parsing**: Parses job requirements, responsibilities, and compensation.
- **Flexible API**: Use high-level convenience functions for simplicity or the `ResumeParser` class for advanced control.
- **Token Tracking**: Monitor LLM token usage for every API call.

## Installation

```bash
npm install @ai-resume-toolkit/json-parser zod

# Install your preferred LLM provider (peer dependency)
npm install openai              # For OpenAI
npm install @anthropic-ai/sdk   # For Anthropic
```

## Quick Start

### Parse a Resume with OpenAI

```typescript
import { parseResumeWithOpenAI } from '@ai-resume-toolkit/json-parser';

const resumeText = `
John Doe
Software Engineer at Google
john@example.com | linkedin.com/in/johndoe

Experience:
- Senior Software Engineer at Google (2020-Present)
  Built scalable microservices handling 1M+ requests/day
...
`;

// This is a convenience function that handles the provider and parser setup for you.
const resume = await parseResumeWithOpenAI(resumeText);

console.log(resume.basics.firstName);      // "John"
console.log(resume.basics.currentCompany); // "Google"
console.log(resume.positions[0].title);    // "Senior Software Engineer"
```

### Parse with a Custom Provider

For more control, you can instantiate your own provider and parser.

```typescript
import { ResumeParser, OpenAIProvider } from '@ai-resume-toolkit/json-parser';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo',
  temperature: 0.3,
});

const parser = new ResumeParser(provider);
const result = await parser.parseResume(resumeText);

console.log(result.data);                  // Parsed resume data
console.log(result.tokens.totalTokens);    // Token usage
```

## API Reference

### `ResumeParser`

The main parser class, which takes an `LLMProvider` in its constructor.

#### `new ResumeParser(provider: LLMProvider)`

Creates a new parser instance with the given provider.

#### `parseResume(text: string, useBasicSchema?: boolean, customPrompt?: string): Promise<ParseResult<Resume | BasicResume>>`

Parses resume text into a structured `Resume` object.

- `useBasicSchema`: Set to `true` for a faster, cheaper parse with fewer fields.

#### `parseJobDescription(text: string, customPrompt?: string): Promise<ParseResult<JobDescription>>`

Parses a job description into a structured `JobDescription` object.

#### `parseCustom<T>(text: string, schema: z.ZodType<T>, customPrompt?: string): Promise<ParseResult<T>>`

Parses text against a custom Zod schema for maximum flexibility.

### LLM Providers

Providers are responsible for communicating with the LLM APIs.

#### `OpenAIProvider`

Connects to the OpenAI API.

```typescript
import { OpenAIProvider } from '@ai-resume-toolkit/json-parser';

const provider = new OpenAIProvider({
  apiKey: 'sk-...',              // Optional (uses OPENAI_API_KEY env var)
  model: 'gpt-3.5-turbo-1106',   // Default
  temperature: 0.5,
});
```

#### `AnthropicProvider`

Connects to the Anthropic API.

```typescript
import { AnthropicProvider } from '@ai-resume-toolkit/json-parser';

const provider = new AnthropicProvider({
  apiKey: 'sk-ant-...',          // Optional (uses ANTHROPIC_API_KEY env var)
  model: 'claude-3-5-sonnet-20241022', // Default
});
```

### Convenience Functions

#### `parseResumeWithOpenAI(text: string, apiKey?: string): Promise<Resume>`

A helper for quick parsing with OpenAI.

#### `parseResumeWithAnthropic(text: string, apiKey?: string): Promise<Resume>`

A helper for quick parsing with Anthropic.

## Error Handling

The library may throw errors during parsing. It's recommended to wrap calls in a `try...catch` block.

```typescript
try {
  const result = await parser.parseResume(resumeText);
} catch (error) {
  if (error.message.includes('Schema validation failed')) {
    console.error('LLM returned an invalid data format.');
  } else {
    console.error('An unexpected parsing error occurred:', error);
  }
}
```

## Creating a Custom Provider

You can implement the `LLMProvider` interface to use any LLM.

```typescript
import { LLMProvider, ParseResult, LLMConfig } from '@ai-resume-toolkit/json-parser';
import { z } from 'zod';

class MyCustomProvider implements LLMProvider {
  readonly name = 'my-provider';
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
  }

  async parse<T>(text: string, schema: z.ZodType<T>, prompt?: string): Promise<ParseResult<T>> {
    // Your implementation here...
    const llmResponse = await myLLMAPI.generate(text, this.config.model);
    const validatedData = schema.parse(llmResponse);

    return {
      data: validatedData,
      tokens: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
    };
  }
}

const parser = new ResumeParser(new MyCustomProvider());
```