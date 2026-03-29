import { RESUME_SCHEMA_VERSION, type LinkItem } from "./resume-schema";
import { listProjectManifestSlugs, resolveProjectMedia } from "./project-assets";
import type { ResumeSourceDocument, ResumeSourceLayeredText, ResumeSourceTextEntry } from "./resume-source";

export type ResumeValidationIssue = {
  level: "error" | "warning";
  path: string;
  message: string;
};

export type ResumeValidationReport = {
  errors: ResumeValidationIssue[];
  warnings: ResumeValidationIssue[];
};

function pushIssue(report: ResumeValidationReport, level: ResumeValidationIssue["level"], path: string, message: string) {
  report[level === "error" ? "errors" : "warnings"].push({ level, path, message });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidLinkHref(href: string) {
  if (href.startsWith("/")) {
    return true;
  }

  if (href.startsWith("mailto:")) {
    return href.length > "mailto:".length;
  }

  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidExperiencePeriod(period: string) {
  return /^\d{4}[./]\d{2}\s*-\s*(\d{4}[./]\d{2}|至今)$/.test(period);
}

function isValidEducationPeriod(period: string) {
  return /^\d{4}\s*-\s*(\d{4}|至今)$/.test(period);
}

function validateLinks(report: ResumeValidationReport, links: LinkItem[] | undefined, path: string) {
  for (const [index, link] of (links ?? []).entries()) {
    if (!isNonEmptyString(link.label)) {
      pushIssue(report, "error", `${path}[${index}].label`, "链接 label 不能为空。");
    }
    if (!isNonEmptyString(link.href) || !isValidLinkHref(link.href)) {
      pushIssue(report, "error", `${path}[${index}].href`, "链接 href 非法或为空。");
    }
  }
}

function validateTextEntries(report: ResumeValidationReport, entries: ResumeSourceTextEntry[] | undefined, path: string) {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();

  for (const [index, entry] of (entries ?? []).entries()) {
    if (!isNonEmptyString(entry.id)) {
      pushIssue(report, "error", `${path}[${index}].id`, "文本条目 id 不能为空。");
    } else if (seenIds.has(entry.id)) {
      pushIssue(report, "error", `${path}[${index}].id`, `文本条目 id 重复：${entry.id}`);
    } else {
      seenIds.add(entry.id);
    }

    if (!isNonEmptyString(entry.dedupeKey)) {
      pushIssue(report, "error", `${path}[${index}].dedupeKey`, "文本条目 dedupeKey 不能为空。");
    } else if (seenKeys.has(entry.dedupeKey)) {
      pushIssue(report, "warning", `${path}[${index}].dedupeKey`, `同一层内存在重复 dedupeKey：${entry.dedupeKey}`);
    } else {
      seenKeys.add(entry.dedupeKey);
    }

    if (!isNonEmptyString(entry.text)) {
      pushIssue(report, "error", `${path}[${index}].text`, "文本条目 text 不能为空。");
    }
  }
}

function validateLayeredContent(report: ResumeValidationReport, content: ResumeSourceLayeredText | undefined, path: string) {
  if (!content) {
    return;
  }

  validateTextEntries(report, content.summary, `${path}.summary`);
  validateTextEntries(report, content.refined, `${path}.refined`);
  validateTextEntries(report, content.original, `${path}.original`);

  if ((content.summary?.length ?? 0) === 0 && (content.refined?.length ?? 0) === 0 && (content.original?.length ?? 0) === 0) {
    pushIssue(report, "warning", path, "分层内容为空，建议至少保留一层文本。");
  }
}

export function validateResumeSource(source: ResumeSourceDocument): ResumeValidationReport {
  const report: ResumeValidationReport = { errors: [], warnings: [] };

  if (source.schemaVersion !== RESUME_SCHEMA_VERSION) {
    pushIssue(report, "error", "schemaVersion", `schemaVersion 必须为 ${RESUME_SCHEMA_VERSION}。`);
  }

  if (!isNonEmptyString(source.profile.name)) {
    pushIssue(report, "error", "profile.name", "姓名不能为空。");
  }
  if (!isNonEmptyString(source.profile.role)) {
    pushIssue(report, "error", "profile.role", "职业方向不能为空。");
  }
  if (!isNonEmptyString(source.profile.bio)) {
    pushIssue(report, "error", "profile.bio", "个人简介不能为空。");
  }
  if (!isNonEmptyString(source.profile.headline)) {
    pushIssue(report, "error", "profile.headline", "简历 headline 不能为空。");
  }
  if ((source.profile.strengths ?? []).length === 0) {
    pushIssue(report, "warning", "profile.strengths", "建议至少提供一条优势描述。");
  }
  validateLinks(report, source.profile.contacts, "profile.contacts");

  const projectSlugs = new Set<string>();
  for (const [index, project] of source.projects.entries()) {
    const projectPath = `projects[${index}]`;
    if (!isNonEmptyString(project.slug)) {
      pushIssue(report, "error", `${projectPath}.slug`, "项目 slug 不能为空。");
    } else if (projectSlugs.has(project.slug)) {
      pushIssue(report, "error", `${projectPath}.slug`, `项目 slug 重复：${project.slug}`);
    } else {
      projectSlugs.add(project.slug);
    }

    if (!isNonEmptyString(project.dedupeKey)) {
      pushIssue(report, "error", `${projectPath}.dedupeKey`, "项目 dedupeKey 不能为空。");
    }
    if (!isNonEmptyString(project.title)) {
      pushIssue(report, "error", `${projectPath}.title`, "项目标题不能为空。");
    }
    if ((project.cardMeta ?? []).length === 0) {
      pushIssue(report, "warning", `${projectPath}.cardMeta`, "建议至少提供一条项目元信息。");
    }
    validateLayeredContent(report, project.content, `${projectPath}.content`);
    if ((project.storySections ?? []).length === 0) {
      pushIssue(report, "warning", `${projectPath}.storySections`, "项目缺少正文 sections。");
    }

    const relatedLinks = project.storySections
      .filter((section) => section.kind === "links")
      .flatMap((section) => section.items);
    validateLinks(report, relatedLinks, `${projectPath}.storySections.links`);

    const media = resolveProjectMedia(project.slug);
    validateLinks(report, media.resources, `${projectPath}.media.resources`);
    for (const [mediaIndex, item] of media.gallery.entries()) {
      if (!isNonEmptyString(item.title)) {
        pushIssue(report, "error", `${projectPath}.media.gallery[${mediaIndex}].title`, "媒体标题不能为空。");
      }
      if (!isNonEmptyString(item.src) || !isValidLinkHref(item.src)) {
        pushIssue(report, "error", `${projectPath}.media.gallery[${mediaIndex}].src`, "媒体资源地址非法或为空。");
      }
    }
    if (media.featured && (!isNonEmptyString(media.featured.title) || !isValidLinkHref(media.featured.src))) {
      pushIssue(report, "error", `${projectPath}.media.featured`, "主媒体缺少合法标题或资源地址。");
    }
  }

  const experienceIds = new Set<string>();
  const experienceKeys = new Set<string>();
  for (const [index, experience] of source.experiences.entries()) {
    const experiencePath = `experiences[${index}]`;
    if (!isNonEmptyString(experience.id)) {
      pushIssue(report, "error", `${experiencePath}.id`, "经历 id 不能为空。");
    } else if (experienceIds.has(experience.id)) {
      pushIssue(report, "error", `${experiencePath}.id`, `经历 id 重复：${experience.id}`);
    } else {
      experienceIds.add(experience.id);
    }

    if (!isNonEmptyString(experience.dedupeKey)) {
      pushIssue(report, "error", `${experiencePath}.dedupeKey`, "经历 dedupeKey 不能为空。");
    } else if (experienceKeys.has(experience.dedupeKey)) {
      pushIssue(report, "warning", `${experiencePath}.dedupeKey`, `经历 dedupeKey 重复：${experience.dedupeKey}`);
    } else {
      experienceKeys.add(experience.dedupeKey);
    }

    if (!isNonEmptyString(experience.company)) {
      pushIssue(report, "error", `${experiencePath}.company`, "公司名称不能为空。");
    }
    if (!isNonEmptyString(experience.role)) {
      pushIssue(report, "error", `${experiencePath}.role`, "岗位名称不能为空。");
    }
    if (!isNonEmptyString(experience.period)) {
      pushIssue(report, "error", `${experiencePath}.period`, "经历时间不能为空。");
    } else if (!isValidExperiencePeriod(experience.period)) {
      pushIssue(report, "warning", `${experiencePath}.period`, "经历时间建议使用 YYYY.MM - YYYY.MM 或 YYYY.MM - 至今 格式。");
    }

    validateLayeredContent(report, experience.content, `${experiencePath}.content`);
    validateTextEntries(report, experience.highlights, `${experiencePath}.highlights`);
    for (const slug of experience.relatedProjects ?? []) {
      if (!projectSlugs.has(slug)) {
        pushIssue(report, "error", `${experiencePath}.relatedProjects`, `引用了不存在的项目：${slug}`);
      }
    }
  }

  const honorIds = new Set<string>();
  const honorKeys = new Set<string>();
  for (const [index, honor] of source.honors.entries()) {
    const honorPath = `honors[${index}]`;
    if (!isNonEmptyString(honor.id)) {
      pushIssue(report, "error", `${honorPath}.id`, "奖项 id 不能为空。");
    } else if (honorIds.has(honor.id)) {
      pushIssue(report, "error", `${honorPath}.id`, `奖项 id 重复：${honor.id}`);
    } else {
      honorIds.add(honor.id);
    }

    if (!isNonEmptyString(honor.dedupeKey)) {
      pushIssue(report, "error", `${honorPath}.dedupeKey`, "奖项 dedupeKey 不能为空。");
    } else if (honorKeys.has(honor.dedupeKey)) {
      pushIssue(report, "warning", `${honorPath}.dedupeKey`, `奖项 dedupeKey 重复：${honor.dedupeKey}`);
    } else {
      honorKeys.add(honor.dedupeKey);
    }

    validateLayeredContent(report, honor.content, `${honorPath}.content`);
  }

  for (const [index, group] of source.skills.entries()) {
    if (!isNonEmptyString(group.title)) {
      pushIssue(report, "error", `skills[${index}].title`, "技能分组标题不能为空。");
    }
    if ((group.items ?? []).length === 0) {
      pushIssue(report, "warning", `skills[${index}].items`, "技能分组为空，建议补充内容。");
    }
  }

  if (!isNonEmptyString(source.education.school)) {
    pushIssue(report, "warning", "education.school", "教育信息缺少学校名称。");
  }
  if (!isNonEmptyString(source.education.degree)) {
    pushIssue(report, "warning", "education.degree", "教育信息缺少学历专业描述。");
  }
  if (!isNonEmptyString(source.education.period)) {
    pushIssue(report, "warning", "education.period", "教育信息缺少时间段。");
  } else if (!isValidEducationPeriod(source.education.period)) {
    pushIssue(report, "warning", "education.period", "教育时间建议使用 YYYY - YYYY 或 YYYY - 至今 格式。");
  }

  const manifestSlugs = listProjectManifestSlugs();
  for (const slug of manifestSlugs) {
    if (!projectSlugs.has(slug)) {
      pushIssue(report, "warning", `project-assets/${slug}`, "存在素材目录，但正式项目中没有对应 slug。");
    }
  }

  return report;
}

export function assertValidResumeSource(source: ResumeSourceDocument) {
  const report = validateResumeSource(source);
  if (report.errors.length > 0) {
    const lines = report.errors.map((issue) => `${issue.path}: ${issue.message}`);
    throw new Error(`[resume-validation]\n${lines.join("\n")}`);
  }
  return report;
}
