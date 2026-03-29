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

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function uniq(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function normalizeTextKey(text) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function parseMonthValue(value) {
  const match = value.match(/(\d{4})[./](\d{1,2})/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 12 + Number(match[2]) - 1;
}

function parsePeriodRange(text) {
  const compact = text.replace(/[–]/g, "-").replace(/\s+/g, " ").trim();
  const match = compact.match(/(\d{4}[./]\d{1,2})\s*-\s*(\d{4}[./]\d{1,2}|至今)/);
  if (!match) {
    return null;
  }
  const start = parseMonthValue(match[1]);
  const end = match[2] === "至今" ? 999999 : parseMonthValue(match[2]);
  if (start === null || end === null) {
    return null;
  }
  return { start, end };
}

function overlapScore(left, right) {
  if (!left || !right) {
    return 0;
  }
  const start = Math.max(left.start, right.start);
  const end = Math.min(left.end, right.end);
  return Math.max(0, end - start + 1);
}

function companyKey(company) {
  return normalizeTextKey(company.replace(/[（）()]/g, ""));
}

function normalizePeriodText(period) {
  return (period ?? "").replace(/[–]/g, "-").replace(/\s+/g, "");
}

function rangeContains(container, inner) {
  return Boolean(container && inner && inner.start >= container.start && inner.end <= container.end);
}

function compareRangeStartDescending(left, right) {
  const leftStart = left.range?.start ?? Number.NEGATIVE_INFINITY;
  const rightStart = right.range?.start ?? Number.NEGATIVE_INFINITY;
  return rightStart - leftStart;
}

function countSharedItems(left, right) {
  const rightSet = new Set(right ?? []);
  return (left ?? []).filter((item) => rightSet.has(item)).length;
}

function hasNonOverlappingRanges(items) {
  const sorted = [...items].sort((left, right) => (left.range?.start ?? 0) - (right.range?.start ?? 0));
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1].range;
    const current = sorted[index].range;
    if (!previous || !current) {
      return false;
    }
    if (current.start < previous.end) {
      return false;
    }
  }
  return true;
}

const PROJECT_KEY_RULES = [
  { key: "scene-blueprint", patterns: [/scene\s*blueprint/i, /场景蓝图/] },
  { key: "xiuxian", patterns: [/修仙/] },
  { key: "knowledge-tagging", patterns: [/短文本知识标注/, /text\s*to\s*knowledge/i] },
  { key: "baike-knowledge-base", patterns: [/百科词条.*知识库/, /百科.*知识库/, /baike/] },
  { key: "desktop-pet", patterns: [/桌宠/] },
  { key: "tower-defense", patterns: [/塔防/] },
];

const STANDARD_ARCHIVE_SECTION_TITLES = new Set(["项目介绍", "主要工作", "技术档案"]);

function normalizeArchiveStoryTitle(title) {
  return /档案/.test(title ?? "") ? "项目档案" : (title ?? "项目档案");
}

function normalizeArchiveSectionTitle(title) {
  switch (title) {
    case "项目概述":
    case "核心定位":
      return "项目介绍";
    case "整理后的详细说明":
    case "架构设计":
      return "主要工作";
    case "项目角色":
    case "项目时间":
    case "项目难点":
    case "项目性能优化工作":
    case "其他工作":
    case "项目影响":
    case "影响":
    case "简历原文":
    case "工具链亮点":
    case "运行时与调试能力":
      return "技术档案";
    default:
      return title;
  }
}

function sectionHasContent(section) {
  return Boolean(
    (section.paragraphs ?? []).length > 0
    || (section.groups ?? []).length > 0
    || section.intro,
  );
}

function groupHasContent(group) {
  return Boolean((group.paragraphs ?? []).length > 0 || (group.items ?? []).length > 0);
}

