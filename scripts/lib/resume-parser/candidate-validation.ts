import type {
  ExperienceCandidateEntity,
  ParsedCandidate,
  ParsedCandidateDiagnosticsItem,
  ProjectCandidateEntity,
  SectionBlock,
} from "./candidate-schema.ts";

export const CANDIDATE_VALIDATION_REPORT_SCHEMA_VERSION = "candidate-validation-report@v1" as const;

export type CandidateValidationIssueLevel = "error" | "warning";

export type CandidateValidationIssueCode =
  | "parser_warning"
  | "low_confidence"
  | "summary_too_long"
  | "duplicate_project_text"
  | "suspicious_line_wrap"
  | "missing_project_split"
  | "project_split_count_mismatch"
  | "experience_order"
  | "metric_unit_anomaly";

export interface CandidateValidationIssue {
  level: CandidateValidationIssueLevel;
  code: CandidateValidationIssueCode;
  path: string;
  message: string;
  evidence?: string[];
}

export interface CandidateValidationExperienceSummary {
  experienceId: string;
  company: string;
  role: string;
  period: string;
  projectCount: number;
  explicitProjectTitleCount: number;
  hasProjectSignals: boolean;
  status: "ok" | "review";
}

export interface CandidateValidationReport {
  schemaVersion: "candidate-validation-report@v1";
  generatedAt: string;
  sourcePath: string;
  candidatePath?: string;
  stats: {
    sectionCount: number;
    experienceCount: number;
    projectCount: number;
    parserWarningCount: number;
    lowConfidenceCount: number;
    errorCount: number;
    warningCount: number;
    suspiciousWrapSectionCount: number;
    reviewExperienceCount: number;
  };
  carriedDiagnostics: {
    warnings: string[];
    lowConfidenceItems: ParsedCandidateDiagnosticsItem[];
  };
  experiences: CandidateValidationExperienceSummary[];
  issues: CandidateValidationIssue[];
}

interface BuildCandidateValidationReportOptions {
  candidatePath?: string;
  generatedAt?: string;
}

function pushIssue(
  issues: CandidateValidationIssue[],
  level: CandidateValidationIssueLevel,
  code: CandidateValidationIssueCode,
  path: string,
  message: string,
  evidence?: string[],
) {
  issues.push({ level, code, path, message, evidence });
}

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, "")
    .replace(/[，。；：、“”"'`‘’（）()\[\]【】\-_/\\|·,.!?！？]/g, "")
    .toLowerCase();
}

function countExplicitProjectTitles(experience: ExperienceCandidateEntity): number {
  return experience.bodyLines.filter((line) => {
    const text = line.trim();
    return /^项目(?:名称|[一二三四五六七八九十\d]+)?[：:]/.test(text)
      && !/^项目(?:介绍|角色|时间|难点|影响|性能优化工作)[：:]/.test(text);
  }).length;
}

function hasProjectSignals(experience: ExperienceCandidateEntity): boolean {
  return experience.bodyLines.some((line) => /^(项目(?:介绍|角色|时间|难点|影响)|主要工作|其他工作|开源链接)[：:]/.test(line.trim()));
}

function parseExperienceStart(period: string): number | null {
  const match = period.match(/^(\d{4})[./](\d{2})/);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 100 + Number(match[2]);
}

function isOngoingExperience(period: string): boolean {
  return /至今/.test(period);
}

function collectProjectTexts(project: ProjectCandidateEntity, projectIndex: number): Array<{ path: string; text: string }> {
  const entries: Array<{ path: string; text: string }> = [];

  for (const [index, block] of project.summaryBlocks.entries()) {
    entries.push({
      path: `entities.projects[${projectIndex}].summaryBlocks[${index}]`,
      text: block.text,
    });
  }

  for (const [index, block] of project.workBlocks.entries()) {
    entries.push({
      path: `entities.projects[${projectIndex}].workBlocks[${index}]`,
      text: block.text,
    });
  }

  for (const [index, block] of project.impactBlocks.entries()) {
    entries.push({
      path: `entities.projects[${projectIndex}].impactBlocks[${index}]`,
      text: block.text,
    });
  }

  return entries;
}

function isStructuralBoundaryLine(text: string): boolean {
  return /^(工作经历|实习经历|个人优势|荣誉奖项|教育经历|社交主页)$/.test(text)
    || /^求职意向[：:]/.test(text)
    || /^工作内容[：:]/.test(text)
    || /^https?:\/\//.test(text)
    || /^项目(?:名称|介绍|角色|时间|难点|影响|性能优化工作|[一二三四五六七八九十\d]+)?[：:]/.test(text)
    || /^(主要工作|其他工作|整体设计|具体模块|项目性能优化工作|开源链接)[：:]/.test(text)
    || /^\d{4}\s*年/.test(text)
    || (/\d{4}[./]\d{2}\s*[-–]\s*(?:\d{4}[./]\d{2}|至今)/.test(text) && text.length <= 120);
}

function looksLikeSuspiciousWrap(previous: string, next: string): boolean {
  const prev = previous.trim();
  const after = next.trim();

  if (!prev || !after) {
    return false;
  }

  if (prev.length < 12 || after.length < 2) {
    return false;
  }

  if (/[。！？.!?；;：:]$/.test(prev)) {
    return false;
  }

  if (isStructuralBoundaryLine(prev) || isStructuralBoundaryLine(after)) {
    return false;
  }

  if (/^[1-9]\d*[.)、]/.test(after)) {
    return false;
  }

  return true;
}

