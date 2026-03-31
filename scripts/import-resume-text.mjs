import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildParsedCandidate } from "./lib/resume-parser/assemble-candidate.ts";
import { enhanceCandidateWithAiStructure } from "./lib/resume-parser/ai/structural-parser.ts";
import { buildStructureReport } from "./lib/resume-parser/structure-report.ts";
import { buildCandidateValidationReport } from "./lib/resume-parser/candidate-validation.ts";
import { buildFieldCandidatesReport } from "./lib/resume-parser/field-candidates.ts";
import { buildFieldCandidateValidationReport } from "./lib/resume-parser/field-candidate-validation.ts";

const args = process.argv.slice(2);
const NOISE_LINES = new Set(["社交主页", "个人优势", "荣誉奖项", "教育经历"]);

function parseArgs(argv) {
  const options = {
    input: undefined,
    outDir: path.resolve("generated/resume-import"),
    stem: undefined,
    stdin: false,
    emitCandidate: false,
    useAiStructure: false,
    useAiFields: false,
    sourceType: undefined,
    sourcePath: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--out-dir") {
      options.outDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--stem") {
      options.stem = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--stdin") {
      options.stdin = true;
      continue;
    }
    if (arg === "--emit-candidate") {
      options.emitCandidate = true;
      continue;
    }
    if (arg === "--use-ai-structure") {
      options.useAiStructure = true;
      options.emitCandidate = true;
      continue;
    }
    if (arg === "--use-ai-fields") {
      options.useAiFields = true;
      options.emitCandidate = true;
      continue;
    }
    if (arg === "--source-type") {
      options.sourceType = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--source-path") {
      options.sourcePath = argv[index + 1];
      index += 1;
      continue;
    }
    if (!options.input) {
      options.input = arg;
    }
  }

  return options;
}

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/ﬁ/g, "fi")
    .replace(/ﬀ/g, "ff")
    .replace(/buﬀ/g, "buff")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function compactSentence(text) {
  return text.replace(/\s+/g, " ").trim();
}

function isNoiseLine(line) {
  return NOISE_LINES.has(line);
}

function isLabelOnlyLine(line) {
  return /^[^：:\s]{2,24}[：:]$/.test(line);
}

function matchInlineLabel(line) {
  return line.match(/^([^：:]{2,24})[：:]\s*(.+)$/);
}

function toStem(input, fallback = "resume") {
  return input ? path.basename(input, path.extname(input)) : fallback;
}

function sanitizeStem(value) {
  return value.replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "resume";
}

function isExperienceHeader(line) {
  const normalized = compactSentence(line);
  return /\d{4}[./]\d{2}\s*[-–]\s*(?:\d{4}[./]\d{2}|至今)/.test(normalized)
    && !normalized.startsWith("项目")
    && !normalized.includes("项目时间")
    && !normalized.includes("求职意向")
    && !normalized.includes("https://")
    && !normalized.includes("开源链接")
    && !normalized.includes("本科")
    && normalized.length <= 120;
}

function detectExperienceSection(line) {
  if (line === "工作经历") {
    return "work";
  }
  if (line === "实习经历") {
    return "internship";
  }
  return undefined;
}

function findFirst(lines, pattern) {
  return lines.find((line) => pattern.test(line));
}

function extractFirstMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? match[0] : "";
}

function parseExperienceHeader(line) {
  const periodMatch = line.match(/(\d{4}[./]\d{2}\s*[-–]\s*(?:\d{4}[./]\d{2}|至今))/);
  const period = periodMatch ? compactSentence(periodMatch[1]).replace(/[–]/g, "-") : "待补充";
  const prefix = line.replace(periodMatch?.[1] ?? "", "").trim();
  const parts = prefix.split(/\s{2,}/).map((item) => item.trim()).filter(Boolean);
  return {
    company: parts[0] ?? prefix,
    role: parts[1] ?? "待补充岗位",
    period,
  };
}

