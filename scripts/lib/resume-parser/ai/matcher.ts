import fs from "node:fs/promises";
import path from "node:path";

import { createChatCompletion } from "../../ai/chat-client.ts";
import type { CandidateConfidence } from "../candidate-schema.ts";

export interface AiProjectMatchSuggestion {
  provider: string;
  model: string;
  selectedSlug: string | null;
  confidence: CandidateConfidence;
  reason: string;
}

interface AiMatcherResponse {
  selectedSlug?: string | null;
  confidence?: CandidateConfidence;
  reason?: string;
}

const PROMPT_PATH = path.resolve("scripts/lib/resume-parser/prompts/matcher.md");
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

function buildMatcherPrompt(input: {
  title: string;
  summary: string;
  highlights: string[];
  candidates: Array<{ slug: string; title: string; score: number }>;
}): string {
  const candidateLines = input.candidates.map((candidate, index) => (
    `${index + 1}. slug=${candidate.slug}; title=${candidate.title}; score=${candidate.score.toFixed(3)}`
  ));

  return [
    `候选项目标题：${input.title}`,
    `候选项目摘要：${input.summary}`,
    "候选项目亮点：",
    ...(input.highlights.length > 0 ? input.highlights.map((line) => `- ${line}`) : ["- <empty>"]),
    "",
    "可选参考项目：",
    ...candidateLines,
  ].join("\n");
}

export async function matchProjectWithAi(input: {
  title: string;
  summary: string;
  highlights: string[];
  candidates: Array<{ slug: string; title: string; score: number }>;
}): Promise<AiProjectMatchSuggestion> {
  const prompt = await loadPrompt();
  const completion = await createChatCompletion({
    task: "match_project",
    responseFormat: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: buildMatcherPrompt(input) },
    ],
  });

  const parsed = JSON.parse(completion.content) as AiMatcherResponse;
  const rawSelectedSlug = typeof parsed.selectedSlug === "string"
    ? parsed.selectedSlug.trim()
    : parsed.selectedSlug ?? null;
  const selectedSlug = rawSelectedSlug === "null" || rawSelectedSlug === "none" || rawSelectedSlug === ""
    ? null
    : rawSelectedSlug;
  if (selectedSlug && !input.candidates.some((candidate) => candidate.slug === selectedSlug)) {
    throw new Error(`AI matcher selected unknown slug: ${selectedSlug}`);
  }

  return {
    provider: completion.provider,
    model: completion.model,
    selectedSlug,
    confidence: normalizeConfidence(parsed.confidence),
    reason: typeof parsed.reason === "string" ? parsed.reason.trim() : "",
  };
}

