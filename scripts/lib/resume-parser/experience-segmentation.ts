import type {
  BulletBlock,
  ExperienceBlock,
  ExperienceCandidateEntity,
  LinkBlock,
  MetricBlock,
  ParagraphBlock,
  ParsedCandidateDiagnosticsItem,
  ProjectCandidateEntity,
} from "./candidate-schema.ts";
import {
  extractProjectTitle,
  isProjectStart,
  matchInlineLabel,
  parseExperienceHeader,
  type ResumeLineToken,
} from "./line-tokenize.ts";
import type { SectionSegment } from "./section-segmentation.ts";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || "item";
}

function extractMetricBlocks(prefix: string, lines: ResumeLineToken[]): MetricBlock[] {
  const metrics: MetricBlock[] = [];

  const pushMetric = (value: string, label: string, token: ResumeLineToken) => {
    if (metrics.some((metric) => metric.value === value && metric.label === label)) {
      return;
    }

    metrics.push({
      id: `${prefix}-metric-${metrics.length + 1}`,
      kind: "metric",
      lineStart: token.lineNumber,
      lineEnd: token.lineNumber,
      rawLines: [token.text],
      value,
      label,
    });
  };

  for (const token of lines) {
    const text = token.compactText;
    const percentageMatches = Array.from(text.matchAll(/(\d+(?:\.\d+)?%)/g));
    for (const match of percentageMatches) {
      pushMetric(match[1], "percentage", token);
    }

    const countMatches = Array.from(text.matchAll(/(\d+(?:\.\d+)?(?:亿|万|kw|k|w)\+?)/gi));
    for (const match of countMatches) {
      pushMetric(match[1], "scale", token);
    }
  }

  return metrics;
}

function toParagraphBlock(prefix: string, token: ResumeLineToken, text: string): ParagraphBlock {
  return {
    id: `${prefix}-paragraph-${token.lineNumber}`,
    kind: "paragraph",
    lineStart: token.lineNumber,
    lineEnd: token.lineNumber,
    rawLines: [token.text],
    text,
  };
}

function toBulletBlock(prefix: string, token: ResumeLineToken, text: string): BulletBlock {
  return {
    id: `${prefix}-bullet-${token.lineNumber}`,
    kind: "bullet",
    lineStart: token.lineNumber,
    lineEnd: token.lineNumber,
    rawLines: [token.text],
    text,
  };
}

function splitProjectTokens(tokens: ResumeLineToken[]): Array<{
  title: string;
  lineStart: number;
  lineEnd: number;
  confidence: "medium" | "high";
  tokens: ResumeLineToken[];
}> {
  const starts = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ index }) => isProjectStart(tokens.map((item) => item.text), index));

  if (starts.length === 0) {
    return [];
  }

  return starts.map(({ token, index }, currentIndex) => {
    const nextStartIndex = starts[currentIndex + 1]?.index ?? tokens.length;
    const projectTokens = tokens.slice(index, nextStartIndex);
    const title = extractProjectTitle(token.text) ?? `project-${currentIndex + 1}`;
    const confidence = /^项目(?:名称|[一二三四五六七八九十\d]+)?[：:]/.test(token.compactText) ? "high" : "medium";

    return {
      title,
      lineStart: token.lineNumber,
      lineEnd: projectTokens[projectTokens.length - 1]?.lineNumber ?? token.lineNumber,
      confidence,
      tokens: projectTokens,
    };
  });
}

function classifyProjectTokens(prefix: string, tokens: ResumeLineToken[]): {
  summaryBlocks: ParagraphBlock[];
  workBlocks: BulletBlock[];
  impactBlocks: ParagraphBlock[];
  metricBlocks: MetricBlock[];
} {
  const summaryBlocks: ParagraphBlock[] = [];
  const workBlocks: BulletBlock[] = [];
  const impactBlocks: ParagraphBlock[] = [];
  const metricBlocks = extractMetricBlocks(prefix, tokens);

  let mode: "summary" | "work" | "impact" = "summary";

  for (const token of tokens) {
    const text = token.compactText;
    if (!text) {
      continue;
    }

    if (/^项目(?:名称|[一二三四五六七八九十\d]+)?[：:]/.test(text)) {
      continue;
    }

    if (/^项目介绍[：:]/.test(text)) {
      mode = "summary";
      summaryBlocks.push(toParagraphBlock(prefix, token, text.replace(/^项目介绍[：:]\s*/, "")));
      continue;
    }

    if (/^(主要工作|其他工作|项目性能优化工作)[：:]?$/.test(text) || /^(主要工作|其他工作|项目性能优化工作)[：:]/.test(text)) {
      mode = "work";
      const content = text.replace(/^(主要工作|其他工作|项目性能优化工作)[：:]?\s*/, "");
      if (content) {
        workBlocks.push(toBulletBlock(prefix, token, content));
      }
      continue;
    }

    if (/^(项目影响|影响)[：:]?$/.test(text) || /^(项目影响|影响)[：:]/.test(text)) {
      mode = "impact";
      const content = text.replace(/^(项目影响|影响)[：:]?\s*/, "");
      if (content) {
        impactBlocks.push(toParagraphBlock(prefix, token, content));
      }
      continue;
    }

    if (mode === "work") {
      workBlocks.push(toBulletBlock(prefix, token, text));
      continue;
    }

    if (mode === "impact") {
      impactBlocks.push(toParagraphBlock(prefix, token, text));
      continue;
    }

    const inlineLabel = matchInlineLabel(text);
    if (inlineLabel) {
      summaryBlocks.push(toParagraphBlock(prefix, token, `${inlineLabel[1]}：${inlineLabel[2]}`));
      continue;
    }

    summaryBlocks.push(toParagraphBlock(prefix, token, text));
  }

  return { summaryBlocks, workBlocks, impactBlocks, metricBlocks };
}

