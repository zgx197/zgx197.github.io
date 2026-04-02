import { resumeData } from "./resume";

export const RESUME_EXPORT_PACKAGE_VERSION = "resume-data-package@v4";
export const RESUME_EXPORT_PACKAGE_TYPE = "resume-data-export";
export const RESUME_EXPORT_JSON_PATH = "/resume.json";
export const RESUME_EXPORT_META_PATH = "/resume.meta.json";
export const RESUME_EXPORT_SCHEMA_PATH = "/resume.schema.json";
export const RESUME_EXPORT_ARCHIVE_PATH = "/resume-data.zip";
export const RESUME_EXPORT_JSON_FILENAME = "zgx197-resume.json";
export const RESUME_EXPORT_META_FILENAME = "zgx197-resume.meta.json";
export const RESUME_EXPORT_SCHEMA_FILENAME = "zgx197-resume.schema.json";
export const RESUME_EXPORT_ARCHIVE_FILENAME = "zgx197-resume-data.zip";

const RESUME_EXPORT_SOURCE_SITE = "https://zgx197.top";
const RESUME_EXPORT_SOURCE_RESUME_PATH = "/resume";
const RESUME_ARCHIVE_README_FILENAME = "README.md";
const RESUME_ARCHIVE_JSON_FILENAME = "resume.json";
const RESUME_ARCHIVE_META_FILENAME = "resume.meta.json";
const RESUME_ARCHIVE_SCHEMA_FILENAME = "resume.schema.json";

type ZipArchiveEntry = {
  name: string;
  data: Uint8Array;
  modifiedAt?: Date;
};

function buildResumeExportSource() {
  return {
    site: RESUME_EXPORT_SOURCE_SITE,
    resumePath: RESUME_EXPORT_SOURCE_RESUME_PATH,
    jsonPath: RESUME_EXPORT_JSON_PATH,
    metaPath: RESUME_EXPORT_META_PATH,
    schemaPath: RESUME_EXPORT_SCHEMA_PATH,
  };
}

export function buildResumeExportPayload(exportedAt = new Date().toISOString()) {
  return {
    packageVersion: RESUME_EXPORT_PACKAGE_VERSION,
    packageType: RESUME_EXPORT_PACKAGE_TYPE,
    exportedAt,
    source: buildResumeExportSource(),
    resume: resumeData,
  };
}

export function buildResumeMetaPayload(exportedAt = new Date().toISOString()) {
  return {
    packageVersion: RESUME_EXPORT_PACKAGE_VERSION,
    packageType: RESUME_EXPORT_PACKAGE_TYPE,
    exportedAt,
    source: buildResumeExportSource(),
    documents: {
      resume: RESUME_ARCHIVE_JSON_FILENAME,
      meta: RESUME_ARCHIVE_META_FILENAME,
      schema: RESUME_ARCHIVE_SCHEMA_FILENAME,
      readme: RESUME_ARCHIVE_README_FILENAME,
    },
    topLevelFields: {
      profile: "个人基础信息与公开对外形象。",
      resume: "简历主体，包括摘要、经历、技能、荣誉和教育等结构化内容。",
      projects: "项目详情数据，包含项目卡片摘要、媒体资源和分区内容。",
    },
    fieldSemantics: {
      "profile.role": "候选人的当前职业定位描述，不等于严格的求职岗位名称。",
      "profile.strengths": "候选人的自我能力概括，适合辅助理解整体画像，但不应替代具体经历和项目事实。",
      "resume.headline": "网页简历对外展示使用的总述句。",
      "resume.summaryPoints": "候选人的摘要表达，用于快速理解背景与关注方向。",
      "resume.focusAreas": "候选人主动强调的关注方向与能力侧重。",
      "resume.profileFacts": "面向外部展示的标签化事实信息。",
      "resume.experiences[].summary": "单段经历的摘要说明，可作为该经历的概括入口。",
      "resume.experiences[].bullets": "候选人想强调的核心贡献点。",
      "resume.experiences[].details.refined": "整理后的详细补充说明，更适合直接阅读。",
      "resume.experiences[].details.original": "更接近原始简历或原始材料的表述。",
      "resume.experiences[].projectSlugs": "该段经历直接关联的项目 slug 列表，可用于和 projects 建立映射。",
      "resume.skillGroups": "按主题分组的技能列表。",
      "projects[].category.featured": "重点项目或工作项目。",
      "projects[].category.open_source": "开源项目。",
      "projects[].meta": "项目卡片的辅助元信息，通常包含时间、角色、平台或技术范围。",
      "projects[].tags": "项目标签，用于表达技术关键词和主题。",
      "projects[].media": "项目素材清单，包含主图、图集和资源链接。",
      "projects[].sections": "项目详情分区。不同 type 表示不同的信息组织方式，例如 showcase、metrics、archive、links。",
    },
    notes: [
      "本文件只提供导出包背景说明和字段语义提示，不对外部系统的消费方式做预设。",
      "如需获得完整事实数据，请以 resume.json 为准。",
      "如需理解结构约束和字段类型，请结合 resume.schema.json 一起阅读。",
    ],
  };
}

