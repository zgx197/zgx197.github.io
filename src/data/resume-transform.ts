import { resolveProjectMedia } from "./project-assets";
import { resumeOverrides, type ResumeSourceOverrides } from "./resume-overrides";
import { RESUME_SCHEMA_VERSION, type DetailLayerContent, type ProjectDetail, type ProjectSection, type ProjectSummary, type ResumeSchema } from "./resume-schema";
import { resumeSource, type ResumeSourceDocument, type ResumeSourceLayeredText, type ResumeSourceProjectStorySection, type ResumeSourceTextEntry } from "./resume-source";
import { assertValidResumeSource } from "./resume-validation";

function uniq(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function mergeTextEntries(base: ResumeSourceTextEntry[] | undefined, override: ResumeSourceTextEntry[] | undefined) {
  const merged = new Map<string, ResumeSourceTextEntry>();

  for (const entry of base ?? []) {
    if (entry?.text) {
      merged.set(entry.dedupeKey, entry);
    }
  }

  for (const entry of override ?? []) {
    if (entry?.text) {
      merged.set(entry.dedupeKey, entry);
    }
  }

  return Array.from(merged.values());
}

function mergeLayeredText(base?: ResumeSourceLayeredText, override?: Partial<ResumeSourceLayeredText>) {
  if (!base && !override) {
    return undefined;
  }

  const merged: ResumeSourceLayeredText = {
    summary: mergeTextEntries(base?.summary, override?.summary),
    refined: mergeTextEntries(base?.refined, override?.refined),
    original: mergeTextEntries(base?.original, override?.original),
  };

  if ((merged.summary?.length ?? 0) === 0) {
    delete merged.summary;
  }
  if ((merged.refined?.length ?? 0) === 0) {
    delete merged.refined;
  }
  if ((merged.original?.length ?? 0) === 0) {
    delete merged.original;
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

function readLayerTexts(entries?: ResumeSourceTextEntry[]) {
  return (entries ?? []).map((entry) => entry.text).filter(Boolean);
}

function resolveLeadText(content?: ResumeSourceLayeredText) {
  return readLayerTexts(content?.summary)[0]
    ?? readLayerTexts(content?.refined)[0]
    ?? readLayerTexts(content?.original)[0]
    ?? "";
}

function buildDetailLayerContent(content?: ResumeSourceLayeredText): DetailLayerContent | undefined {
  if (!content) {
    return undefined;
  }

  const refined = readLayerTexts(content.refined);
  const original = readLayerTexts(content.original);

  if (refined.length === 0 && original.length === 0) {
    return undefined;
  }

  return {
    refinedTitle: refined.length > 0 ? "整理后的详细说明" : undefined,
    refined,
    originalTitle: original.length > 0 ? "简历原文" : undefined,
    original,
  };
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
    if (!experienceOverride) {
      return experience;
    }

    return {
      ...experience,
      ...experienceOverride,
      content: mergeLayeredText(experience.content, experienceOverride.content),
      highlights: mergeTextEntries(experience.highlights, experienceOverride.highlights),
    };
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
      content: mergeLayeredText(project.content, projectOverride.content),
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

function mergeHonors(source: ResumeSourceDocument["honors"], overrides: ResumeSourceOverrides["honors"]) {
  if (!overrides || overrides.length === 0) {
    return source;
  }

  const merged = new Map(source.map((honor) => [honor.dedupeKey, honor]));
  for (const honor of overrides) {
    const existing = merged.get(honor.dedupeKey);
    if (!existing) {
      merged.set(honor.dedupeKey, honor);
      continue;
    }

    merged.set(honor.dedupeKey, {
      ...existing,
      ...honor,
      content: mergeLayeredText(existing.content, honor.content),
    });
  }

  return Array.from(merged.values());
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
    honors: mergeHonors(source.honors, overrides.honors),
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
      title: section.title ?? "技术标签",
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
  const description = resolveLeadText({ summary: project.content?.summary, refined: undefined, original: undefined })
    || resolveLeadText(project.content);
  const subtitle = readLayerTexts(project.content?.refined)[0] ?? description;

  return {
    slug: project.slug,
    title: project.title,
    category: project.track,
    meta: project.cardMeta,
    description,
    tags: uniq(project.cardTags),
    eyebrow: project.heroEyebrow,
    subtitle,
    media: resolveProjectMedia(project.slug),
    sections: project.storySections.map(mapStorySection),
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
        summary: resolveLeadText(experience.content),
        bullets: readLayerTexts(experience.highlights),
        details: buildDetailLayerContent(experience.content),
        projectSlugs: experience.relatedProjects,
        note: experience.note,
      })),
      skillGroups: source.skills,
      honors: source.honors.map((honor) => resolveLeadText(honor.content)).filter(Boolean),
      education: source.education,
    },
    projects: source.projects.map((project) => mapProject(project)),
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

export function getProjectBySlug(slug: string) {
  return resumeData.projects.find((project) => project.slug === slug);
}

export function getProjectHref(slug: string) {
  return `/projects/${slug}`;
}