export function segmentExperiences(sections: SectionSegment[]): {
  experiences: ExperienceCandidateEntity[];
  projects: ProjectCandidateEntity[];
  sectionExperienceBlocks: Map<string, ExperienceBlock[]>;
  warnings: string[];
  lowConfidenceItems: ParsedCandidateDiagnosticsItem[];
} {
  const experiences: ExperienceCandidateEntity[] = [];
  const projects: ProjectCandidateEntity[] = [];
  const sectionExperienceBlocks = new Map<string, ExperienceBlock[]>();
  const warnings: string[] = [];
  const lowConfidenceItems: ParsedCandidateDiagnosticsItem[] = [];

  for (const section of sections) {
    if (section.sectionType !== "experiences" && section.sectionType !== "internship") {
      continue;
    }

    const headerIndices = section.tokens
      .map((token, index) => ({ token, index }))
      .filter(({ token }) => token.isExperienceHeader);

    if (headerIndices.length === 0) {
      warnings.push(`Section "${section.title}" does not contain a detectable experience header.`);
      continue;
    }

    const experienceBlocks: ExperienceBlock[] = [];

    for (let index = 0; index < headerIndices.length; index += 1) {
      const current = headerIndices[index];
      const next = headerIndices[index + 1];
      const experienceTokens = section.tokens.slice(current.index, next?.index ?? section.tokens.length);
      const [headerToken, ...bodyTokens] = experienceTokens;
      const header = parseExperienceHeader(headerToken.text);
      const experienceId = `${slugify(`${header.company}-${header.period}`)}-${index + 1}`;

      if (!header.company || header.company.includes("待补充")) {
        lowConfidenceItems.push({
          type: "low_confidence",
          target: experienceId,
          reason: "Experience company was not parsed with high confidence.",
          lineStart: headerToken.lineNumber,
          lineEnd: headerToken.lineNumber,
        });
      }

      const projectCandidates = splitProjectTokens(bodyTokens);
      const projectIds: string[] = [];

      for (let projectIndex = 0; projectIndex < projectCandidates.length; projectIndex += 1) {
        const projectCandidate = projectCandidates[projectIndex];
        const projectId = `${experienceId}-project-${projectIndex + 1}`;
        const prefix = `${projectId}-${slugify(projectCandidate.title)}`;
        const links: LinkBlock[] = projectCandidate.tokens
          .filter((token) => /^https?:\/\//.test(token.compactText) || /^开源链接[：:]/.test(token.compactText))
          .map((token, linkIndex) => ({
            id: `${prefix}-link-${linkIndex + 1}`,
            kind: "link",
            lineStart: token.lineNumber,
            lineEnd: token.lineNumber,
            rawLines: [token.text],
            href: token.compactText.replace(/^开源链接[：:]\s*/, ""),
            label: token.compactText.replace(/^开源链接[：:]\s*/, ""),
          }));

        const classified = classifyProjectTokens(prefix, projectCandidate.tokens);

        projects.push({
          id: projectId,
          title: projectCandidate.title,
          experienceId,
          sectionType: section.sectionType,
          lineStart: projectCandidate.lineStart,
          lineEnd: projectCandidate.lineEnd,
          rawLines: projectCandidate.tokens.map((token) => token.text),
          confidence: projectCandidate.confidence,
          summaryBlocks: classified.summaryBlocks,
          workBlocks: classified.workBlocks,
          impactBlocks: classified.impactBlocks,
          metricBlocks: classified.metricBlocks,
          linkBlocks: links,
        });

        projectIds.push(projectId);
      }

      experiences.push({
        id: experienceId,
        sectionType: section.sectionType,
        company: header.company,
        role: header.role,
        period: header.period,
        lineStart: headerToken.lineNumber,
        lineEnd: experienceTokens[experienceTokens.length - 1]?.lineNumber ?? headerToken.lineNumber,
        rawLines: experienceTokens.map((token) => token.text),
        bodyLines: bodyTokens.map((token) => token.text),
        projectIds,
      });

      experienceBlocks.push({
        id: `${section.id}-experience-${index + 1}`,
        kind: "experience",
        lineStart: headerToken.lineNumber,
        lineEnd: experienceTokens[experienceTokens.length - 1]?.lineNumber ?? headerToken.lineNumber,
        rawLines: experienceTokens.map((token) => token.text),
        experienceId,
        company: header.company,
        role: header.role,
        period: header.period,
      });
    }

    sectionExperienceBlocks.set(section.id, experienceBlocks);
  }

  return {
    experiences,
    projects,
    sectionExperienceBlocks,
    warnings,
    lowConfidenceItems,
  };
}
