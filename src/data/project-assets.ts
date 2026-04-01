import fs from "node:fs";
import path from "node:path";

import type { LinkItem, ProjectMediaAsset, ProjectMediaCollection } from "./resume-schema";

const PROJECT_ASSET_ROOT = path.resolve(process.cwd(), "public/project-assets");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

type ProjectMediaManifest = {
  featured?: ProjectMediaAsset | null;
  gallery?: ProjectMediaAsset[];
  resources?: LinkItem[];
  note?: string;
};

type ProjectAssetLocation = {
  fsDir: string;
  publicBasePath: string;
};

function isExternalUrl(value: string) {
  return /^https?:\/\//.test(value);
}

function toPublicAssetPath(assetBasePath: string, src: string) {
  if (isExternalUrl(src) || src.startsWith("/")) {
    return src;
  }

  return `${assetBasePath}/${src.replace(/^\.\//, "")}`;
}

function toBilibiliEmbedUrl(src: string) {
  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();

    if (host === "player.bilibili.com") {
      return src;
    }

    if (!host.includes("bilibili.com")) {
      return src;
    }

    const pathMatch = url.pathname.match(/\/video\/(BV[0-9A-Za-z]+|av\d+)/i);
    if (!pathMatch) {
      return src;
    }

    const id = pathMatch[1];
    const page = url.searchParams.get("p") ?? "1";
    const query = new URLSearchParams();

    if (/^BV/i.test(id)) {
      query.set("bvid", id);
    } else {
      query.set("aid", id.replace(/^av/i, ""));
    }

    query.set("page", page);
    return `https://player.bilibili.com/player.html?${query.toString()}`;
  } catch {
    return src;
  }
}

function normalizeEmbedSource(src: string) {
  if (!isExternalUrl(src)) {
    return src;
  }

  return toBilibiliEmbedUrl(src);
}

function normalizeMediaAsset(assetBasePath: string, asset: ProjectMediaAsset): ProjectMediaAsset {
  const normalizedSrc = toPublicAssetPath(assetBasePath, asset.src);

  return {
    ...asset,
    src: asset.kind === "embed" ? normalizeEmbedSource(normalizedSrc) : normalizedSrc,
    poster: asset.poster ? toPublicAssetPath(assetBasePath, asset.poster) : undefined,
  };
}

function getProjectAssetLocations(slug: string): ProjectAssetLocation[] {
  return [
    {
      fsDir: path.join(PROJECT_ASSET_ROOT, "work", slug),
      publicBasePath: `/project-assets/work/${slug}`,
    },
    {
      fsDir: path.join(PROJECT_ASSET_ROOT, "open-source", slug),
      publicBasePath: `/project-assets/open-source/${slug}`,
    },
    {
      fsDir: path.join(PROJECT_ASSET_ROOT, slug),
      publicBasePath: `/project-assets/${slug}`,
    },
  ];
}

function manifestPathFor(location: ProjectAssetLocation) {
  return path.join(location.fsDir, "manifest.json");
}

function imageDirectoryFor(location: ProjectAssetLocation) {
  return path.join(location.fsDir, "images");
}

function formatImageTitle(fileName: string) {
  const name = path.parse(fileName).name.replace(/[-_]+/g, " ").trim();
  return name.length > 0 ? name : fileName;
}

function parseLeadingImageOrder(fileName: string) {
  const match = fileName.match(/^(\d{2})/);
  if (!match) {
    return undefined;
  }

  return Number(match[1]);
}

function discoverImageAssets(location: ProjectAssetLocation) {
  const imageDirectory = imageDirectoryFor(location);
  if (!fs.existsSync(imageDirectory)) {
    return [];
  }

  const orderedFileNames = fs.readdirSync(imageDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "zh-CN"))
    .map((fileName, defaultIndex) => ({
      fileName,
      defaultIndex,
      leadingOrder: parseLeadingImageOrder(fileName),
    }))
    .sort((left, right) => {
      if (left.leadingOrder !== undefined && right.leadingOrder !== undefined && left.leadingOrder !== right.leadingOrder) {
        return left.leadingOrder - right.leadingOrder;
      }

      return left.defaultIndex - right.defaultIndex;
    })
    .map((entry) => entry.fileName);

  return orderedFileNames
    .map((fileName) => {
      const title = formatImageTitle(fileName);
      return normalizeMediaAsset(location.publicBasePath, {
        kind: "image",
        title,
        src: `images/${fileName}`,
        alt: title,
      });
    });
}

function dedupeMediaAssets(assets: ProjectMediaAsset[]) {
  const merged = new Map<string, ProjectMediaAsset>();
  for (const asset of assets) {
    merged.set(`${asset.kind}:${asset.src}`, asset);
  }

  return Array.from(merged.values());
}

function dedupeLinks(links: LinkItem[]) {
  const merged = new Map<string, LinkItem>();
  for (const link of links) {
    merged.set(`${link.label}:${link.href}`, link);
  }

  return Array.from(merged.values());
}

export function resolveProjectMedia(slug: string): ProjectMediaCollection {
  const mediaAssets: ProjectMediaAsset[] = [];
  const resourceLinks: LinkItem[] = [];
  let resolvedManifestPath: string | undefined;
  let resolvedNote: string | undefined;

  for (const location of getProjectAssetLocations(slug)) {
    const manifestPath = manifestPathFor(location);
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, "utf8");
      const manifest = JSON.parse(raw) as ProjectMediaManifest;

      if (!resolvedManifestPath) {
        resolvedManifestPath = `${location.publicBasePath}/manifest.json`;
      }
      if (!resolvedNote && manifest.note) {
        resolvedNote = manifest.note;
      }

      if (manifest.featured) {
        mediaAssets.push(normalizeMediaAsset(location.publicBasePath, manifest.featured));
      }

      for (const item of manifest.gallery ?? []) {
        mediaAssets.push(normalizeMediaAsset(location.publicBasePath, item));
      }

      resourceLinks.push(...(manifest.resources ?? []));
    }

    mediaAssets.push(...discoverImageAssets(location));
  }

  const dedupedAssets = dedupeMediaAssets(mediaAssets);
  if (dedupedAssets.length === 0 && resourceLinks.length === 0 && !resolvedManifestPath) {
    return {
      gallery: [],
      resources: [],
    };
  }

  return {
    manifestPath: resolvedManifestPath,
    featured: dedupedAssets[0],
    gallery: dedupedAssets.slice(1),
    resources: dedupeLinks(resourceLinks),
    note: resolvedNote,
  };
}

export function listProjectManifestSlugs() {
  if (!fs.existsSync(PROJECT_ASSET_ROOT)) {
    return [];
  }

  const manifestSlugs = new Set<string>();

  for (const rootEntry of fs.readdirSync(PROJECT_ASSET_ROOT, { withFileTypes: true })) {
    if (!rootEntry.isDirectory()) {
      continue;
    }

    const rootPath = path.join(PROJECT_ASSET_ROOT, rootEntry.name);
    const directManifestPath = path.join(rootPath, "manifest.json");
    if (fs.existsSync(directManifestPath)) {
      manifestSlugs.add(rootEntry.name);
    }

    for (const childEntry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      if (!childEntry.isDirectory()) {
        continue;
      }

      const nestedManifestPath = path.join(rootPath, childEntry.name, "manifest.json");
      if (fs.existsSync(nestedManifestPath)) {
        manifestSlugs.add(childEntry.name);
      }
    }
  }

  return Array.from(manifestSlugs);
}

export function getProjectAssetRoot() {
  return PROJECT_ASSET_ROOT;
}
