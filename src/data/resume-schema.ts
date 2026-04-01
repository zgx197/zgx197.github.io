export const RESUME_SCHEMA_VERSION = "resume-schema@v1";

export type ResumeSchemaVersion = typeof RESUME_SCHEMA_VERSION;

export type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type FocusArea = {
  title: string;
  description: string;
};

export type ProjectCategory = "featured" | "open_source";

export type ProjectMediaKind = "image" | "video" | "embed";

export type ProjectMediaAsset = {
  kind: ProjectMediaKind;
  title: string;
  src: string;
  description?: string;
  alt?: string;
  poster?: string;
  external?: boolean;
};

export type ProjectMediaCollection = {
  manifestPath?: string;
  featured?: ProjectMediaAsset;
  gallery: ProjectMediaAsset[];
  resources: LinkItem[];
  note?: string;
};

export type ProjectSummary = {
  slug: string;
  title: string;
  category: ProjectCategory;
  meta: string[];
  description: string;
  tags: string[];
};

export type DetailLayerContent = {
  refinedTitle?: string;
  refined?: string[];
  originalTitle?: string;
  original?: string[];
};

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  period: string;
  summary: string;
  bullets: string[];
  details?: DetailLayerContent;
  projectSlugs?: string[];
  note?: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type ShowcaseBlock = {
  title: string;
  description?: string;
  items?: string[];
};

export type ShowcaseCard = {
  title: string;
  description: string;
};

export type ProjectArchiveGroup = {
  title?: string;
  paragraphs?: string[];
  items?: string[];
};

export type ProjectArchiveSection = {
  title: string;
  intro?: string;
  paragraphs?: string[];
  groups?: ProjectArchiveGroup[];
};

export type ProjectSection =
  | {
      type: "showcase";
      title: string;
      featuredTitle: string;
      featuredDescription: string;
      sideBlocks: ShowcaseBlock[];
      gallery: ShowcaseCard[];
      note: string;
    }
  | {
      type: "metrics";
      title: string;
      items: { value: string; label: string }[];
    }
  | {
      type: "highlights";
      title: string;
      items: { title: string; description: string }[];
    }
  | {
      type: "paragraph";
      title: string;
      paragraphs: string[];
    }
  | {
      type: "bullets";
      title: string;
      items: string[];
    }
  | {
      type: "layered_bullets";
      title: string;
      refinedTitle?: string;
      refinedItems?: string[];
      originalTitle?: string;
      originalItems?: string[];
    }
  | {
      type: "archive";
      title: string;
      description?: string;
      sections: ProjectArchiveSection[];
    }
  | {
      type: "tags";
      title: string;
      items: string[];
    }
  | {
      type: "links";
      title: string;
      items: LinkItem[];
    };

export type ProjectDetail = ProjectSummary & {
  eyebrow: string;
  subtitle: string;
  media: ProjectMediaCollection;
  sections: ProjectSection[];
};

export type Education = {
  school: string;
  degree: string;
  period: string;
  details: string[];
};

export type HonorImageAsset = {
  title: string;
  src: string;
  alt?: string;
  description?: string;
};

export type HonorReference = {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

export type HonorExtraItem = {
  slug: string;
  title: string;
  summary?: string;
  images: HonorImageAsset[];
  references: HonorReference[];
};

export type ResumeSchema = {
  schemaVersion: ResumeSchemaVersion;
  profile: {
    name: string;
    role: string;
    bio: string;
    strengths: string[];
    contacts: LinkItem[];
  };
  resume: {
    headline: string;
    summaryPoints: string[];
    focusAreas: FocusArea[];
    profileFacts: { label: string; value: string }[];
    experiences: ExperienceItem[];
    skillGroups: SkillGroup[];
    honors: string[];
    honorExtras: HonorExtraItem[];
    education: Education;
  };
  projects: ProjectDetail[];
};
