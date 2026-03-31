import fs from "node:fs/promises";
import path from "node:path";

import { createChatCompletion } from "../../ai/chat-client.ts";
import type {
  CandidateConfidence,
  ParsedCandidate,
  ProjectCandidateEntity,
} from "../candidate-schema.ts";

export interface AiStructureProject {
  title: string;
  bodyLineStart: number;
  bodyLineEnd: number;
  confidence: CandidateConfidence;
}

export interface AiStructureExperienceResult {
  experienceId: string;
  provider: string;
  model: string;
  projects: AiStructureProject[];
  applied: boolean;
  reason?: string;
}

export interface AiStructureEnhancementResult {
  enabled: boolean;
  used: boolean;
  attemptedExperienceIds: string[];
  appliedExperienceIds: string[];
  provider?: string;
  model?: string;
  warnings: string[];
  parserNotes: string[];
  rawResults: AiStructureExperienceResult[];
}

interface AiStructuralResponse {
  projects?: Array<{
    title?: string;
    bodyLineStart?: number;
    bodyLineEnd?: number;
    confidence?: CandidateConfidence;
  }>;
}

const PROMPT_PATH = path.resolve("scripts/lib/resume-parser/prompts/structural-parser.md");

let cachedPrompt: string | null = null;

async function loadPrompt(): Promise<string> {
  if (cachedPrompt) {
    return cachedPrompt;
  }

  cachedPrompt = await fs.readFile(PROMPT_PATH, "utf8");
  return cachedPrompt;
}

function shouldUseAiForExperience(experience: ParsedCandidate["entities"]["experiences"][number]): boolean {
  const bodyLength = experience.bodyLines.length;
  const labelCount = experience.bodyLines.filter((line) => /^项目(?:名称|介绍|角色|时间|难点|影响|一|二|三|四|五|六|七|八|九|十)?[：:]/.test(line)).length;
  return bodyLength >= 16 && labelCount >= 4;
}

function buildExperiencePrompt(experience: ParsedCandidate["entities"]["experiences"][number]): string {
  const numberedLines = experience.bodyLines
    .map((line, index) => `${index + 1}. ${line}`)
    .join("\n");

  return [
    `公司：${experience.company}`,
    `岗位：${experience.role}`,
    `时间：${experience.period}`,
    "",
    "请识别下面这段工作经历内部的项目块。",
    "只关心项目标题和每个项目覆盖的 body 行号范围。",
    "",
    numberedLines,
  ].join("\n");
}

function normalizeConfidence(value: string | undefined): CandidateConfidence {
  return value === "high" || value === "medium" || value === "low" ? value : "medium";
}

function validateAiProjects(
  experience: ParsedCandidate["entities"]["experiences"][number],
  response: AiStructuralResponse,
): AiStructureProject[] {
  const bodyLength = experience.bodyLines.length;
  const rawProjects = Array.isArray(response.projects) ? response.projects : [];
  const projects = rawProjects
    .map((project) => ({
      title: project.title?.trim() ?? "",
      bodyLineStart: Number(project.bodyLineStart),
      bodyLineEnd: Number(project.bodyLineEnd),
      confidence: normalizeConfidence(project.confidence),
    }))
    .filter((project) => project.title.length > 0)
    .filter((project) => Number.isInteger(project.bodyLineStart) && Number.isInteger(project.bodyLineEnd))
    .filter((project) => project.bodyLineStart >= 1 && project.bodyLineEnd >= project.bodyLineStart && project.bodyLineEnd <= bodyLength)
    .sort((left, right) => left.bodyLineStart - right.bodyLineStart);

  const deduped: AiStructureProject[] = [];
  for (const project of projects) {
    const previous = deduped[deduped.length - 1];
    if (previous && project.bodyLineStart <= previous.bodyLineEnd) {
      continue;
    }
    deduped.push(project);
  }

  return deduped;
}

