import fs from "node:fs/promises";
import path from "node:path";

import { createChatCompletion } from "../../ai/chat-client.ts";
import type { CandidateConfidence, ProjectCandidateEntity } from "../candidate-schema.ts";

export interface AiProjectFieldSummary {
  provider: string;
  model: string;
  summary: string;
  highlights: string[];
  tags: string[];
  metrics: Array<{ value: string; label: string }>;
  confidence: CandidateConfidence;
}

interface AiSummaryResponse {
  summary?: string;
  highlights?: string[];
  tags?: string[];
  metrics?: Array<{ value?: string; label?: string }>;
  confidence?: CandidateConfidence;
}

const PROMPT_PATH = path.resolve("scripts/lib/resume-parser/prompts/summarizer.md");
let cachedPrompt: string | null = null;

async function loadPrompt(): Promise<string> {
  if (cachedPrompt) {
    return cachedPrompt;
  }

  cachedPrompt = await fs.readFile(PROMPT_PATH, "utf8");
  return cachedPrompt;
}

function normalizeConfidence(value: string | undefined): CandidateConfidence {
  return value === "high" || value === "medium" || value === "low" ? value : "medium";
}

function normalizeStringArray(values: unknown, maxItems: number): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeMetrics(values: unknown): Array<{ value: string; label: string }> {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => ({
      value: typeof item?.value === "string" ? item.value.trim() : "",
      label: typeof item?.label === "string" ? item.label.trim() : "",
    }))
    .filter((item) => item.value && item.label)
    .slice(0, 6);
}

function buildProjectPrompt(project: ProjectCandidateEntity, company: string, role: string, period: string): string {
  const summaryLines = project.summaryBlocks.map((block) => block.text);
  const workLines = project.workBlocks.map((block) => block.text);
  const impactLines = project.impactBlocks.map((block) => block.text);
  const metricLines = project.metricBlocks.map((block) => `${block.label}: ${block.value}`);

  return [
    `公司：${company}`,
    `岗位：${role}`,
    `经历时间：${period}`,
    `项目标题：${project.title}`,
    "",
    "项目介绍：",
    ...(summaryLines.length > 0 ? summaryLines : ["<empty>"]),
    "",
    "主要工作：",
    ...(workLines.length > 0 ? workLines : ["<empty>"]),
    "",
    "项目影响：",
    ...(impactLines.length > 0 ? impactLines : ["<empty>"]),
    "",
    "已有指标：",
    ...(metricLines.length > 0 ? metricLines : ["<empty>"]),
  ].join("\n");
}

export async function summarizeProjectFieldsWithAi(input: {
  project: ProjectCandidateEntity;
  company: string;
  role: string;
  period: string;
}): Promise<AiProjectFieldSummary> {
  const prompt = await loadPrompt();
  const completion = await createChatCompletion({
    task: "summarize_project",
    responseFormat: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: buildProjectPrompt(input.project, input.company, input.role, input.period) },
    ],
  });

  const parsed = JSON.parse(completion.content) as AiSummaryResponse;
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const highlights = normalizeStringArray(parsed.highlights, 4);
  const tags = normalizeStringArray(parsed.tags, 6);
  const metrics = normalizeMetrics(parsed.metrics);

  if (!summary) {
    throw new Error("AI summarizer returned empty summary.");
  }

  return {
    provider: completion.provider,
    model: completion.model,
    summary,
    highlights,
    tags,
    metrics,
    confidence: normalizeConfidence(parsed.confidence),
  };
}