function detectMetricUnitAnomalies(text: string): string[] {
  const anomalies = new Set<string>();
  const malformedPatterns = [
    /\d+(?:\.\d+)?\s*(?:%%|％％|%％|％%)/g,
    /\d+(?:\.\d+)?\s*(?:kk|KK|ww|WW|亿亿|万万|w万|万w|kwkw)/g,
    /\d+(?:\.\d+)?\s*[kK][wW][wW]/g,
  ];

  for (const pattern of malformedPatterns) {
    for (const match of text.matchAll(pattern)) {
      anomalies.add(match[0]);
    }
  }

  return [...anomalies];
}

function toSectionPath(section: SectionBlock, sectionIndex: number): string {
  return `sections[${sectionIndex}](${section.id})`;
}

export function buildCandidateValidationReport(
  candidate: ParsedCandidate,
  options: BuildCandidateValidationReportOptions = {},
): CandidateValidationReport {
  const issues: CandidateValidationIssue[] = [];
  const experiences: CandidateValidationExperienceSummary[] = [];
  const generatedAt = options.generatedAt ?? new Date().toISOString();

  for (const [index, warning] of candidate.diagnostics.warnings.entries()) {
    pushIssue(
      issues,
      "warning",
      "parser_warning",
      `diagnostics.warnings[${index}]`,
      warning,
    );
  }

  for (const [index, item] of candidate.diagnostics.lowConfidenceItems.entries()) {
    pushIssue(
      issues,
      "warning",
      "low_confidence",
      `diagnostics.lowConfidenceItems[${index}]`,
      `${item.target}: ${item.reason}`,
      item.lineStart ? [`lines ${item.lineStart}-${item.lineEnd ?? item.lineStart}`] : undefined,
    );
  }

  for (const [sectionIndex, section] of candidate.sections.entries()) {
    const examples: string[] = [];

    for (let lineIndex = 0; lineIndex < section.rawLines.length - 1; lineIndex += 1) {
      const current = section.rawLines[lineIndex] ?? "";
      const next = section.rawLines[lineIndex + 1] ?? "";
      if (!looksLikeSuspiciousWrap(current, next)) {
        continue;
      }

      const currentLine = section.lineStart + lineIndex;
      const nextLine = currentLine + 1;
      examples.push(`L${currentLine}->L${nextLine}: ${current.trim()} | ${next.trim()}`);
      if (examples.length >= 5) {
        break;
      }
    }

    if (examples.length > 0) {
      pushIssue(
        issues,
        "warning",
        "suspicious_line_wrap",
        toSectionPath(section, sectionIndex),
        `Section "${section.title}" contains suspicious wrapped lines that may indicate extraction truncation.`,
        examples,
      );
    }
  }

  for (const [experienceIndex, experience] of candidate.entities.experiences.entries()) {
    const explicitProjectTitleCount = countExplicitProjectTitles(experience);
    const projectCount = experience.projectIds.length;
    const projectSignals = hasProjectSignals(experience);
    let status: CandidateValidationExperienceSummary["status"] = "ok";

    if (explicitProjectTitleCount > 0 && projectCount === 0) {
      status = "review";
      pushIssue(
        issues,
        "error",
        "missing_project_split",
        `entities.experiences[${experienceIndex}](${experience.id})`,
        `Experience "${experience.company}" contains explicit project titles but no projects were split out.`,
        [`explicitProjectTitleCount=${explicitProjectTitleCount}`],
      );
    } else if (explicitProjectTitleCount > projectCount) {
      status = "review";
      pushIssue(
        issues,
        "warning",
        "project_split_count_mismatch",
        `entities.experiences[${experienceIndex}](${experience.id})`,
        `Experience "${experience.company}" contains more explicit project title lines than parsed projects.`,
        [`explicitProjectTitleCount=${explicitProjectTitleCount}`, `projectCount=${projectCount}`],
      );
    } else if (explicitProjectTitleCount === 0 && projectCount === 0 && projectSignals) {
      status = "review";
      pushIssue(
        issues,
        "warning",
        "missing_project_split",
        `entities.experiences[${experienceIndex}](${experience.id})`,
        `Experience "${experience.company}" contains project-related signals but no explicit project block was parsed.`,
      );
    }

    experiences.push({
      experienceId: experience.id,
      company: experience.company,
      role: experience.role,
      period: experience.period,
      projectCount,
      explicitProjectTitleCount,
      hasProjectSignals: projectSignals,
      status,
    });
  }

  const ongoingIndex = candidate.entities.experiences.findIndex((experience) => isOngoingExperience(experience.period));
  if (ongoingIndex > 0) {
    pushIssue(
      issues,
      "warning",
      "experience_order",
      `entities.experiences[${ongoingIndex}](${candidate.entities.experiences[ongoingIndex].id})`,
      "The ongoing experience is not placed at the top of the experience list.",
    );
  }

  for (let index = 0; index < candidate.entities.experiences.length - 1; index += 1) {
    const current = candidate.entities.experiences[index];
    const next = candidate.entities.experiences[index + 1];
    const currentStart = parseExperienceStart(current.period);
    const nextStart = parseExperienceStart(next.period);

    if (currentStart === null || nextStart === null) {
      continue;
    }

    if (currentStart < nextStart) {
      pushIssue(
        issues,
        "warning",
        "experience_order",
        `entities.experiences[${index}](${current.id})`,
        `Experience order is not descending by start date: "${current.company}" appears before newer "${next.company}".`,
        [`${current.period} < ${next.period}`],
      );
    }
  }

  for (const [projectIndex, project] of candidate.entities.projects.entries()) {
    for (const [summaryIndex, block] of project.summaryBlocks.entries()) {
      if (block.text.trim().length > 180) {
        pushIssue(
          issues,
          "warning",
          "summary_too_long",
          `entities.projects[${projectIndex}](${project.id}).summaryBlocks[${summaryIndex}]`,
          `Project "${project.title}" contains an overlong summary block that should be refined before merge.`,
          [`length=${block.text.trim().length}`],
        );
      }
    }

    const seen = new Map<string, string>();
    for (const entry of collectProjectTexts(project, projectIndex)) {
      const normalized = normalizeText(entry.text);
      if (normalized.length < 12) {
        continue;
      }

      const previousPath = seen.get(normalized);
      if (previousPath) {
        pushIssue(
          issues,
          "warning",
          "duplicate_project_text",
          entry.path,
          `Project "${project.title}" contains duplicated text blocks.`,
          [previousPath, entry.text.trim()],
        );
        continue;
      }

      seen.set(normalized, entry.path);
    }

    const metricAnomalies = new Set<string>();
    for (const line of project.rawLines) {
      for (const anomaly of detectMetricUnitAnomalies(line)) {
        metricAnomalies.add(anomaly);
      }
    }

    if (metricAnomalies.size > 0) {
      pushIssue(
        issues,
        "warning",
        "metric_unit_anomaly",
        `entities.projects[${projectIndex}](${project.id})`,
        `Project "${project.title}" contains suspicious metric units that need manual review.`,
        [...metricAnomalies],
      );
    }
  }

  return {
    schemaVersion: CANDIDATE_VALIDATION_REPORT_SCHEMA_VERSION,
    generatedAt,
    sourcePath: candidate.documentMeta.sourcePath,
    candidatePath: options.candidatePath,
    stats: {
      sectionCount: candidate.sections.length,
      experienceCount: candidate.entities.experiences.length,
      projectCount: candidate.entities.projects.length,
      parserWarningCount: candidate.diagnostics.warnings.length,
      lowConfidenceCount: candidate.diagnostics.lowConfidenceItems.length,
      errorCount: issues.filter((issue) => issue.level === "error").length,
      warningCount: issues.filter((issue) => issue.level === "warning").length,
      suspiciousWrapSectionCount: issues.filter((issue) => issue.code === "suspicious_line_wrap").length,
      reviewExperienceCount: experiences.filter((experience) => experience.status === "review").length,
    },
    carriedDiagnostics: {
      warnings: candidate.diagnostics.warnings,
      lowConfidenceItems: candidate.diagnostics.lowConfidenceItems,
    },
    experiences,
    issues,
  };
}


