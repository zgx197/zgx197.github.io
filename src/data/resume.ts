export type {
  DetailLayerContent,
  Education,
  ExperienceItem,
  ProjectArchiveGroup,
  ProjectArchiveSection,
  FocusArea,
  HonorExtraItem,
  HonorImageAsset,
  HonorReference,
  LinkItem,
  ProjectCategory,
  ProjectDetail,
  ProjectMediaAsset,
  ProjectMediaCollection,
  ProjectMediaKind,
  ProjectSection,
  ProjectSummary,
  ResumeSchema,
  ResumeSchemaVersion,
  ShowcaseBlock,
  ShowcaseCard,
  SkillGroup,
} from "./resume-schema";

export type {
  ResumeFact,
  ResumeSourceDocument,
  ResumeSourceExperience,
  ResumeSourceProfile,
  ResumeSourceProject,
  ResumeSourceProjectStorySection,
} from "./resume-source";

export type { ResumeSourceOverrides } from "./resume-overrides";
export type { ResumeValidationIssue, ResumeValidationReport } from "./resume-validation";

export { RESUME_SCHEMA_VERSION } from "./resume-schema";
export { resumeSource } from "./resume-source";
export { resumeOverrides } from "./resume-overrides";
export {
  buildResumeSchema,
  featuredProjectCards,
  getProjectBySlug,
  getProjectHref,
  openSourceProjectCards,
  projectSummaries,
  resolvedResumeSource,
  resumeData,
  resumeValidationReport,
} from "./resume-transform";
export { validateResumeSource } from "./resume-validation";
export { resolveProjectMedia } from "./project-assets";
