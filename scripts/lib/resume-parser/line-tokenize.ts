import type { CandidateSourceType, ParsedCandidateSectionType } from "./candidate-schema.ts";

export const NOISE_LINES = new Set(["社交主页", "个人优势", "荣誉奖项", "教育经历"]);

export interface ResumeLineToken {
  lineNumber: number;
  raw: string;
  text: string;
  compactText: string;
  indent: number;
  sourceTypeHint: CandidateSourceType;
  sectionHeadingType?: ParsedCandidateSectionType;
  isNoise: boolean;
  isLink: boolean;
  isExperienceHeader: boolean;
  isProjectStart: boolean;
  isBulletLike: boolean;
}

const SECTION_HEADINGS: Record<string, ParsedCandidateSectionType> = {
  个人优势: "strengths",
  工作经历: "experiences",
  实习经历: "internship",
  荣誉奖项: "honors",
  教育经历: "education",
};

export function compactSentence(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeResumeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/ﬁ/g, "fi")
    .replace(/ﬀ/g, "ff")
    .replace(/buﬀ/g, "buff")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeStem(value: string): string {
  return value.replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "resume";
}

export function detectSectionHeadingType(line: string): ParsedCandidateSectionType | undefined {
  return SECTION_HEADINGS[compactSentence(line)];
}

export function isNoiseLine(line: string): boolean {
  return NOISE_LINES.has(compactSentence(line));
}

export function isLabelOnlyLine(line: string): boolean {
  return /^[^：:\s]{2,24}[：:]$/.test(compactSentence(line));
}

export function matchInlineLabel(line: string): RegExpMatchArray | null {
  return compactSentence(line).match(/^([^：:]{2,24})[：:]\s*(.+)$/);
}

export function isLinkLine(line: string): boolean {
  return /^https?:\/\//.test(compactSentence(line));
}

function isLikelyNameLine(line: string): boolean {
  return /^[^\dA-Za-z@:/|（）() ]{2,8}$/u.test(compactSentence(line));
}

export function isExperienceHeader(line: string): boolean {
  const normalized = compactSentence(line);
  return /\d{4}[./]\d{2}\s*[-–]\s*(?:\d{4}[./]\d{2}|至今)/.test(normalized)
    && !normalized.startsWith("项目")
    && !normalized.includes("项目时间")
    && !normalized.includes("求职意向")
    && !normalized.includes("https://")
    && !normalized.includes("开源链接")
    && !normalized.includes("本科")
    && normalized.length <= 120;
}

export function parseExperienceHeader(line: string): { company: string; role: string; period: string } {
  const rawLine = line.trim();
  const periodMatch = rawLine.match(/(\d{4}[./]\d{2}\s*[-–]\s*(?:\d{4}[./]\d{2}|至今))/);
  const period = periodMatch ? compactSentence(periodMatch[1]).replace(/[–]/g, "-") : "待补充";
  const prefix = rawLine.replace(periodMatch?.[1] ?? "", "").trim();
  const parts = prefix.split(/\s{2,}|\t+/).map((item) => item.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return {
      company: parts[0],
      role: parts[1],
      period,
    };
  }

  const fallback = compactSentence(prefix).match(/^(.+?)\s+([^\s]+)$/);
  return {
    company: parts[0] ?? fallback?.[1] ?? compactSentence(prefix),
    role: parts[1] ?? fallback?.[2] ?? "待补充岗位",
    period,
  };
}

export function isStandaloneProjectTitle(line: string): boolean {
  const compactLine = compactSentence(line);
  return compactLine.length > 0
    && compactLine.length <= 48
    && !compactLine.includes("：")
    && !isNoiseLine(compactLine)
    && !isExperienceHeader(compactLine)
    && /(项目|系统|游戏|框架|工具|平台|桌宠|脱壳|蓝图)/.test(compactLine);
}

export function extractProjectTitle(line: string): string | undefined {
  const compactLine = compactSentence(line);
  const explicit = compactLine.match(/^项目(?:名称|[一二三四五六七八九十\d]+)?[：:]\s*(.+)$/);
  if (explicit?.[1]) {
    return explicit[1].trim();
  }

  if (isStandaloneProjectTitle(compactLine)) {
    return compactLine;
  }

  return undefined;
}