function parseMonthValue(value) {
  const match = value.match(/(\d{4})[./](\d{1,2})/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 12 + Number(match[2]) - 1;
}

function parsePeriodRange(text) {
  const compact = compactSentence(text).replace(/[–]/g, "-");
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

function containsMonth(range, month) {
  return range && month !== null && month >= range.start && month <= range.end;
}

function isTailBoundaryLine(line) {
  return /^\d{4}\s*年/.test(line) || /大学\s+本科\s+/.test(line);
}

function isStandaloneProjectTitle(line) {
  return line.length > 0
    && line.length <= 40
    && !line.includes("：")
    && !isNoiseLine(line)
    && !isExperienceHeader(line)
    && /(项目|系统|游戏|框架|研发|工具|桌宠|脱壳)/.test(line);
}

function isProjectStart(lines, index) {
  const current = lines[index] ?? "";
  const next = lines[index + 1] ?? "";

  if (/^项目(?:[一二三四五六七八九十]|\d+)?[：:]/.test(current)) {
    return true;
  }

  return isStandaloneProjectTitle(current) && (/^项目介绍[：:]/.test(next) || /^开源链接[：:]/.test(next));
}

function looksLikeStandaloneBulletLabel(label) {
  return label.length <= 8;
}

function shouldJoinWrappedLine(previous, current) {
  if (!previous || !current) {
    return false;
  }

  if (
    isNoiseLine(current)
    || detectExperienceSection(current) !== undefined
    || isExperienceHeader(current)
    || isExperienceHeader(previous)
    || isTailBoundaryLine(current)
    || isStandaloneProjectTitle(current)
    || isLabelOnlyLine(current)
  ) {
    return false;
  }

  if (/^项目(?:[一二三四五六七八九十]|\d+)?[：:]/.test(current) || /^(项目介绍|项目角色|项目时间|项目难点|主要工作|项目性能优化工作|其他工作|影响|开源链接)[：:]/.test(current)) {
    return false;
  }

  if (isNoiseLine(previous) || detectExperienceSection(previous) !== undefined || isLabelOnlyLine(previous) || /^https?:\/\//.test(previous)) {
    return false;
  }

  const currentInlineLabel = matchInlineLabel(current)?.[1];
  if (currentInlineLabel) {
    if (/[一二三四五六七八九十百千万半]$/.test(previous) && /^[个种条套项份段类]/.test(currentInlineLabel)) {
      return true;
    }

    if (!looksLikeStandaloneBulletLabel(currentInlineLabel) && !/[。！？；]$/.test(previous)) {
      return true;
    }

    return false;
  }

  return !/[。！？；:：]$/.test(previous);
}

function joinWrappedLines(lines) {
  const merged = [];

  for (const line of lines) {
    const previous = merged[merged.length - 1];
    if (previous && shouldJoinWrappedLine(previous, line)) {
      merged[merged.length - 1] = `${previous}${line}`;
      continue;
    }

    merged.push(line);
  }

  return merged;
}

function splitLines(text) {
  const rawLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return joinWrappedLines(rawLines);
}

function buildProfile(lines, fullText) {
  const name = fullText.match(/(?:^|\n)([^\n\dA-Za-z@:/|（）() ]{2,6})(?=\n)/u)?.[1]?.trim() ?? findFirst(lines, /^[^\dA-Za-z@:/|（）() ]{2,6}$/u) ?? "待补充姓名";
  const email = extractFirstMatch(fullText, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu);
  const phone = extractFirstMatch(fullText, /1\d{10}/);
  const intentMatch = fullText.match(/求职意向[：:]\s*([^\n]+)/);
  const socialLinks = Array.from(fullText.matchAll(/https?:\/\/[^\s（）()<>，,]+/g), (match) => match[0]);

  const strengthLines = lines.filter((line) => {
    return /^[^：:]{2,20}[：:].+/.test(line)
      && !/^求职意向[：:]/.test(line)
      && !/^https?:\/\//.test(line)
      && !/^项目(?:介绍|角色|时间|难点|一|二|三|四|五|六|七|八|九|十)?[：:]/.test(line)
      && !/^开源链接[：:]/.test(line);
  });

  const strengths = strengthLines.slice(0, 6).map((line) => compactSentence(line));
  const facts = [];

  if (intentMatch) {
    facts.push({ label: "求职意向", value: compactSentence(intentMatch[1]) });
  }
  if (phone) {
    facts.push({ label: "电话", value: phone });
  }
  if (email) {
    facts.push({ label: "邮箱", value: email });
  }
  if (socialLinks[0]) {
    facts.push({ label: "主页", value: socialLinks[0] });
  }

  const contacts = [{ label: "简历", href: "/resume" }];
  if (socialLinks[0]) {
    contacts.push({ label: "链接", href: socialLinks[0], external: true });
  }
  if (email) {
    contacts.push({ label: "Email", href: `mailto:${email}` });
  }

  return {
    name,
    role: intentMatch ? `${compactSentence(intentMatch[1])} / 游戏开发 / 算法工程` : "待整理职业方向",
    bio: strengths.join(" ") || "待从简历文本中补充个人简介。",
    headline: strengths.slice(0, 2).join(" ") || "待从简历文本中补充职业摘要。",
    strengths,
    summaryPoints: strengths.slice(0, 3),
    focusAreas: strengths.slice(0, 3).map((item, index) => ({
      title: `方向 ${index + 1}`,
      description: item,
    })),
    facts,
    contacts,
  };
}

function buildSkillGroups(lines) {
  const groups = [];
  for (const line of lines) {
    if (!/^[^：:]{2,20}[：:].+/.test(line)) {
      continue;
    }
    if (/^项目(?:介绍|角色|时间|难点|一|二|三|四|五|六|七|八|九|十)?[：:]/.test(line) || /^求职意向[：:]/.test(line) || /^https?:\/\//.test(line)) {
      continue;
    }
    const match = line.match(/^([^：:]{2,20})[：:]\s*(.+)$/);
    if (!match) {
      continue;
    }
    const title = compactSentence(match[1]);
    const content = compactSentence(match[2]);
    groups.push({
      title,
      items: content.split(/[、,，/]|\s{2,}|和/).map((item) => item.trim()).filter(Boolean).slice(0, 8),
    });
  }

  return groups.length > 0 ? groups : [{ title: "待整理技能", items: ["请根据原始简历补充技能分组"] }];
}

function splitExperienceBlocks(lines) {
  const headers = [];
  let currentSection = undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const section = detectExperienceSection(lines[index]);
    if (section) {
      currentSection = section;
      continue;
    }

    if (isExperienceHeader(lines[index])) {
      headers.push({ index, sectionType: currentSection ?? "work" });
    }
  }

  return headers.map((headerEntry, index) => {
    const start = headerEntry.index;
    const end = headers[index + 1]?.index ?? lines.length;
    return {
      start,
      end,
      headerLine: lines[start],
      prevLine: lines[start - 1] ?? "",
      lines: lines.slice(start, end),
      header: {
        ...parseExperienceHeader(lines[start]),
        sectionType: headerEntry.sectionType,
      },
    };
  });
}

function collectProjectBlocks(block, sourceExperienceIndex) {
  const contentLines = block.lines.slice(1);
  const preparedLines = [...contentLines];
  let injectedTitle = false;

  if (isStandaloneProjectTitle(block.prevLine) && (/^项目介绍[：:]/.test(preparedLines[0] ?? "") || /^开源链接[：:]/.test(preparedLines[0] ?? ""))) {
    preparedLines.unshift(`项目：${block.prevLine}`);
    injectedTitle = true;
  }

  const starts = [];
  for (let index = 0; index < preparedLines.length; index += 1) {
    if (isProjectStart(preparedLines, index)) {
      starts.push(index);
    }
  }

  return starts.map((start, index) => {
    const nextStart = starts[index + 1] ?? preparedLines.length;
    let end = nextStart;
    for (let cursor = start + 1; cursor < nextStart; cursor += 1) {
      const currentLine = preparedLines[cursor];
      const nextLine = preparedLines[cursor + 1] ?? "";
      if (isTailBoundaryLine(currentLine) || (isStandaloneProjectTitle(currentLine) && isExperienceHeader(nextLine))) {
        end = cursor;
        break;
      }
    }
    const carriesPreviousTitle = injectedTitle && start === 0;
    const anchorIndex = carriesPreviousTitle ? block.start - 1 : block.start + start + 1;
    return {
      anchorIndex,
      sourceExperienceIndex: carriesPreviousTitle ? Math.max(0, sourceExperienceIndex - 1) : sourceExperienceIndex,
      lines: preparedLines.slice(start, end),
    };
  });
}

function parseLabeledSections(lines) {
  const sections = new Map();
  let currentKey = "__preface__";
  sections.set(currentKey, []);

  for (const line of lines) {
    const labelMatch = line.match(/^(项目介绍|项目角色|项目时间|项目难点|主要工作|项目性能优化工作|其他工作|项目影响|影响|开源链接)[：:]\s*(.*)$/);
    if (labelMatch) {
      currentKey = labelMatch[1];
      if (!sections.has(currentKey)) {
        sections.set(currentKey, []);
      }
      if (labelMatch[2]) {
        sections.get(currentKey).push(labelMatch[2]);
      }
      continue;
    }

    sections.get(currentKey).push(line);
  }

  return sections;
}

function extractBullets(lines) {
  const bullets = [];
  let currentLabel = "";
  let currentBullet = "";

  const flush = () => {
    if (currentBullet.trim()) {
      bullets.push(compactSentence(currentBullet));
      currentBullet = "";
    }
  };

  for (const line of lines) {
    if (!line || isNoiseLine(line)) {
      continue;
    }

    if (isStandaloneProjectTitle(line) || isExperienceHeader(line) || isTailBoundaryLine(line)) {
      flush();
      break;
    }

    if (isLabelOnlyLine(line)) {
      flush();
      currentLabel = line.replace(/[：:]$/, "").trim();
      continue;
    }

    const labeledLine = matchInlineLabel(line);
    if (labeledLine) {
      if (
        currentBullet
        && !/[。！？；]$/.test(currentBullet)
        && !looksLikeStandaloneBulletLabel(labeledLine[1])
      ) {
        currentBullet += `${labeledLine[1]}：${labeledLine[2]}`;
        continue;
      }

      flush();
      currentLabel = labeledLine[1];
      currentBullet = `${currentLabel}：${labeledLine[2]}`;
      continue;
    }

    const numberedLine = line.match(/^(\d+)\.\s*(.+)$/);
    if (numberedLine) {
      flush();
      currentBullet = currentLabel ? `${currentLabel} / ${numberedLine[2]}` : numberedLine[2];
      continue;
    }

    if (currentBullet) {
      currentBullet += line;
    } else {
      currentBullet = currentLabel ? `${currentLabel} / ${line}` : line;
    }
  }

  flush();
  return bullets.filter(Boolean);
}

function buildArchiveGroups(lines) {
  const introParagraphs = [];
  const groups = [];
  let currentGroup = null;

  const flush = () => {
    if (!currentGroup) {
      return;
    }
    if ((currentGroup.title && currentGroup.title.length > 0) || (currentGroup.paragraphs?.length ?? 0) > 0 || (currentGroup.items?.length ?? 0) > 0) {
      groups.push(currentGroup);
    }
    currentGroup = null;
  };

  const ensureGroup = () => {
    if (!currentGroup) {
      currentGroup = { items: [] };
    }
    return currentGroup;
  };

  for (const rawLine of lines) {
    const line = compactSentence(rawLine);
    if (!line || isNoiseLine(line)) {
      continue;
    }

    if (isLabelOnlyLine(line)) {
      flush();
      currentGroup = { title: line.replace(/[：:]$/, "").trim(), items: [] };
      continue;
    }

    if (/^\d+\.\s*/.test(line) || matchInlineLabel(line)) {
      const group = ensureGroup();
      group.items = group.items ?? [];
      group.items.push(line);
      continue;
    }

    if (currentGroup) {
      currentGroup.paragraphs = currentGroup.paragraphs ?? [];
      currentGroup.paragraphs.push(line);
      continue;
    }

    introParagraphs.push(line);
  }

  flush();
  return { introParagraphs, groups };
}

function buildArchiveGroupsForLabel(title, lines) {
  const { introParagraphs, groups } = buildArchiveGroups(lines);
  const normalizedGroups = [];

  if (groups.length === 0) {
    if (introParagraphs.length > 0) {
      normalizedGroups.push({
        title,
        paragraphs: introParagraphs,
      });
    }
    return normalizedGroups;
  }

  if (introParagraphs.length > 0) {
    normalizedGroups.push({
      title,
      paragraphs: introParagraphs,
    });
  }

  for (const group of groups) {
    normalizedGroups.push({
      title: group.title ? `${title} / ${group.title}` : title,
      paragraphs: group.paragraphs,
      items: group.items,
    });
  }

  return normalizedGroups;
}

function buildArchiveSections(labeledSections) {
  const sections = [];
  const prefaceLines = (labeledSections.get("__preface__") ?? []).map((line) => compactSentence(line)).filter(Boolean);
  const introLines = [
    ...prefaceLines,
    ...((labeledSections.get("项目介绍") ?? []).map((line) => compactSentence(line)).filter(Boolean)),
  ];
  const mainWorkLines = (labeledSections.get("主要工作") ?? []).map((line) => compactSentence(line)).filter(Boolean);
  const technicalLabels = ["项目角色", "项目时间", "项目难点", "项目性能优化工作", "其他工作", "项目影响", "影响"];
  const technicalGroups = [];

  if (introLines.length > 0) {
    sections.push({
      title: "项目介绍",
      paragraphs: introLines,
    });
  }

  if (mainWorkLines.length > 0) {
    const { introParagraphs, groups } = buildArchiveGroups(mainWorkLines);
    sections.push({
      title: "主要工作",
      intro: groups.length > 0 && introParagraphs.length > 0 ? introParagraphs.join(" ") : undefined,
      paragraphs: groups.length === 0 ? introParagraphs : undefined,
      groups: groups.length > 0 ? groups : undefined,
    });
  }

  for (const label of technicalLabels) {
    const lines = (labeledSections.get(label) ?? []).map((line) => compactSentence(line)).filter(Boolean);
    if (lines.length === 0) {
      continue;
    }

    const normalizedLabel = label === "影响" ? "项目影响" : label;
    technicalGroups.push(...buildArchiveGroupsForLabel(normalizedLabel, lines));
  }

  if (technicalGroups.length > 0) {
    sections.push({
      title: "技术档案",
      groups: technicalGroups,
    });
  }

  return sections;
}

function pushMetric(metrics, value, label) {
  if (!value || !label) {
    return;
  }
  if (metrics.some((item) => item.value === value && item.label === label)) {
    return;
  }
  metrics.push({ value, label });
}

function extractMetricItems(lines) {
  const metrics = [];
  const text = compactSentence(lines.join(" "));

  const projectCount = text.match(/(?:累计)?支持(?:上线|落地)?项目\s*(\d+\+?)/);
  if (projectCount) {
    pushMetric(metrics, projectCount[1], "支持上线项目");
  }

  const revenue = text.match(/(?:年度)?辐射收入[^，。；]*?(亿级别|亿级|\d+(?:\.\d+)?亿)/);
  if (revenue) {
    pushMetric(metrics, revenue[1], "年度辐射收入");
  }

  const f1 = text.match(/f1\s*[=:：]?\s*(\d+(?:\.\d+)?%\+?)/i);
  if (f1) {
    pushMetric(metrics, f1[1], "分类 F1");
  }

  const segmentationAccuracy = text.match(/(?:切分准确(?:率)?|序列标注切分准确)\s*(\d+(?:\.\d+)?%\+?)/);
  if (segmentationAccuracy) {
    pushMetric(metrics, segmentationAccuracy[1], "切分准确率");
  }

  const accuracy = text.match(/整体准确率\s*(\d+(?:\.\d+)?%\+?)|准确率\s*(\d+(?:\.\d+)?%\+?)/);
  if (accuracy) {
    pushMetric(metrics, accuracy[1] ?? accuracy[2], "整体准确率");
  }

  const recall = text.match(/召回(?:率)?\s*(\d+(?:\.\d+)?%\+?)/);
  if (recall) {
    pushMetric(metrics, recall[1], "召回率");
  }

  const volume = text.match(/(?:共生成|生成)\s*([\d.]+(?:[kK]|[wW]|kw|Kw|kW|KW)?\+?)/);
  if (volume) {
    pushMetric(metrics, volume[1], "高质量结果");
  }

  return metrics.slice(0, 5);
}

function extractLinks(text) {
  return Array.from(text.matchAll(/https?:\/\/[^\s（）()<>，,]+/g), (match) => match[0].replace(/[。；，,]+$/g, ""));
}

function inferTags(text) {
  const dictionary = [
    "Unity",
    "GameFramework",
    "C#",
    "C++",
    "Python",
    "Shell",
    "protobuf-net",
    "Protobuf",
    "Perlin",
    "BFS",
    "Hex-Grid",
    "ScriptableObject",
    "Excel",
    "JSON",
    "Win32",
    "Luban",
    "TapTap",
    "PaddlePaddle",
    "Prompt Learning",
    "GPU",
    "CPU",
    "Airflow",
    "TermTree",
    "NLP",
    "知识图谱",
  ];

  return dictionary.filter((item) => text.toLowerCase().includes(item.toLowerCase())).slice(0, 8);
}

const PROJECT_IDENTITY_RULES = [
  { slug: "sceneblueprint", dedupeKey: "scene-blueprint", patterns: [/scene\s*blueprint/i, /场景蓝图/] },
  { slug: "xiuxian-game", dedupeKey: "xiuxian-game", patterns: [/修仙/] },
  { slug: "knowledge-graph", dedupeKey: "knowledge-graph", patterns: [/短文本知识标注/, /knowledge\s*tagging/i, /text\s*to\s*knowledge/i] },
  { slug: "baike-knowledge-base", dedupeKey: "baike-knowledge-base", patterns: [/百科词条.*知识库/, /百科.*知识库/, /baike/i] },
  { slug: "desktop-pet", dedupeKey: "desktop-pet", patterns: [/桌宠/] },
  { slug: "tower-defense", dedupeKey: "tower-defense", patterns: [/塔防/] },
];

function slugifyTitle(title, index) {
  const normalized = title
    .replace(/[（(].*?[)）]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `project-${index + 1}`;
}

function resolveProjectIdentity(title, rawText, index) {
  const joined = `${title} ${rawText}`;
  for (const rule of PROJECT_IDENTITY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(joined))) {
      return { slug: rule.slug, dedupeKey: rule.dedupeKey };
    }
  }

  const fallbackSlug = slugifyTitle(title, index);
  return { slug: fallbackSlug, dedupeKey: normalizeTextKey(title) || fallbackSlug };
}

