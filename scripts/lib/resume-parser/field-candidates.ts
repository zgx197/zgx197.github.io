import type { CandidateConfidence, ParsedCandidate, ProjectCandidateEntity } from "./candidate-schema.ts";
import type { CandidateValidationReport } from "./candidate-validation.ts";
import { summarizeProjectFieldsWithAi } from "./ai/summarizer.ts";
import { matchProjectWithAi } from "./ai/matcher.ts";
import { listProjectReferences } from "../resume-mapper/project-index.ts";

export const FIELD_CANDIDATES_SCHEMA_VERSION = "field-candidates@v1" as const;

export interface FieldCandidateText {
  text: string;
  source: "deterministic" | "ai";
  confidence: CandidateConfidence;
}

export interface FieldCandidateMetric {
  value: string;
  label: string;
  source: "deterministic" | "ai";
  confidence: CandidateConfidence;
}

export interface FieldCandidateMatchOption {
  slug: string;
  title: string;
  score: number;
  confidence: CandidateConfidence;
}

export interface FieldCandidateMatch {
  selectedSlug: string | null;
  selectedTitle?: string;
  source: "deterministic" | "ai" | "none";
  confidence: CandidateConfidence;
  score?: number;
  rationale?: string;
  options: FieldCandidateMatchOption[];
}

export interface ProjectFieldCandidate {
  projectId: string;
  experienceId: string;
  company: string;
  title: string;
  summary: FieldCandidateText;
  highlights: FieldCandidateText[];
  tags: Array<{ tag: string; source: "deterministic" | "ai"; confidence: CandidateConfidence }>;
  metrics: FieldCandidateMetric[];
  match: FieldCandidateMatch;
  warnings: string[];
  skipped: boolean;
  skipReason?: string;
}

export interface FieldCandidatesReport {
  schemaVersion: "field-candidates@v1";
  generatedAt: string;
  sourcePath: string;
  candidatePath?: string;
  validationPath?: string;
  gate: {
    allowed: boolean;
    reason?: string;
    errorCount: number;
    warningCount: number;
    reviewExperienceIds: string[];
  };
  ai: {
    enabled: boolean;
    used: boolean;
    warnings: string[];
    summarizerProvider?: string;
    summarizerModel?: string;
    matcherProvider?: string;
    matcherModel?: string;
  };
  projectCount: number;
  matchedProjectCount: number;
  projects: ProjectFieldCandidate[];
}

export interface BuildFieldCandidatesOptions {
  useAiFields?: boolean;
  candidatePath?: string;
  validationPath?: string;
  generatedAt?: string;
}

interface ProjectNarrative {
  summaryLines: string[];
  workLines: string[];
  impactLines: string[];
  mergedText: string;
}

const TAG_RULES: Array<{ tag: string; patterns: RegExp[] }> = [
  { tag: "Unity", patterns: [/unity/i, /u3d/i] },
  { tag: "Editor Tooling", patterns: [/编辑器/, /工作台/, /tool/i] },
  { tag: "Blueprint", patterns: [/蓝图/, /blueprint/i] },
  { tag: "Frame Sync", patterns: [/帧同步/, /framesync/i] },
  { tag: "Gameplay", patterns: [/技能/, /战斗/, /玩法/] },
  { tag: "AI", patterns: [/\bai\b/i, /大模型/, /agent/i] },
  { tag: "DSL", patterns: [/\bdsl\b/i, /代码生成/, /importer/i] },
  { tag: "Procedural Generation", patterns: [/程序化/, /perlin/i, /hex-grid/i] },
  { tag: "Performance", patterns: [/性能/, /对象池/, /lod/i, /protobuf/i] },
  { tag: "Knowledge Graph", patterns: [/知识库/, /知识图谱/, /百科/] },
  { tag: "NLP", patterns: [/nlp/i, /短文本/, /分类模型/, /召回/] },
  { tag: "Data Pipeline", patterns: [/airflow/i, /数据流/, /更新流水线/] },
];

