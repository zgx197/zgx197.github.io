import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const EXPORT_MARKER = "export const resumeSource: ResumeSourceDocument = ";
const SCHEMA_VERSION = "resume-schema@v1";

function parseArgs(argv) {
  const options = {
    input: undefined,
    target: path.resolve("src/data/resume-source.ts"),
    backupDir: path.resolve("generated/resume-import/backups"),
    write: false,
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
    if (arg === "--write") {
      options.write = true;
    }
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

async function parseSourceModule(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const objectLiteral = extractObjectLiteral(raw, EXPORT_MARKER)
    .replaceAll("RESUME_SCHEMA_VERSION", JSON.stringify(SCHEMA_VERSION));
  const document = Function(`"use strict"; return (${objectLiteral});`)();
  return { raw, document };
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

const PROJECT_IDENTITY_RULES = [
  { slug: "sceneblueprint", dedupeKey: "scene-blueprint", patterns: [/scene\s*blueprint/i, /场景蓝图/] },
  { slug: "xiuxian-game", dedupeKey: "xiuxian-game", patterns: [/修仙/] },
  { slug: "knowledge-graph", dedupeKey: "knowledge-graph", patterns: [/短文本知识标注/, /knowledge\s*tagging/i, /text\s*to\s*knowledge/i] },
  { slug: "baike-knowledge-base", dedupeKey: "baike-knowledge-base", patterns: [/百科词条.*知识库/, /百科.*知识库/, /baike/i] },
  { slug: "desktop-pet", dedupeKey: "desktop-pet", patterns: [/桌宠/] },
  { slug: "tower-defense", dedupeKey: "tower-defense", patterns: [/塔防/] },
];

function resolveProjectIdentity(project, fallbackSlug) {
  const joined = [project.title, project.slug, ...(project.cardMeta ?? []), ...(project.cardTags ?? [])].filter(Boolean).join(" ");
  for (const rule of PROJECT_IDENTITY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(joined))) {
      return { slug: rule.slug, dedupeKey: rule.dedupeKey };
    }
  }

  return {
    slug: fallbackSlug || project.slug,
    dedupeKey: project.dedupeKey || normalizeTextKey(project.title || project.slug) || fallbackSlug || project.slug,
  };
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
    const identity = resolveProjectIdentity(project, project.slug || `project-${index + 1}`);
    return {
    slug: identity.slug,
    dedupeKey: identity.dedupeKey,
    title: project.title,
    track: project.track,
    cardMeta: project.cardMeta ?? [],
    cardTags: project.cardTags ?? [],
    heroEyebrow: project.heroEyebrow,
    content: project.content
      ? normalizeLayeredContent(project.content, `project-${project.slug}`)
      : buildLayeredContentFromLegacy(project.cardSummary, { refined: [project.heroSubtitle], original: [] }, `project-${project.slug}`),
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
  const merged = new Map((base ?? []).map((entry) => [entry.dedupeKey, entry]));
  for (const entry of incoming ?? []) {
    const existing = merged.get(entry.dedupeKey);
    if (!existing || entry.text.length >= existing.text.length) {
      merged.set(entry.dedupeKey, entry);
    }
  }
  return Array.from(merged.values());
}

function mergeLayeredContent(base, incoming) {
  if (!base && !incoming) {
    return undefined;
  }
  const merged = {
    summary: mergeEntries(base?.summary, incoming?.summary),
    refined: mergeEntries(base?.refined, incoming?.refined),
    original: mergeEntries(base?.original, incoming?.original),
  };
  if (merged.summary.length === 0) delete merged.summary;
  if (merged.refined.length === 0) delete merged.refined;
  if (merged.original.length === 0) delete merged.original;
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function mergeProfile(existingProfile, importedProfile) {
  const nextProfile = JSON.parse(JSON.stringify(existingProfile));
  if ((!nextProfile.role || nextProfile.role.includes("待")) && importedProfile.role) nextProfile.role = importedProfile.role;
  if ((!nextProfile.bio || nextProfile.bio.includes("待")) && importedProfile.bio) nextProfile.bio = importedProfile.bio;
  if ((!nextProfile.headline || nextProfile.headline.includes("待")) && importedProfile.headline) nextProfile.headline = importedProfile.headline;
  nextProfile.strengths = uniq([...(existingProfile.strengths ?? []), ...(importedProfile.strengths ?? [])]);
  nextProfile.summaryPoints = uniq([...(existingProfile.summaryPoints ?? []), ...(importedProfile.summaryPoints ?? [])]).slice(0, 6);
  nextProfile.focusAreas = [...(existingProfile.focusAreas ?? [])];
  for (const area of importedProfile.focusAreas ?? []) {
    if (!nextProfile.focusAreas.some((existing) => existing.title === area.title && existing.description === area.description)) {
      nextProfile.focusAreas.push(area);
    }
  }
  nextProfile.facts = [...(existingProfile.facts ?? [])];
  for (const fact of importedProfile.facts ?? []) {
    if (!nextProfile.facts.some((existing) => existing.label === fact.label && existing.value === fact.value)) {
      nextProfile.facts.push(fact);
    }
  }
  nextProfile.contacts = [...(existingProfile.contacts ?? [])];
  for (const contact of importedProfile.contacts ?? []) {
    if (!nextProfile.contacts.some((existing) => existing.href === contact.href)) {
      nextProfile.contacts.push(contact);
    }
  }
  return nextProfile;
}

function mergeSkills(existingSkills, importedSkills) {
  const nextSkills = JSON.parse(JSON.stringify(existingSkills));
  for (const group of importedSkills ?? []) {
    const match = nextSkills.find((existing) => existing.title === group.title);
    if (match) {
      match.items = uniq([...(match.items ?? []), ...(group.items ?? [])]);
      continue;
    }
    nextSkills.push(group);
  }
  return nextSkills;
}

function mergeEducation(existingEducation, importedEducation) {
  const nextEducation = JSON.parse(JSON.stringify(existingEducation));
  if ((!nextEducation.school || nextEducation.school.includes("待")) && importedEducation.school) nextEducation.school = importedEducation.school;
  if ((!nextEducation.degree || nextEducation.degree.includes("待")) && importedEducation.degree) nextEducation.degree = importedEducation.degree;
  if ((!nextEducation.period || nextEducation.period.includes("待")) && importedEducation.period) nextEducation.period = importedEducation.period;
  nextEducation.details = uniq([...(existingEducation.details ?? []), ...(importedEducation.details ?? [])]);
  return nextEducation;
}

function mergeStorySections(existingSections, importedSections) {
  const next = JSON.parse(JSON.stringify(existingSections ?? []));

  for (const section of importedSections ?? []) {
    const match = next.find((item) => item.kind === section.kind && item.title === section.title);
    if (!match) {
      next.push(JSON.parse(JSON.stringify(section)));
      continue;
    }

    if (section.kind === "links") {
      match.items = uniq([...(match.items ?? []), ...(section.items ?? [])].map((item) => JSON.stringify(item))).map((item) => JSON.parse(item));
      continue;
    }

    if (section.kind === "stack") {
      match.items = uniq([...(match.items ?? []), ...(section.items ?? [])]);
      continue;
    }

    if (section.kind === "story") {
      match.paragraphs = uniq([...(match.paragraphs ?? []), ...(section.paragraphs ?? [])]);
      continue;
    }

    if (section.kind === "archive") {
      const existingByTitle = new Map((match.sections ?? []).map((item) => [item.title, item]));
      for (const importedArchiveSection of section.sections ?? []) {
        const existingArchiveSection = existingByTitle.get(importedArchiveSection.title);
        if (!existingArchiveSection) {
          match.sections.push(JSON.parse(JSON.stringify(importedArchiveSection)));
          continue;
        }
        existingArchiveSection.intro = existingArchiveSection.intro ?? importedArchiveSection.intro;
        existingArchiveSection.paragraphs = uniq([...(existingArchiveSection.paragraphs ?? []), ...(importedArchiveSection.paragraphs ?? [])]);
        const groups = [...(existingArchiveSection.groups ?? [])];
        for (const importedGroup of importedArchiveSection.groups ?? []) {
          const groupIndex = groups.findIndex((group) => (group.title ?? "") === (importedGroup.title ?? ""));
          if (groupIndex < 0) {
            groups.push(JSON.parse(JSON.stringify(importedGroup)));
            continue;
          }
          groups[groupIndex] = {
            ...groups[groupIndex],
            paragraphs: uniq([...(groups[groupIndex].paragraphs ?? []), ...(importedGroup.paragraphs ?? [])]),
            items: uniq([...(groups[groupIndex].items ?? []), ...(importedGroup.items ?? [])]),
          };
        }
        existingArchiveSection.groups = groups;
      }
      continue;
    }
  }

  return next;
}

function mergeProjects(existingProjects, importedProjects) {
  const nextProjects = JSON.parse(JSON.stringify(existingProjects));
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
      nextProjects.push(JSON.parse(JSON.stringify(importedProject)));
      existingByKey.set(importedProject.dedupeKey, nextProjects[nextProjects.length - 1]);
      existingByKey.set(importedProject.slug, nextProjects[nextProjects.length - 1]);
      slugMap.set(importedProject.slug, importedProject.slug);
      addedCount += 1;
      continue;
    }

    matchedCount += 1;
    slugMap.set(importedProject.slug, existing.slug);
    existing.cardMeta = uniq([...(existing.cardMeta ?? []), ...(importedProject.cardMeta ?? [])]);
    existing.cardTags = uniq([...(existing.cardTags ?? []), ...(importedProject.cardTags ?? [])]);
    existing.heroEyebrow = existing.heroEyebrow || importedProject.heroEyebrow;
    existing.content = mergeLayeredContent(existing.content, importedProject.content);
    existing.showcase = { ...existing.showcase, ...(importedProject.showcase ?? {}) };
    existing.storySections = mergeStorySections(existing.storySections, importedProject.storySections);
  }

  return { nextProjects, slugMap, matchedCount, addedCount };
}

function remapProjectSlugs(slugs, slugMap) {
  return uniq((slugs ?? []).map((slug) => slugMap.get(slug) ?? slug));
}

function findExperienceMatch(existingExperiences, importedExperience) {
  return existingExperiences.find((experience) => (
    experience.id === importedExperience.id
      || experience.dedupeKey === importedExperience.dedupeKey
      || (
        normalizeTextKey(experience.company) === normalizeTextKey(importedExperience.company)
        && experience.period === importedExperience.period
        && experience.role === importedExperience.role
      )
  ));
}

function mergeExperiences(existingExperiences, importedExperiences, slugMap) {
  const nextExperiences = JSON.parse(JSON.stringify(existingExperiences));
  let matchedCount = 0;
  let addedCount = 0;

  for (const importedExperience of importedExperiences ?? []) {
    const normalizedImported = {
      ...importedExperience,
      relatedProjects: remapProjectSlugs(importedExperience.relatedProjects, slugMap),
    };
    const existing = findExperienceMatch(nextExperiences, normalizedImported);
    if (!existing) {
      nextExperiences.push(JSON.parse(JSON.stringify(normalizedImported)));
      addedCount += 1;
      continue;
    }

    matchedCount += 1;
    existing.content = mergeLayeredContent(existing.content, normalizedImported.content);
    existing.highlights = mergeEntries(existing.highlights, normalizedImported.highlights);
    existing.relatedProjects = uniq([...(existing.relatedProjects ?? []), ...(normalizedImported.relatedProjects ?? [])]);
    if (!existing.note && normalizedImported.note) {
      existing.note = normalizedImported.note;
    }
  }

  return { nextExperiences, matchedCount, addedCount };
}

function mergeHonors(existingHonors, importedHonors) {
  const merged = new Map((existingHonors ?? []).map((honor) => [honor.dedupeKey, JSON.parse(JSON.stringify(honor))]));
  let matchedCount = 0;
  let addedCount = 0;

  for (const honor of importedHonors ?? []) {
    const existing = merged.get(honor.dedupeKey);
    if (!existing) {
      merged.set(honor.dedupeKey, JSON.parse(JSON.stringify(honor)));
      addedCount += 1;
      continue;
    }
    matchedCount += 1;
    existing.content = mergeLayeredContent(existing.content, honor.content);
  }

  return {
    honors: Array.from(merged.values()),
    matchedCount,
    addedCount,
  };
}

function serializeModule(rawModuleText, document) {
  const objectLiteral = extractObjectLiteral(rawModuleText, EXPORT_MARKER);
  return rawModuleText.replace(objectLiteral, JSON.stringify(document, null, 2));
}

async function main() {
  const options = parseArgs(args);
  const inputPath = options.input ?? await resolveLatestImportedSource();
  const importedRaw = JSON.parse(await fs.readFile(inputPath, "utf8"));
  const importedSource = normalizeDocument(importedRaw);
  const { raw: existingRawModule, document: existingDocument } = await parseSourceModule(options.target);
  const existingSource = normalizeDocument(existingDocument);

  const { nextProjects, slugMap, matchedCount: matchedProjects, addedCount: addedProjects } = mergeProjects(existingSource.projects, importedSource.projects);
  const { nextExperiences, matchedCount: matchedExperiences, addedCount: addedExperiences } = mergeExperiences(existingSource.experiences, importedSource.experiences, slugMap);
  const { honors, matchedCount: matchedHonors, addedCount: addedHonors } = mergeHonors(existingSource.honors, importedSource.honors);

  const mergedDocument = {
    schemaVersion: SCHEMA_VERSION,
    profile: mergeProfile(existingSource.profile, importedSource.profile),
    experiences: nextExperiences,
    skills: mergeSkills(existingSource.skills, importedSource.skills),
    honors,
    education: mergeEducation(existingSource.education, importedSource.education),
    projects: nextProjects,
  };

  const summary = {
    input: inputPath,
    write: options.write,
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
    summary.backup = backupPath;
    summary.target = options.target;
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