export function buildResumeSchemaDocument() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${RESUME_EXPORT_SOURCE_SITE}${RESUME_EXPORT_SCHEMA_PATH}`,
    title: "ZGX Resume Export Schema",
    description: "张国鑫简历导出数据的字段结构说明。该文档只描述结构、类型与基础语义，不预设外部系统如何消费这份数据。",
    type: "object",
    required: ["packageVersion", "packageType", "exportedAt", "source", "resume"],
    properties: {
      packageVersion: {
        type: "string",
        description: "导出包版本号。结构发生不兼容变化时应升级。",
      },
      packageType: {
        type: "string",
        const: RESUME_EXPORT_PACKAGE_TYPE,
        description: "导出包类型标识，当前固定为 resume-data-export。",
      },
      exportedAt: {
        type: "string",
        format: "date-time",
        description: "导出时间，ISO 8601 格式。",
      },
      source: {
        type: "object",
        description: "数据来源信息，帮助消费方理解这份数据来自哪个站点和入口。",
        required: ["site", "resumePath", "jsonPath", "metaPath", "schemaPath"],
        properties: {
          site: {
            type: "string",
            description: "原始简历站点域名。",
          },
          resumePath: {
            type: "string",
            description: "原始网页简历路径。",
          },
          jsonPath: {
            type: "string",
            description: "当前简历 JSON 导出路径。",
          },
          metaPath: {
            type: "string",
            description: "当前简历说明文档 JSON 导出路径。",
          },
          schemaPath: {
            type: "string",
            description: "当前 schema 文档路径。",
          },
        },
      },
      resume: {
        $ref: "#/$defs/resumeSchema",
        description: "结构化简历主体数据。字段语义与网页展示共用同一套数据源。",
      },
    },
    $defs: {
      linkItem: {
        type: "object",
        required: ["label", "href"],
        properties: {
          label: {
            type: "string",
            description: "链接展示名称。",
          },
          href: {
            type: "string",
            description: "链接地址或站内路径。",
          },
          external: {
            type: "boolean",
            description: "是否为站外链接。true 时通常需要新窗口打开。",
          },
        },
      },
      focusArea: {
        type: "object",
        required: ["title", "description"],
        properties: {
          title: {
            type: "string",
            description: "关注方向名称。",
          },
          description: {
            type: "string",
            description: "该方向的说明文案。",
          },
        },
      },
      detailLayerContent: {
        type: "object",
        description: "带有分层来源的补充说明。refined 通常是整理后的详细补充，original 是原始简历表述。",
        properties: {
          refinedTitle: {
            type: "string",
          },
          refined: {
            type: "array",
            items: { type: "string" },
          },
          originalTitle: {
            type: "string",
          },
          original: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      experienceItem: {
        type: "object",
        required: ["id", "company", "role", "period", "summary", "bullets"],
        properties: {
          id: {
            type: "string",
            description: "工作经历稳定 ID，适合外部系统做映射。",
          },
          company: {
            type: "string",
          },
          role: {
            type: "string",
          },
          period: {
            type: "string",
            description: "经历时间范围，保留原始展示文案。",
          },
          summary: {
            type: "string",
            description: "该经历的摘要说明。",
          },
          bullets: {
            type: "array",
            description: "候选人希望突出的核心贡献点。",
            items: { type: "string" },
          },
          details: {
            $ref: "#/$defs/detailLayerContent",
          },
          projectSlugs: {
            type: "array",
            description: "与该段经历直接关联的项目 slug 列表。",
            items: { type: "string" },
          },
          note: {
            type: "string",
          },
        },
      },
      skillGroup: {
        type: "object",
        required: ["title", "items"],
        properties: {
          title: {
            type: "string",
          },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      showcaseBlock: {
        type: "object",
        required: ["title"],
        properties: {
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      showcaseCard: {
        type: "object",
        required: ["title", "description"],
        properties: {
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
        },
      },
      projectArchiveGroup: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },
          paragraphs: {
            type: "array",
            items: { type: "string" },
          },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      projectArchiveSection: {
        type: "object",
        required: ["title"],
        properties: {
          title: {
            type: "string",
          },
          intro: {
            type: "string",
          },
          paragraphs: {
            type: "array",
            items: { type: "string" },
          },
          groups: {
            type: "array",
            items: { $ref: "#/$defs/projectArchiveGroup" },
          },
        },
      },
      projectMediaAsset: {
        type: "object",
        required: ["kind", "title", "src"],
        properties: {
          kind: {
            type: "string",
            enum: ["image", "video", "embed"],
            description: "媒体类型。image 表示图片，video 表示视频资源，embed 表示外部嵌入页面。",
          },
          title: {
            type: "string",
          },
          src: {
            type: "string",
          },
          description: {
            type: "string",
          },
          alt: {
            type: "string",
          },
          poster: {
            type: "string",
          },
          external: {
            type: "boolean",
          },
        },
      },
      projectMediaCollection: {
        type: "object",
        required: ["gallery", "resources"],
        properties: {
          manifestPath: {
            type: "string",
            description: "项目素材 manifest 的来源路径。",
          },
          featured: {
            $ref: "#/$defs/projectMediaAsset",
          },
          gallery: {
            type: "array",
            items: { $ref: "#/$defs/projectMediaAsset" },
          },
          resources: {
            type: "array",
            items: { $ref: "#/$defs/linkItem" },
          },
          note: {
            type: "string",
          },
        },
      },
      projectSectionShowcase: {
        type: "object",
        required: ["type", "title", "featuredTitle", "featuredDescription", "sideBlocks", "gallery", "note"],
        properties: {
          type: { const: "showcase" },
          title: { type: "string" },
          featuredTitle: { type: "string" },
          featuredDescription: { type: "string" },
          sideBlocks: {
            type: "array",
            items: { $ref: "#/$defs/showcaseBlock" },
          },
          gallery: {
            type: "array",
            items: { $ref: "#/$defs/showcaseCard" },
          },
          note: {
            type: "string",
            description: "展示位说明，适合作为后续扩展或编辑参考。",
          },
        },
      },
      projectSectionMetrics: {
        type: "object",
        required: ["type", "title", "items"],
        properties: {
          type: { const: "metrics" },
          title: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["value", "label"],
              properties: {
                value: { type: "string" },
                label: { type: "string" },
              },
            },
          },
        },
      },
      projectSectionHighlights: {
        type: "object",
        required: ["type", "title", "items"],
        properties: {
          type: { const: "highlights" },
          title: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "description"],
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
            },
          },
        },
      },
      projectSectionParagraph: {
        type: "object",
        required: ["type", "title", "paragraphs"],
        properties: {
          type: { const: "paragraph" },
          title: { type: "string" },
          paragraphs: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      projectSectionBullets: {
        type: "object",
        required: ["type", "title", "items"],
        properties: {
          type: { const: "bullets" },
          title: { type: "string" },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      projectSectionLayeredBullets: {
        type: "object",
        required: ["type", "title"],
        properties: {
          type: { const: "layered_bullets" },
          title: { type: "string" },
          refinedTitle: { type: "string" },
          refinedItems: {
            type: "array",
            items: { type: "string" },
          },
          originalTitle: { type: "string" },
          originalItems: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      projectSectionArchive: {
        type: "object",
        required: ["type", "title", "sections"],
        properties: {
          type: { const: "archive" },
          title: { type: "string" },
          description: { type: "string" },
          sections: {
            type: "array",
            items: { $ref: "#/$defs/projectArchiveSection" },
          },
        },
      },
      projectSectionTags: {
        type: "object",
        required: ["type", "title", "items"],
        properties: {
          type: { const: "tags" },
          title: { type: "string" },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      projectSectionLinks: {
        type: "object",
        required: ["type", "title", "items"],
        properties: {
          type: { const: "links" },
          title: { type: "string" },
          items: {
            type: "array",
            items: { $ref: "#/$defs/linkItem" },
          },
        },
      },
      projectSection: {
        oneOf: [
          { $ref: "#/$defs/projectSectionShowcase" },
          { $ref: "#/$defs/projectSectionMetrics" },
          { $ref: "#/$defs/projectSectionHighlights" },
          { $ref: "#/$defs/projectSectionParagraph" },
          { $ref: "#/$defs/projectSectionBullets" },
          { $ref: "#/$defs/projectSectionLayeredBullets" },
          { $ref: "#/$defs/projectSectionArchive" },
          { $ref: "#/$defs/projectSectionTags" },
          { $ref: "#/$defs/projectSectionLinks" },
        ],
      },
      projectDetail: {
        type: "object",
        required: ["slug", "title", "category", "meta", "description", "tags", "eyebrow", "subtitle", "media", "sections"],
        properties: {
          slug: {
            type: "string",
            description: "项目稳定 slug，适合作为路由和关联键。",
          },
          title: { type: "string" },
          category: {
            type: "string",
            enum: ["featured", "open_source"],
            description: "featured 表示工作项目或重点项目；open_source 表示开源项目。",
          },
          meta: {
            type: "array",
            items: { type: "string" },
          },
          description: {
            type: "string",
          },
          tags: {
            type: "array",
            items: { type: "string" },
          },
          eyebrow: {
            type: "string",
          },
          subtitle: {
            type: "string",
          },
          media: {
            $ref: "#/$defs/projectMediaCollection",
          },
          sections: {
            type: "array",
            description: "项目详情分区。不同 type 表示不同信息密度和组织方式。",
            items: { $ref: "#/$defs/projectSection" },
          },
        },
      },
      education: {
        type: "object",
        required: ["school", "degree", "period", "details"],
        properties: {
          school: {
            type: "string",
          },
          degree: {
            type: "string",
          },
          period: {
            type: "string",
          },
          details: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      honorImageAsset: {
        type: "object",
        required: ["title", "src"],
        properties: {
          title: {
            type: "string",
          },
          src: {
            type: "string",
          },
          alt: {
            type: "string",
          },
          description: {
            type: "string",
          },
        },
      },
      honorReference: {
        type: "object",
        required: ["label", "value"],
        properties: {
          label: {
            type: "string",
          },
          value: {
            type: "string",
          },
          href: {
            type: "string",
          },
          external: {
            type: "boolean",
          },
        },
      },
      honorExtraItem: {
        type: "object",
        required: ["slug", "title", "images", "references"],
        properties: {
          slug: {
            type: "string",
          },
          title: {
            type: "string",
          },
          summary: {
            type: "string",
          },
          images: {
            type: "array",
            items: { $ref: "#/$defs/honorImageAsset" },
          },
          references: {
            type: "array",
            items: { $ref: "#/$defs/honorReference" },
          },
        },
      },
      resumeSchema: {
        type: "object",
        required: ["schemaVersion", "profile", "resume", "projects"],
        properties: {
          schemaVersion: {
            type: "string",
            description: "网页简历内部使用的 schema 版本号。",
          },
          profile: {
            type: "object",
            required: ["name", "role", "bio", "strengths", "contacts"],
            properties: {
              name: {
                type: "string",
              },
              role: {
                type: "string",
              },
              bio: {
                type: "string",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
              },
              contacts: {
                type: "array",
                items: { $ref: "#/$defs/linkItem" },
              },
            },
          },
          resume: {
            type: "object",
            required: ["headline", "summaryPoints", "focusAreas", "profileFacts", "experiences", "skillGroups", "honors", "honorExtras", "education"],
            properties: {
              headline: {
                type: "string",
              },
              summaryPoints: {
                type: "array",
                items: { type: "string" },
              },
              focusAreas: {
                type: "array",
                items: { $ref: "#/$defs/focusArea" },
              },
              profileFacts: {
                type: "array",
                items: {
                  type: "object",
                  required: ["label", "value"],
                  properties: {
                    label: { type: "string" },
                    value: { type: "string" },
                  },
                },
              },
              experiences: {
                type: "array",
                items: { $ref: "#/$defs/experienceItem" },
              },
              skillGroups: {
                type: "array",
                items: { $ref: "#/$defs/skillGroup" },
              },
              honors: {
                type: "array",
                items: { type: "string" },
              },
              honorExtras: {
                type: "array",
                items: { $ref: "#/$defs/honorExtraItem" },
              },
              education: {
                $ref: "#/$defs/education",
              },
            },
          },
          projects: {
            type: "array",
            items: { $ref: "#/$defs/projectDetail" },
          },
        },
      },
    },
  };
}

export function buildResumeExportReadme(exportedAt = new Date().toISOString()) {
  return [
    "# Resume Export Package",
    "",
    "这是张国鑫个人简历站导出的结构化简历数据包。",
    "",
    "## Package Metadata",
    "",
    `- packageVersion: \`${RESUME_EXPORT_PACKAGE_VERSION}\``,
    `- packageType: \`${RESUME_EXPORT_PACKAGE_TYPE}\``,
    `- exportedAt: \`${exportedAt}\``,
    `- sourceSite: \`${RESUME_EXPORT_SOURCE_SITE}\``,
    `- sourceResumePath: \`${RESUME_EXPORT_SOURCE_RESUME_PATH}\``,
    "",
    "## Included Files",
    "",
    `- \`${RESUME_ARCHIVE_JSON_FILENAME}\`: 当前简历的标准结构化数据，适合程序直接读取。`,
    `- \`${RESUME_ARCHIVE_META_FILENAME}\`: 当前导出包的背景说明、顶层字段说明和字段语义提示。`,
    `- \`${RESUME_ARCHIVE_SCHEMA_FILENAME}\`: 字段结构、枚举值和类型约束说明。`,
    `- \`${RESUME_ARCHIVE_README_FILENAME}\`: 当前说明文件。`,
    "",
    "## Recommended Reading Order",
    "",
    "1. 先阅读 `README.md`，理解这个压缩包的定位和文件用途。",
    "2. 再阅读 `resume.meta.json`，理解顶层字段和基础语义说明。",
    "3. 再阅读 `resume.schema.json`，理解结构、类型和枚举约束。",
    "4. 最后消费 `resume.json`，把它当成完整事实层数据。",
    "",
    "## Important Notes",
    "",
    "- 这份数据包只导出简历事实和基础说明，不预设任何外部系统的消费行为。",
    "- 如果需要生成摘要、问答、评分或其他推断结果，建议在外部系统中自行完成。",
    "- 如需获得完整事实数据，请以 `resume.json` 为准。",
    "",
  ].join("\n");
}

