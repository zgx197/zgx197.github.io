import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const EXPORT_MARKER = "export const resumeSource: ResumeSourceDocument = ";
const SCHEMA_VERSION = "resume-schema@v1";
const MERGE_REPORT_SCHEMA_VERSION = "resume-merge-report@v1";
const SAFE_EXISTING_PROJECT_SECTION_KINDS = new Set(["metrics", "stack", "links", "archive"]);

function parseArgs(argv) {
  const options = {
    input: undefined,
    target: path.resolve("src/data/resume-source.ts"),
    backupDir: path.resolve("generated/resume-import/backups"),
    reportOut: undefined,
    parsedCandidate: undefined,
    candidateValidation: undefined,
    fieldCandidates: undefined,
    fieldValidation: undefined,
    write: false,
    mode: "safe",
    allowRiskyProfile: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") {
      options.input = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--target") {
      options.target = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--backup-dir") {
      options.backupDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--report-out") {
      options.reportOut = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--parsed-candidate") {
      options.parsedCandidate = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--candidate-validation") {
      options.candidateValidation = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--field-candidates") {
      options.fieldCandidates = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--field-validation") {
      options.fieldValidation = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--write") {
      options.write = true;
      continue;
    }
    if (arg === "--mode") {
      options.mode = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--legacy") {
      options.mode = "legacy";
      continue;
    }
    if (arg === "--allow-risky-profile") {
      options.allowRiskyProfile = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
  }

  if (!["safe", "legacy"].includes(options.mode)) {
    throw new Error(`Unsupported merge mode: ${options.mode}`);
  }

  return options;
}

async function resolveLatestImportedSource() {
  const directory = path.resolve("generated/resume-import");
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".resume-source.json"))
    .map((entry) => path.join(directory, entry.name));

  if (candidates.length === 0) {
    throw new Error("No imported resume-source json found under generated/resume-import.");
  }

  const stats = await Promise.all(candidates.map(async (candidate) => ({
    candidate,
    stat: await fs.stat(candidate),
  })));

  stats.sort((left, right) => right.stat.mtimeMs - left.stat.mtimeMs);
  return stats[0].candidate;
}

function deriveBundlePaths(inputPath, options) {
  const resumeSourcePath = path.resolve(inputPath);
  const replaceSuffix = (suffix, fallbackSuffix) => {
    const baseName = path.basename(resumeSourcePath);
    if (baseName.endsWith(".resume-source.json")) {
      return path.join(path.dirname(resumeSourcePath), baseName.replace(/\.resume-source\.json$/, suffix));
    }
    return path.join(path.dirname(resumeSourcePath), `${path.basename(resumeSourcePath, path.extname(resumeSourcePath))}${fallbackSuffix}`);
  };

  return {
    resumeSourcePath,
    parsedCandidatePath: options.parsedCandidate ?? replaceSuffix(".parsed-candidate.json", ".parsed-candidate.json"),
    candidateValidationPath: options.candidateValidation ?? replaceSuffix(".candidate-validation-report.json", ".candidate-validation-report.json"),
    fieldCandidatesPath: options.fieldCandidates ?? replaceSuffix(".field-candidates.json", ".field-candidates.json"),
    fieldValidationPath: options.fieldValidation ?? replaceSuffix(".field-candidate-validation-report.json", ".field-candidate-validation-report.json"),
    reportPath: options.reportOut ?? replaceSuffix(".merge-report.json", ".merge-report.json"),
  };
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function summarizeValue(value, maxLength = 220) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (typeof value[0] === "string") return value.length <= 6 ? value : [...value.slice(0, 6), `…(${value.length - 6} more)`];
    return `Array(${value.length})`;
  }
  if (typeof value === "object") return `Object(${Object.keys(value).length})`;
  return value;
}

function pushChange(report, pathValue, kind, before, after, detail) {
  report.diff.push({
    path: pathValue,
    kind,
    before: summarizeValue(before),
    after: summarizeValue(after),
    detail,
  });
}

function pushSkipped(report, scope, detail) {
  report.skipped.push({ scope, detail });
}

function recordIfChanged(report, pathValue, before, after, detail, kind = "update") {
  if (!sameValue(before, after)) {
    pushChange(report, pathValue, kind, before, after, detail);
  }
}

