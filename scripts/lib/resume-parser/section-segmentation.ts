import type {
  CandidateChildBlock,
  ParagraphBlock,
  BulletBlock,
  LinkBlock,
  ParsedCandidateSectionType,
  SectionBlock,
} from "./candidate-schema.ts";
import type { ResumeLineToken } from "./line-tokenize.ts";

export interface SectionSegment {
  id: string;
  sectionType: ParsedCandidateSectionType;
  title: string;
  headingLine?: number;
  lineStart: number;
  lineEnd: number;
  tokens: ResumeLineToken[];
}

function buildBlockId(prefix: string, lineNumber: number): string {
  return `${prefix}-${lineNumber}`;
}

function toParagraphBlock(prefix: string, token: ResumeLineToken): ParagraphBlock {
  return {
    id: buildBlockId(`${prefix}-paragraph`, token.lineNumber),
    kind: "paragraph",
    lineStart: token.lineNumber,
    lineEnd: token.lineNumber,
    rawLines: [token.text],
    text: token.compactText,
  };
}

function toBulletBlock(prefix: string, token: ResumeLineToken): BulletBlock {
  return {
    id: buildBlockId(`${prefix}-bullet`, token.lineNumber),
    kind: "bullet",
    lineStart: token.lineNumber,
    lineEnd: token.lineNumber,
    rawLines: [token.text],
    text: token.compactText,
  };
}

function toLinkBlock(prefix: string, token: ResumeLineToken): LinkBlock {
  return {
    id: buildBlockId(`${prefix}-link`, token.lineNumber),
    kind: "link",
    lineStart: token.lineNumber,
    lineEnd: token.lineNumber,
    rawLines: [token.text],
    href: token.compactText,
    label: token.compactText,
  };
}

function makeSectionSegment(
  id: string,
  sectionType: ParsedCandidateSectionType,
  title: string,
  tokens: ResumeLineToken[],
  headingLine?: number,
): SectionSegment | null {
  if (tokens.length === 0) {
    return null;
  }

  return {
    id,
    sectionType,
    title,
    headingLine,
    lineStart: headingLine ?? tokens[0].lineNumber,
    lineEnd: tokens[tokens.length - 1].lineNumber,
    tokens,
  };
}

function headingToTitle(sectionType: ParsedCandidateSectionType): string {
  switch (sectionType) {
    case "profile":
      return "基本信息";
    case "strengths":
      return "个人优势";
    case "experiences":
      return "工作经历";
    case "internship":
      return "实习经历";
    case "honors":
      return "荣誉奖项";
    case "education":
      return "教育经历";
    default:
      return "未分类";
  }
}

export function segmentSections(tokens: ResumeLineToken[]): {
  sections: SectionSegment[];
  warnings: string[];
  parserNotes: string[];
} {
  const sections: SectionSegment[] = [];
  const warnings: string[] = [];
  const parserNotes: string[] = [];
  const headingIndices = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.sectionHeadingType !== undefined);

  const firstHeadingIndex = headingIndices[0]?.index ?? -1;
  const firstExperienceHeaderIndex = tokens.findIndex((token) => token.isExperienceHeader);

  const profileBoundaryCandidates = [firstHeadingIndex, firstExperienceHeaderIndex].filter((value) => value >= 0);
  const profileBoundary = profileBoundaryCandidates.length > 0 ? Math.min(...profileBoundaryCandidates) : tokens.length;

  if (profileBoundary > 0) {
    const profileSegment = makeSectionSegment("section-profile", "profile", "基本信息", tokens.slice(0, profileBoundary));
    if (profileSegment) {
      sections.push(profileSegment);
    }
  }

  if (headingIndices.length === 0 && firstExperienceHeaderIndex >= 0) {
    const experienceSegment = makeSectionSegment(
      "section-experiences",
      "experiences",
      "工作经历",
      tokens.slice(firstExperienceHeaderIndex),
    );
    if (experienceSegment) {
      sections.push(experienceSegment);
      parserNotes.push("No explicit section headings found. Created an implicit experiences section from the first experience header.");
    }
    return { sections, warnings, parserNotes };
  }

  for (let index = 0; index < headingIndices.length; index += 1) {
    const current = headingIndices[index];
    const next = headingIndices[index + 1];
    const sectionType = current.token.sectionHeadingType ?? "unknown";
    const contentStart = current.index + 1;
    const contentEnd = next?.index ?? tokens.length;
    const contentTokens = tokens.slice(contentStart, contentEnd);
    const segment = makeSectionSegment(
      `section-${sectionType}-${current.token.lineNumber}`,
      sectionType,
      headingToTitle(sectionType),
      contentTokens,
      current.token.lineNumber,
    );

    if (segment) {
      sections.push(segment);
      continue;
    }

    warnings.push(`Section "${current.token.compactText}" is present but empty.`);
  }

  if (!sections.some((section) => section.sectionType === "experiences" || section.sectionType === "internship")) {
    warnings.push("No experiences or internship section was detected in the candidate structure.");
  }

  return { sections, warnings, parserNotes };
}

export function buildLooseSectionBlocks(section: SectionSegment): CandidateChildBlock[] {
  const prefix = section.id;

  return section.tokens
    .filter((token) => !token.isNoise)
    .map((token) => {
      if (token.isLink) {
        return toLinkBlock(prefix, token);
      }

      if (section.sectionType === "strengths" || token.isBulletLike) {
        return toBulletBlock(prefix, token);
      }

      return toParagraphBlock(prefix, token);
    });
}

export function toSectionBlock(section: SectionSegment, blocks: CandidateChildBlock[]): SectionBlock {
  return {
    id: section.id,
    kind: "section",
    sectionType: section.sectionType,
    title: section.title,
    headingLine: section.headingLine,
    lineStart: section.lineStart,
    lineEnd: section.lineEnd,
    rawLines: section.tokens.map((token) => token.text),
    blocks,
  };
}