function slugifyValue(value, fallback = "item") {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || fallback;
}

function normalizeTextKey(text) {
  return compactSentence(text)
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[，。,、；：:（）()【】\[\]“”"'‘’~!@#$%^&*_+=<>?/\\|-]/g, "");
}

function buildHonorDedupeKey(text) {
  const value = compactSentence(text);
  const year = value.match(/\b(20\d{2})\b/)?.[1] ?? "unknown";
  const level = value.match(/(特等奖|金牌|银牌|铜牌|一等奖|二等奖|三等奖)/)?.[1] ?? "";

  if (/专利|发明人/.test(value)) {
    return `${year}|patent`;
  }
  if (/部门奖|项目奖/.test(value)) {
    return `${year}|department-award`;
  }
  if (/零度突破之星/.test(value)) {
    return `${year}|breakthrough-star`;
  }
  if (/ICPC/.test(value)) {
    return `${year}|icpc|${level || normalizeTextKey(value)}`;
  }
  if (/CCPC/.test(value)) {
    return `${year}|ccpc|${level || normalizeTextKey(value)}`;
  }
  if (/蓝桥杯/.test(value)) {
    return `${year}|lanqiao|${level || normalizeTextKey(value)}`;
  }
  return `${year}|${normalizeTextKey(value)}`;
}

function createTextEntry(text, prefix, index, keyBuilder = normalizeTextKey) {
  const normalized = compactSentence(text);
  return {
    id: `${prefix}-${index + 1}`,
    dedupeKey: keyBuilder(normalized) || `${prefix}-${index + 1}`,
    text: normalized,
  };
}

function dedupeTextEntries(entries) {
  const map = new Map();
  for (const entry of entries ?? []) {
    if (!entry?.text) {
      continue;
    }
    const key = entry.dedupeKey || normalizeTextKey(entry.text);
    const current = map.get(key);
    if (!current || entry.text.length > current.text.length) {
      map.set(key, { ...entry, dedupeKey: key });
    }
  }
  return Array.from(map.values());
}

function createLayeredContent({ summary = [], refined = [], original = [] }, prefix, keyBuilder = normalizeTextKey) {
  const content = {
    summary: dedupeTextEntries(summary.filter(Boolean).map((text, index) => createTextEntry(text, `${prefix}-summary`, index, keyBuilder))),
    refined: dedupeTextEntries(refined.filter(Boolean).map((text, index) => createTextEntry(text, `${prefix}-refined`, index, keyBuilder))),
    original: dedupeTextEntries(original.filter(Boolean).map((text, index) => createTextEntry(text, `${prefix}-original`, index, keyBuilder))),
  };

  if (content.summary.length === 0) {
    delete content.summary;
  }
  if (content.refined.length === 0) {
    delete content.refined;
  }
  if (content.original.length === 0) {
    delete content.original;
  }

  return Object.keys(content).length > 0 ? content : undefined;
}

function buildExperienceId(experience, index) {
  const start = experience.period.match(/\d{4}[./]\d{1,2}/)?.[0]?.replace(/[./]/g, "-") ?? `experience-${index + 1}`;
  return slugifyValue(`${experience.company}-${start}`, `experience-${index + 1}`);
}

function toCapabilityItems(bullets) {
  return bullets.slice(0, 10).map((bullet, index) => {
    const [lead, ...rest] = bullet.split(/[：:]/);
    const title = compactSentence(lead).slice(0, 24) || `要点 ${index + 1}`;
    const detail = rest.length > 0 ? rest.join("：") : bullet;
    return { title, detail: compactSentence(detail) };
  });
}

function toRefinedDetailItems(bullets) {
  return bullets.slice(0, 8).map((bullet) => {
    const [lead, ...rest] = bullet.split(/[：:]/);
    const title = compactSentence(lead);
    const detail = compactSentence(rest.length > 0 ? rest.join("：") : bullet);
    return title && rest.length > 0 ? `${title}：${detail}` : detail;
  });
}

function buildProjectDraft(projectBlock, experience, index) {
  const titleLine = projectBlock.lines[0] ?? `项目 ${index + 1}`;
  const title = titleLine.replace(/^项目(?:[一二三四五六七八九十]|\d+)?[：:]\s*/, "").trim() || `项目 ${index + 1}`;
  const labeledSections = parseLabeledSections(projectBlock.lines.slice(1));
  const intro = compactSentence((labeledSections.get("项目介绍") ?? []).join(" "));
  const role = compactSentence((labeledSections.get("项目角色") ?? [experience.role]).join(" "));
  const explicitPeriodText = compactSentence((labeledSections.get("项目时间") ?? []).join(" "));
  const period = explicitPeriodText || experience.period;
  const challenge = compactSentence((labeledSections.get("项目难点") ?? []).join(" "));
  const mainWorkLines = labeledSections.get("主要工作") ?? [];
  const impactLines = labeledSections.get("影响") ?? [];
  const rawText = projectBlock.lines.join("\n");
  const links = extractLinks(rawText);
  const bullets = extractBullets(mainWorkLines);
  const tags = inferTags(rawText);
  const metrics = extractMetricItems([...impactLines, ...mainWorkLines, ...projectBlock.lines]);
  const archiveSections = buildArchiveSections(labeledSections);
  const summary = intro || bullets[0] || "待补充项目摘要。";
  const isOpenSource = /github|package|开源框架|开源项目/i.test(rawText);
  const projectRange = parsePeriodRange(explicitPeriodText);
  const explicitTime = Boolean(explicitPeriodText && projectRange);

  const identity = resolveProjectIdentity(title, rawText, index);

  const storySections = [
    {
      kind: "story",
      title: "项目介绍",
      paragraphs: [summary, challenge].filter(Boolean),
    },
  ];

  if (metrics.length > 0) {
    storySections.unshift({ kind: "metrics", title: "项目影响", items: metrics });
  }

  if (bullets.length > 0) {
    storySections.push({
      kind: "capabilities",
      title: "主要工作",
      items: toCapabilityItems(bullets),
    });
  }

  if (archiveSections.length > 0) {
    storySections.push({
      kind: "archive",
      title: "项目档案",
      description: "按统一栏目保留项目原始信息，并补充必要的结构化归档。",
      sections: archiveSections,
    });
  }

  if (tags.length > 0) {
    storySections.push({ kind: "stack", title: "技术栈", items: tags });
  }

  if (links.length > 0) {
    storySections.push({
      kind: "links",
      title: "相关链接",
      items: links.map((href) => ({ label: href.includes("paddlepaddle") ? "项目链接" : "外部链接", href, external: true })),
    });
  }

  return {
    slug: identity.slug,
    dedupeKey: identity.dedupeKey,
    title,
    track: isOpenSource ? "open_source" : "featured",
    cardMeta: [experience.company, role, explicitPeriodText || experience.period].filter(Boolean),
    cardSummary: summary,
    cardTags: tags,
    heroEyebrow: isOpenSource ? "Open Source / Imported Draft" : "Featured Project / Imported Draft",
    heroSubtitle: summary,
    content: createLayeredContent({
      summary: [summary],
      refined: [summary],
      original: intro ? [intro] : [],
    }, `project-${identity.slug}`),
    showcase: {
      title: "作品展示",
      featuredTitle: `${title} 展示位`,
      featuredDescription: "这是由导入脚本自动生成的展示占位。后续可以补真实截图、视频或架构图。",
      sideBlocks: [
        { title: "导入状态", description: "第一版由简历原文自动生成，适合继续人工补充展示素材和更精炼的叙述。" },
        { title: "推荐补充", items: ["主展示视频", "关键界面截图", "架构图或流程图"] },
      ],
      gallery: [
        { title: "概览", description: summary.slice(0, 80) },
        { title: "职责", description: role || "待补充" },
        { title: "周期", description: period || "待补充" },
      ],
      note: "导入器只负责生成草稿结构，不会替代后续的内容提炼和视觉素材整理。",
    },
    storySections,
    importMeta: {
      sourceExperienceIndex: projectBlock.sourceExperienceIndex,
      sourceCompany: experience.company,
      sourceRole: role,
      sourceSectionType: experience.sectionType,
      sourcePeriod: explicitPeriodText || experience.period,
      rawBulletCount: bullets.length,
      anchorIndex: projectBlock.anchorIndex,
      explicitTime,
      projectRange,
    },
  };
}

function assignProjectsToExperiences(experiences, projects) {
  for (const project of projects) {
    let bestIndex = project.importMeta.sourceExperienceIndex;
    let bestScore = Number.NEGATIVE_INFINITY;

    experiences.forEach((experience, index) => {
      let score = 0;
      const distance = Math.abs(index - project.importMeta.sourceExperienceIndex);
      const sameSourceBlock = index === project.importMeta.sourceExperienceIndex;
      const sameCompany = experience.company === project.importMeta.sourceCompany;
      const sameSection = experience.importMeta.sectionType === project.importMeta.sourceSectionType;

      score += sameSourceBlock ? 320 : Math.max(0, 120 - distance * 22);

      if (sameCompany) {
        score += 240;
      } else {
        score -= 160;
      }

      if (sameSection) {
        score += 140;
      } else {
        score -= 100;
      }

      if (!project.importMeta.explicitTime && sameCompany && !sameSourceBlock) {
        score -= 120;
      }

      if (project.importMeta.explicitTime && project.importMeta.projectRange) {
        const overlap = overlapScore(project.importMeta.projectRange, experience.importMeta.periodRange);
        score += overlap * 18;
        if (containsMonth(experience.importMeta.periodRange, project.importMeta.projectRange.start)) {
          score += 260;
        }
        if (containsMonth(experience.importMeta.periodRange, project.importMeta.projectRange.end)) {
          score += 120;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    project.importMeta.assignedExperienceIndex = bestIndex;
  }

  for (let index = 0; index < experiences.length - 1; index += 1) {
    const current = experiences[index];
    const next = experiences[index + 1];
    if (current.company !== next.company) {
      continue;
    }

    const currentProjects = projects.filter((project) => project.importMeta.assignedExperienceIndex === index);
    const nextProjects = projects.filter((project) => project.importMeta.assignedExperienceIndex === index + 1);

    if (currentProjects.length === 0 && nextProjects.length > 1) {
      const candidate = nextProjects.find((project) => !project.importMeta.explicitTime) ?? nextProjects[0];
      if (candidate && candidate.importMeta.sourceSectionType === current.importMeta.sectionType) {
        candidate.importMeta.assignedExperienceIndex = index;
      }
    }
  }

  for (const project of projects) {
    const assignedExperience = experiences[project.importMeta.assignedExperienceIndex];
    project.cardMeta[0] = assignedExperience.company;
    if (!project.importMeta.explicitTime && project.cardMeta.length > 2) {
      project.cardMeta[2] = assignedExperience.period;
    }
  }
}

function buildExperiences(blocks) {
  const experiences = blocks.map((block, index) => ({
    id: buildExperienceId(block.header, index),
    company: block.header.company,
    role: block.header.role,
    period: block.header.period,
    note: block.header.sectionType === "internship" ? "实习经历" : undefined,
    importMeta: {
      headerIndex: block.start,
      sectionType: block.header.sectionType,
      periodRange: parsePeriodRange(block.header.period),
      fallbackBullets: extractBullets(block.lines.slice(1)).slice(0, 6),
    },
  }));

  const projects = blocks.flatMap((block, index) => {
    const projectBlocks = collectProjectBlocks(block, index);
    return projectBlocks.map((projectBlock, projectIndex) => buildProjectDraft(projectBlock, block.header, projectIndex + index * 10));
  });

  assignProjectsToExperiences(experiences, projects);

  const finalizedExperiences = experiences.map((experience, index) => {
    const assignedProjects = projects
      .filter((project) => project.importMeta.assignedExperienceIndex === index)
      .sort((left, right) => left.importMeta.anchorIndex - right.importMeta.anchorIndex);

    const projectSummaries = assignedProjects.map((project) => `${project.title}：${project.cardSummary}`);
    const summary = projectSummaries[0] || experience.importMeta.fallbackBullets[0] || `${experience.company} ${experience.role}`;
    const refined = assignedProjects.length > 0
      ? assignedProjects.map((project) => `${project.title}：${project.cardSummary}`)
      : experience.importMeta.fallbackBullets;
    const original = assignedProjects.length > 0
      ? assignedProjects.map((project) => `${project.title}：${project.heroSubtitle}`)
      : experience.importMeta.fallbackBullets;
    const highlights = (projectSummaries.length > 0 ? projectSummaries : experience.importMeta.fallbackBullets).slice(0, 5);

    return {
      id: experience.id,
      dedupeKey: normalizeTextKey(`${experience.company}|${experience.role}|${experience.period}`) || experience.id,
      company: experience.company,
      role: experience.role,
      period: experience.period,
      summary,
      achievements: highlights,
      details: {
        refinedTitle: "整理后的详细说明",
        refined,
        originalTitle: "简历原文",
        original,
      },
      content: createLayeredContent({
        summary: [summary],
        refined,
        original,
      }, `experience-${experience.id}`),
      highlights: dedupeTextEntries(highlights.map((text, itemIndex) => createTextEntry(text, `experience-${experience.id}-highlight`, itemIndex))),
      relatedProjects: assignedProjects.length > 0 ? assignedProjects.map((project) => project.slug) : undefined,
    };
  });

  return { experiences: finalizedExperiences, projects };
}

function buildHonors(lines) {
  return lines.filter((line) => /^\d{4}\s*年/.test(line)).map((line) => compactSentence(line));
}

function toStructuredHonors(honors) {
  const grouped = new Map();

  for (const honor of honors ?? []) {
    const text = compactSentence(honor);
    if (!text) {
      continue;
    }
    const key = buildHonorDedupeKey(text);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(text);
  }

  return Array.from(grouped.entries()).map(([dedupeKey, texts], index) => {
    const uniqueTexts = Array.from(new Set(texts)).sort((left, right) => left.length - right.length);
    return {
      id: `honor-${index + 1}`,
      dedupeKey,
      content: createLayeredContent({
        summary: uniqueTexts[0] ? [uniqueTexts[0]] : [],
        original: uniqueTexts,
      }, `honor-${index + 1}`, buildHonorDedupeKey),
    };
  });
}

function buildEducation(lines) {
  const combinedText = compactSentence(lines.join(" "));
  const schoolLine = lines.find((line) => /大学.+本科.+\d{4}-\d{4}/.test(line)) ?? combinedText;
  const match = schoolLine.match(/(.*?大学)\s+本科\s+(.*?)\s+(\d{4}-\d{4})/);
  const details = lines
    .filter((line) => /集训队|助教|学院|实验室/.test(line) && !/大学.+本科.+\d{4}-\d{4}/.test(line))
    .slice(0, 4);

  if (!match) {
    return { school: schoolLine, degree: "本科", period: "待补充", details };
  }

  return {
    school: compactSentence(match[1]),
    degree: `本科 · ${compactSentence(match[2])}`,
    period: compactSentence(match[3]),
    details,
  };
}

function buildDraft(text, inputStem) {
  const lines = splitLines(text).filter((line) => !isNoiseLine(line));
  const firstProjectIndex = lines.findIndex((line) => /^项目(?:[一二三四五六七八九十]|\d+)?[：:]/.test(line));
  const firstExperienceIndex = lines.findIndex((line) => detectExperienceSection(line) !== undefined || isExperienceHeader(line));
  const profileCutoffCandidates = [firstProjectIndex, firstExperienceIndex].filter((index) => index >= 0);
  const profileCutoff = profileCutoffCandidates.length > 0 ? Math.min(...profileCutoffCandidates) : -1;
  const profileLines = profileCutoff > 0 ? lines.slice(0, profileCutoff) : lines.slice(0, 20);
  const profile = buildProfile(profileLines, text);
  const skillGroups = buildSkillGroups(profileLines);
  const experienceBlocks = splitExperienceBlocks(lines);
  const { experiences, projects } = buildExperiences(experienceBlocks);
  const honors = buildHonors(lines);
  const education = buildEducation(lines);

  return {
    sourceFileStem: inputStem,
    importedAt: new Date().toISOString(),
    profile,
    experiences,
    skills: skillGroups,
    honors,
    education,
    projects,
  };
}

function toResumeSourceTemplate(draft) {
  return {
    schemaVersion: "resume-schema@v1",
    profile: {
      name: draft.profile.name,
      role: draft.profile.role,
      bio: draft.profile.bio,
      headline: draft.profile.headline,
      strengths: draft.profile.strengths,
      summaryPoints: draft.profile.summaryPoints,
      focusAreas: draft.profile.focusAreas,
      facts: draft.profile.facts,
      contacts: draft.profile.contacts,
    },
    experiences: draft.experiences.map(({ summary, achievements, details, importMeta, ...experience }) => ({
      ...experience,
      content: experience.content,
      highlights: experience.highlights,
    })),
    skills: draft.skills,
    honors: toStructuredHonors(draft.honors),
    education: draft.education,
    projects: draft.projects.map(({ cardSummary, heroSubtitle, importMeta, ...project }) => ({
      ...project,
      content: project.content,
    })),
  };
}

function buildWarnings(draft) {
  const warnings = [];
  if (draft.projects.length === 0) {
    warnings.push("未识别到项目块，请检查 PDF / 文本中的项目标题格式。");
  }
  if (draft.experiences.length === 0) {
    warnings.push("未识别到工作经历头部，请检查时间区间格式是否类似 2024.02-2025.06。");
  }
  if (draft.profile.strengths.length === 0) {
    warnings.push("未识别到个人优势条目，建议人工补充 profile.strengths / summaryPoints。");
  }
  if (draft.projects.some((project) => {
    const hasMetrics = project.storySections.some((section) => section.kind === "metrics" && section.items.length > 0);
    const hasCapabilities = project.storySections.some((section) => section.kind === "capabilities" && section.items.length > 0);
    return !hasMetrics && !hasCapabilities;
  })) {
    warnings.push("部分项目未提取到明确指标或要点，建议人工检查生成草稿。");
  }
  return warnings;
}

function isAssignmentHighConfidence(project, draft) {
  const assignedExperience = draft.experiences[project.importMeta.assignedExperienceIndex];
  if (!assignedExperience) {
    return false;
  }

  const sameCompany = assignedExperience.company === project.importMeta.sourceCompany;
  const sameSourceBlock = project.importMeta.sourceExperienceIndex === project.importMeta.assignedExperienceIndex;

  if (!sameCompany) {
    return false;
  }

  if (project.importMeta.explicitTime && project.importMeta.projectRange) {
    const assignedRange = parsePeriodRange(assignedExperience.period);
    return overlapScore(project.importMeta.projectRange, assignedRange) > 0;
  }

  return sameSourceBlock;
}

function buildReport(draft, warnings) {
  const missingRequiredFields = [];
  if (!draft.profile.name || draft.profile.name.includes("待补充")) {
    missingRequiredFields.push("profile.name");
  }
  if (!draft.profile.role || draft.profile.role.includes("待整理") || draft.profile.role.includes("待补充")) {
    missingRequiredFields.push("profile.role");
  }
  if (!draft.education.school || draft.education.school.includes("待补充")) {
    missingRequiredFields.push("education.school");
  }
  if (!draft.education.period || draft.education.period.includes("待补充")) {
    missingRequiredFields.push("education.period");
  }

  const projectDiagnostics = draft.projects.map((project) => {
    const metricsSection = project.storySections.find((section) => section.kind === "metrics");
    const capabilitiesSection = project.storySections.find((section) => section.kind === "capabilities");
    const linksSection = project.storySections.find((section) => section.kind === "links");

    return {
      slug: project.slug,
      title: project.title,
      sourceCompany: project.importMeta.sourceCompany,
      assignedCompany: draft.experiences[project.importMeta.assignedExperienceIndex]?.company ?? project.importMeta.sourceCompany,
      assignedExperienceIndex: project.importMeta.assignedExperienceIndex,
      sourceExperienceIndex: project.importMeta.sourceExperienceIndex,
      explicitTime: project.importMeta.explicitTime,
      metricsCount: metricsSection?.items.length ?? 0,
      capabilityCount: capabilitiesSection?.items.length ?? 0,
      linkCount: linksSection?.items.length ?? 0,
    };
  });

  const lowConfidenceAssignments = draft.projects
    .filter((project) => !isAssignmentHighConfidence(project, draft))
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      sourceCompany: project.importMeta.sourceCompany,
      assignedCompany: draft.experiences[project.importMeta.assignedExperienceIndex]?.company ?? project.importMeta.sourceCompany,
      sourceExperienceIndex: project.importMeta.sourceExperienceIndex,
      assignedExperienceIndex: project.importMeta.assignedExperienceIndex,
      reason: project.importMeta.explicitTime
        ? "项目被重新归属到更匹配的经历。"
        : "缺少明确项目时间，且当前归属未能由原始项目块位置直接支撑。",
    }));

  const projectsNeedingReview = projectDiagnostics
    .filter((project) => project.metricsCount === 0 || project.capabilityCount === 0)
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      reason: project.metricsCount === 0 && project.capabilityCount === 0
        ? "缺少指标与要点"
        : project.metricsCount === 0
          ? "缺少指标"
          : "缺少工作要点",
    }));

  return {
    schemaVersion: "resume-schema@v1",
    warnings,
    projectCount: draft.projects.length,
    experienceCount: draft.experiences.length,
    missingRequiredFields,
    lowConfidenceAssignments,
    projectsNeedingReview,
    projectDiagnostics,
  };
}

