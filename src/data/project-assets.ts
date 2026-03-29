import fs from "node:fs";
import path from "node:path";

import type { LinkItem, ProjectMediaAsset, ProjectMediaCollection } from "./resume-schema";

const PROJECT_ASSET_ROOT = path.resolve(process.cwd(), "public/project-assets");

type ProjectMediaManifest = {
  featured?: ProjectMediaAsset | null;
  gallery?: ProjectMediaAsset[];
  resources?: LinkItem[];
  note?: string;
};

function isExternalUrl(value: string) {
  return /^https?:\/\//.test(value);
}

function toPublicAssetPath(slug: string, src: string) {
  if (isExternalUrl(src) || src.startsWith("/")) {
    return src;
  }
  return `/project-assets/${slug}/${src.replace(/^\.\//, "")}`;
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

function normalizeMediaAsset(slug: string, asset: ProjectMediaAsset): ProjectMediaAsset {
  const normalizedSrc = toPublicAssetPath(slug, asset.src);

  return {
    ...asset,
    src: asset.kind === "embed" ? normalizeEmbedSource(normalizedSrc) : normalizedSrc,
    poster: asset.poster ? toPublicAssetPath(slug, asset.poster) : undefined,
  };
}

function manifestPathFor(slug: string) {
  return path.join(PROJECT_ASSET_ROOT, slug, "manifest.json");
}

export function resolveProjectMedia(slug: string): ProjectMediaCollection {
  const manifestPath = manifestPathFor(slug);
  if (!fs.existsSync(manifestPath)) {
    return {
      gallery: [],
      resources: [],
    };
  }

  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as ProjectMediaManifest;

  return {
    manifestPath: `/project-assets/${slug}/manifest.json`,
    featured: manifest.featured ? normalizeMediaAsset(slug, manifest.featured) : undefined,
    gallery: (manifest.gallery ?? []).map((item) => normalizeMediaAsset(slug, item)),
    resources: manifest.resources ?? [],
    note: manifest.note,
  };
}

export function listProjectManifestSlugs() {
  if (!fs.existsSync(PROJECT_ASSET_ROOT)) {
    return [];
  }

  return fs.readdirSync(PROJECT_ASSET_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(manifestPathFor(slug)));
}

export function getProjectAssetRoot() {
  return PROJECT_ASSET_ROOT;
}
