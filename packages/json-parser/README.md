# Resume JSON Parser

LLM-based structured data extraction from resumes and job descriptions with full type safety.

## Features

- **Multi-Provider Support**: OpenAI, Anthropic, or custom LLM providers
- **Type-Safe Schemas**: Zod-based validation for reliable parsing
- **Comprehensive Data Model**: Extract all resume sections (basics, experience, education, skills, etc.)
- **Job Description Parsing**: Parse JD requirements, responsibilities, and compensation
- **Flexible API**: High-level convenience functions or low-level control
- **Token Tracking**: Monitor LLM token usage across all calls

## Installation

```bash
npm install @ai-resume-toolkit/json-parser zod

# Install your preferred LLM provider (peer dependency)
npm install openai              # For OpenAI
npm install @anthropic-ai/sdk   # For Anthropic
```

## Quick Start

### Parse Resume with OpenAI

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

const resume = await parseResumeWithOpenAI(resumeText);

console.log(resume.basics.firstName);      // "John"
console.log(resume.basics.currentCompany); // "Google"
console.log(resume.positions[0].title);    // "Senior Software Engineer"
```

### Parse with Custom Provider

```typescript
import { ResumeParser, OpenAIProvider } from '@ai-resume-toolkit/json-parser';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo',
  temperature: 0.3,
});

const parser = new ResumeParser(provider);
const result = await parser.parseResume(resumeText);

console.log(result.data);                  // Parsed resume
console.log(result.tokens.totalTokens);    // Token usage
```

### Parse Job Description

```typescript
import { ResumeParser, OpenAIProvider } from '@ai-resume-toolkit/json-parser';

const jdText = `
Senior Backend Engineer
Company: Acme Corp
Location: San Francisco, CA

Requirements:
- 5+ years of experience with Node.js and TypeScript
- Experience with microservices architecture
...
`;

const parser = new ResumeParser(new OpenAIProvider());
const result = await parser.parseJobDescription(jdText);

console.log(result.data.requirements.required);  // ["5+ years Node.js", ...]
console.log(result.data.requirements.experience.min); // 5
```

## API Reference

### `ResumeParser`

Main parser class with configurable LLM provider.

```typescript
import { ResumeParser, OpenAIProvider } from '@ai-resume-toolkit/json-parser';

const parser = new ResumeParser(new OpenAIProvider());
```

#### Methods

**`parseResume(text, useBasicSchema?, customPrompt?)`**

Parse resume text into structured JSON.

- **Parameters:**
  - `text`: Raw resume text
  - `useBasicSchema`: Use simplified schema (default: false)
  - `customPrompt`: Custom prompt template (default: generic extraction prompt)

- **Returns:** `Promise<ParseResult<Resume>>`

**`parseJobDescription(text, customPrompt?)`**

Parse job description text into structured JSON.

- **Returns:** `Promise<ParseResult<JobDescription>>`

**`parseCustom<T>(text, schema, customPrompt?)`**

Parse with a custom Zod schema.

```typescript
import { z } from 'zod';

const customSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  skills: z.array(z.string()),
});

const result = await parser.parseCustom(text, customSchema);
```

### LLM Providers

#### `OpenAIProvider`

```typescript
import { OpenAIProvider } from '@ai-resume-toolkit/json-parser';

const provider = new OpenAIProvider({
  apiKey: 'sk-...',              // Optional if OPENAI_API_KEY env var set
  model: 'gpt-3.5-turbo-1106',   // Default model
  temperature: 0.5,               // Default temperature
  maxTokens: 4096,                // Max tokens to generate
  timeout: 60000,                 // Request timeout (ms)
});
```

**Supported Models:**
- `gpt-3.5-turbo-1106` (default, cost-effective)
- `gpt-4-turbo` (more accurate, higher cost)
- `gpt-4o` (latest, balanced)

#### `AnthropicProvider`

```typescript
import { AnthropicProvider } from '@ai-resume-toolkit/json-parser';

