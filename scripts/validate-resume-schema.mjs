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
  if (exportIndex < 0) throw new Error(`Could not find export marker: ${marker}`);
  const startIndex = moduleText.indexOf("{", exportIndex + marker.length);
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
  const objectLiteral = extractObjectLiteral(raw, marker).replaceAll("RESUME_SCHEMA_VERSION", JSON.stringify(SCHEMA_VERSION));
  return Function(`"use strict"; return (${objectLiteral});`)();
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidHref(href) {
  if (typeof href !== "string" || href.length === 0) return false;
  if (href.startsWith("/")) return true;
  if (href.startsWith("mailto:")) return href.length > "mailto:".length;
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

function validateEntries(report, entries, pathValue) {
  const ids = new Set();
  const keys = new Set();
  for (const [index, entry] of (entries ?? []).entries()) {
    if (!isNonEmptyString(entry.id)) {
      pushIssue(report, "error", `${pathValue}[${index}].id`, "条目 id 不能为空。");
    } else if (ids.has(entry.id)) {
      pushIssue(report, "error", `${pathValue}[${index}].id`, `条目 id 重复：${entry.id}`);
    } else {
      ids.add(entry.id);
    }
    if (!isNonEmptyString(entry.dedupeKey)) {
      pushIssue(report, "error", `${pathValue}[${index}].dedupeKey`, "条目 dedupeKey 不能为空。");
    } else if (keys.has(entry.dedupeKey)) {
      pushIssue(report, "warning", `${pathValue}[${index}].dedupeKey`, `条目 dedupeKey 重复：${entry.dedupeKey}`);
    } else {
      keys.add(entry.dedupeKey);
    }
    if (!isNonEmptyString(entry.text)) {
      pushIssue(report, "error", `${pathValue}[${index}].text`, "条目 text 不能为空。");
    }
  }
}

function validateLayeredContent(report, content, pathValue) {
  if (!content) return;
  validateEntries(report, content.summary, `${pathValue}.summary`);
  validateEntries(report, content.refined, `${pathValue}.refined`);
  validateEntries(report, content.original, `${pathValue}.original`);
}

function mergeEntries(base = [], override = []) {
  const merged = new Map(base.map((entry) => [entry.dedupeKey, entry]));
  for (const entry of override) {
    merged.set(entry.dedupeKey, entry);
  }
  return Array.from(merged.values());
}

function mergeLayeredContent(base, override) {
  if (!base && !override) return undefined;
  const merged = {
    summary: mergeEntries(base?.summary, override?.summary),
    refined: mergeEntries(base?.refined, override?.refined),
    original: mergeEntries(base?.original, override?.original),
  };
  if (merged.summary.length === 0) delete merged.summary;
  if (merged.refined.length === 0) delete merged.refined;
  if (merged.original.length === 0) delete merged.original;
  return Object.keys(merged).length > 0 ? merged : undefined;
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
    experiences: source.experiences.map((experience) => {
      const override = overrides.experiences?.[experience.id];
      return override
        ? {
            ...experience,
            ...override,
            content: mergeLayeredContent(experience.content, override.content),
            highlights: mergeEntries(experience.highlights, override.highlights),
          }
        : experience;
    }),
    projects: source.projects.map((project) => {
      const override = overrides.projects?.[project.slug];
      return override
        ? {
            ...project,
            ...override,
            content: mergeLayeredContent(project.content, override.content),
            showcase: {
              ...project.showcase,
              ...(override.showcase ?? {}),
            },
            storySections: override.storySections ?? project.storySections,
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
  if (!fs.existsSync(assetRoot)) return;
  const knownSlugs = new Set(source.projects.map((project) => project.slug));
  const directories = fs.readdirSync(assetRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  for (const directory of directories) {
    const slug = directory.name;
    const manifestPath = path.join(assetRoot, slug, "manifest.json");
    if (!fs.existsSync(manifestPath)) continue;
    if (!knownSlugs.has(slug)) {
      pushIssue(report, "warning", `project-assets/${slug}`, "存在素材 manifest，但没有对应项目 slug。");
      continue;
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const assets = [manifest.featured].filter(Boolean).concat(manifest.gallery ?? []);
    for (const [index, asset] of assets.entries()) {
      if (!isNonEmptyString(asset.title)) pushIssue(report, "error", `project-assets/${slug}.assets[${index}].title`, "素材标题不能为空。");
      if (!isNonEmptyString(asset.src)) {
        pushIssue(report, "error", `project-assets/${slug}.assets[${index}].src`, "素材地址不能为空。");
        continue;
      }
      if (/^https?:\/\//.test(asset.src) || asset.src.startsWith("/")) continue;
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

  if (source.schemaVersion !== SCHEMA_VERSION) pushIssue(report, "error", "schemaVersion", `schemaVersion 必须为 ${SCHEMA_VERSION}。`);
  if (!isNonEmptyString(source.profile.name)) pushIssue(report, "error", "profile.name", "姓名不能为空。");
  if (!isNonEmptyString(source.profile.role)) pushIssue(report, "error", "profile.role", "职业方向不能为空。");
  if (!isNonEmptyString(source.profile.bio)) pushIssue(report, "error", "profile.bio", "个人简介不能为空。");
  if (!isNonEmptyString(source.profile.headline)) pushIssue(report, "error", "profile.headline", "个人 headline 不能为空。");
  validateLinks(report, source.profile.contacts, "profile.contacts");

  const projectSlugs = new Set();
  for (const [index, project] of source.projects.entries()) {
    const projectPath = `projects[${index}]`;
    if (!isNonEmptyString(project.slug)) pushIssue(report, "error", `${projectPath}.slug`, "项目 slug 不能为空。");
    else if (projectSlugs.has(project.slug)) pushIssue(report, "error", `${projectPath}.slug`, `项目 slug 重复：${project.slug}`);
    else projectSlugs.add(project.slug);
    if (!isNonEmptyString(project.dedupeKey)) pushIssue(report, "error", `${projectPath}.dedupeKey`, "项目 dedupeKey 不能为空。");
    if (!isNonEmptyString(project.title)) pushIssue(report, "error", `${projectPath}.title`, "项目标题不能为空。");
    validateLayeredContent(report, project.content, `${projectPath}.content`);
    const relatedLinks = project.storySections.filter((section) => section.kind === "links").flatMap((section) => section.items);
    validateLinks(report, relatedLinks, `${projectPath}.storySections.links`);
  }

  for (const [index, experience] of source.experiences.entries()) {
    const experiencePath = `experiences[${index}]`;
    if (!isNonEmptyString(experience.id)) pushIssue(report, "error", `${experiencePath}.id`, "经历 id 不能为空。");
    if (!isNonEmptyString(experience.dedupeKey)) pushIssue(report, "error", `${experiencePath}.dedupeKey`, "经历 dedupeKey 不能为空。");
    if (!isNonEmptyString(experience.company)) pushIssue(report, "error", `${experiencePath}.company`, "公司名称不能为空。");
    if (!isNonEmptyString(experience.role)) pushIssue(report, "error", `${experiencePath}.role`, "岗位名称不能为空。");
    if (!isNonEmptyString(experience.period)) pushIssue(report, "error", `${experiencePath}.period`, "经历时间不能为空。");
    else if (!isValidExperiencePeriod(experience.period)) pushIssue(report, "warning", `${experiencePath}.period`, "经历时间建议使用 YYYY.MM - YYYY.MM 或 YYYY.MM - 至今 格式。");
    validateLayeredContent(report, experience.content, `${experiencePath}.content`);
    validateEntries(report, experience.highlights, `${experiencePath}.highlights`);
    for (const slug of experience.relatedProjects ?? []) {
      if (!projectSlugs.has(slug)) pushIssue(report, "error", `${experiencePath}.relatedProjects`, `引用了不存在的项目：${slug}`);
    }
  }

  for (const [index, honor] of source.honors.entries()) {
    if (!isNonEmptyString(honor.id)) pushIssue(report, "error", `honors[${index}].id`, "奖项 id 不能为空。");
    if (!isNonEmptyString(honor.dedupeKey)) pushIssue(report, "error", `honors[${index}].dedupeKey`, "奖项 dedupeKey 不能为空。");
    validateLayeredContent(report, honor.content, `honors[${index}].content`);
  }

  if (!isNonEmptyString(source.education.school)) pushIssue(report, "warning", "education.school", "教育信息缺少学校名称。");
  if (!isNonEmptyString(source.education.degree)) pushIssue(report, "warning", "education.degree", "教育信息缺少学历专业描述。");
  if (!isNonEmptyString(source.education.period)) pushIssue(report, "warning", "education.period", "教育信息缺少时间段。");
  else if (!isValidEducationPeriod(source.education.period)) pushIssue(report, "warning", "education.period", "教育时间建议使用 YYYY - YYYY 或 YYYY - 至今 格式。");

  validateProjectAssets(source, assetRoot, report);
  return report;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const source = parseExportedObject(options.source, SOURCE_EXPORT);
  const overrides = parseExportedObject(options.overrides, OVERRIDE_EXPORT);
  const merged = mergeSource(source, overrides);
  const report = validateSource(merged, options.assetRoot);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("Resume validation complete.");
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

  if (report.errors.length > 0) {
    process.exitCode = 1;
  }
}

main();