function convertArchiveSectionToGroups(section, titlePrefix) {
  const groups = [];
  const introParagraphs = [section.intro, ...(section.paragraphs ?? [])].filter(Boolean);

  if ((section.groups ?? []).length === 0) {
    if (introParagraphs.length > 0) {
      groups.push({
        title: titlePrefix,
        paragraphs: introParagraphs,
      });
    }
    return groups;
  }

  if (introParagraphs.length > 0) {
    groups.push({
      title: titlePrefix,
      paragraphs: introParagraphs,
    });
  }

  for (const group of section.groups ?? []) {
    const nextGroup = {
      title: titlePrefix ? (group.title ? `${titlePrefix} / ${group.title}` : titlePrefix) : group.title,
      paragraphs: group.paragraphs,
      items: group.items,
    };
    if (groupHasContent(nextGroup)) {
      groups.push(nextGroup);
    }
  }

  return groups;
}

function normalizeArchiveSections(sections) {
  const normalized = [];
  const ensureSection = (title) => {
    let section = normalized.find((item) => item.title === title);
    if (!section) {
      section = { title };
      normalized.push(section);
    }
    return section;
  };

  for (const section of sections ?? []) {
    const rawTitle = section.title;
    const normalizedTitle = normalizeArchiveSectionTitle(rawTitle);
    const prefixTitle = STANDARD_ARCHIVE_SECTION_TITLES.has(rawTitle) ? undefined : rawTitle;

    if (normalizedTitle === "项目介绍") {
      const target = ensureSection("项目介绍");
      target.paragraphs = uniq([
        ...(target.paragraphs ?? []),
        ...[section.intro, ...(section.paragraphs ?? [])].filter(Boolean),
      ]);
      continue;
    }

    const target = ensureSection(normalizedTitle);
    target.groups = [
      ...(target.groups ?? []),
      ...convertArchiveSectionToGroups(section, prefixTitle),
    ];
  }

  return normalized.filter(sectionHasContent);
}

function normalizeImportedProject(project) {
  const nextProject = deepClone(project);
  nextProject.storySections = (nextProject.storySections ?? []).map((section) => {
    if (section.kind !== "archive") {
      return section;
    }

    return {
      ...section,
      title: normalizeArchiveStoryTitle(section.title),
      sections: normalizeArchiveSections(section.sections ?? []),
    };
  });
  return nextProject;
}

function resolveProjectKey(project) {
  const candidates = [project.slug, project.title, ...(project.cardTags ?? []), ...(project.cardMeta ?? [])].filter(Boolean);
  const joined = candidates.join(" ");

  for (const rule of PROJECT_KEY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(joined))) {
      return rule.key;
    }
  }

  return normalizeTextKey(project.title || project.slug || "project");
}

function mapProjectSlugs(slugs, slugMap) {
  return uniq((slugs ?? []).map((slug) => slugMap.get(slug) ?? slug));
}