const TAG_NORMALIZATION_RULES: Array<{ patterns: RegExp[]; normalized: string }> = [
  { patterns: [/^unity开发$/i, /^u3d游戏开发$/i], normalized: "Unity" },
  { patterns: [/^技能系统$/i], normalized: "Gameplay" },
  { patterns: [/^蓝图制作$/i], normalized: "Blueprint" },
  { patterns: [/^代码生成$/i], normalized: "DSL" },
  { patterns: [/^场景设计$/i], normalized: "Editor Tooling" },
  { patterns: [/^可视化编辑$/i, /^时间轴编排$/i], normalized: "Editor Tooling" },
  { patterns: [/^性能优化$/i], normalized: "Performance" },
  { patterns: [/^程序化生成$/i], normalized: "Procedural Generation" },
  { patterns: [/^知识表征$/i, /^知识挖掘$/i, /^知识库关联$/i], normalized: "Knowledge Graph" },
  { patterns: [/^文本理解$/i, /^分类模型$/i, /^实体识别$/i], normalized: "NLP" },
  { patterns: [/^数据流搭建$/i], normalized: "Data Pipeline" },
];

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, "")
    .replace(/[，。；：、“”"'`‘’（）()\[\]【】\-_/\\|·,.!?！？]/g, "")
    .toLowerCase();
}

function normalizeTagValue(tag: string): string {
  const compact = tag.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "";
  }

  for (const rule of TAG_NORMALIZATION_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(compact))) {
      return rule.normalized;
    }
  }

  return compact;
}

function finalizeTags<T extends { tag: string; source: "deterministic" | "ai"; confidence: CandidateConfidence }>(
  tags: T[],
): T[] {
  const normalized = new Map<string, T>();

  for (const item of tags) {
    const tag = normalizeTagValue(item.tag);
    const key = normalizeText(tag);
    if (!tag || !key) {
      continue;
    }
    if (!normalized.has(key)) {
      normalized.set(key, {
        ...item,
        tag,
      });
    }
  }

  return [...normalized.values()].slice(0, 6);
}

function charBigrams(text: string): Set<string> {
  const normalized = normalizeText(text);
  const grams = new Set<string>();
  if (normalized.length < 2) {
    if (normalized) {
      grams.add(normalized);
    }
    return grams;
  }

  for (let index = 0; index < normalized.length - 1; index += 1) {
    grams.add(normalized.slice(index, index + 2));
  }
  return grams;
}

function jaccardSimilarity(left: string, right: string): number {
  const leftSet = charBigrams(left);
  const rightSet = charBigrams(right);
  if (leftSet.size === 0 || rightSet.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const gram of leftSet) {
    if (rightSet.has(gram)) {
      intersection += 1;
    }
  }

  const union = leftSet.size + rightSet.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function longestCommonSubstringRatio(left: string, right: string): number {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) {
    return 0;
  }

  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  let longest = 0;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] !== b[j - 1]) {
        continue;
      }
      dp[i][j] = dp[i - 1][j - 1] + 1;
      longest = Math.max(longest, dp[i][j]);
    }
  }

  return longest / Math.min(a.length, b.length);
}

function isLowSignalHighlightLine(line: string): boolean {
  return /^(整体设计|具体模块|主要工作|其他工作|项目影响|项目性能优化工作)[：:]?$/.test(line.trim());
}

function isBoundaryLine(text: string): boolean {
  const line = text.trim();
  return !line
    || /^项目(?:名称|介绍|角色|时间|难点|影响|性能优化工作|[一二三四五六七八九十\d]+)?[：:]/.test(line)
    || /^(主要工作|其他工作|工作内容|整体设计|具体模块|开源链接)[：:]/.test(line)
    || /^\d{4}[./]\d{2}\s*[-–]\s*(?:\d{4}[./]\d{2}|至今)/.test(line)
    || /^https?:\/\//.test(line);
}

