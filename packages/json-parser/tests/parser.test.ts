import { describe, it, expect, vi } from 'vitest';
import { mock, mockDeep } from 'vitest-mock-extended';
import { z } from 'zod';
import { ResumeParser } from '../src/parser';
import { LLMProvider, ParseResult } from '../src/providers/types';
import { basicResumeSchema, resumeSchema, jobDescriptionSchema } from '../src/schema';

describe('ResumeParser', () => {
  const mockProvider = mock<LLMProvider>();

  it('should parse a resume with the default schema', async () => {
    const text = '...resume text...';
    const expected = { basics: { firstName: 'John' } };
    mockProvider.parse.mockResolvedValue({
      success: true,
      data: expected,
      tokens: { totalTokens: 100 },
    } as ParseResult<any>);

    const parser = new ResumeParser(mockProvider);
    const result = await parser.parseResume(text);

    expect(result.data).toEqual(expected);
    expect(mockProvider.parse).toHaveBeenCalledWith(text, resumeSchema, undefined);
  });

  it('should parse a resume with the basic schema', async () => {
    const text = '...resume text...';
    const expected = { basics: { name: 'John Doe' } };
    mockProvider.parse.mockResolvedValue({
      success: true,
      data: expected,
      tokens: { totalTokens: 50 },
    } as ParseResult<any>);

    const parser = new ResumeParser(mockProvider);
    const result = await parser.parseResume(text, true);

    expect(result.data).toEqual(expected);
    expect(mockProvider.parse).toHaveBeenCalledWith(text, basicResumeSchema, undefined);
  });

  it('should parse a job description', async () => {
    const text = '...job description...';
    const expected = { requirements: { required: ['TypeScript'] } };
    mockProvider.parse.mockResolvedValue({
      success: true,
      data: expected,
      tokens: { totalTokens: 80 },
    } as ParseResult<any>);

    const parser = new ResumeParser(mockProvider);
    const result = await parser.parseJobDescription(text);

    expect(result.data).toEqual(expected);
    expect(mockProvider.parse).toHaveBeenCalledWith(text, jobDescriptionSchema, undefined);
  });

  it('should parse with a custom schema', async () => {
    const text = '...custom text...';
    const customSchema = z.object({
      company: z.string(),
      role: z.string(),
    });
    const expected = { company: 'Acme Inc.', role: 'Developer' };
    mockProvider.parse.mockResolvedValue({
      success: true,
      data: expected,
      tokens: { totalTokens: 30 },
    } as ParseResult<any>);

    const parser = new ResumeParser(mockProvider);
    const result = await parser.parseCustom(text, customSchema);

    expect(result.data).toEqual(expected);
    expect(mockProvider.parse).toHaveBeenCalledWith(text, customSchema, undefined);
  });
});