function mergeProfile(existingProfile, importedProfile) {
  const nextProfile = deepClone(existingProfile);

  if ((!nextProfile.role || nextProfile.role.includes("待")) && importedProfile.role) {
    nextProfile.role = importedProfile.role;
  }
  if ((!nextProfile.bio || nextProfile.bio.includes("待")) && importedProfile.bio) {
    nextProfile.bio = importedProfile.bio;
  }
  if ((!nextProfile.headline || nextProfile.headline.includes("待")) && importedProfile.headline) {
    nextProfile.headline = importedProfile.headline;
  }

  nextProfile.strengths = uniq([...(existingProfile.strengths ?? []), ...(importedProfile.strengths ?? [])]);
  nextProfile.summaryPoints = uniq([...(existingProfile.summaryPoints ?? []), ...(importedProfile.summaryPoints ?? [])]).slice(0, 6);
  nextProfile.focusAreas = [...(existingProfile.focusAreas ?? [])];
  for (const area of importedProfile.focusAreas ?? []) {
    if (!nextProfile.focusAreas.some((existing) => existing.title === area.title || existing.description === area.description)) {
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
  const nextSkills = deepClone(existingSkills);

  for (const group of importedSkills) {
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
  const nextEducation = deepClone(existingEducation);

  if ((!nextEducation.school || nextEducation.school.includes("待")) && importedEducation.school) {
    nextEducation.school = importedEducation.school;
  }
  if ((!nextEducation.degree || nextEducation.degree.includes("待")) && importedEducation.degree) {
    nextEducation.degree = importedEducation.degree;
  }
  if ((!nextEducation.period || nextEducation.period.includes("待")) && importedEducation.period) {
    nextEducation.period = importedEducation.period;
  }
  nextEducation.details = uniq([...(existingEducation.details ?? []), ...(importedEducation.details ?? [])]);

  return nextEducation;
}

function mergeProjectCollections(existingProjects, importedProjects) {
  const nextProjects = deepClone(existingProjects);
  const slugMap = new Map();
  let matchedCount = 0;
  let addedCount = 0;

  const existingByKey = new Map();
  for (const project of nextProjects) {
    existingByKey.set(resolveProjectKey(project), project);
  }

  for (const importedProjectRaw of importedProjects) {
    const importedProject = normalizeImportedProject(importedProjectRaw);
    const key = resolveProjectKey(importedProject);
    const existingMatch = existingByKey.get(key);

    if (existingMatch) {
      matchedCount += 1;
      slugMap.set(importedProject.slug, existingMatch.slug);
      existingMatch.cardTags = uniq([...(existingMatch.cardTags ?? []), ...(importedProject.cardTags ?? [])]);

      const importedLinks = importedProject.storySections?.find((section) => section.kind === "links")?.items ?? [];
      if (importedLinks.length > 0) {
        const existingLinksSection = existingMatch.storySections?.find((section) => section.kind === "links");
        if (existingLinksSection) {
          const existingItems = existingLinksSection.items ?? [];
          existingLinksSection.items = [...existingItems];
          for (const item of importedLinks) {
            if (!existingLinksSection.items.some((existing) => existing.href === item.href)) {
              existingLinksSection.items.push(item);
            }
          }
        }
      }

      const importedLayeredSection = importedProject.storySections?.find((section) => section.kind === "layered_bullets");
      if (importedLayeredSection) {
        const existingLayeredSection = existingMatch.storySections?.find((section) => section.kind === "layered_bullets");
        if (existingLayeredSection) {
          existingLayeredSection.refinedTitle = existingLayeredSection.refinedTitle ?? importedLayeredSection.refinedTitle;
          existingLayeredSection.originalTitle = existingLayeredSection.originalTitle ?? importedLayeredSection.originalTitle;
          existingLayeredSection.refinedItems = uniq([...(existingLayeredSection.refinedItems ?? []), ...(importedLayeredSection.refinedItems ?? [])]);
          existingLayeredSection.originalItems = uniq([...(existingLayeredSection.originalItems ?? []), ...(importedLayeredSection.originalItems ?? [])]);
        } else {
          existingMatch.storySections.push(deepClone(importedLayeredSection));
        }
      }

      const importedArchiveSection = importedProject.storySections?.find((section) => section.kind === "archive");
      if (importedArchiveSection) {
        const existingArchiveSection = existingMatch.storySections?.find((section) => section.kind === "archive");
        if (existingArchiveSection) {
          existingArchiveSection.title = normalizeArchiveStoryTitle(existingArchiveSection.title);
          existingArchiveSection.description = existingArchiveSection.description ?? importedArchiveSection.description;
          existingArchiveSection.sections = normalizeArchiveSections(existingArchiveSection.sections ?? []);
          const existingByTitle = new Map((existingArchiveSection.sections ?? []).map((section) => [section.title, section]));
          for (const importedSection of importedArchiveSection.sections ?? []) {
            const existingSection = existingByTitle.get(importedSection.title);
            if (!existingSection) {
              existingArchiveSection.sections.push(deepClone(importedSection));
              continue;
            }
            existingSection.intro = existingSection.intro ?? importedSection.intro;
            existingSection.paragraphs = uniq([...(existingSection.paragraphs ?? []), ...(importedSection.paragraphs ?? [])]);
            const existingGroups = existingSection.groups ?? [];
            const importedGroups = importedSection.groups ?? [];
            const nextGroups = [...existingGroups];
            for (const importedGroup of importedGroups) {
              const matchIndex = nextGroups.findIndex((group) => (group.title ?? "") === (importedGroup.title ?? ""));
              if (matchIndex < 0) {
                nextGroups.push(deepClone(importedGroup));
                continue;
              }
              nextGroups[matchIndex] = {
                ...nextGroups[matchIndex],
                paragraphs: uniq([...(nextGroups[matchIndex].paragraphs ?? []), ...(importedGroup.paragraphs ?? [])]),
                items: uniq([...(nextGroups[matchIndex].items ?? []), ...(importedGroup.items ?? [])]),
              };
            }
            existingSection.groups = nextGroups;
          }
        } else {
          existingMatch.storySections.push(deepClone(importedArchiveSection));
        }
      }
      continue;
    }

    const appendedProject = deepClone(importedProject);
    nextProjects.push(appendedProject);
    existingByKey.set(key, appendedProject);
    slugMap.set(importedProject.slug, appendedProject.slug);
    addedCount += 1;
  }

  return { nextProjects, slugMap, matchedCount, addedCount };
}

function findExperienceMatchIndex(existingExperiences, importedExperience, mappedProjectSlugs = []) {
  const importedCompanyKey = companyKey(importedExperience.company);
  const importedRange = parsePeriodRange(importedExperience.period);
  const normalizedImportedPeriod = normalizePeriodText(importedExperience.period);
  let bestIndex = -1;
  let bestScore = Number.NEGATIVE_INFINITY;

  existingExperiences.forEach((experience, index) => {
    if (companyKey(experience.company) !== importedCompanyKey) {
      return;
    }

    const existingRange = parsePeriodRange(experience.period);
    const overlap = overlapScore(existingRange, importedRange);
    const sharedProjects = countSharedItems(experience.relatedProjects, mappedProjectSlugs);
    let score = 80;

    if (experience.role === importedExperience.role) {
      score += 40;
    }
    if (normalizePeriodText(experience.period) === normalizedImportedPeriod) {
      score += 260;
    }
    score += overlap * 16;

    if (rangeContains(existingRange, importedRange)) {
      score += 30;
    }
    if (sharedProjects > 0) {
      score += sharedProjects * 260;
    }
    if ((experience.note ?? "") === (importedExperience.note ?? "") && importedExperience.note) {
      score += 90;
    } else if (Boolean(experience.note) !== Boolean(importedExperience.note)) {
      score -= 60;
    }
    if (importedRange && existingRange && overlap === 0) {
      score -= 180;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore > 0 ? bestIndex : -1;
}

function mergeDetailLayer(existingLayer, importedLayer) {
  if (!existingLayer && !importedLayer) {
    return undefined;
  }

  return {
    refinedTitle: existingLayer?.refinedTitle ?? importedLayer?.refinedTitle,
    refined: uniq([...(existingLayer?.refined ?? []), ...(importedLayer?.refined ?? [])]),
    originalTitle: existingLayer?.originalTitle ?? importedLayer?.originalTitle,
    original: uniq([...(existingLayer?.original ?? []), ...(importedLayer?.original ?? [])]),
  };
}

function mergeExperience(existingExperience, importedExperience, mappedProjectSlugs) {
  const nextExperience = deepClone(existingExperience);

  if ((!nextExperience.summary || nextExperience.summary.includes("待")) && importedExperience.summary) {
    nextExperience.summary = importedExperience.summary;
  }

  nextExperience.achievements = uniq([...(existingExperience.achievements ?? []), ...(importedExperience.achievements ?? [])]).slice(0, 8);
  nextExperience.details = mergeDetailLayer(existingExperience.details, importedExperience.details);
  const mergedProjectSlugs = uniq([...(existingExperience.relatedProjects ?? []), ...mappedProjectSlugs]);
  if (mergedProjectSlugs.length > 0) {
    nextExperience.relatedProjects = mergedProjectSlugs;
  }
  if (!nextExperience.note && importedExperience.note) {
    nextExperience.note = importedExperience.note;
  }

  return nextExperience;
}

function buildImportedExperienceCandidates(importedExperiences, slugMap) {
  return importedExperiences.map((experience, index) => ({
    experience,
    mappedProjectSlugs: mapProjectSlugs(experience.relatedProjects, slugMap),
    range: parsePeriodRange(experience.period),
    originalIndex: index,
  }));
}

function shouldSplitExistingExperience(existingEntries, importedEntries) {
  if (existingEntries.length !== 1 || importedEntries.length < 2) {
    return false;
  }

  const existingRange = parsePeriodRange(existingEntries[0].experience.period);
  if (!existingRange || importedEntries.some((entry) => !entry.range)) {
    return false;
  }

  if (!hasNonOverlappingRanges(importedEntries)) {
    return false;
  }

  const sortedImported = [...importedEntries].sort(compareRangeStartDescending);
  const newestImported = sortedImported[0].range;
  const oldestImported = sortedImported[sortedImported.length - 1].range;
  if (!newestImported || !oldestImported) {
    return false;
  }

  const importedCoverage = {
    start: oldestImported.start,
    end: newestImported.end,
  };

  if (!rangeContains(existingRange, importedCoverage)) {
    return false;
  }

  return sortedImported.every((entry) => normalizePeriodText(entry.experience.period) !== normalizePeriodText(existingEntries[0].experience.period));
}

function choosePrimarySplitImportedIndex(existingExperience, importedEntries) {
  let bestIndex = 0;
  let bestScore = Number.NEGATIVE_INFINITY;

  importedEntries.forEach((entry, index) => {
    let score = 0;
    const sharedProjects = countSharedItems(existingExperience.relatedProjects, entry.mappedProjectSlugs);
    score += sharedProjects * 320;

    if ((existingExperience.note ?? "") === (entry.experience.note ?? "")) {
      score += entry.experience.note ? 90 : 40;
    } else if (Boolean(existingExperience.note) !== Boolean(entry.experience.note)) {
      score -= 50;
    }

    if (existingExperience.role === entry.experience.role) {
      score += 30;
    }

    score += entry.range?.start ?? 0;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function extractExperienceAnchors(experience) {
  const sources = [
    experience.summary,
    ...(experience.achievements ?? []),
    ...(experience.details?.refined ?? []),
    ...(experience.details?.original ?? []),
  ].filter(Boolean);

  return uniq(sources.map((text) => {
    const match = text.match(/^([^：:]{2,48})[：:]/);
    return match ? normalizeTextKey(match[1]) : undefined;
  }));
}

function filterExperienceItemsByAnchors(items, anchors) {
  if (!items || anchors.length === 0) {
    return items;
  }

  return items.filter((item) => {
    const normalized = normalizeTextKey(item);
    return !anchors.some((anchor) => normalized.includes(anchor));
  });
}

function pruneSplitPrimaryExperience(existingExperience, siblingImportedEntries) {
  const anchors = uniq(siblingImportedEntries.flatMap((entry) => extractExperienceAnchors(entry.experience)));
  if (anchors.length === 0) {
    return deepClone(existingExperience);
  }

  const nextExperience = deepClone(existingExperience);
  nextExperience.achievements = filterExperienceItemsByAnchors(nextExperience.achievements, anchors);

  if (nextExperience.details) {
    nextExperience.details.refined = filterExperienceItemsByAnchors(nextExperience.details.refined, anchors);
    nextExperience.details.original = filterExperienceItemsByAnchors(nextExperience.details.original, anchors);
  }

  return nextExperience;
}

function expandExistingExperiencesForImported(existingExperiences, importedExperiences, slugMap) {
  const existingEntriesByCompany = new Map();
  existingExperiences.forEach((experience, index) => {
    const key = companyKey(experience.company);
    if (!existingEntriesByCompany.has(key)) {
      existingEntriesByCompany.set(key, []);
    }
    existingEntriesByCompany.get(key).push({ experience, index });
  });

  const importedCandidatesByCompany = new Map();
  for (const candidate of buildImportedExperienceCandidates(importedExperiences, slugMap)) {
    const key = companyKey(candidate.experience.company);
    if (!importedCandidatesByCompany.has(key)) {
      importedCandidatesByCompany.set(key, []);
    }
    importedCandidatesByCompany.get(key).push(candidate);
  }

  const splitPlan = new Map();

  for (const [key, importedEntries] of importedCandidatesByCompany.entries()) {
    const existingEntries = existingEntriesByCompany.get(key) ?? [];
    if (!shouldSplitExistingExperience(existingEntries, importedEntries)) {
      continue;
    }

    const existingExperience = existingEntries[0].experience;
    const sortedImported = [...importedEntries].sort((left, right) => left.originalIndex - right.originalIndex);
    const primaryIndex = choosePrimarySplitImportedIndex(existingExperience, sortedImported);

    const replacementExperiences = sortedImported.map((entry, index) => {
      if (index !== primaryIndex) {
        const placeholder = deepClone(entry.experience);
        placeholder.relatedProjects = entry.mappedProjectSlugs.length > 0 ? entry.mappedProjectSlugs : placeholder.relatedProjects;
        return placeholder;
      }

      const prunedExistingExperience = pruneSplitPrimaryExperience(
        existingExperience,
        sortedImported.filter((_, candidateIndex) => candidateIndex !== primaryIndex),
      );

      return {
        ...prunedExistingExperience,
        id: entry.experience.id,
        company: entry.experience.company,
        role: entry.experience.role,
        period: entry.experience.period,
        note: entry.experience.note,
        relatedProjects: uniq([...(existingExperience.relatedProjects ?? []), ...entry.mappedProjectSlugs]),
      };
    });

    splitPlan.set(existingEntries[0].index, replacementExperiences);
  }

  if (splitPlan.size === 0) {
    return deepClone(existingExperiences);
  }

  const nextExperiences = [];
  existingExperiences.forEach((experience, index) => {
    const replacements = splitPlan.get(index);
    if (replacements) {
      nextExperiences.push(...replacements);
      return;
    }
    nextExperiences.push(deepClone(experience));
  });

  return nextExperiences;
}

function mergeExperienceCollections(existingExperiences, importedExperiences, slugMap) {
  const nextExperiences = expandExistingExperiencesForImported(existingExperiences, importedExperiences, slugMap);
  let mergedCount = 0;
  let addedCount = 0;

  for (const importedExperience of importedExperiences) {
    const mappedProjectSlugs = mapProjectSlugs(importedExperience.relatedProjects, slugMap);
    const matchIndex = findExperienceMatchIndex(nextExperiences, importedExperience, mappedProjectSlugs);

    if (matchIndex >= 0) {
      nextExperiences[matchIndex] = mergeExperience(nextExperiences[matchIndex], importedExperience, mappedProjectSlugs);
      mergedCount += 1;
      continue;
    }

    const appendedExperience = deepClone(importedExperience);
    appendedExperience.relatedProjects = mappedProjectSlugs.length > 0 ? mappedProjectSlugs : appendedExperience.relatedProjects;
    nextExperiences.push(appendedExperience);
    addedCount += 1;
  }

  return { nextExperiences, mergedCount, addedCount };
}

function extractObjectLiteral(moduleText) {
  const exportIndex = moduleText.indexOf(EXPORT_MARKER);
  if (exportIndex < 0) {
    throw new Error("Could not find resumeSource export in target file.");
  }

  const startIndex = moduleText.indexOf("{", exportIndex + EXPORT_MARKER.length);
  if (startIndex < 0) {
    throw new Error("Could not locate object literal start in target file.");
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
        return {
          prefix: moduleText.slice(0, exportIndex),
          objectLiteral: moduleText.slice(startIndex, index + 1),
        };
      }
    }
  }

  throw new Error("Could not locate object literal end in target file.");
}

function parseSourceModule(moduleText) {
  const { prefix, objectLiteral } = extractObjectLiteral(moduleText);
  const normalizedLiteral = objectLiteral.replaceAll("RESUME_SCHEMA_VERSION", JSON.stringify(SCHEMA_VERSION));
  const source = Function(`"use strict"; return (${normalizedLiteral});`)();
  return { prefix, source };
}

function buildSourceModule(prefix, resumeSource) {
  const objectLiteral = JSON.stringify(resumeSource, null, 2);
  return `${prefix}${EXPORT_MARKER}${objectLiteral};\n`;
}

function basicValidateResumeSource(source) {
  if (source.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`Merged resume source schemaVersion must be ${SCHEMA_VERSION}.`);
  }

  const slugs = new Set();
  for (const project of source.projects ?? []) {
    if (!project.slug) {
      throw new Error("Merged resume source contains a project without slug.");
    }
    if (slugs.has(project.slug)) {
      throw new Error(`Merged resume source contains duplicate project slug: ${project.slug}`);
    }
    slugs.add(project.slug);
  }

  const experienceIds = new Set();
  for (const experience of source.experiences ?? []) {
    if (!experience.id) {
      throw new Error(`Merged resume source contains an experience without id: ${experience.company ?? "unknown"}`);
    }
    if (experienceIds.has(experience.id)) {
      throw new Error(`Merged resume source contains duplicate experience id: ${experience.id}`);
    }
    experienceIds.add(experience.id);
    for (const slug of experience.relatedProjects ?? []) {
      if (!slugs.has(slug)) {
        throw new Error(`Experience ${experience.id} references unknown project slug: ${slug}`);
      }
    }
  }
}

function mergeDocuments(existingSource, importedSource) {
  const { nextProjects, slugMap, matchedCount: matchedProjects, addedCount: addedProjects } = mergeProjectCollections(
    existingSource.projects ?? [],
    importedSource.projects ?? [],
  );

  const { nextExperiences, mergedCount: mergedExperiences, addedCount: addedExperiences } = mergeExperienceCollections(
    existingSource.experiences ?? [],
    importedSource.experiences ?? [],
    slugMap,
  );

  return {
    mergedSource: {
      schemaVersion: existingSource.schemaVersion ?? importedSource.schemaVersion ?? SCHEMA_VERSION,
      profile: mergeProfile(existingSource.profile, importedSource.profile),
      experiences: nextExperiences,
      skills: mergeSkills(existingSource.skills ?? [], importedSource.skills ?? []),
      honors: uniq([...(existingSource.honors ?? []), ...(importedSource.honors ?? [])]),
      education: mergeEducation(existingSource.education, importedSource.education),
      projects: nextProjects,
    },
    summary: {
      matchedProjects,
      addedProjects,
      mergedExperiences,
      addedExperiences,
    },
  };
}

async function main() {
  const options = parseArgs(args);
  const input = options.input ?? await resolveLatestImportedSource();

  const [importedRaw, targetRaw] = await Promise.all([
    fs.readFile(input, "utf8"),
    fs.readFile(options.target, "utf8"),
  ]);

  const importedResumeSource = JSON.parse(importedRaw);
  const { prefix, source: existingResumeSource } = parseSourceModule(targetRaw);
  const { mergedSource, summary } = mergeDocuments(existingResumeSource, importedResumeSource);
  basicValidateResumeSource(mergedSource);
  const nextContent = buildSourceModule(prefix, mergedSource);

  if (!options.write) {
    console.log(`Dry run only. Imported source: ${input}`);
    console.log(`Target file: ${options.target}`);
    console.log(`Projects matched: ${summary.matchedProjects}`);
    console.log(`Projects added: ${summary.addedProjects}`);
    console.log(`Experiences merged: ${summary.mergedExperiences}`);
    console.log(`Experiences added: ${summary.addedExperiences}`);
    console.log(`Backup dir: ${options.backupDir}`);
    console.log("Use --write to update src/data/resume-source.ts with merged content.");
    return;
  }

  await fs.mkdir(options.backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(options.backupDir, `resume-source.${timestamp}.ts`);

  await Promise.all([
    fs.writeFile(backupPath, targetRaw, "utf8"),
    fs.writeFile(options.target, nextContent, "utf8"),
  ]);

  console.log(`Merged imported resume source: ${input}`);
  console.log(`- target updated: ${options.target}`);
  console.log(`- backup created: ${backupPath}`);
  console.log(`- projects matched: ${summary.matchedProjects}`);
  console.log(`- projects added: ${summary.addedProjects}`);
  console.log(`- experiences merged: ${summary.mergedExperiences}`);
  console.log(`- experiences added: ${summary.addedExperiences}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});








