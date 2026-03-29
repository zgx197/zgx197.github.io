import { resolveProjectMedia } from "./project-assets";
import { resumeOverrides, type ResumeSourceOverrides } from "./resume-overrides";
import { RESUME_SCHEMA_VERSION, type ProjectDetail, type ProjectSection, type ProjectSummary, type ResumeSchema } from "./resume-schema";
import { resumeSource, type ResumeSourceDocument, type ResumeSourceProjectStorySection } from "./resume-source";
import { assertValidResumeSource } from "./resume-validation";

function uniq(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function mapByKey<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  const index = new Map<string, T>();
  for (const item of items) {
    const value = item[key];
    if (typeof value === "string") {
      index.set(value, item);
    }
  }
  return index;
}

function mergeProfile(source: ResumeSourceDocument["profile"], overrides: ResumeSourceOverrides["profile"]) {
  if (!overrides) {
    return source;
  }

  return {
    ...source,
    ...overrides,
    strengths: overrides.strengths ?? source.strengths,
    summaryPoints: overrides.summaryPoints ?? source.summaryPoints,
    focusAreas: overrides.focusAreas ?? source.focusAreas,
    facts: overrides.facts ?? source.facts,
    contacts: overrides.contacts ?? source.contacts,
  };
}

function mergeExperiences(source: ResumeSourceDocument["experiences"], overrides: ResumeSourceOverrides["experiences"]) {
  if (!overrides) {
    return source;
  }

  return source.map((experience) => {
    const experienceOverride = overrides[experience.id];
    return experienceOverride ? { ...experience, ...experienceOverride } : experience;
  });
}

function mergeProjects(source: ResumeSourceDocument["projects"], overrides: ResumeSourceOverrides["projects"]) {
  if (!overrides) {
    return source;
  }

  return source.map((project) => {
    const projectOverride = overrides[project.slug];
    if (!projectOverride) {
      return project;
    }

    return {
      ...project,
      ...projectOverride,
      showcase: {
        ...project.showcase,
        ...(projectOverride.showcase ?? {}),
      },
      storySections: projectOverride.storySections ?? project.storySections,
    };
  });
}

function mergeSkills(source: ResumeSourceDocument["skills"], overrides: ResumeSourceOverrides["skills"]) {
  if (!overrides) {
    return source;
  }

  return source.map((group) => ({
    ...group,
    items: overrides[group.title] ?? group.items,
  }));
}

function filterHiddenEntities(source: ResumeSourceDocument, overrides: ResumeSourceOverrides): ResumeSourceDocument {
  const hiddenExperienceIds = new Set(overrides.hiddenExperienceIds ?? []);
  const hiddenProjectSlugs = new Set(overrides.hiddenProjectSlugs ?? []);

  if (hiddenExperienceIds.size === 0 && hiddenProjectSlugs.size === 0) {
    return source;
  }

  return {
    ...source,
    experiences: source.experiences
      .filter((experience) => !hiddenExperienceIds.has(experience.id))
      .map((experience) => ({
        ...experience,
        relatedProjects: experience.relatedProjects?.filter((slug) => !hiddenProjectSlugs.has(slug)),
      })),
    projects: source.projects.filter((project) => !hiddenProjectSlugs.has(project.slug)),
  };
}

function mergeResumeSource(source: ResumeSourceDocument, overrides: ResumeSourceOverrides): ResumeSourceDocument {
  const merged: ResumeSourceDocument = {
    ...source,
    profile: mergeProfile(source.profile, overrides.profile),
    experiences: mergeExperiences(source.experiences, overrides.experiences),
    projects: mergeProjects(source.projects, overrides.projects),
    skills: mergeSkills(source.skills, overrides.skills),
    honors: overrides.honors ?? source.honors,
    education: {
      ...source.education,
      ...(overrides.education ?? {}),
      details: overrides.education?.details ?? source.education.details,
    },
  };

  return filterHiddenEntities(merged, overrides);
}