function shouldMergeWrappedLine(previous: string, next: string): boolean {
  const prev = previous.trim();
  const after = next.trim();
  if (!prev || !after) {
    return false;
  }
  if (isBoundaryLine(prev) || isBoundaryLine(after)) {
    return false;
  }
  if (/[。！？.!?；;：:]$/.test(prev)) {
    return false;
  }
  if (/^[1-9]\d*[.)、]/.test(after)) {
    return false;
  }
  return true;
}

function mergeWrappedLines(lines: string[]): string[] {
  const merged: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const previous = merged[merged.length - 1];
    if (previous && shouldMergeWrappedLine(previous, line)) {
      merged[merged.length - 1] = `${previous}${line}`;
      continue;
    }

    merged.push(line);
  }

  return merged;
}

function collectNarrative(project: ProjectCandidateEntity): ProjectNarrative {
  const summaryLines = mergeWrappedLines(project.summaryBlocks.map((block) => block.text));
  const workLines = mergeWrappedLines(project.workBlocks.map((block) => block.text));
  const impactLines = mergeWrappedLines(project.impactBlocks.map((block) => block.text));
  return {
    summaryLines,
    workLines,
    impactLines,
    mergedText: [...summaryLines, ...workLines, ...impactLines].join("\n"),
  };
}