const provider = new AnthropicProvider({
  apiKey: 'sk-ant-...',                      // Optional if ANTHROPIC_API_KEY env var set
  model: 'claude-3-5-sonnet-20241022',      // Default model
  temperature: 0.5,
  maxTokens: 4096,
  timeout: 60000,
});
```

**Supported Models:**
- `claude-3-5-sonnet-20241022` (default, recommended)
- `claude-3-opus-20240229` (most capable)
- `claude-3-haiku-20240307` (fastest, cheapest)

### Schemas

#### `Resume` Type

Full resume structure:

```typescript
interface Resume {
  basics: {
    firstName: string;
    lastName: string;
    currentJobTitle: string;
    currentCompany: string;
    email: string | null;
    phone: string | null;
    linkedIn: string | null;
    social: string[];
    location: string | null;
  };

  skills: string[];

  positions: Array<{
    org: string;
    title: string;
    summary: string;
    location: string;
    level: "Fresher-level" | "Associate-level" | "Mid-level" | "Senior-level" | "Executive-level";
    start: { year: number | null; month: number | null };
    end: { year: number | null; month: number | null };
  }>;

  projects: Array<{
    title: string;
    summary: string;
  }>;

  schools: Array<{
    institution: string;
    degree: string;
    field: string;
    gpa: number | null;
    start: { year: number | null; month: number | null };
    end: { year: number | null; month: number | null };
  }>;

  languages: string[];
  certificates: string[];
}
```

#### `JobDescription` Type

Job description structure with requirements, responsibilities, and compensation.

### Parse Result

```typescript
interface ParseResult<T> {
  data: T;                      // Parsed and validated data
  tokens: {
    promptTokens: number;       // Input tokens
    completionTokens: number;   // Output tokens
    totalTokens: number;        // Total tokens
  };
}
```

## Advanced Usage

### Custom Prompts

```typescript
const customPrompt = `You are an expert resume parser. Extract the following information:
- Focus on technical skills
- Identify leadership experience
- Note any open-source contributions

Input:
{input}`;

const result = await parser.parseResume(resumeText, false, customPrompt);
```

### Basic Schema (Faster)

Use the basic schema for faster, cheaper parsing with fewer fields:

```typescript
const result = await parser.parseResume(resumeText, true); // useBasicSchema = true
// Only extracts: basics, skills, positions, schools
```

### Custom Provider

Implement your own LLM provider:

```typescript
import { LLMProvider, ParseResult } from '@ai-resume-toolkit/json-parser';
import { z } from 'zod';

class MyCustomProvider implements LLMProvider {
  readonly name = 'my-provider';

  async parse<T>(text: string, schema: z.ZodType<T>, prompt?: string): Promise<ParseResult<T>> {
    // Your implementation
    const data = await myLLM.parse(text);
    const validated = schema.parse(data);

    return {
      data: validated,
      tokens: { promptTokens: 100, completionTokens: 200, totalTokens: 300 }
    };
  }
}

const parser = new ResumeParser(new MyCustomProvider());
```

### Error Handling

```typescript
try {
  const result = await parser.parseResume(resumeText);
} catch (error) {
  if (error.message.includes('Schema validation failed')) {
    console.error('LLM returned invalid data format');
  } else if (error.message.includes('API key')) {
    console.error('Authentication error');
  } else {
    console.error('Parsing error:', error);
  }
}
```

## Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

## Cost Optimization

### Use Smaller Models

```typescript
// GPT-3.5 Turbo (cheaper)
const provider = new OpenAIProvider({ model: 'gpt-3.5-turbo-1106' });

// Claude Haiku (fastest, cheapest)
const provider = new AnthropicProvider({ model: 'claude-3-haiku-20240307' });
```

### Use Basic Schema

```typescript
// Full schema: ~4000 tokens
await parser.parseResume(text, false);

// Basic schema: ~2000 tokens (50% cheaper)
await parser.parseResume(text, true);
```

### Track Token Usage

```typescript
const result = await parser.parseResume(text);
console.log(`Cost: ~$${(result.tokens.totalTokens / 1000) * 0.001}`);
```

## License

MIT - See LICENSE file for details

## Author

Ravindra Kanchikare (krhebber)
