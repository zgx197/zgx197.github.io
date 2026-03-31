export const PARSED_CANDIDATE_SCHEMA_VERSION = "parsed-candidate@v1" as const;
export const NORMALIZATION_VERSION = "normalize@v1" as const;

export type ParsedCandidateSchemaVersion = typeof PARSED_CANDIDATE_SCHEMA_VERSION;
export type NormalizationVersion = typeof NORMALIZATION_VERSION;

export type CandidateSourceType = "pdf" | "text" | "stdin" | "unknown";

export type ParsedCandidateSectionType =
  | "profile"
  | "strengths"
  | "experiences"
  | "internship"
  | "honors"
  | "education"
  | "unknown";

export type CandidateConfidence = "low" | "medium" | "high";

export interface CandidateBlockBase {
  id: string;
  kind: string;
  lineStart: number;
  lineEnd: number;
  rawLines: string[];
}

export interface ParagraphBlock extends CandidateBlockBase {
  kind: "paragraph";
  text: string;
}

export interface BulletBlock extends CandidateBlockBase {
  kind: "bullet";
  text: string;
}

export interface LinkBlock extends CandidateBlockBase {
  kind: "link";
  href: string;
  label?: string;
}

export interface MetricBlock extends CandidateBlockBase {
  kind: "metric";
  value: string;
  label: string;
}

export interface ExperienceBlock extends CandidateBlockBase {
  kind: "experience";
  experienceId: string;
  company: string;
  role: string;
  period: string;
}

export interface ProjectBlock extends CandidateBlockBase {
  kind: "project";
  projectId: string;
  title: string;
  confidence: CandidateConfidence;
}

export type CandidateChildBlock =
  | ParagraphBlock
  | BulletBlock
  | LinkBlock
  | MetricBlock
  | ExperienceBlock
  | ProjectBlock;

export interface SectionBlock extends CandidateBlockBase {
  kind: "section";
  sectionType: ParsedCandidateSectionType;
  title: string;
  headingLine?: number;
  blocks: CandidateChildBlock[];
}

export interface ProjectCandidateEntity {
  id: string;
  title: string;
  experienceId: string;
  sectionType: "experiences" | "internship";
  lineStart: number;
  lineEnd: number;
  rawLines: string[];
  confidence: CandidateConfidence;
  summaryBlocks: ParagraphBlock[];
  workBlocks: BulletBlock[];
  impactBlocks: ParagraphBlock[];
  metricBlocks: MetricBlock[];
  linkBlocks: LinkBlock[];
}

export interface ExperienceCandidateEntity {
  id: string;
  sectionType: "experiences" | "internship";
  company: string;
  role: string;
  period: string;
  lineStart: number;
  lineEnd: number;
  rawLines: string[];
  bodyLines: string[];
  projectIds: string[];
}

export interface HonorCandidateEntity {
  id: string;
  text: string;
  lineStart: number;
  lineEnd: number;
  rawLines: string[];
}

export interface EducationCandidateEntity {
  school?: string;
  degree?: string;
  period?: string;
  lineStart: number;
  lineEnd: number;
  rawLines: string[];
}

export interface ParsedCandidateProfile {
  name?: string;
  intent?: string;
  contactLines: string[];
  links: string[];
  strengthLines: string[];
}

export interface ParsedCandidateDiagnosticsItem {
  type: "warning" | "low_confidence" | "note";
  target: string;
  reason: string;
  lineStart?: number;
  lineEnd?: number;
}

export interface ParsedCandidate {
  schemaVersion: ParsedCandidateSchemaVersion;
  documentMeta: {
    sourceType: CandidateSourceType;
    sourcePath: string;
    inputStem: string;
    importedAt: string;
    normalizationVersion: NormalizationVersion;
  };
  profile: ParsedCandidateProfile;
  sections: SectionBlock[];
  entities: {
    experiences: ExperienceCandidateEntity[];
    projects: ProjectCandidateEntity[];
    honors: HonorCandidateEntity[];
    education: EducationCandidateEntity | null;
  };
  diagnostics: {
    warnings: string[];
    parserNotes: string[];
    lowConfidenceItems: ParsedCandidateDiagnosticsItem[];
  };
}

export interface BuildParsedCandidateOptions {
  inputStem: string;
  sourcePath: string;
  sourceType: CandidateSourceType;
  importedAt?: string;
}