function clampText(text: string, maxLength: number): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, maxLength - 1).trim()}…`;
}

function buildDeterministicSummary(project: ProjectCandidateEntity, narrative: ProjectNarrative): FieldCandidateText {
  const base = narrative.summaryLines[0] ?? narrative.workLines[0] ?? project.rawLines[0] ?? project.title;
  const text = base.includes(project.title) ? base : `${project.title}：${base}`;
  return {
    text: clampText(text, 110),
    source: "deterministic",
    confidence: narrative.summaryLines.length > 0 ? "high" : "medium",
  };
}

function buildDeterministicHighlights(narrative: ProjectNarrative): FieldCandidateText[] {
  return narrative.workLines
    .filter((line) => !isLowSignalHighlightLine(line))
    .slice(0, 4)
    .map((line, index) => ({
      text: clampText(line, index === 0 ? 100 : 90),
      source: "deterministic",
      confidence: "medium",
    }));
}

function buildDeterministicMetrics(project: ProjectCandidateEntity, narrative: ProjectNarrative): FieldCandidateMetric[] {
  const metrics = new Map<string, FieldCandidateMetric>();
  const seenValues = new Set<string>();

  for (const metric of project.metricBlocks) {
    const key = `${metric.value}|${metric.label}`;
    metrics.set(key, {
      value: metric.value,
      label: metric.label,
      source: "deterministic",
      confidence: "high",
    });
    seenValues.add(metric.value);
  }

  const mergedLines = [...narrative.summaryLines, ...narrative.workLines, ...narrative.impactLines];
  for (const line of mergedLines) {
    const matches = Array.from(line.matchAll(/(\d+(?:\.\d+)?(?:%|亿|万|kw|k|w)\+?)/gi));
    for (const match of matches) {
      const value = match[1];
      const key = `${value}|detected`;
      if (!metrics.has(key) && !seenValues.has(value)) {
        metrics.set(key, {
          value,
          label: /准确|召回|命中|覆盖|压缩|提升/.test(line) ? "effect" : "detected",
          source: "deterministic",
          confidence: "medium",
        });
        seenValues.add(value);
      }
    }
  }

  return [...metrics.values()].slice(0, 6);
}

function buildDeterministicTags(project: ProjectCandidateEntity, narrative: ProjectNarrative): Array<{ tag: string; source: "deterministic"; confidence: CandidateConfidence }> {
  const text = `${project.title}\n${narrative.mergedText}`;
  const tags = TAG_RULES
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(text)))
    .slice(0, 6)
    .map((rule) => ({
      tag: rule.tag,
      source: "deterministic" as const,
      confidence: "medium" as CandidateConfidence,
    }));

  return finalizeTags(tags);
}

function toMatchConfidence(score: number): CandidateConfidence {
  if (score >= 0.9) {
    return "high";
  }
  if (score >= 0.65) {
    return "medium";
  }
  return "low";
}

async function rankProjectMatches(project: ProjectCandidateEntity, summary: string, highlights: string[]): Promise<FieldCandidateMatchOption[]> {
  const references = await listProjectReferences();
  const candidateText = `${project.title}\n${summary}\n${highlights.join("\n")}`;

  return references
    .map((reference) => {
      const normalizedTitle = normalizeText(project.title);
      const normalizedReferenceTitle = normalizeText(reference.title);
      let titleScore = jaccardSimilarity(project.title, reference.title);
      const lcsScore = longestCommonSubstringRatio(project.title, reference.title);
      if (normalizedTitle === normalizedReferenceTitle) {
        titleScore = 1;
      } else if (normalizedReferenceTitle.includes(normalizedTitle) || normalizedTitle.includes(normalizedReferenceTitle)) {
        titleScore = Math.max(titleScore, 0.9);
      } else if (lcsScore >= 0.55) {
        titleScore = Math.max(titleScore, lcsScore * 0.88);
      }

      const bodyScore = jaccardSimilarity(candidateText, reference.searchText);
      const score = Number((titleScore * 0.72 + bodyScore * 0.28).toFixed(3));
      return {
        slug: reference.slug,
        title: reference.title,
        score,
        confidence: toMatchConfidence(score),
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

function chooseDeterministicMatch(options: FieldCandidateMatchOption[]): FieldCandidateMatch {
  const top = options[0];
  if (!top || top.score < 0.65) {
    return {
      selectedSlug: null,
      source: "none",
      confidence: top?.confidence ?? "low",
      options,
    };
  }

  return {
    selectedSlug: top.slug,
    selectedTitle: top.title,
    source: "deterministic",
    confidence: top.confidence,
    score: top.score,
    rationale: top.score >= 0.92 ? "title-exact-or-near-exact" : "semantic-overlap",
    options,
  };
}

function findExperience(candidate: ParsedCandidate, experienceId: string) {
  return candidate.entities.experiences.find((experience) => experience.id === experienceId);
}

export async function buildFieldCandidatesReport(
  candidate: ParsedCandidate,
  validationReport: CandidateValidationReport,
  options: BuildFieldCandidatesOptions = {},
): Promise<FieldCandidatesReport> {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const reviewExperienceIds = validationReport.experiences
    .filter((experience) => experience.status === "review")
    .map((experience) => experience.experienceId);
  const gateAllowed = validationReport.stats.errorCount === 0;
  const report: FieldCandidatesReport = {
    schemaVersion: FIELD_CANDIDATES_SCHEMA_VERSION,
    generatedAt,
    sourcePath: candidate.documentMeta.sourcePath,
    candidatePath: options.candidatePath,
    validationPath: options.validationPath,
    gate: {
      allowed: gateAllowed,
      reason: gateAllowed ? undefined : "candidate-validation-report contains blocking errors",
      errorCount: validationReport.stats.errorCount,
      warningCount: validationReport.stats.warningCount,
      reviewExperienceIds,
    },
    ai: {
      enabled: Boolean(options.useAiFields),
      used: false,
      warnings: [],
    },
    projectCount: candidate.entities.projects.length,
    matchedProjectCount: 0,
    projects: [],
  };

  if (!gateAllowed) {
    return report;
  }

  for (const project of candidate.entities.projects) {
    const experience = findExperience(candidate, project.experienceId);
    const company = experience?.company ?? "未知公司";
    const role = experience?.role ?? "未知岗位";
    const period = experience?.period ?? "未知时间";
    const narrative = collectNarrative(project);
    const warnings: string[] = [];

    const summary = buildDeterministicSummary(project, narrative);
    const highlights = buildDeterministicHighlights(narrative);
    const tags = buildDeterministicTags(project, narrative);
    const metrics = buildDeterministicMetrics(project, narrative);
    let match = chooseDeterministicMatch(await rankProjectMatches(project, summary.text, highlights.map((item) => item.text)));

    const isReviewExperience = reviewExperienceIds.includes(project.experienceId);
    if (isReviewExperience) {
      report.projects.push({
        projectId: project.id,
        experienceId: project.experienceId,
        company,
        title: project.title,
        summary,
        highlights,
        tags,
        metrics,
        match,
        warnings,
        skipped: true,
        skipReason: "parent experience is marked for review by candidate validation",
      });
      continue;
    }

    let nextSummary = summary;
    let nextHighlights = highlights;
    let nextTags = tags;
    let nextMetrics = metrics;

    if (options.useAiFields) {
      try {
        const aiSummary = await summarizeProjectFieldsWithAi({
          project,
          company,
          role,
          period,
        });

        report.ai.used = true;
        report.ai.summarizerProvider = aiSummary.provider;
        report.ai.summarizerModel = aiSummary.model;
        nextSummary = {
          text: clampText(aiSummary.summary, 110),
          source: "ai",
          confidence: aiSummary.confidence,
        };
        if (aiSummary.highlights.length > 0) {
          nextHighlights = aiSummary.highlights.map((text) => ({
            text: clampText(text, 100),
            source: "ai",
            confidence: aiSummary.confidence,
          }));
        }
        if (aiSummary.tags.length > 0) {
          nextTags = finalizeTags(aiSummary.tags.map((tag) => ({ tag, source: "ai" as const, confidence: aiSummary.confidence })));
        }
        if (aiSummary.metrics.length > 0) {
          nextMetrics = aiSummary.metrics.map((metric) => ({
            ...metric,
            source: "ai" as const,
            confidence: aiSummary.confidence,
          }));
        }
      } catch (error) {
        warnings.push(error instanceof Error ? error.message : String(error));
        report.ai.warnings.push(`summarize_project failed for ${project.title}: ${warnings[warnings.length - 1]}`);
      }
    }

    if (options.useAiFields && match.confidence !== "high") {
      try {
        const aiMatch = await matchProjectWithAi({
          title: project.title,
          summary: nextSummary.text,
          highlights: nextHighlights.map((item) => item.text),
          candidates: match.options.map((option) => ({
            slug: option.slug,
            title: option.title,
            score: option.score,
          })),
        });
        report.ai.used = true;
        report.ai.matcherProvider = aiMatch.provider;
        report.ai.matcherModel = aiMatch.model;
        if (aiMatch.selectedSlug) {
          const selected = match.options.find((option) => option.slug === aiMatch.selectedSlug);
          if (!selected) {
            warnings.push(`AI matcher selected unknown slug ${aiMatch.selectedSlug} for ${project.title}.`);
          } else if (selected.score < 0.4) {
            warnings.push(`AI matcher selected low-score slug ${aiMatch.selectedSlug} for ${project.title}.`);
          } else {
            match = {
              selectedSlug: aiMatch.selectedSlug,
              selectedTitle: selected.title,
              source: "ai",
              confidence: aiMatch.confidence,
              score: selected.score,
              rationale: aiMatch.reason,
              options: match.options,
            };
          }
        }
      } catch (error) {
        warnings.push(error instanceof Error ? error.message : String(error));
        report.ai.warnings.push(`match_project failed for ${project.title}: ${warnings[warnings.length - 1]}`);
      }
    }

    report.projects.push({
      projectId: project.id,
      experienceId: project.experienceId,
      company,
      title: project.title,
      summary: nextSummary,
      highlights: nextHighlights,
      tags: nextTags,
      metrics: nextMetrics,
      match,
      warnings,
      skipped: false,
    });
  }

  report.matchedProjectCount = report.projects.filter((project) => project.match.selectedSlug).length;
  return report;
}