function extractObjectLiteral(moduleText, marker) {
  const exportIndex = moduleText.indexOf(marker);
  if (exportIndex < 0) throw new Error(`Could not find export marker: ${marker}`);
  const startIndex = moduleText.indexOf("{", exportIndex + marker.length);
  if (startIndex < 0) throw new Error(`Could not locate object literal start for export: ${marker}`);

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

async function parseSourceModule(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const objectLiteral = extractObjectLiteral(raw, EXPORT_MARKER)
    .replaceAll("RESUME_SCHEMA_VERSION", JSON.stringify(SCHEMA_VERSION));
  const document = Function(`"use strict"; return (${objectLiteral});`)();
  return { raw, document };
}

function serializeModule(rawModuleText, document) {
  const objectLiteral = extractObjectLiteral(rawModuleText, EXPORT_MARKER);
  return rawModuleText.replace(objectLiteral, JSON.stringify(document, null, 2));
}

function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function normalizeTextKey(text) {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[，。,、；：:（）()【】\[\]“”"'‘’`~!@#$%^&*_+=<>?/\\|-]/g, "");
}

function normalizePeriodKey(period) {
  return normalizeText(period).replace(/[\s–-]+/g, "");
}

const PROJECT_IDENTITY_RULES = [
  { slug: "framesync-skill-runtime", dedupeKey: "framesync-skill-runtime", patterns: [/framesync/i, /释放/, /执行系统/] },
  { slug: "framesync-skill-editor", dedupeKey: "framesync-skill-editor", patterns: [/framesync/i, /逻辑编辑器/] },
  { slug: "sceneblueprint", dedupeKey: "scene-blueprint", patterns: [/scene\s*blueprint/i, /场景蓝图/] },
  { slug: "stage-designer", dedupeKey: "stage-designer", patterns: [/stage\s*designer/i, /snap\s*grid\s*flow/i, /场景设计平台/] },
  { slug: "xiuxian-game", dedupeKey: "xiuxian-game", patterns: [/修仙/] },
  { slug: "knowledge-graph", dedupeKey: "knowledge-graph", patterns: [/短文本知识标注/, /knowledge\s*tagging/i, /text\s*to\s*knowledge/i] },
  { slug: "baike-knowledge-base", dedupeKey: "baike-knowledge-base", patterns: [/百科词条.*知识库/, /百科.*知识库/, /baike/i] },
  { slug: "desktop-pet", dedupeKey: "desktop-pet", patterns: [/桌宠/] },
  { slug: "tower-defense", dedupeKey: "tower-defense", patterns: [/塔防/] },
];

function resolveProjectIdentity(project, fallbackSlug) {
  const joined = [project.title, project.slug, ...(project.cardMeta ?? []), ...(project.cardTags ?? [])].filter(Boolean).join(" ");
  for (const rule of PROJECT_IDENTITY_RULES) {
    if (rule.patterns.every((pattern) => pattern.test(joined))) {
      return { slug: rule.slug, dedupeKey: rule.dedupeKey };
    }
  }

  return {
    slug: fallbackSlug || project.slug,
    dedupeKey: project.dedupeKey || normalizeTextKey(project.title || project.slug) || fallbackSlug || project.slug,
  };
}

function slugifyProjectTitle(title) {
  const tokens = Array.from(title.matchAll(/[A-Za-z0-9]+/g), (match) => match[0].toLowerCase());
  const base = tokens.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const fallback = normalizeTextKey(title).slice(0, 24);
  return base || fallback || `project-${Math.abs(hashCode(title))}`;
}

function hashCode(text) {
  let hash = 0;
  const value = String(text ?? "");
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function buildHonorDedupeKey(text) {
  const value = normalizeText(text);
  const year = value.match(/\b(20\d{2})\b/)?.[1] ?? "unknown";
  const level = value.match(/(特等奖|金牌|银牌|铜牌|一等奖|二等奖|三等奖)/)?.[1] ?? "";
  if (/专利|发明人/.test(value)) return `${year}|patent`;
  if (/部门奖|项目奖/.test(value)) return `${year}|department-award`;
  if (/零度突破之星/.test(value)) return `${year}|breakthrough-star`;
  if (/ICPC/.test(value)) return `${year}|icpc|${level || normalizeTextKey(value)}`;
  if (/CCPC/.test(value)) return `${year}|ccpc|${level || normalizeTextKey(value)}`;
  if (/蓝桥杯/.test(value)) return `${year}|lanqiao|${level || normalizeTextKey(value)}`;
  return `${year}|${normalizeTextKey(value)}`;
}

function createEntry(text, prefix, index, keyBuilder = normalizeTextKey) {
  const normalized = normalizeText(text);
  return {
    id: `${prefix}-${index + 1}`,
    dedupeKey: keyBuilder(normalized) || `${prefix}-${index + 1}`,
    text: normalized,
  };
}

function normalizeEntries(items, prefix, keyBuilder = normalizeTextKey) {
  const map = new Map();
  for (const [index, item] of (items ?? []).entries()) {
    const entry = typeof item === "string"
      ? createEntry(item, prefix, index, keyBuilder)
      : {
          id: item?.id || `${prefix}-${index + 1}`,
          dedupeKey: item?.dedupeKey || keyBuilder(item?.text || item?.value || "") || `${prefix}-${index + 1}`,
          text: normalizeText(item?.text || item?.value || ""),
        };
    if (!entry.text) {
      continue;
    }
    const current = map.get(entry.dedupeKey);
    if (!current || entry.text.length > current.text.length) {
      map.set(entry.dedupeKey, entry);
    }
  }
  return Array.from(map.values());
}

function normalizeLayeredContent(content, prefix, keyBuilder = normalizeTextKey) {
  const next = {
    summary: normalizeEntries(content?.summary, `${prefix}-summary`, keyBuilder),
    refined: normalizeEntries(content?.refined, `${prefix}-refined`, keyBuilder),
    original: normalizeEntries(content?.original, `${prefix}-original`, keyBuilder),
  };

  if (next.summary.length === 0) delete next.summary;
  if (next.refined.length === 0) delete next.refined;
  if (next.original.length === 0) delete next.original;

  return Object.keys(next).length > 0 ? next : undefined;
}

function buildLayeredContentFromLegacy(summary, details, prefix, keyBuilder = normalizeTextKey) {
  return normalizeLayeredContent({
    summary: summary ? [summary] : [],
    refined: details?.refined ?? [],
    original: details?.original ?? [],
  }, prefix, keyBuilder);
}

function normalizeHonors(honors) {
  const grouped = new Map();

  for (const honor of honors ?? []) {
    if (typeof honor === "string") {
      const text = normalizeText(honor);
      if (!text) continue;
      const key = buildHonorDedupeKey(text);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(text);
      continue;
    }

    if (honor?.content) {
      const key = honor.dedupeKey || buildHonorDedupeKey(honor.content.summary?.[0]?.text || honor.content.original?.[0]?.text || "");
      const existing = grouped.get(key) ?? [];
      const layers = [
        ...(honor.content.summary ?? []).map((entry) => normalizeText(entry.text)),
        ...(honor.content.refined ?? []).map((entry) => normalizeText(entry.text)),
        ...(honor.content.original ?? []).map((entry) => normalizeText(entry.text)),
      ].filter(Boolean);
      grouped.set(key, [...existing, ...layers]);
    }
  }

  return Array.from(grouped.entries()).map(([dedupeKey, texts], index) => {
    const uniqueTexts = Array.from(new Set(texts)).sort((left, right) => left.length - right.length);
    return {
      id: `honor-${index + 1}`,
      dedupeKey,
      content: normalizeLayeredContent({
        summary: uniqueTexts[0] ? [uniqueTexts[0]] : [],
        original: uniqueTexts,
      }, `honor-${index + 1}`, buildHonorDedupeKey),
    };
  });
}

function normalizeDocument(document) {
  const experiences = (document.experiences ?? []).map((experience, index) => ({
    id: experience.id,
    dedupeKey: experience.dedupeKey || normalizeTextKey(`${experience.company}|${experience.role}|${experience.period}`) || `experience-${index + 1}`,
    company: experience.company,
    role: experience.role,
    period: experience.period,
    content: experience.content
      ? normalizeLayeredContent(experience.content, `experience-${experience.id}`)
      : buildLayeredContentFromLegacy(experience.summary, experience.details, `experience-${experience.id}`),
    highlights: normalizeEntries(experience.highlights ?? experience.achievements, `experience-${experience.id}-highlight`),
    relatedProjects: experience.relatedProjects,
    note: experience.note,
  }));

  const projects = (document.projects ?? []).map((project, index) => {
    const fallbackSlug = project.slug || slugifyProjectTitle(project.title || `project-${index + 1}`);
    const identity = resolveProjectIdentity(project, fallbackSlug);
    return {
      slug: identity.slug,
      dedupeKey: identity.dedupeKey,
      title: project.title,
      track: project.track,
      cardMeta: project.cardMeta ?? [],
      cardTags: project.cardTags ?? [],
      heroEyebrow: project.heroEyebrow,
      content: project.content
        ? normalizeLayeredContent(project.content, `project-${identity.slug}`)
        : buildLayeredContentFromLegacy(project.cardSummary, { refined: [project.heroSubtitle], original: [] }, `project-${identity.slug}`),
      showcase: project.showcase,
      storySections: project.storySections ?? [],
    };
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    profile: document.profile,
    experiences,
    skills: document.skills ?? [],
    honors: normalizeHonors(document.honors ?? []),
    education: document.education,
    projects,
  };
}

function uniq(items) {
  return Array.from(new Set((items ?? []).filter(Boolean)));
}

function mergeEntries(base, incoming) {
  const merged = [...(base ?? [])].map((entry) => clone(entry));
  const findEntryIndex = (entry) => merged.findIndex((current) => current.dedupeKey === entry.dedupeKey || (current.id && entry.id && current.id === entry.id));

  for (const entry of incoming ?? []) {
    const existingIndex = findEntryIndex(entry);
    if (existingIndex < 0) {
      merged.push(clone(entry));
      continue;
    }

    const existing = merged[existingIndex];
    if ((entry.id && existing.id === entry.id) || entry.text.length >= existing.text.length) {
      merged[existingIndex] = clone(entry);
    }
  }

  return merged;
}

function mergeLayeredContent(base, incoming, options = {}) {
  if (!base && !incoming) {
    return undefined;
  }

  const shouldMergeSummary = options.mergeSummary !== false;
  const merged = {
    summary: shouldMergeSummary ? mergeEntries(base?.summary, incoming?.summary) : [...(base?.summary ?? [])],
    refined: mergeEntries(base?.refined, incoming?.refined),
    original: mergeEntries(base?.original, incoming?.original),
  };

  if (merged.summary.length === 0) delete merged.summary;
  if (merged.refined.length === 0) delete merged.refined;
  if (merged.original.length === 0) delete merged.original;
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function mergeMetricsItems(baseItems, incomingItems) {
  const merged = new Map();
  for (const item of [...(baseItems ?? []), ...(incomingItems ?? [])]) {
    const key = `${normalizeText(item.value)}|${normalizeText(item.label)}`;
    if (!key || key === "|") {
      continue;
    }
    merged.set(key, { value: normalizeText(item.value), label: normalizeText(item.label) });
  }
  return Array.from(merged.values());
}

function mergeCapabilityItems(baseItems, incomingItems) {
  const merged = new Map();
  for (const item of [...(baseItems ?? []), ...(incomingItems ?? [])]) {
    const key = `${normalizeText(item.title)}|${normalizeText(item.detail)}`;
    if (!key || key === "|") {
      continue;
    }
    merged.set(key, {
      title: normalizeText(item.title),
      detail: normalizeText(item.detail),
    });
  }
  return Array.from(merged.values());
}

function mergeStorySections(existingSections, importedSections, options = {}) {
  const safeOnly = options.safeOnly === true;
  const next = clone(existingSections ?? []);
  const incoming = safeOnly ? (importedSections ?? []).filter((section) => SAFE_EXISTING_PROJECT_SECTION_KINDS.has(section.kind)) : (importedSections ?? []);

  for (const section of incoming) {
    const match = next.find((item) => item.kind === section.kind && item.title === section.title);
    if (!match) {
      next.push(clone(section));
      continue;
    }

    if (section.kind === "metrics") {
      match.items = mergeMetricsItems(match.items, section.items);
      continue;
    }
    if (section.kind === "capabilities") {
      match.items = mergeCapabilityItems(match.items, section.items);
      continue;
    }
    if (section.kind === "story") {
      match.paragraphs = uniq([...(match.paragraphs ?? []), ...(section.paragraphs ?? [])]);
      continue;
    }
    if (section.kind === "bullets") {
      match.items = uniq([...(match.items ?? []), ...(section.items ?? [])]);
      continue;
    }
    if (section.kind === "layered_bullets") {
      match.refinedTitle = match.refinedTitle ?? section.refinedTitle;
      match.originalTitle = match.originalTitle ?? section.originalTitle;
      match.refinedItems = uniq([...(match.refinedItems ?? []), ...(section.refinedItems ?? [])]);
      match.originalItems = uniq([...(match.originalItems ?? []), ...(section.originalItems ?? [])]);
      continue;
    }
    if (section.kind === "archive") {
      const existingByTitle = new Map((match.sections ?? []).map((item) => [item.title, item]));
      for (const importedArchiveSection of section.sections ?? []) {
        const existingArchiveSection = existingByTitle.get(importedArchiveSection.title);
        if (!existingArchiveSection) {
          match.sections.push(clone(importedArchiveSection));
          continue;
        }
        existingArchiveSection.intro = existingArchiveSection.intro ?? importedArchiveSection.intro;
        existingArchiveSection.paragraphs = uniq([...(existingArchiveSection.paragraphs ?? []), ...(importedArchiveSection.paragraphs ?? [])]);
      }
      continue;
    }
    if (section.kind === "stack") {
      match.items = uniq([...(match.items ?? []), ...(section.items ?? [])]);
      continue;
    }
    if (section.kind === "links") {
      match.items = uniq([...(match.items ?? []), ...(section.items ?? [])].map((item) => JSON.stringify(item))).map((item) => JSON.parse(item));
    }
  }

  return next;
}

function isPlaceholderText(value) {
  const text = normalizeText(value);
  return !text || text.includes("待");
}

function mergeProfile(existingProfile, importedProfile, report, options) {
  const nextProfile = clone(existingProfile);

  if ((isPlaceholderText(nextProfile.role) || options.allowRiskyProfile) && importedProfile.role) {
    const before = nextProfile.role;
    nextProfile.role = importedProfile.role;
    recordIfChanged(report, "profile.role", before, nextProfile.role, "merged profile role");
  }
  if ((isPlaceholderText(nextProfile.bio) || options.allowRiskyProfile) && importedProfile.bio) {
    const before = nextProfile.bio;
    nextProfile.bio = importedProfile.bio;
    recordIfChanged(report, "profile.bio", before, nextProfile.bio, "merged profile bio");
  }
  if ((isPlaceholderText(nextProfile.headline) || options.allowRiskyProfile) && importedProfile.headline) {
    const before = nextProfile.headline;
    nextProfile.headline = importedProfile.headline;
    recordIfChanged(report, "profile.headline", before, nextProfile.headline, "merged profile headline");
  } else if (!options.allowRiskyProfile && (importedProfile.headline ?? "") !== "") {
    pushSkipped(report, "profile.headline", "safe mode preserves existing headline unless placeholder");
  }

  const strengths = uniq([...(existingProfile.strengths ?? []), ...(importedProfile.strengths ?? [])]);
  recordIfChanged(report, "profile.strengths", nextProfile.strengths, strengths, "merged safe profile strengths");
  nextProfile.strengths = strengths;

  const contacts = [...(existingProfile.contacts ?? [])];
  for (const contact of importedProfile.contacts ?? []) {
    if (!contacts.some((existing) => existing.href === contact.href)) {
      contacts.push(contact);
    }
  }
  recordIfChanged(report, "profile.contacts", nextProfile.contacts, contacts, "merged profile contacts");
  nextProfile.contacts = contacts;

  if (options.allowRiskyProfile) {
    const summaryPoints = uniq([...(existingProfile.summaryPoints ?? []), ...(importedProfile.summaryPoints ?? [])]).slice(0, 6);
    const focusAreas = [...(existingProfile.focusAreas ?? [])];
    for (const area of importedProfile.focusAreas ?? []) {
      if (!focusAreas.some((existing) => existing.title === area.title && existing.description === area.description)) {
        focusAreas.push(area);
      }
    }
    const facts = [...(existingProfile.facts ?? [])];
    for (const fact of importedProfile.facts ?? []) {
      if (!facts.some((existing) => existing.label === fact.label && existing.value === fact.value)) {
        facts.push(fact);
      }
    }

    recordIfChanged(report, "profile.summaryPoints", nextProfile.summaryPoints, summaryPoints, "merged risky profile summary points");
    recordIfChanged(report, "profile.focusAreas", nextProfile.focusAreas, focusAreas, "merged risky profile focus areas");
    recordIfChanged(report, "profile.facts", nextProfile.facts, facts, "merged risky profile facts");

    nextProfile.summaryPoints = summaryPoints;
    nextProfile.focusAreas = focusAreas;
    nextProfile.facts = facts;
  } else {
    if ((importedProfile.summaryPoints ?? []).length > 0) pushSkipped(report, "profile.summaryPoints", "safe mode preserves risky profile summary points");
    if ((importedProfile.focusAreas ?? []).length > 0) pushSkipped(report, "profile.focusAreas", "safe mode preserves risky profile focus areas");
    if ((importedProfile.facts ?? []).length > 0) pushSkipped(report, "profile.facts", "safe mode preserves risky profile facts");
  }

  return nextProfile;
}

function mergeSkills(existingSkills, importedSkills, report) {
  const nextSkills = clone(existingSkills);
  for (const group of importedSkills ?? []) {
    const match = nextSkills.find((existing) => existing.title === group.title);
    if (match) {
      const before = clone(match.items);
      match.items = uniq([...(match.items ?? []), ...(group.items ?? [])]);
      recordIfChanged(report, `skills[${group.title}]`, before, match.items, "merged skill items");
      continue;
    }
    nextSkills.push(group);
    pushChange(report, `skills[${group.title}]`, "add", undefined, group.items, "added new skill group");
  }
  return nextSkills;
}

function mergeEducation(existingEducation, importedEducation, report) {
  const nextEducation = clone(existingEducation);
  if (isPlaceholderText(nextEducation.school) && importedEducation.school) {
    const before = nextEducation.school;
    nextEducation.school = importedEducation.school;
    recordIfChanged(report, "education.school", before, nextEducation.school, "merged education school");
  }
  if (isPlaceholderText(nextEducation.degree) && importedEducation.degree) {
    const before = nextEducation.degree;
    nextEducation.degree = importedEducation.degree;
    recordIfChanged(report, "education.degree", before, nextEducation.degree, "merged education degree");
  }
  if (isPlaceholderText(nextEducation.period) && importedEducation.period) {
    const before = nextEducation.period;
    nextEducation.period = importedEducation.period;
    recordIfChanged(report, "education.period", before, nextEducation.period, "merged education period");
  }
  const details = uniq([...(existingEducation.details ?? []), ...(importedEducation.details ?? [])]);
  recordIfChanged(report, "education.details", nextEducation.details, details, "merged education details");
  nextEducation.details = details;
  return nextEducation;
}

function mergeHonors(existingHonors, importedHonors, report) {
  const merged = new Map((existingHonors ?? []).map((honor) => [honor.dedupeKey, clone(honor)]));
  let matchedCount = 0;
  let addedCount = 0;

  for (const honor of importedHonors ?? []) {
    const existing = merged.get(honor.dedupeKey);
    if (!existing) {
      merged.set(honor.dedupeKey, clone(honor));
      addedCount += 1;
      pushChange(report, `honors[${honor.dedupeKey}]`, "add", undefined, honor.content, "added new honor");
      continue;
    }

    matchedCount += 1;
    const before = clone(existing.content);
    existing.content = mergeLayeredContent(existing.content, honor.content);
    recordIfChanged(report, `honors[${honor.dedupeKey}].content`, before, existing.content, "merged honor layered content");
  }

  return {
    honors: Array.from(merged.values()),
    matchedCount,
    addedCount,
  };
}

function findExperienceMatch(existingExperiences, importedExperience) {
  return existingExperiences.find((experience) => (
    experience.id === importedExperience.id
      || experience.dedupeKey === importedExperience.dedupeKey
      || (
        normalizeTextKey(experience.company) === normalizeTextKey(importedExperience.company)
        && normalizePeriodKey(experience.period) === normalizePeriodKey(importedExperience.period)
        && normalizeTextKey(experience.role) === normalizeTextKey(importedExperience.role)
      )
  ));
}

function remapProjectSlugs(slugs, slugMap) {
  return uniq((slugs ?? []).map((slug) => slugMap.get(slug) ?? slug));
}

function mergeExperiences(existingExperiences, importedExperiences, slugMap, report, options) {
  const nextExperiences = clone(existingExperiences);
  let matchedCount = 0;
  let addedCount = 0;

  for (const importedExperience of importedExperiences ?? []) {
    const normalizedImported = {
      ...importedExperience,
      relatedProjects: remapProjectSlugs(importedExperience.relatedProjects, slugMap),
    };
    const existing = findExperienceMatch(nextExperiences, normalizedImported);
    if (!existing) {
      nextExperiences.push(clone(normalizedImported));
      addedCount += 1;
      pushChange(report, `experiences[${normalizedImported.id}]`, "add", undefined, normalizedImported, "added new experience");
      continue;
    }

    matchedCount += 1;
    const beforeContent = clone(existing.content);
    existing.content = mergeLayeredContent(existing.content, normalizedImported.content, {
      mergeSummary: options.mode === "legacy" || (existing.content?.summary?.length ?? 0) === 0,
    });
    recordIfChanged(report, `experiences[${existing.id}].content`, beforeContent, existing.content, "merged experience layered content");

    const beforeHighlights = clone(existing.highlights);
    existing.highlights = mergeEntries(existing.highlights, normalizedImported.highlights);
    recordIfChanged(report, `experiences[${existing.id}].highlights`, beforeHighlights, existing.highlights, "merged experience highlights");

    const beforeProjects = clone(existing.relatedProjects ?? []);
    existing.relatedProjects = uniq([...(existing.relatedProjects ?? []), ...(normalizedImported.relatedProjects ?? [])]);
    recordIfChanged(report, `experiences[${existing.id}].relatedProjects`, beforeProjects, existing.relatedProjects, "merged experience related projects");

    if (!existing.note && normalizedImported.note) {
      const before = existing.note;
      existing.note = normalizedImported.note;
      recordIfChanged(report, `experiences[${existing.id}].note`, before, existing.note, "merged experience note");
    }
  }

  return { nextExperiences, matchedCount, addedCount };
}

function mergeProjects(existingProjects, importedProjects, report, options) {
  const nextProjects = clone(existingProjects);
  const slugMap = new Map();
  let matchedCount = 0;
  let addedCount = 0;
  const existingByKey = new Map();

  for (const project of nextProjects) {
    existingByKey.set(project.dedupeKey, project);
    existingByKey.set(project.slug, project);
  }

  for (const importedProject of importedProjects ?? []) {
    const existing = existingByKey.get(importedProject.dedupeKey) ?? existingByKey.get(importedProject.slug);
    if (!existing) {
      nextProjects.push(clone(importedProject));
      existingByKey.set(importedProject.dedupeKey, nextProjects[nextProjects.length - 1]);
      existingByKey.set(importedProject.slug, nextProjects[nextProjects.length - 1]);
      slugMap.set(importedProject.slug, importedProject.slug);
      addedCount += 1;
      pushChange(report, `projects[${importedProject.slug}]`, "add", undefined, importedProject, "added new project");
      continue;
    }

    matchedCount += 1;
    slugMap.set(importedProject.slug, existing.slug);

    const beforeMeta = clone(existing.cardMeta);
    existing.cardMeta = uniq([...(existing.cardMeta ?? []), ...(importedProject.cardMeta ?? [])]);
    recordIfChanged(report, `projects[${existing.slug}].cardMeta`, beforeMeta, existing.cardMeta, "merged project cardMeta");

    const beforeTags = clone(existing.cardTags);
    existing.cardTags = uniq([...(existing.cardTags ?? []), ...(importedProject.cardTags ?? [])]);
    recordIfChanged(report, `projects[${existing.slug}].cardTags`, beforeTags, existing.cardTags, "merged project cardTags");

    if (options.mode === "legacy") {
      const beforeEyebrow = existing.heroEyebrow;
      existing.heroEyebrow = existing.heroEyebrow || importedProject.heroEyebrow;
      recordIfChanged(report, `projects[${existing.slug}].heroEyebrow`, beforeEyebrow, existing.heroEyebrow, "merged project eyebrow in legacy mode");

      const beforeShowcase = clone(existing.showcase);
      existing.showcase = { ...existing.showcase, ...(importedProject.showcase ?? {}) };
      recordIfChanged(report, `projects[${existing.slug}].showcase`, beforeShowcase, existing.showcase, "merged project showcase in legacy mode");
    } else {
      if (importedProject.heroEyebrow && importedProject.heroEyebrow !== existing.heroEyebrow) {
        pushSkipped(report, `projects[${existing.slug}].heroEyebrow`, "safe mode preserves existing hero eyebrow for matched projects");
      }
      if (!sameValue(importedProject.showcase, existing.showcase)) {
        pushSkipped(report, `projects[${existing.slug}].showcase`, "safe mode preserves existing showcase for matched projects");
      }
    }

    const beforeContent = clone(existing.content);
    existing.content = mergeLayeredContent(existing.content, importedProject.content, {
      mergeSummary: options.mode === "legacy" || (existing.content?.summary?.length ?? 0) === 0,
    });
    recordIfChanged(report, `projects[${existing.slug}].content`, beforeContent, existing.content, "merged project layered content");

    const beforeSections = clone(existing.storySections);
    existing.storySections = mergeStorySections(existing.storySections, importedProject.storySections, {
      safeOnly: options.mode === "safe",
    });
    recordIfChanged(report, `projects[${existing.slug}].storySections`, beforeSections, existing.storySections, "merged project story sections");
  }

  return { nextProjects, slugMap, matchedCount, addedCount };
}

function buildMergeReportSkeleton(options, bundlePaths, artifacts) {
  return {
    schemaVersion: MERGE_REPORT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    mode: options.mode,
    write: options.write,
    allowRiskyProfile: options.allowRiskyProfile,
    force: options.force,
    input: {
      resumeSourcePath: bundlePaths.resumeSourcePath,
      parsedCandidatePath: bundlePaths.parsedCandidatePath,
      candidateValidationPath: bundlePaths.candidateValidationPath,
      fieldCandidatesPath: bundlePaths.fieldCandidatesPath,
      fieldValidationPath: bundlePaths.fieldValidationPath,
      targetPath: options.target,
      reportPath: bundlePaths.reportPath,
    },
    artifacts: {
      importedSourcePresent: Boolean(artifacts.importedRaw),
      parsedCandidatePresent: Boolean(artifacts.parsedCandidate),
      candidateValidationPresent: Boolean(artifacts.candidateValidation),
      fieldCandidatesPresent: Boolean(artifacts.fieldCandidates),
      fieldValidationPresent: Boolean(artifacts.fieldValidation),
    },
    gate: {},
    preparation: {
      candidateProjectsBuilt: 0,
      candidateProjectsSkipped: 0,
      experienceProjectLinksUpdated: 0,
    },
    summary: {},
    diff: [],
    skipped: [],
  };
}

function buildGateInfo(options, artifacts) {
  const reasons = [];

  if (options.mode === "safe") {
    if (!artifacts.parsedCandidate) {
      reasons.push("safe merge requires parsed-candidate.json");
    }
    if (!artifacts.candidateValidation) {
      reasons.push("safe merge requires candidate-validation-report.json");
    } else if ((artifacts.candidateValidation.stats?.errorCount ?? 0) > 0) {
      reasons.push(`candidate-validation-report has ${artifacts.candidateValidation.stats.errorCount} blocking errors`);
    }
    if (!artifacts.fieldCandidates) {
      reasons.push("safe merge requires field-candidates.json");
    } else if (artifacts.fieldCandidates.gate?.allowed !== true) {
      reasons.push("field-candidates gate is blocked by upstream candidate validation");
    }
    if (!artifacts.fieldValidation) {
      reasons.push("safe merge requires field-candidate-validation-report.json");
    } else if ((artifacts.fieldValidation.stats?.errorCount ?? 0) > 0) {
      reasons.push(`field-candidate-validation-report has ${artifacts.fieldValidation.stats.errorCount} blocking errors`);
    }
  }

  return {
    mode: options.mode,
    blocked: reasons.length > 0,
    forced: reasons.length > 0 && options.force,
    reasons,
    candidateValidation: artifacts.candidateValidation
      ? {
          errorCount: artifacts.candidateValidation.stats?.errorCount ?? 0,
          warningCount: artifacts.candidateValidation.stats?.warningCount ?? 0,
          reviewExperienceCount: artifacts.candidateValidation.stats?.reviewExperienceCount ?? 0,
        }
      : null,
    fieldCandidates: artifacts.fieldCandidates
      ? {
          allowed: artifacts.fieldCandidates.gate?.allowed ?? false,
          matchedProjectCount: artifacts.fieldCandidates.matchedProjectCount ?? 0,
          projectCount: artifacts.fieldCandidates.projectCount ?? 0,
          aiEnabled: artifacts.fieldCandidates.ai?.enabled ?? false,
          aiUsed: artifacts.fieldCandidates.ai?.used ?? false,
          aiWarningCount: artifacts.fieldCandidates.ai?.warnings?.length ?? 0,
        }
      : null,
    fieldValidation: artifacts.fieldValidation
      ? {
          errorCount: artifacts.fieldValidation.stats?.errorCount ?? 0,
          warningCount: artifacts.fieldValidation.stats?.warningCount ?? 0,
        }
      : null,
  };
}

function extractProjectIdFromIssuePath(pathValue) {
  return pathValue.match(/projects\[\d+\]\(([^)]+)\)/)?.[1] ?? null;
}

function buildFieldValidationIssueIndex(fieldValidationReport) {
  const issuesByProjectId = new Map();
  for (const issue of fieldValidationReport?.issues ?? []) {
    const projectId = extractProjectIdFromIssuePath(issue.path);
    if (!projectId) {
      continue;
    }
    const current = issuesByProjectId.get(projectId) ?? [];
    current.push(issue);
    issuesByProjectId.set(projectId, current);
  }
  return issuesByProjectId;
}

function buildFieldCandidateIndex(fieldCandidatesReport, fieldValidationReport) {
  const issuesByProjectId = buildFieldValidationIssueIndex(fieldValidationReport);
  return new Map((fieldCandidatesReport?.projects ?? []).map((project) => [project.projectId, {
    ...project,
    validationIssues: issuesByProjectId.get(project.projectId) ?? [],
  }]));
}

function mergeWrappedLines(lines) {
  const merged = [];
  for (const rawLine of lines ?? []) {
    const line = normalizeText(rawLine);
    if (!line) continue;
    const previous = merged[merged.length - 1];
    if (previous && !/[。！？.!?；;：:]$/.test(previous) && !/^(主要工作|项目介绍|项目影响|影响|其他工作|项目性能优化工作)[：:]?$/.test(line)) {
      merged[merged.length - 1] = `${previous}${line}`;
      continue;
    }
    merged.push(line);
  }
  return merged;
}

function buildCandidateMetrics(project, fieldProject, canUseFieldData) {
  if (canUseFieldData && (fieldProject.metrics?.length ?? 0) > 0) {
    return mergeMetricsItems([], fieldProject.metrics.map((metric) => ({ value: metric.value, label: metric.label })));
  }
  return mergeMetricsItems([], (project.metricBlocks ?? []).map((metric) => ({ value: metric.value, label: metric.label })));
}

function buildCandidateTags(fieldProject, canUseFieldData) {
  if (!canUseFieldData) return [];
  return uniq((fieldProject.tags ?? []).map((item) => normalizeText(item.tag)).filter(Boolean));
}

function buildArchiveSections(project) {
  const sections = [];
  const summaryLines = mergeWrappedLines((project.summaryBlocks ?? []).map((block) => block.text));
  const workLines = mergeWrappedLines((project.workBlocks ?? []).map((block) => block.text));
  const impactLines = mergeWrappedLines((project.impactBlocks ?? []).map((block) => block.text));

  if (summaryLines.length > 0) sections.push({ title: "项目介绍", paragraphs: summaryLines });
  if (workLines.length > 0) sections.push({ title: "主要工作", paragraphs: workLines });
  if (impactLines.length > 0) sections.push({ title: "项目影响", paragraphs: impactLines });

  return sections;
}

function buildDraftShowcase(title) {
  return {
    title: "作品展示",
    featuredTitle: `${title} 展示位`,
    featuredDescription: "当前为自动合并生成的项目草稿，后续可补充截图、流程图或录屏素材。",
    sideBlocks: [
      {
        title: "当前状态",
        items: ["阶段 5 自动 merge 新增草稿", "建议后续补展示素材与精修说明"],
      },
    ],
    gallery: [
      {
        title: "待补素材",
        description: "可补关键流程图、编辑器截图或运行效果录屏。",
      },
    ],
    note: "当前展示区为自动生成占位，建议后续以项目截图、流程图和关键系统说明替换。",
  };
}

function inferProjectTrack(project, existingProject) {
  if (existingProject?.track) return existingProject.track;
  const linkText = (project.linkBlocks ?? []).map((block) => `${block.label ?? ""} ${block.href ?? ""}`).join(" ");
  if (/github/i.test(linkText) || /开源/.test(project.title)) {
    return "open_source";
  }
  return "featured";
}

function buildProjectCardMeta(experience) {
  return uniq([
    normalizeText(experience?.company),
    normalizeText(experience?.role),
    normalizeText(experience?.period),
  ]).filter(Boolean);
}

function buildProjectLayeredContent(project, fieldProject, slug, canUseFieldData) {
  const summaryLines = mergeWrappedLines((project.summaryBlocks ?? []).map((block) => block.text));
  const workLines = mergeWrappedLines((project.workBlocks ?? []).map((block) => block.text));
  const impactLines = mergeWrappedLines((project.impactBlocks ?? []).map((block) => block.text));
  const summaryText = canUseFieldData ? normalizeText(fieldProject.summary?.text) : summaryLines[0] ?? workLines[0] ?? project.title;
  const refinedTexts = canUseFieldData && (fieldProject.highlights?.length ?? 0) > 0 ? fieldProject.highlights.map((item) => item.text) : workLines.slice(0, 6);
  const originalTexts = uniq([...summaryLines, ...workLines, ...impactLines]).slice(0, 18);

  return normalizeLayeredContent({
    summary: summaryText ? [summaryText] : [],
    refined: refinedTexts,
    original: originalTexts,
  }, `project-${slug}`);
}

function buildProjectStorySections(project, fieldProject, canUseFieldData) {
  const sections = [];
  const metrics = buildCandidateMetrics(project, fieldProject, canUseFieldData);
  const summaryLines = mergeWrappedLines((project.summaryBlocks ?? []).map((block) => block.text));
  const workLines = canUseFieldData && (fieldProject.highlights?.length ?? 0) > 0
    ? fieldProject.highlights.map((item) => normalizeText(item.text)).filter(Boolean)
    : mergeWrappedLines((project.workBlocks ?? []).map((block) => block.text)).slice(0, 8);
  const tags = buildCandidateTags(fieldProject, canUseFieldData);
  const links = (project.linkBlocks ?? []).map((block) => ({
    label: normalizeText(block.label || block.href || "链接"),
    href: normalizeText(block.href),
    external: true,
  })).filter((item) => item.href);
  const archiveSections = buildArchiveSections(project);

  if (metrics.length > 0) sections.push({ kind: "metrics", title: "项目影响", items: metrics });
  if (summaryLines.length > 0) sections.push({ kind: "story", title: "项目介绍", paragraphs: summaryLines });
  if (workLines.length > 0) sections.push({ kind: "bullets", title: "核心工作", items: workLines });
  if (tags.length > 0) sections.push({ kind: "stack", title: "技术标签", items: tags });
  if (links.length > 0) sections.push({ kind: "links", title: "相关链接", items: links });
  if (archiveSections.length > 0) {
    sections.push({
      kind: "archive",
      title: "项目档案",
      description: "按候选结构保留原始项目信息，便于后续人工审阅与精修。",
      sections: archiveSections,
    });
  }

  return sections;
}

function buildProjectFromCandidate(project, experience, fieldProject, fieldIssues, existingProjectsBySlug, report) {
  const hasWarningIssues = (fieldIssues ?? []).some((issue) => issue.level === "warning");
  const hasErrorIssues = (fieldIssues ?? []).some((issue) => issue.level === "error");
  const canUseFieldData = Boolean(fieldProject) && !fieldProject.skipped && !hasWarningIssues && !hasErrorIssues;

  if (fieldProject?.skipped) {
    pushSkipped(report, `candidate-project:${project.id}`, fieldProject.skipReason || "field candidate was skipped by upstream review gate");
    return null;
  }
  if (hasErrorIssues) {
    pushSkipped(report, `candidate-project:${project.id}`, "field candidate has blocking validation errors, project skipped in safe merge preparation");
    return null;
  }
  if (hasWarningIssues) {
    pushSkipped(report, `candidate-project:${project.id}`, "field candidate has warnings, safe merge falls back to parsed-candidate only");
  }

  const matchedSlug = canUseFieldData ? fieldProject.match?.selectedSlug : null;
  const existingProject = matchedSlug ? existingProjectsBySlug.get(matchedSlug) : null;
  const fallbackSlug = slugifyProjectTitle(project.title);
  const identity = matchedSlug
    ? { slug: matchedSlug, dedupeKey: existingProject?.dedupeKey ?? matchedSlug }
    : resolveProjectIdentity({
        title: project.title,
        cardMeta: buildProjectCardMeta(experience),
        cardTags: buildCandidateTags(fieldProject, canUseFieldData),
      }, fallbackSlug);

  const track = inferProjectTrack(project, existingProject);
  const heroEyebrow = existingProject?.heroEyebrow ?? (track === "open_source" ? "Open Source / Imported Draft" : "Featured Project / Imported Draft");

  return {
    slug: identity.slug,
    dedupeKey: existingProject?.dedupeKey ?? identity.dedupeKey,
    title: project.title,
    track,
    cardMeta: buildProjectCardMeta(experience),
    cardTags: buildCandidateTags(fieldProject, canUseFieldData),
    heroEyebrow,
    content: buildProjectLayeredContent(project, fieldProject, identity.slug, canUseFieldData),
    showcase: existingProject?.showcase ?? buildDraftShowcase(project.title),
    storySections: buildProjectStorySections(project, fieldProject, canUseFieldData),
  };
}

function buildCandidateProjects(parsedCandidate, fieldCandidates, fieldValidation, existingSource, report) {
  const experiencesById = new Map((parsedCandidate.entities?.experiences ?? []).map((experience) => [experience.id, experience]));
  const fieldProjectsById = buildFieldCandidateIndex(fieldCandidates, fieldValidation);
  const existingProjectsBySlug = new Map((existingSource.projects ?? []).map((project) => [project.slug, project]));
  const projects = [];
  const slugsByExperienceId = new Map();

  for (const project of parsedCandidate.entities?.projects ?? []) {
    const experience = experiencesById.get(project.experienceId);
    if (!experience) {
      pushSkipped(report, `candidate-project:${project.id}`, "missing parent experience in parsed candidate");
      continue;
    }

    const fieldProject = fieldProjectsById.get(project.id) ?? null;
    const fieldIssues = fieldProject?.validationIssues ?? [];
    const builtProject = buildProjectFromCandidate(project, experience, fieldProject, fieldIssues, existingProjectsBySlug, report);
    if (!builtProject) {
      report.preparation.candidateProjectsSkipped += 1;
      continue;
    }

    projects.push(builtProject);
    report.preparation.candidateProjectsBuilt += 1;
    const currentSlugs = slugsByExperienceId.get(project.experienceId) ?? [];
    currentSlugs.push(builtProject.slug);
    slugsByExperienceId.set(project.experienceId, currentSlugs);
  }

  return { projects, slugsByExperienceId };
}

function updateImportedExperiencesWithCandidateProjects(importedExperiences, parsedCandidate, slugsByExperienceId, report) {
  const nextExperiences = clone(importedExperiences);
  let updatedCount = 0;

  for (const parsedExperience of parsedCandidate.entities?.experiences ?? []) {
    const match = nextExperiences.find((experience) => (
      normalizeTextKey(experience.company) === normalizeTextKey(parsedExperience.company)
        && normalizeTextKey(experience.role) === normalizeTextKey(parsedExperience.role)
        && normalizePeriodKey(experience.period) === normalizePeriodKey(parsedExperience.period)
    ));
    if (!match) {
      continue;
    }

    const nextRelatedProjects = uniq([...(match.relatedProjects ?? []), ...(slugsByExperienceId.get(parsedExperience.id) ?? [])]);
    if (!sameValue(match.relatedProjects ?? [], nextRelatedProjects)) {
      recordIfChanged(report, `preparedInput.experiences[${match.id}].relatedProjects`, match.relatedProjects ?? [], nextRelatedProjects, "updated imported experience related projects from parsed candidate");
      match.relatedProjects = nextRelatedProjects;
      updatedCount += 1;
    }
  }

  report.preparation.experienceProjectLinksUpdated = updatedCount;
  return nextExperiences;
}

function prepareImportedSourceForMerge(importedSource, artifacts, existingSource, report, options) {
  if (options.mode === "legacy") {
    return importedSource;
  }

  const { projects, slugsByExperienceId } = buildCandidateProjects(
    artifacts.parsedCandidate,
    artifacts.fieldCandidates,
    artifacts.fieldValidation,
    existingSource,
    report,
  );

  const experiences = updateImportedExperiencesWithCandidateProjects(
    importedSource.experiences,
    artifacts.parsedCandidate,
    slugsByExperienceId,
    report,
  );

  return {
    ...importedSource,
    experiences,
    projects,
  };
}

async function writeReport(reportPath, report) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function main() {
  const options = parseArgs(args);
  const inputPath = options.input ?? await resolveLatestImportedSource();
  const bundlePaths = deriveBundlePaths(inputPath, options);

  const importedRaw = await readJsonIfExists(bundlePaths.resumeSourcePath);
  if (!importedRaw) {
    throw new Error(`Imported resume-source json not found: ${bundlePaths.resumeSourcePath}`);
  }

  const artifacts = {
    importedRaw,
    parsedCandidate: await readJsonIfExists(bundlePaths.parsedCandidatePath),
    candidateValidation: await readJsonIfExists(bundlePaths.candidateValidationPath),
    fieldCandidates: await readJsonIfExists(bundlePaths.fieldCandidatesPath),
    fieldValidation: await readJsonIfExists(bundlePaths.fieldValidationPath),
  };

  const report = buildMergeReportSkeleton(options, bundlePaths, artifacts);
  report.gate = buildGateInfo(options, artifacts);

  if (report.gate.blocked && !report.gate.forced) {
    report.summary = {
      status: "blocked",
      reasonCount: report.gate.reasons.length,
      diffCount: 0,
      skippedCount: report.skipped.length,
    };
    await writeReport(bundlePaths.reportPath, report);
    const message = ["Merge gate blocked.", ...report.gate.reasons.map((reason) => `- ${reason}`), `- report: ${bundlePaths.reportPath}`].join("\n");
    throw new Error(message);
  }

  const importedSource = normalizeDocument(importedRaw);
  const { raw: existingRawModule, document: existingDocument } = await parseSourceModule(options.target);
  const existingSource = normalizeDocument(existingDocument);
  const preparedImportedSource = prepareImportedSourceForMerge(importedSource, artifacts, existingSource, report, options);

  const { nextProjects, slugMap, matchedCount: matchedProjects, addedCount: addedProjects } = mergeProjects(existingSource.projects, preparedImportedSource.projects, report, options);
  const { nextExperiences, matchedCount: matchedExperiences, addedCount: addedExperiences } = mergeExperiences(existingSource.experiences, preparedImportedSource.experiences, slugMap, report, options);
  const { honors, matchedCount: matchedHonors, addedCount: addedHonors } = mergeHonors(existingSource.honors, preparedImportedSource.honors, report);

  const mergedDocument = {
    schemaVersion: SCHEMA_VERSION,
    profile: mergeProfile(existingSource.profile, preparedImportedSource.profile, report, options),
    experiences: nextExperiences,
    skills: mergeSkills(existingSource.skills, preparedImportedSource.skills, report),
    honors,
    education: mergeEducation(existingSource.education, preparedImportedSource.education, report),
    projects: nextProjects,
  };

  report.summary = {
    status: options.write ? "write-ready" : "dry-run-ready",
    diffCount: report.diff.length,
    skippedCount: report.skipped.length,
    projects: { matched: matchedProjects, added: addedProjects, total: mergedDocument.projects.length },
    experiences: { matched: matchedExperiences, added: addedExperiences, total: mergedDocument.experiences.length },
    honors: { matched: matchedHonors, added: addedHonors, total: mergedDocument.honors.length },
    skills: mergedDocument.skills.length,
  };

  if (options.write) {
    await fs.mkdir(options.backupDir, { recursive: true });
    const backupPath = path.join(options.backupDir, `${path.basename(options.target, ".ts")}.${Date.now()}.bak.ts`);
    await fs.writeFile(backupPath, existingRawModule, "utf8");
    await fs.writeFile(options.target, serializeModule(existingRawModule, mergedDocument), "utf8");
    report.summary.backup = backupPath;
    report.summary.target = options.target;
  }

  await writeReport(bundlePaths.reportPath, report);

  console.log(JSON.stringify({
    mode: options.mode,
    write: options.write,
    input: bundlePaths.resumeSourcePath,
    target: options.target,
    report: bundlePaths.reportPath,
    gate: { blocked: report.gate.blocked, forced: report.gate.forced, reasons: report.gate.reasons },
    preparation: report.preparation,
    summary: report.summary,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