async function readInput(options) {
  if (options.stdin) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
  }

  if (!options.input) {
    throw new Error("Usage: node scripts/import-resume-text.mjs <resume.txt> [--out-dir generated/resume-import]");
  }

  return fs.readFile(options.input, "utf8");
}

function serializeTsModule(template) {
  return `export const importedResumeSource = ${JSON.stringify(template, null, 2)};\n`;
}

async function main() {
  const options = parseArgs(args);
  const rawText = await readInput(options);
  const normalizedText = normalizeText(rawText);
  const stem = sanitizeStem(options.stem ?? toStem(options.input));
  const draft = buildDraft(normalizedText, stem);
  const template = toResumeSourceTemplate(draft);
  const warnings = buildWarnings(draft);
  const report = buildReport(draft, warnings);
  let parsedCandidate = options.emitCandidate
    ? buildParsedCandidate(normalizedText, {
      inputStem: stem,
      sourcePath: options.sourcePath ?? options.input ?? "<stdin>",
      sourceType: options.sourceType ?? (options.stdin ? "stdin" : "text"),
    })
    : null;
  let aiStructureReport = null;

  if (parsedCandidate && options.useAiStructure) {
    const enhanced = await enhanceCandidateWithAiStructure(parsedCandidate);
    parsedCandidate = enhanced.candidate;
    aiStructureReport = enhanced.report;
  }

  const structureReport = parsedCandidate ? buildStructureReport(parsedCandidate, aiStructureReport) : null;

  await fs.mkdir(options.outDir, { recursive: true });

  const normalizedPath = path.join(options.outDir, `${stem}.normalized.txt`);
  const draftPath = path.join(options.outDir, `${stem}.draft.json`);
  const templatePath = path.join(options.outDir, `${stem}.resume-source.json`);
  const templateTsPath = path.join(options.outDir, `${stem}.resume-source.ts`);
  const reportPath = path.join(options.outDir, `${stem}.report.json`);
  const parsedCandidatePath = path.join(options.outDir, `${stem}.parsed-candidate.json`);
  const structureReportPath = path.join(options.outDir, `${stem}.structure-report.json`);
  const candidateValidationReportPath = path.join(options.outDir, `${stem}.candidate-validation-report.json`);
  const fieldCandidatesPath = path.join(options.outDir, `${stem}.field-candidates.json`);
  const fieldCandidateValidationReportPath = path.join(options.outDir, `${stem}.field-candidate-validation-report.json`);

  const candidateValidationReport = parsedCandidate
    ? buildCandidateValidationReport(parsedCandidate, { candidatePath: parsedCandidatePath })
    : null;
  const fieldCandidatesReport = parsedCandidate && candidateValidationReport
    ? await buildFieldCandidatesReport(parsedCandidate, candidateValidationReport, {
      useAiFields: options.useAiFields,
      candidatePath: parsedCandidatePath,
      validationPath: candidateValidationReportPath,
    })
    : null;
  const fieldCandidateValidationReport = fieldCandidatesReport
    ? buildFieldCandidateValidationReport(fieldCandidatesReport, {
      fieldCandidatesPath,
    })
    : null;

  const writeJobs = [
    fs.writeFile(normalizedPath, `${normalizedText}\n`, "utf8"),
    fs.writeFile(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8"),
    fs.writeFile(templatePath, `${JSON.stringify(template, null, 2)}\n`, "utf8"),
    fs.writeFile(templateTsPath, serializeTsModule(template), "utf8"),
    fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8"),
  ];

  if (parsedCandidate) {
    writeJobs.push(fs.writeFile(parsedCandidatePath, `${JSON.stringify(parsedCandidate, null, 2)}\n`, "utf8"));
  }

  if (structureReport) {
    writeJobs.push(fs.writeFile(structureReportPath, `${JSON.stringify(structureReport, null, 2)}\n`, "utf8"));
  }

  if (candidateValidationReport) {
    writeJobs.push(fs.writeFile(candidateValidationReportPath, `${JSON.stringify(candidateValidationReport, null, 2)}\n`, "utf8"));
  }

  if (fieldCandidatesReport) {
    writeJobs.push(fs.writeFile(fieldCandidatesPath, `${JSON.stringify(fieldCandidatesReport, null, 2)}\n`, "utf8"));
  }

  if (fieldCandidateValidationReport) {
    writeJobs.push(fs.writeFile(fieldCandidateValidationReportPath, `${JSON.stringify(fieldCandidateValidationReport, null, 2)}\n`, "utf8"));
  }

  await Promise.all(writeJobs);

  console.log(`Imported resume text: ${options.input ?? "<stdin>"}`);
  console.log(`- normalized text: ${normalizedPath}`);
  console.log(`- draft json: ${draftPath}`);
  console.log(`- resume-source json: ${templatePath}`);
  console.log(`- resume-source ts: ${templateTsPath}`);
  console.log(`- report: ${reportPath}`);
  if (parsedCandidate) {
    console.log(`- parsed candidate: ${parsedCandidatePath}`);
  }
  if (structureReport) {
    console.log(`- structure report: ${structureReportPath}`);
  }
  if (candidateValidationReport) {
    console.log(`- candidate validation report: ${candidateValidationReportPath}`);
    console.log(`- candidate validation errors: ${candidateValidationReport.stats.errorCount}`);
    console.log(`- candidate validation warnings: ${candidateValidationReport.stats.warningCount}`);
  }
  if (fieldCandidatesReport) {
    console.log(`- field candidates: ${fieldCandidatesPath}`);
    console.log(`- field candidates gate allowed: ${fieldCandidatesReport.gate.allowed}`);
    console.log(`- field candidates matched projects: ${fieldCandidatesReport.matchedProjectCount}/${fieldCandidatesReport.projectCount}`);
  }
  if (fieldCandidateValidationReport) {
    console.log(`- field candidate validation report: ${fieldCandidateValidationReportPath}`);
    console.log(`- field candidate validation errors: ${fieldCandidateValidationReport.stats.errorCount}`);
    console.log(`- field candidate validation warnings: ${fieldCandidateValidationReport.stats.warningCount}`);
  }

  if (warnings.length > 0) {
    console.log("Warnings:");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (aiStructureReport?.warnings?.length > 0) {
    console.log("AI warnings:");
    aiStructureReport.warnings.forEach((warning) => console.log(`- ${warning}`));
  }
  if (fieldCandidatesReport?.ai?.warnings?.length > 0) {
    console.log("Field AI warnings:");
    fieldCandidatesReport.ai.warnings.forEach((warning) => console.log(`- ${warning}`));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});













