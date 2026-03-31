import path from "node:path";
import type {
  BuildParsedCandidateOptions,
  EducationCandidateEntity,
  HonorCandidateEntity,
  ParsedCandidate,
  ParsedCandidateDiagnosticsItem,
} from "./candidate-schema.ts";
import {
  NORMALIZATION_VERSION,
  PARSED_CANDIDATE_SCHEMA_VERSION,
} from "./candidate-schema.ts";
import { tokenizeResumeText } from "./line-tokenize.ts";
import { buildLooseSectionBlocks, segmentSections, toSectionBlock } from "./section-segmentation.ts";
import { segmentExperiences } from "./experience-segmentation.ts";

function toAbsoluteSourcePath(sourcePath: string): string {
  if (!sourcePath || sourcePath === "<stdin>") {
    return sourcePath || "<stdin>";
  }

  return path.isAbsolute(sourcePath) ? sourcePath : path.resolve(sourcePath);
}

function parseProfile(tokens: Array<{ compactText: string; isNoise?: boolean; isLink?: boolean }>): ParsedCandidate["profile"] {
  const usefulTokens = tokens.filter((token) => token.compactText && !token.isNoise);
  const lines = usefulTokens.map((token) => token.compactText);
  const name = usefulTokens.find((token) => !token.isLink && /^[^\dA-Za-z@:/|（）() ]{2,8}$/u.test(token.compactText))?.compactText;
  const intent = lines.find((line) => /^求职意向[：:]/.test(line))?.replace(/^求职意向[：:]\s*/, "");
  const contactLines = lines.filter((line) => /1\d{10}|@[A-Z0-9._%+-]+\.[A-Z]{2,}|男\s*\|/iu.test(line));
  const links = usefulTokens.filter((token) => token.isLink).map((token) => token.compactText);

  return {
    name,
    intent,
    contactLines,
    links,
    strengthLines: [],
  };
}

function parseHonors(sectionTokens: Array<{ compactText: string; lineNumber: number; text: string }>): HonorCandidateEntity[] {
  return sectionTokens
    .filter((token) => /^\d{4}\s*年/.test(token.compactText) || /(奖|竞赛|荣誉|冠军|银奖|铜奖)/.test(token.compactText))
    .map((token, index) => ({
      id: `honor-${index + 1}`,
      text: token.compactText,
      lineStart: token.lineNumber,
      lineEnd: token.lineNumber,
      rawLines: [token.text],
    }));
}

function parseEducation(sectionTokens: Array<{ compactText: string; lineNumber: number; text: string }>): EducationCandidateEntity | null {
  if (sectionTokens.length === 0) {
    return null;
  }

  const lines = sectionTokens.map((token) => token.compactText).filter(Boolean);
  const merged = lines.join(" ");
  const school = merged.match(/([^\s]+大学)/)?.[1];
  const degree = merged.match(/(本科|硕士|博士[^\s]*)/)?.[1];
  const period = merged.match(/(\d{4}[-.]\d{2,4}\s*[-–]\s*\d{4}[-.]\d{2,4}|\d{4}-\d{4})/)?.[1]?.replace(/[–]/g, "-");

  return {
    school,
    degree,
    period,
    lineStart: sectionTokens[0].lineNumber,
    lineEnd: sectionTokens[sectionTokens.length - 1].lineNumber,
    rawLines: sectionTokens.map((token) => token.text),
  };
}

export function buildParsedCandidate(text: string, options: BuildParsedCandidateOptions): ParsedCandidate {
  const importedAt = options.importedAt ?? new Date().toISOString();
  const tokenized = tokenizeResumeText(text, options.sourceType);
  const sectionResult = segmentSections(tokenized.lines);
  const experienceResult = segmentExperiences(sectionResult.sections);

  const profileSection = sectionResult.sections.find((section) => section.sectionType === "profile");
  const strengthsSection = sectionResult.sections.find((section) => section.sectionType === "strengths");
  const honorsSection = sectionResult.sections.find((section) => section.sectionType === "honors");
  const educationSection = sectionResult.sections.find((section) => section.sectionType === "education");

  const profile = parseProfile(profileSection?.tokens ?? []);
  profile.strengthLines = (strengthsSection?.tokens ?? []).map((token) => token.compactText).filter(Boolean);

  const honors = parseHonors(honorsSection?.tokens ?? []);
  const education = parseEducation(educationSection?.tokens ?? []);

  const sectionBlocks = sectionResult.sections.map((section) => {
    const blocks = experienceResult.sectionExperienceBlocks.get(section.id) ?? buildLooseSectionBlocks(section);
    return toSectionBlock(section, blocks);
  });

  const warnings = [
    ...sectionResult.warnings,
    ...experienceResult.warnings,
  ];

  const parserNotes = [
    ...sectionResult.parserNotes,
    `Tokenized ${tokenized.lines.length} merged lines from normalized resume text.`,
  ];

  const lowConfidenceItems: ParsedCandidateDiagnosticsItem[] = [
    ...experienceResult.lowConfidenceItems,
  ];

  if (!strengthsSection || profile.strengthLines.length === 0) {
    warnings.push("No strengths section content was detected in parsed-candidate output.");
  }

  if (!profile.name) {
    lowConfidenceItems.push({
      type: "low_confidence",
      target: "profile.name",
      reason: "Profile name could not be parsed from the preface section.",
      lineStart: profileSection?.lineStart,
      lineEnd: profileSection?.lineEnd,
    });
  }

  if (!experienceResult.experiences.some((experience) => experience.company.includes("北京畅聊天下科技有限公司"))) {
    warnings.push("The latest expected experience for 北京畅聊天下科技有限公司 was not detected.");
  }

  return {
    schemaVersion: PARSED_CANDIDATE_SCHEMA_VERSION,
    documentMeta: {
      sourceType: options.sourceType,
      sourcePath: toAbsoluteSourcePath(options.sourcePath),
      inputStem: options.inputStem,
      importedAt,
      normalizationVersion: NORMALIZATION_VERSION,
    },
    profile,
    sections: sectionBlocks,
    entities: {
      experiences: experienceResult.experiences,
      projects: experienceResult.projects,
      honors,
      education,
    },
    diagnostics: {
      warnings,
      parserNotes,
      lowConfidenceItems,
    },
  };
}

