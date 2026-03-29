import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const SOURCE_EXPORT = "export const resumeSource: ResumeSourceDocument = ";
const OVERRIDE_EXPORT = "export const resumeOverrides: ResumeSourceOverrides = ";
const SCHEMA_VERSION = "resume-schema@v1";

function parseArgs(argv) {
  const options = {
    source: path.resolve("src/data/resume-source.ts"),
    overrides: path.resolve("src/data/resume-overrides.ts"),
    assetRoot: path.resolve("public/project-assets"),
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") {
      options.source = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--overrides") {
      options.overrides = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--asset-root") {
      options.assetRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
    }
  }

  return options;
}

function extractObjectLiteral(moduleText, marker) {
  const exportIndex = moduleText.indexOf(marker);
  if (exportIndex < 0) {
    throw new Error(`Could not find export marker: ${marker}`);
  }

  const startIndex = moduleText.indexOf("{", exportIndex + marker.length);
  if (startIndex < 0) {
    throw new Error(`Could not locate object literal start for export: ${marker}`);
  }

  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;

  for (let index = startIndex; index < moduleText.length; index += 1) {
    const char = moduleText[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return moduleText.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error(`Could not locate object literal end for export: ${marker}`);
}

function parseExportedObject(filePath, marker) {
  const raw = fs.readFileSync(filePath, "utf8");
  const objectLiteral = extractObjectLiteral(raw, marker)
    .replaceAll("RESUME_SCHEMA_VERSION", JSON.stringify(SCHEMA_VERSION));
  return Function(`"use strict"; return (${objectLiteral});`)();
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidHref(href) {
  if (typeof href !== "string" || href.length === 0) {
    return false;
  }
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

function isValidExperiencePeriod(period) {
  return /^\d{4}[./]\d{2}\s*-\s*(\d{4}[./]\d{2}|至今)$/.test(period);
}

function isValidEducationPeriod(period) {
  return /^\d{4}\s*-\s*(\d{4}|至今)$/.test(period);
}

function pushIssue(report, level, pathValue, message) {
  report[level === "error" ? "errors" : "warnings"].push({ level, path: pathValue, message });
}

function validateLinks(report, links, pathValue) {
  for (const [index, link] of (links ?? []).entries()) {
    if (!isNonEmptyString(link.label)) {
      pushIssue(report, "error", `${pathValue}[${index}].label`, "链接标题不能为空。");
    }
    if (!isValidHref(link.href)) {
      pushIssue(report, "error", `${pathValue}[${index}].href`, "链接地址非法或为空。");
    }
  }
}

function validateProjectArchive(report, project, projectPath) {
  const archiveSections = (project.storySections ?? []).filter((section) => section.kind === "archive");
  if (archiveSections.length === 0) {
    pushIssue(report, "warning", `${projectPath}.storySections`, "建议项目提供 archive 档案区，保证简历原始信息可完整落到详情页。");
    return;
  }

  if (archiveSections.length > 1) {
    pushIssue(report, "warning", `${projectPath}.storySections`, "项目存在多个 archive 档案区，建议合并为单个“项目档案”。");
  }

  const archive = archiveSections[0];
  if (archive.title !== "项目档案") {
    pushIssue(report, "warning", `${projectPath}.storySections.archive.title`, "archive 标题建议统一为“项目档案”。");
  }

  const requiredTitles = ["项目介绍", "主要工作", "技术档案"];
  const existingTitles = new Set((archive.sections ?? []).map((section) => section.title));
  for (const title of requiredTitles) {
    if (!existingTitles.has(title)) {
      pushIssue(report, "warning", `${projectPath}.storySections.archive.sections`, `archive 建议包含“${title}”栏目。`);
    }
  }

  const legacySections = (archive.sections ?? []).filter((section) => !requiredTitles.includes(section.title));
  if (legacySections.length > 0) {
    pushIssue(report, "warning", `${projectPath}.storySections.archive.sections`, `archive 仍含旧栏目命名：${legacySections.map((section) => section.title).join("、")}。`);
  }
}

function mergeSource(source, overrides) {
  return {
    ...source,
    profile: {
      ...source.profile,
      ...(overrides.profile ?? {}),
      strengths: overrides.profile?.strengths ?? source.profile.strengths,
      summaryPoints: overrides.profile?.summaryPoints ?? source.profile.summaryPoints,
      focusAreas: overrides.profile?.focusAreas ?? source.profile.focusAreas,
      facts: overrides.profile?.facts ?? source.profile.facts,
      contacts: overrides.profile?.contacts ?? source.profile.contacts,
    },
    experiences: source.experiences.map((experience) => ({
      ...experience,
      ...(overrides.experiences?.[experience.id] ?? {}),
    })),
    projects: source.projects.map((project) => {
      const projectOverride = overrides.projects?.[project.slug];
      return projectOverride
        ? {
            ...project,
            ...projectOverride,
            showcase: {
              ...project.showcase,
              ...(projectOverride.showcase ?? {}),
            },
            storySections: projectOverride.storySections ?? project.storySections,
          }
        : project;
    }),
    skills: source.skills.map((group) => ({
      ...group,
      items: overrides.skills?.[group.title] ?? group.items,
    })),
    honors: overrides.honors ?? source.honors,
    education: {
      ...source.education,
      ...(overrides.education ?? {}),
      details: overrides.education?.details ?? source.education.details,
    },
  };
}

function validateProjectAssets(source, assetRoot, report) {
  if (!fs.existsSync(assetRoot)) {
    return;
  }

  const knownSlugs = new Set(source.projects.map((project) => project.slug));
  const directories = fs.readdirSync(assetRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());

  for (const directory of directories) {
    const slug = directory.name;
    const manifestPath = path.join(assetRoot, slug, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
      continue;
    }
    if (!knownSlugs.has(slug)) {
      pushIssue(report, "warning", `project-assets/${slug}`, "存在素材 manifest，但没有对应项目 slug。");
      continue;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const assets = [manifest.featured].filter(Boolean).concat(manifest.gallery ?? []);
    for (const [index, asset] of assets.entries()) {
      if (!isNonEmptyString(asset.title)) {
        pushIssue(report, "error", `project-assets/${slug}.assets[${index}].title`, "素材标题不能为空。");
      }
      if (!isNonEmptyString(asset.src)) {
        pushIssue(report, "error", `project-assets/${slug}.assets[${index}].src`, "素材地址不能为空。");
        continue;
      }
      if (/^https?:\/\//.test(asset.src) || asset.src.startsWith("/")) {
        continue;
      }
      const localAssetPath = path.join(assetRoot, slug, asset.src.replace(/^\.\//, ""));
      if (!fs.existsSync(localAssetPath)) {
        pushIssue(report, "error", `project-assets/${slug}.assets[${index}].src`, `引用的本地素材不存在：${asset.src}`);
      }
    }
    validateLinks(report, manifest.resources, `project-assets/${slug}.resources`);
  }
}

function validateSource(source, assetRoot) {
  const report = { errors: [], warnings: [] };

  if (source.schemaVersion !== SCHEMA_VERSION) {
    pushIssue(report, "error", "schemaVersion", `schemaVersion 必须为 ${SCHEMA_VERSION}。`);
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
    pushIssue(report, "error", "profile.headline", "headline 不能为空。");
  }
  if ((source.profile.strengths ?? []).length === 0) {
    pushIssue(report, "warning", "profile.strengths", "建议至少提供一条优势描述。");
  }
  validateLinks(report, source.profile.contacts, "profile.contacts");

  const projectSlugs = new Set();
  for (const [index, project] of source.projects.entries()) {
    const projectPath = `projects[${index}]`;
    if (!isNonEmptyString(project.slug)) {
      pushIssue(report, "error", `${projectPath}.slug`, "项目 slug 不能为空。");
    } else if (projectSlugs.has(project.slug)) {
      pushIssue(report, "error", `${projectPath}.slug`, `项目 slug 重复：${project.slug}`);
    } else {
      projectSlugs.add(project.slug);
    }
    if (!isNonEmptyString(project.title)) {
      pushIssue(report, "error", `${projectPath}.title`, "项目标题不能为空。");
    }
    if ((project.cardMeta ?? []).length === 0) {
      pushIssue(report, "warning", `${projectPath}.cardMeta`, "建议至少提供一条项目元信息。");
    }
    if (!isNonEmptyString(project.cardSummary)) {
      pushIssue(report, "error", `${projectPath}.cardSummary`, "项目摘要不能为空。");
    }
    if ((project.storySections ?? []).length === 0) {
      pushIssue(report, "warning", `${projectPath}.storySections`, "项目缺少 storySections。");
    }
    const links = (project.storySections ?? []).filter((section) => section.kind === "links").flatMap((section) => section.items ?? []);
    validateLinks(report, links, `${projectPath}.links`);
    validateProjectArchive(report, project, projectPath);
  }

  const experienceIds = new Set();
  for (const [index, experience] of source.experiences.entries()) {
    const experiencePath = `experiences[${index}]`;
    if (!isNonEmptyString(experience.id)) {
      pushIssue(report, "error", `${experiencePath}.id`, "经历 id 不能为空。");
    } else if (experienceIds.has(experience.id)) {
      pushIssue(report, "error", `${experiencePath}.id`, `经历 id 重复：${experience.id}`);
    } else {
      experienceIds.add(experience.id);
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
    for (const slug of experience.relatedProjects ?? []) {
      if (!projectSlugs.has(slug)) {
        pushIssue(report, "error", `${experiencePath}.relatedProjects`, `引用了不存在的项目：${slug}`);
      }
    }
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

  validateProjectAssets(source, assetRoot, report);
  return report;
}

function printReport(report, useJson) {
  if (useJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`Resume validation complete.`);
  console.log(`- errors: ${report.errors.length}`);
  console.log(`- warnings: ${report.warnings.length}`);

  if (report.errors.length > 0) {
    console.log("Errors:");
    for (const issue of report.errors) {
      console.log(`- ${issue.path}: ${issue.message}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log("Warnings:");
    for (const issue of report.warnings) {
      console.log(`- ${issue.path}: ${issue.message}`);
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const source = parseExportedObject(options.source, SOURCE_EXPORT);
  const overrides = parseExportedObject(options.overrides, OVERRIDE_EXPORT);
  const merged = mergeSource(source, overrides);
  const report = validateSource(merged, options.assetRoot);
  printReport(report, options.json);
  if (report.errors.length > 0) {
    process.exitCode = 1;
  }
}

main();



