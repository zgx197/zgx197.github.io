import fs from "node:fs/promises";
import path from "node:path";

export interface ProjectReference {
  slug: string;
  title: string;
  searchText: string;
}

const RESUME_SOURCE_PATH = path.resolve("src/data/resume-source.ts");
let cachedReferences: ProjectReference[] | null = null;

function toSearchText(chunk: string): string {
  return chunk
    .replace(/\r?\n/g, " ")
    .replace(/\"/g, " ")
    .replace(/[{}\[\],]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function listProjectReferences(): Promise<ProjectReference[]> {
  if (cachedReferences) {
    return cachedReferences;
  }

  const source = await fs.readFile(RESUME_SOURCE_PATH, "utf8");
  const slugMatches = Array.from(source.matchAll(/"slug":\s*"([^"]+)"/g));
  const references: ProjectReference[] = [];

  for (let index = 0; index < slugMatches.length; index += 1) {
    const current = slugMatches[index];
    const next = slugMatches[index + 1];
    const slug = current[1];
    const start = current.index ?? 0;
    const end = next?.index ?? source.length;
    const chunk = source.slice(start, end);
    const titleMatch = chunk.match(/"title":\s*"([^"]+)"/);
    if (!titleMatch) {
      continue;
    }

    references.push({
      slug,
      title: titleMatch[1],
      searchText: toSearchText(chunk),
    });
  }

  cachedReferences = references;
  return cachedReferences;
}