function encodeJson(value: unknown) {
  return new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
}

function encodeText(value: string) {
  return new TextEncoder().encode(value);
}

function createCrc32Table() {
  const table = new Uint32Array(256);

  for (let index = 0; index < table.length; index += 1) {
    let current = index;

    for (let bit = 0; bit < 8; bit += 1) {
      current = (current & 1) === 1 ? (0xedb88320 ^ (current >>> 1)) : (current >>> 1);
    }

    table[index] = current >>> 0;
  }

  return table;
}

const CRC32_TABLE = createCrc32Table();

function crc32(input: Uint8Array) {
  let current = 0xffffffff;

  for (const byte of input) {
    current = CRC32_TABLE[(current ^ byte) & 0xff] ^ (current >>> 8);
  }

  return (current ^ 0xffffffff) >>> 0;
}

function dateToDosDateTime(date: Date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    ((date.getHours() & 0x1f) << 11)
    | ((date.getMinutes() & 0x3f) << 5)
    | Math.floor((date.getSeconds() & 0x3f) / 2);
  const dosDate =
    (((year - 1980) & 0x7f) << 9)
    | (((date.getMonth() + 1) & 0x0f) << 5)
    | (date.getDate() & 0x1f);

  return { dosDate, dosTime };
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value & 0xffff, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

function concatUint8Arrays(parts: Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function createStoredZip(entries: ZipArchiveEntry[]) {
  const fileParts: Uint8Array[] = [];
  const centralDirectoryParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encodeText(entry.name);
    const data = entry.data;
    const checksum = crc32(data);
    const modifiedAt = entry.modifiedAt ?? new Date();
    const { dosDate, dosTime } = dateToDosDateTime(modifiedAt);

    const localHeader = new Uint8Array(30);
    const localHeaderView = new DataView(localHeader.buffer);
    writeUint32(localHeaderView, 0, 0x04034b50);
    writeUint16(localHeaderView, 4, 20);
    writeUint16(localHeaderView, 6, 0x0800);
    writeUint16(localHeaderView, 8, 0);
    writeUint16(localHeaderView, 10, dosTime);
    writeUint16(localHeaderView, 12, dosDate);
    writeUint32(localHeaderView, 14, checksum);
    writeUint32(localHeaderView, 18, data.length);
    writeUint32(localHeaderView, 22, data.length);
    writeUint16(localHeaderView, 26, nameBytes.length);
    writeUint16(localHeaderView, 28, 0);

    fileParts.push(localHeader, nameBytes, data);

    const centralHeader = new Uint8Array(46);
    const centralHeaderView = new DataView(centralHeader.buffer);
    writeUint32(centralHeaderView, 0, 0x02014b50);
    writeUint16(centralHeaderView, 4, 20);
    writeUint16(centralHeaderView, 6, 20);
    writeUint16(centralHeaderView, 8, 0x0800);
    writeUint16(centralHeaderView, 10, 0);
    writeUint16(centralHeaderView, 12, dosTime);
    writeUint16(centralHeaderView, 14, dosDate);
    writeUint32(centralHeaderView, 16, checksum);
    writeUint32(centralHeaderView, 20, data.length);
    writeUint32(centralHeaderView, 24, data.length);
    writeUint16(centralHeaderView, 28, nameBytes.length);
    writeUint16(centralHeaderView, 30, 0);
    writeUint16(centralHeaderView, 32, 0);
    writeUint16(centralHeaderView, 34, 0);
    writeUint16(centralHeaderView, 36, 0);
    writeUint32(centralHeaderView, 38, 0);
    writeUint32(centralHeaderView, 42, offset);

    centralDirectoryParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + data.length;
  }

  const centralDirectory = concatUint8Arrays(centralDirectoryParts);
  const endRecord = new Uint8Array(22);
  const endRecordView = new DataView(endRecord.buffer);
  writeUint32(endRecordView, 0, 0x06054b50);
  writeUint16(endRecordView, 4, 0);
  writeUint16(endRecordView, 6, 0);
  writeUint16(endRecordView, 8, entries.length);
  writeUint16(endRecordView, 10, entries.length);
  writeUint32(endRecordView, 12, centralDirectory.length);
  writeUint32(endRecordView, 16, offset);
  writeUint16(endRecordView, 20, 0);

  return concatUint8Arrays([...fileParts, centralDirectory, endRecord]);
}

export function buildResumeExportArchive() {
  const exportedAt = new Date().toISOString();
  const payload = buildResumeExportPayload(exportedAt);
  const metaPayload = buildResumeMetaPayload(exportedAt);
  const schemaDocument = buildResumeSchemaDocument();
  const readme = buildResumeExportReadme(exportedAt);
  const archiveEntries: ZipArchiveEntry[] = [
    {
      name: RESUME_ARCHIVE_JSON_FILENAME,
      data: encodeJson(payload),
    },
    {
      name: RESUME_ARCHIVE_META_FILENAME,
      data: encodeJson(metaPayload),
    },
    {
      name: RESUME_ARCHIVE_SCHEMA_FILENAME,
      data: encodeJson(schemaDocument),
    },
    {
      name: RESUME_ARCHIVE_README_FILENAME,
      data: encodeText(readme),
    },
  ];

  return createStoredZip(archiveEntries);
}
