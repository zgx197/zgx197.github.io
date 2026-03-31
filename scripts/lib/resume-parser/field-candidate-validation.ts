import type { FieldCandidatesReport } from "./field-candidates.ts";

export const FIELD_CANDIDATE_VALIDATION_REPORT_SCHEMA_VERSION = "field-candidate-validation-report@v1" as const;

export type FieldCandidateValidationIssue = {
  level: "error" | "warning";
  code:
    | "summary_missing"
    | "summary_too_long"
    | "highlight_missing"
    | "highlight_duplicate"
    | "tag_duplicate"
    | "metric_duplicate"
    | "invalid_match_selection"
    | "low_score_match"
    | "project_skipped"
    | "field_warning";
  path: string;
  message: string;
  evidence?: string[];
};

export interface FieldCandidateValidationReport {
  schemaVersion: "field-candidate-validation-report@v1";
  generatedAt: string;
  sourcePath: string;
  fieldCandidatesPath?: string;
  stats: {
    projectCount: number;
    matchedProjectCount: number;
    skippedProjectCount: number;
    errorCount: number;
    warningCount: number;
  };
  issues: FieldCandidateValidationIssue[];
}

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, "")
    .replace(/[，。；：、“”"'`‘’（）()\[\]【】\-_/\\|·,.!?！？]/g, "")
    .toLowerCase();
}

function pushIssue(
  issues: FieldCandidateValidationIssue[],
  level: FieldCandidateValidationIssue["level"],
  code: FieldCandidateValidationIssue["code"],
  path: string,
  message: string,
  evidence?: string[],
) {
  issues.push({ level, code, path, message, evidence });
}

export function buildFieldCandidateValidationReport(
  report: FieldCandidatesReport,
  options: { fieldCandidatesPath?: string; generatedAt?: string } = {},
): FieldCandidateValidationReport {
  const issues: FieldCandidateValidationIssue[] = [];
  const generatedAt = options.generatedAt ?? new Date().toISOString();

  for (const [index, project] of report.projects.entries()) {
    const projectPath = `projects[${index}](${project.projectId})`;
    const summary = project.summary.text.trim();
    if (!summary) {
      pushIssue(issues, "error", "summary_missing", `${projectPath}.summary`, `Project "${project.title}" is missing summary.`);
    } else if (summary.length > 120) {
      pushIssue(issues, "warning", "summary_too_long", `${projectPath}.summary`, `Project "${project.title}" summary is longer than 120 characters.`, [`length=${summary.length}`]);
    }

    if (project.highlights.length === 0) {
      pushIssue(issues, "warning", "highlight_missing", `${projectPath}.highlights`, `Project "${project.title}" has no highlights.`);
    }

    const seenHighlights = new Set<string>();
    for (const [highlightIndex, highlight] of project.highlights.entries()) {
      const normalized = normalizeText(highlight.text);
      if (!normalized) {
        continue;
      }
      if (normalizeText(summary) === normalized) {
        pushIssue(issues, "warning", "highlight_duplicate", `${projectPath}.highlights[${highlightIndex}]`, `Project "${project.title}" has a highlight duplicated from summary.`);
      }
      if (seenHighlights.has(normalized)) {
        pushIssue(issues, "warning", "highlight_duplicate", `${projectPath}.highlights[${highlightIndex}]`, `Project "${project.title}" has duplicated highlights.`);
      }
      seenHighlights.add(normalized);
    }

    const seenTags = new Set<string>();
    for (const [tagIndex, tag] of project.tags.entries()) {
      const normalized = normalizeText(tag.tag);
      if (!normalized) {
        continue;
      }
      if (seenTags.has(normalized)) {
        pushIssue(issues, "warning", "tag_duplicate", `${projectPath}.tags[${tagIndex}]`, `Project "${project.title}" has duplicated tags.`);
      }
      seenTags.add(normalized);
    }

    const seenMetrics = new Set<string>();
    for (const [metricIndex, metric] of project.metrics.entries()) {
      const key = `${metric.value}|${metric.label}`;
      if (seenMetrics.has(key)) {
        pushIssue(issues, "warning", "metric_duplicate", `${projectPath}.metrics[${metricIndex}]`, `Project "${project.title}" has duplicated metrics.`);
      }
      seenMetrics.add(key);
    }

    if (project.match.selectedSlug) {
      const selected = project.match.options.find((option) => option.slug === project.match.selectedSlug);
      if (!selected) {
        pushIssue(issues, "error", "invalid_match_selection", `${projectPath}.match`, `Project "${project.title}" selected a slug that is not present in options.`);
      } else if (selected.score < 0.4) {
        pushIssue(issues, "warning", "low_score_match", `${projectPath}.match`, `Project "${project.title}" selected a low-score slug match.`, [`slug=${selected.slug}`, `score=${selected.score}`]);
      }
    }

    if (project.skipped) {
      pushIssue(issues, "warning", "project_skipped", projectPath, `Project "${project.title}" was skipped in field candidate generation.`, project.skipReason ? [project.skipReason] : undefined);
    }

    for (const [warningIndex, warning] of project.warnings.entries()) {
      pushIssue(issues, "warning", "field_warning", `${projectPath}.warnings[${warningIndex}]`, warning);
    }
  }

  return {
    schemaVersion: FIELD_CANDIDATE_VALIDATION_REPORT_SCHEMA_VERSION,
    generatedAt,
    sourcePath: report.sourcePath,
    fieldCandidatesPath: options.fieldCandidatesPath,
    stats: {
      projectCount: report.projectCount,
      matchedProjectCount: report.matchedProjectCount,
      skippedProjectCount: report.projects.filter((project) => project.skipped).length,
      errorCount: issues.filter((issue) => issue.level === "error").length,
      warningCount: issues.filter((issue) => issue.level === "warning").length,
    },
    issues,
  };
}
