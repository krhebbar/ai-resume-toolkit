/**
 * Resume JSON Schema
 *
 * Type-safe Zod schema for structured resume data extraction using LLMs.
 * This schema defines the complete structure of a parsed resume.
 *
 * @module schema
 */

import { z } from "zod";

/**
 * Complete resume schema with all standard sections
 */
export const resumeSchema = z.object({
  /**
   * Basic information about the candidate
   */
  basics: z.object({
    currentJobTitle: z
      .string()
      .describe("Current job title from the most recent position"),
    currentCompany: z
      .string()
      .describe("Current company from the most recent position"),
    firstName: z.string().describe("Candidate's first name"),
    lastName: z.string().describe("Candidate's last name"),
    email: z.string().nullable().describe("Email address"),
    phone: z.string().nullable().describe("Phone number"),
    linkedIn: z.string().nullable().describe("LinkedIn profile URL"),
    social: z.array(z.string()).describe("Other social media profiles/URLs"),
    location: z
      .string()
      .nullable()
      .describe("Current location or preferred work location"),
  }),

  /**
   * Technical and professional skills
   */
  skills: z
    .array(z.string())
    .describe("List of technical skills, tools, and technologies"),

  /**
   * Work experience and positions
   */
  positions: z.array(
    z.object({
      org: z.string().describe("Company or organization name"),
      title: z.string().describe("Job title"),
      summary: z.string().describe("Brief description of responsibilities and achievements"),
      location: z.string().describe("Job location"),
      level: z
        .enum([
          "Fresher-level",
          "Associate-level",
          "Mid-level",
          "Senior-level",
          "Executive-level",
        ])
        .describe("Seniority level of the position"),
      start: z.object({
        year: z.number().nullable().describe("Start year"),
        month: z.number().nullable().describe("Start month (1-12)"),
      }),
      end: z.object({
        year: z.number().nullable().describe("End year (null if current)"),
        month: z.number().nullable().describe("End month (1-12, null if current)"),
      }),
    })
  ),

  /**
   * Notable projects
   */
  projects: z.array(
    z.object({
      title: z.string().describe("Project name"),
      summary: z.string().describe("Project description and achievements"),
    })
  ),

  /**
   * Educational background
   */
  schools: z.array(
    z.object({
      institution: z.string().describe("School or university name"),
      degree: z.string().describe("Degree type (e.g., Bachelor's, Master's)"),
      field: z.string().describe("Field of study or major"),
      gpa: z.number().nullable().describe("GPA if available"),
      start: z.object({
        year: z.number().nullable(),
        month: z.number().nullable(),
      }),
      end: z.object({
        year: z.number().nullable(),
        month: z.number().nullable(),
      }),
    })
  ),

  /**
   * Languages spoken
   */
  languages: z.array(z.string()).describe("Languages with proficiency levels"),

  /**
   * Professional certificates and certifications
   */
  certificates: z.array(z.string()).describe("Certifications and licenses"),
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type Resume = z.infer<typeof resumeSchema>;

/**
 * Simplified schema for basic resume parsing (subset of full schema)
 */
export const basicResumeSchema = z.object({
  basics: resumeSchema.shape.basics,
  skills: resumeSchema.shape.skills,
  positions: resumeSchema.shape.positions,
  schools: resumeSchema.shape.schools,
});

export type BasicResume = z.infer<typeof basicResumeSchema>;

/**
 * Schema for job description parsing
 */
export const jobDescriptionSchema = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company name"),
  location: z.string().describe("Job location"),
  type: z
    .enum(["Full-time", "Part-time", "Contract", "Internship", "Temporary"])
    .describe("Employment type"),

  requirements: z.object({
    required: z.array(z.string()).describe("Required skills and qualifications"),
    preferred: z.array(z.string()).describe("Preferred/nice-to-have skills"),
    experience: z.object({
      min: z.number().nullable().describe("Minimum years of experience"),
      max: z.number().nullable().describe("Maximum years of experience"),
    }),
    education: z.string().nullable().describe("Required education level"),
  }),

  responsibilities: z.array(z.string()).describe("Key job responsibilities"),

  benefits: z.array(z.string()).describe("Benefits and perks"),

  salary: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
    currency: z.string().nullable(),
  }).nullable(),
});

export type JobDescription = z.infer<typeof jobDescriptionSchema>;