export function isProjectStart(lines: string[], index: number): boolean {
  const current = compactSentence(lines[index] ?? "");
  const next = compactSentence(lines[index + 1] ?? "");

  if (!current) {
    return false;
  }

  if (/^项目(?:名称|[一二三四五六七八九十\d]+)?[：:]/.test(current)) {
    return true;
  }

  return isStandaloneProjectTitle(current) && (/^项目介绍[：:]/.test(next) || /^开源链接[：:]/.test(next));
}

export function isBulletLikeLine(line: string): boolean {
  const compactLine = compactSentence(line);
  return /^\d+\.\s*/.test(compactLine)
    || /^[-*•]\s+/.test(compactLine)
    || /^项目(?:介绍|角色|时间|难点|影响|性能优化工作|名称|一|二|三|四|五|六|七|八|九|十)?[：:]/.test(compactLine)
    || /^主要工作[：:]?$/.test(compactLine)
    || /^其他工作[：:]?$/.test(compactLine);
}

function looksLikeStandaloneBulletLabel(label: string): boolean {
  return label.length <= 8;
}

function isTailBoundaryLine(line: string): boolean {
  const compactLine = compactSentence(line);
  return /^\d{4}\s*年/.test(compactLine) || /大学\s+本科\s+/.test(compactLine);
}

function shouldJoinWrappedLine(previous: string, current: string): boolean {
  if (!previous || !current) {
    return false;
  }

  const prev = compactSentence(previous);
  const curr = compactSentence(current);

  if (
    isNoiseLine(curr)
    || detectSectionHeadingType(curr) !== undefined
    || isExperienceHeader(curr)
    || isExperienceHeader(prev)
    || isTailBoundaryLine(curr)
    || isStandaloneProjectTitle(curr)
    || isLabelOnlyLine(curr)
  ) {
    return false;
  }

  if (/^项目(?:名称|介绍|角色|时间|难点|影响|性能优化工作|一|二|三|四|五|六|七|八|九|十)?[：:]/.test(curr) || /^(主要工作|其他工作|开源链接)[：:]/.test(curr)) {
    return false;
  }

  if (isLikelyNameLine(prev)) {
    return false;
  }

  if (isNoiseLine(prev) || detectSectionHeadingType(prev) !== undefined || isLabelOnlyLine(prev) || isLinkLine(prev)) {
    return false;
  }

  const currentInlineLabel = matchInlineLabel(curr)?.[1];
  if (currentInlineLabel) {
    if (/[一二三四五六七八九十百千万半]$/.test(prev) && /^[个种条套项份段类]/.test(currentInlineLabel)) {
      return true;
    }

    if (!looksLikeStandaloneBulletLabel(currentInlineLabel) && !/[。！？；]$/.test(prev)) {
      return true;
    }

    return false;
  }

  return !/[。！？；:：]$/.test(prev);
}

export function splitResumeLines(text: string): string[] {
  const rawLines = normalizeResumeText(text)
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .filter((line) => line.trim().length > 0);

  const merged: string[] = [];

  for (const line of rawLines) {
    const previous = merged[merged.length - 1];
    const trimmed = line.trim();
    if (previous && shouldJoinWrappedLine(previous, trimmed)) {
      merged[merged.length - 1] = `${previous}${trimmed}`;
      continue;
    }

    merged.push(trimmed);
  }

  return merged;
}

export function tokenizeResumeText(text: string, sourceTypeHint: CandidateSourceType = "unknown"): {
  normalizedText: string;
  lines: ResumeLineToken[];
} {
  const normalizedText = normalizeResumeText(text);
  const mergedLines = splitResumeLines(normalizedText);
  const tokens = mergedLines.map((line, index): ResumeLineToken => ({
    lineNumber: index + 1,
    raw: line,
    text: line,
    compactText: compactSentence(line),
    indent: /^\s*/.exec(line)?.[0]?.length ?? 0,
    sourceTypeHint,
    sectionHeadingType: detectSectionHeadingType(line),
    isNoise: isNoiseLine(line),
    isLink: isLinkLine(line),
    isExperienceHeader: isExperienceHeader(line),
    isProjectStart: isProjectStart(mergedLines, index),
    isBulletLike: isBulletLikeLine(line),
  }));

  return { normalizedText, lines: tokens };
}