function mapStorySection(section: ResumeSourceProjectStorySection): ProjectSection {
  if (section.kind === "metrics") {
    return {
      type: "metrics",
      title: section.title,
      items: section.items,
    };
  }

  if (section.kind === "capabilities") {
    return {
      type: "highlights",
      title: section.title,
      items: section.items.map((item) => ({
        title: item.title,
        description: item.detail,
      })),
    };
  }

  if (section.kind === "story") {
    return {
      type: "paragraph",
      title: section.title,
      paragraphs: section.paragraphs,
    };
  }

  if (section.kind === "bullets") {
    return {
      type: "bullets",
      title: section.title,
      items: section.items,
    };
  }

  if (section.kind === "layered_bullets") {
    return {
      type: "layered_bullets",
      title: section.title,
      refinedTitle: section.refinedTitle,
      refinedItems: section.refinedItems,
      originalTitle: section.originalTitle,
      originalItems: section.originalItems,
    };
  }

  if (section.kind === "archive") {
    return {
      type: "archive",
      title: section.title,
      description: section.description,
      sections: section.sections,
    };
  }

  if (section.kind === "stack") {
    return {
      type: "tags",
      title: section.title ?? "技术栈",
      items: section.items,
    };
  }

  return {
    type: "links",
    title: section.title ?? "相关链接",
    items: section.items,
  };
}

function mapProject(project: ResumeSourceDocument["projects"][number]): ProjectDetail {
  return {
    slug: project.slug,
    title: project.title,
    category: project.track,
    meta: project.cardMeta,
    description: project.cardSummary,
    tags: uniq(project.cardTags),
    eyebrow: project.heroEyebrow,
    subtitle: project.heroSubtitle,
    media: resolveProjectMedia(project.slug),
    sections: [
      {
        type: "showcase",
        title: project.showcase.title,
        featuredTitle: project.showcase.featuredTitle,
        featuredDescription: project.showcase.featuredDescription,
        sideBlocks: project.showcase.sideBlocks,
        gallery: project.showcase.gallery,
        note: project.showcase.note,
      },
      ...project.storySections.map(mapStorySection),
    ],
  };
}

export function buildResumeSchema(source: ResumeSourceDocument): ResumeSchema {
  const report = assertValidResumeSource(source);
  if (report.warnings.length > 0) {
    console.warn(`[resume-validation] warnings: ${report.warnings.length}`);
  }

  return {
    schemaVersion: RESUME_SCHEMA_VERSION,
    profile: {
      name: source.profile.name,
      role: source.profile.role,
      bio: source.profile.bio,
      strengths: source.profile.strengths,
      contacts: source.profile.contacts,
    },
    resume: {
      headline: source.profile.headline,
      summaryPoints: source.profile.summaryPoints,
      focusAreas: source.profile.focusAreas,
      profileFacts: source.profile.facts,
      experiences: source.experiences.map((experience) => ({
        id: experience.id,
        company: experience.company,
        role: experience.role,
        period: experience.period,
        summary: experience.summary,
        bullets: experience.achievements,
        details: experience.details,
        projectSlugs: experience.relatedProjects,
        note: experience.note,
      })),
      skillGroups: source.skills,
      honors: source.honors,
      education: source.education,
    },
    projects: source.projects.map(mapProject),
  };
}

export const resolvedResumeSource = mergeResumeSource(resumeSource, resumeOverrides);
export const resumeValidationReport = assertValidResumeSource(resolvedResumeSource);
export const resumeData = buildResumeSchema(resolvedResumeSource);

export const projectSummaries = resumeData.projects.map((project) => ({
  slug: project.slug,
  title: project.title,
  category: project.category,
  meta: project.meta,
  description: project.description,
  tags: project.tags,
})) satisfies ProjectSummary[];

export const featuredProjectCards = projectSummaries.filter((project) => project.category === "featured");
export const openSourceProjectCards = projectSummaries.filter((project) => project.category === "open_source");

const projectIndex = mapByKey(resumeData.projects, "slug");

export function getProjectBySlug(slug: string) {
  return projectIndex.get(slug);
}

export function getProjectHref(slug: string) {
  return `/projects/${slug}`;
}

