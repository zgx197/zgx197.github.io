import type { ParsedCandidate } from "./candidate-schema.ts";
import type { AiStructureEnhancementResult } from "./ai/structural-parser.ts";

export interface StructureReport {
  schemaVersion: "structure-report@v1";
  generatedAt: string;
  sourcePath: string;
  sectionCount: number;
  experienceCount: number;
  projectCount: number;
  warningCount: number;
  lowConfidenceCount: number;
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    period: string;
    projectCount: number;
    projectIds: string[];
    projectTitles: string[];
  }>;
  ai: {
    enabled: boolean;
    used: boolean;
    provider?: string;
    model?: string;
    attemptedExperienceIds: string[];
    appliedExperienceIds: string[];
    warnings: string[];
    results: Array<{
      experienceId: string;
      applied: boolean;
      reason?: string;
      projectCount: number;
      projects: Array<{
        title: string;
        bodyLineStart: number;
        bodyLineEnd: number;
        confidence: "low" | "medium" | "high";
      }>;
    }>;
  };
}

export function buildStructureReport(
  candidate: ParsedCandidate,
  aiReport?: AiStructureEnhancementResult | null,
): StructureReport {
  return {
    schemaVersion: "structure-report@v1",
    generatedAt: new Date().toISOString(),
    sourcePath: candidate.documentMeta.sourcePath,
    sectionCount: candidate.sections.length,
    experienceCount: candidate.entities.experiences.length,
    projectCount: candidate.entities.projects.length,
    warningCount: candidate.diagnostics.warnings.length,
    lowConfidenceCount: candidate.diagnostics.lowConfidenceItems.length,
    experiences: candidate.entities.experiences.map((experience) => ({
      id: experience.id,
      company: experience.company,
      role: experience.role,
      period: experience.period,
      projectCount: experience.projectIds.length,
      projectIds: experience.projectIds,
      projectTitles: candidate.entities.projects
        .filter((project) => project.experienceId === experience.id)
        .map((project) => project.title),
    })),
    ai: {
      enabled: Boolean(aiReport),
      used: aiReport?.used ?? false,
      provider: aiReport?.provider,
      model: aiReport?.model,
      attemptedExperienceIds: aiReport?.attemptedExperienceIds ?? [],
      appliedExperienceIds: aiReport?.appliedExperienceIds ?? [],
      warnings: aiReport?.warnings ?? [],
      results: aiReport?.rawResults.map((result) => ({
        experienceId: result.experienceId,
        applied: result.applied,
        reason: result.reason,
        projectCount: result.projects.length,
        projects: result.projects,
      })) ?? [],
    },
  };
}