function classifyProjectLines(lines: string[]): Pick<ProjectCandidateEntity, "summaryBlocks" | "workBlocks" | "impactBlocks" | "metricBlocks" | "linkBlocks"> {
  const summaryBlocks: ProjectCandidateEntity["summaryBlocks"] = [];
  const workBlocks: ProjectCandidateEntity["workBlocks"] = [];
  const impactBlocks: ProjectCandidateEntity["impactBlocks"] = [];
  const metricBlocks: ProjectCandidateEntity["metricBlocks"] = [];
  const linkBlocks: ProjectCandidateEntity["linkBlocks"] = [];

  let mode: "summary" | "work" | "impact" = "summary";

  for (let index = 0; index < lines.length; index += 1) {
    const text = lines[index]?.trim() ?? "";
    if (!text) {
      continue;
    }

    const lineStart = index + 1;
    if (/^项目(?:名称|[一二三四五六七八九十\d]+)?[：:]/.test(text)) {
      continue;
    }

    if (/^项目介绍[：:]/.test(text)) {
      mode = "summary";
      summaryBlocks.push({
        id: `summary-${lineStart}`,
        kind: "paragraph",
        lineStart,
        lineEnd: lineStart,
        rawLines: [text],
        text: text.replace(/^项目介绍[：:]\s*/, ""),
      });
      continue;
    }

    if (/^(主要工作|其他工作|项目性能优化工作)[：:]?/.test(text)) {
      mode = "work";
      const body = text.replace(/^(主要工作|其他工作|项目性能优化工作)[：:]?\s*/, "");
      if (body) {
        workBlocks.push({
          id: `work-${lineStart}`,
          kind: "bullet",
          lineStart,
          lineEnd: lineStart,
          rawLines: [text],
          text: body,
        });
      }
      continue;
    }

    if (/^(项目影响|影响)[：:]?/.test(text)) {
      mode = "impact";
      const body = text.replace(/^(项目影响|影响)[：:]?\s*/, "");
      if (body) {
        impactBlocks.push({
          id: `impact-${lineStart}`,
          kind: "paragraph",
          lineStart,
          lineEnd: lineStart,
          rawLines: [text],
          text: body,
        });
      }
      continue;
    }

    if (/^开源链接[：:]/.test(text) || /^https?:\/\//.test(text)) {
      const href = text.replace(/^开源链接[：:]\s*/, "");
      linkBlocks.push({
        id: `link-${lineStart}`,
        kind: "link",
        lineStart,
        lineEnd: lineStart,
        rawLines: [text],
        href,
        label: href,
      });
      continue;
    }

    for (const match of text.matchAll(/(\d+(?:\.\d+)?(?:%|亿|万|kw|k|w)\+?)/gi)) {
      metricBlocks.push({
        id: `metric-${lineStart}-${match.index ?? 0}`,
        kind: "metric",
        lineStart,
        lineEnd: lineStart,
        rawLines: [text],
        value: match[1],
        label: "detected",
      });
    }

    const blockId = `${mode}-${lineStart}`;
    if (mode === "work") {
      workBlocks.push({
        id: blockId,
        kind: "bullet",
        lineStart,
        lineEnd: lineStart,
        rawLines: [text],
        text,
      });
      continue;
    }

    if (mode === "impact") {
      impactBlocks.push({
        id: blockId,
        kind: "paragraph",
        lineStart,
        lineEnd: lineStart,
        rawLines: [text],
        text,
      });
      continue;
    }

    summaryBlocks.push({
      id: blockId,
      kind: "paragraph",
      lineStart,
      lineEnd: lineStart,
      rawLines: [text],
      text,
    });
  }

  return { summaryBlocks, workBlocks, impactBlocks, metricBlocks, linkBlocks };
}

