import fs from "node:fs";
import path from "node:path";

import type { HonorExtraItem, HonorImageAsset, HonorReference } from "./resume-schema";

const HONOR_ASSET_ROOT = path.resolve(process.cwd(), "public/honor-assets");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

type HonorExtraSourceItem = {
  slug: string;
  title: string;
  summary?: string;
  references: HonorReference[];
};

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

function honorImageDirectoryFor(slug: string) {
  return path.join(HONOR_ASSET_ROOT, slug, "images");
}

function toHonorPublicAssetPath(slug: string, fileName: string) {
  return `/honor-assets/${slug}/images/${fileName}`;
}

function resolveHonorImages(slug: string): HonorImageAsset[] {
  const imageDirectory = honorImageDirectoryFor(slug);
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

  return orderedFileNames.map((fileName) => {
    const title = formatImageTitle(fileName);
    return {
      title,
      src: toHonorPublicAssetPath(slug, fileName),
      alt: title,
    } satisfies HonorImageAsset;
  });
}

const honorExtraSource: HonorExtraSourceItem[] = [
  {
    slug: "patents",
    title: "一级专利发明人相关资料",
    summary: "收录简历中提到的部分专利编号与名称，可作为专利成果补充说明。",
    references: [
      { label: "专利", value: "序列标注模型的训练方法、装置、电子设备和存储介质  CN113220836B" },
      { label: "专利", value: "噪音样本的识别方法、装置、电子设备以及存储介质  CN113887627B" },
      { label: "专利", value: "文本分类模型的训练方法、文本分类方法及装置  CN115934937B" },
      { label: "专利", value: "信息抽取方法、装置、电子设备以及存储介质  CN116108857B" },
      { label: "专利", value: "搜索词权重的确定方法、装置及电子设备  CN114398469A" },
      { label: "专利", value: "数据处理方法、装置、设备以及存储介质  CN114860872B" },
      { label: "专利", value: "文本信息处理方法、装置、电子设备以及存储介质  CN113220835B" },
      { label: "专利", value: "分类模型训练、语义分类方法、装置、设备和介质  CN114969326B" },
      { label: "专利", value: "实体关系抽取方法、装置、电子设备和存储介质  CN113221566B" },
      { label: "专利", value: "文本分类方法、装置以及设备  CN115982352A" },
      { label: "专利", value: "文本标注方法、装置及电子设备  CN114416976A" },
      { label: "说明", value: "等专利..." },
    ],
  },
];

export const honorExtras: HonorExtraItem[] = honorExtraSource.map((item) => ({
  slug: item.slug,
  title: item.title,
  summary: item.summary,
  images: resolveHonorImages(item.slug),
  references: item.references,
}));

export function getHonorAssetRoot() {
  return HONOR_ASSET_ROOT;
}