function mergeAiProjectsIntoCandidate(
  candidate: ParsedCandidate,
  aiProjectsByExperienceId: Map<string, AiStructureProject[]>,
): ParsedCandidate {
  const experiences = candidate.entities.experiences.map((experience) => {
    const overrides = aiProjectsByExperienceId.get(experience.id);
    if (!overrides || overrides.length === 0) {
      return experience;
    }

    return {
      ...experience,
      projectIds: overrides.map((_, index) => `${experience.id}-ai-project-${index + 1}`),
    };
  });

  const projects: ProjectCandidateEntity[] = [];

  for (const experience of experiences) {
    const overrides = aiProjectsByExperienceId.get(experience.id);
    if (!overrides || overrides.length === 0) {
      projects.push(...candidate.entities.projects.filter((project) => project.experienceId === experience.id));
      continue;
    }

    for (let index = 0; index < overrides.length; index += 1) {
      const override = overrides[index];
      const slice = experience.bodyLines.slice(override.bodyLineStart - 1, override.bodyLineEnd);
      const classified = classifyProjectLines(slice);
      const lineStart = experience.lineStart + override.bodyLineStart;
      const lineEnd = experience.lineStart + override.bodyLineEnd;

      projects.push({
        id: `${experience.id}-ai-project-${index + 1}`,
        title: override.title,
        experienceId: experience.id,
        sectionType: experience.sectionType,
        lineStart,
        lineEnd,
        rawLines: slice,
        confidence: override.confidence,
        summaryBlocks: classified.summaryBlocks.map((block) => ({
          ...block,
          lineStart: lineStart + block.lineStart - 1,
          lineEnd: lineStart + block.lineEnd - 1,
        })),
        workBlocks: classified.workBlocks.map((block) => ({
          ...block,
          lineStart: lineStart + block.lineStart - 1,
          lineEnd: lineStart + block.lineEnd - 1,
        })),
        impactBlocks: classified.impactBlocks.map((block) => ({
          ...block,
          lineStart: lineStart + block.lineStart - 1,
          lineEnd: lineStart + block.lineEnd - 1,
        })),
        metricBlocks: classified.metricBlocks.map((block) => ({
          ...block,
          lineStart: lineStart + block.lineStart - 1,
          lineEnd: lineStart + block.lineEnd - 1,
        })),
        linkBlocks: classified.linkBlocks.map((block) => ({
          ...block,
          lineStart: lineStart + block.lineStart - 1,
          lineEnd: lineStart + block.lineEnd - 1,
        })),
      });
    }
  }

  return {
    ...candidate,
    entities: {
      ...candidate.entities,
      experiences,
      projects,
    },
  };
}

export async function enhanceCandidateWithAiStructure(candidate: ParsedCandidate): Promise<{
  candidate: ParsedCandidate;
  report: AiStructureEnhancementResult;
}> {
  const report: AiStructureEnhancementResult = {
    enabled: true,
    used: false,
    attemptedExperienceIds: [],
    appliedExperienceIds: [],
    provider: undefined,
    model: undefined,
    warnings: [],
    parserNotes: [],
    rawResults: [],
  };

  const prompt = await loadPrompt();
  const aiProjectsByExperienceId = new Map<string, AiStructureProject[]>();

  for (const experience of candidate.entities.experiences) {
    if (!shouldUseAiForExperience(experience)) {
      continue;
    }

    report.attemptedExperienceIds.push(experience.id);

    try {
      const completion = await createChatCompletion({
        task: "structural_parse",
        responseFormat: { type: "json_object" },
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: buildExperiencePrompt(experience) },
        ],
      });

      report.used = true;
      report.provider = completion.provider;
      report.model = completion.model;

      const parsed = JSON.parse(completion.content) as AiStructuralResponse;
      const projects = validateAiProjects(experience, parsed);
      const applied = projects.length > 0;

      report.rawResults.push({
        experienceId: experience.id,
        provider: completion.provider,
        model: completion.model,
        projects,
        applied,
        reason: applied ? "ai-override-applied" : "ai-returned-no-valid-projects",
      });

      if (!applied) {
        report.warnings.push(`AI structural parser returned no valid projects for ${experience.company}.`);
        continue;
      }

      aiProjectsByExperienceId.set(experience.id, projects);
      report.appliedExperienceIds.push(experience.id);
      report.parserNotes.push(`AI structural parser applied to ${experience.company} (${experience.id}) with ${projects.length} project blocks.`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      report.warnings.push(`AI structural parser failed for ${experience.company} (${experience.id}): ${reason}`);
      report.rawResults.push({
        experienceId: experience.id,
        provider: report.provider ?? "unknown",
        model: report.model ?? "unknown",
        projects: [],
        applied: false,
        reason,
      });
    }
  }

  const nextCandidate = aiProjectsByExperienceId.size === 0
    ? {
      ...candidate,
      diagnostics: {
        ...candidate.diagnostics,
        warnings: [...candidate.diagnostics.warnings, ...report.warnings],
        parserNotes: [...candidate.diagnostics.parserNotes, ...report.parserNotes],
      },
    }
    : mergeAiProjectsIntoCandidate(candidate, aiProjectsByExperienceId);

  if (aiProjectsByExperienceId.size > 0) {
    nextCandidate.diagnostics.warnings.push(...report.warnings);
    nextCandidate.diagnostics.parserNotes.push(...report.parserNotes);
  }

  return {
    candidate: nextCandidate,
    report,
  };
}
