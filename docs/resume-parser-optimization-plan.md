# 简历解析流程重构实施手册

## 文档目的

本文档是后续实现的执行手册，不是方向性讨论稿。

目标只有一个：

- 把当前“PDF / 文本 -> 导入脚本 -> 正式数据 -> 网页”的链路，重构成一条 **可审阅、可评估、可回滚、可逐步演进** 的解析流水线。

明确不包含的范围：

- 不优化网站 UI 风格
- 不改页面视觉设计
- 不优先做 SEO
- 不做后台编辑器

## 当前问题

当前链路可以跑通，但不稳定。根本问题不是单条规则写错，而是流程层次不清。

主要问题：

- 文本结构识别不稳定
  表现为一整段工作内容被压成一个 summary，多项目经历无法正确拆分。
- 结构识别和文案提炼耦合
  结构一旦错，summary、highlights、metrics 也会一起错。
- 校验偏格式校验
  现在能发现 `id` 重复、链接非法，但很难发现“内容看起来合理、其实语义错误”的情况。
- merge 过早写回正式数据
  候选结果质量不够时，仍可能污染 [`resume-source.ts`](/d:/UGit/zgx197.github.io/src/data/resume-source.ts)。
- AI 接入位置还未收敛
  AI 应该做候选增强，不应该直接接管正式发布。

## 重构后的目标链路

重构后的标准链路应为：

`原始简历 -> 文本抽取 -> 结构候选 -> 候选校验 -> 字段候选 -> 安全合并 -> 正式数据 -> 网页`

分层解释：

1. `原始简历`
   PDF / TXT / MD 文件本身。
2. `文本抽取`
   得到 `extracted.txt` / `normalized.txt`。
3. `结构候选`
   得到 `parsed-candidate.json`，重点表达 section / experience / project。
4. `候选校验`
   得到 `structure-report.json` 和 `candidate-validation-report.json`。
5. `字段候选`
   在结构稳定基础上生成 summary / highlights / metrics / tags / slug match 候选。
6. `安全合并`
   merge 只写“安全字段”，高风险字段必须保守。
7. `正式数据`
   继续由 [`resume-source.ts`](/d:/UGit/zgx197.github.io/src/data/resume-source.ts) 和 [`resume-overrides.ts`](/d:/UGit/zgx197.github.io/src/data/resume-overrides.ts) 驱动。
8. `网页`
   页面层不承担纠错职责，只消费正式数据。

## 核心原则

后续所有实现都遵守下面 6 条原则。

### 1. 候选结果不是正式结果

自动解析器产出的永远是候选，不是最终发布内容。

### 2. 结构优先于文案

先把 `section -> experience -> project` 三层结构做稳，再做 summary 和 tags。

### 3. 宁缺毋错

字段置信度不够时宁可留空，不要生成“看起来完整但实际错误”的内容。

### 4. 校验必须覆盖语义异常

不只校验格式，还要校验重复、截断、异常长度、项目遗漏、指标失真等问题。

### 5. merge 必须保守

merge 只负责安全发布，不负责修正解析问题。

### 6. AI 只做候选增强

AI 可以做：

- 结构识别
- 字段提炼
- 候选匹配
- 报告解释

AI 不可以做：

- 直接写正式 source
- 直接决定 merge
- 绕过 deterministic 校验

## 目标架构

### A. 原始输入层

输入文件：

- PDF
- TXT
- Markdown

当前脚本：

- [`import-resume-pdf.py`](/d:/UGit/zgx197.github.io/scripts/import-resume-pdf.py)
- [`import-resume-text.mjs`](/d:/UGit/zgx197.github.io/scripts/import-resume-text.mjs)

### B. 中间结构层

新增核心产物：

- `*.parsed-candidate.json`
- `*.structure-report.json`

这层是整个重构的核心，后续所有 AI 和校验都围绕它工作。

### C. 字段候选层

新增候选字段：

- summary 候选
- highlights 候选
- metrics 候选
- tag 候选
- slug 匹配建议

### D. 正式发布层

继续保留：

- [`resume-source.ts`](/d:/UGit/zgx197.github.io/src/data/resume-source.ts)
- [`resume-overrides.ts`](/d:/UGit/zgx197.github.io/src/data/resume-overrides.ts)
- [`resume-transform.ts`](/d:/UGit/zgx197.github.io/src/data/resume-transform.ts)

原则：

- 页面层不动
- 正式 schema 不作为第一阶段改造重点

## 中间结构模型

## `parsed-candidate@v1`

第一阶段的唯一正式目标，是让系统稳定产出 `parsed-candidate@v1`。

建议最小结构如下：

```json
{
  "schemaVersion": "parsed-candidate@v1",
  "documentMeta": {
    "sourceType": "pdf",
    "sourcePath": "D:/UGit/zgx197.github.io/张国鑫-U3D-202603-v2.pdf",
    "importedAt": "2026-03-31T15:40:00+08:00",
    "normalizationVersion": "normalize@v1"
  },
  "profile": {},
  "sections": [],
  "entities": {
    "experiences": [],
    "projects": [],
    "honors": [],
    "education": null
  },
  "diagnostics": {
    "warnings": [],
    "parserNotes": [],
    "lowConfidenceItems": []
  }
}
```

### 必须支持的结构块

- `SectionBlock`
- `ExperienceBlock`
- `ProjectBlock`
- `ParagraphBlock`
- `BulletBlock`
- `MetricBlock`
- `LinkBlock`

### 第一阶段必须稳定识别的 section

- `profile`
- `strengths`
- `experiences`
- `internship`
- `honors`
- `education`

### 第一阶段必须稳定识别的 experience 头部字段

- `company`
- `role`
- `period`

### 第一阶段必须稳定识别的 project 内部区块

- `summaryBlocks`
- `workBlocks`
- `impactBlocks`
- `metricBlocks`
- `linkBlocks`

## AI 接入原则

## Kimi K2.5 使用策略

后续主推荐模型是 **Kimi K2.5**，但我们不把模型名硬编码进解析逻辑。

参考 `DatumPlatform` 的已实现模式：

- 采用 **OpenAI-compatible Chat Completions**
- 通过 provider 配置管理 `baseUrl` / `model` / `apiKey`
- Tool Calling 使用 OpenAI 兼容格式
- 模型名是配置项，不写死在调用层

参考文件：

- [`aiConfig.ts`](/d:/UGit/DatumPlatform/datum-web/src/services/aiConfig.ts)
- [`aiChat.ts`](/d:/UGit/DatumPlatform/datum-web/src/services/aiChat.ts)
- [`aiTools.ts`](/d:/UGit/DatumPlatform/datum-web/src/services/aiTools.ts)

### 我们在本仓库中的约束

- 默认用 Kimi 作为主要 provider
- 通过环境变量提供 API Key
- 通过 `provider-config.ts` 统一解析 provider 与任务路由
- 所有 AI 输出必须是结构化 JSON

## AI 任务类型

### 1. Structural Parser

职责：

- 识别 section 内的 experience / project 结构

输出：

- 结构候选
- `confidence`

### 2. Field Summarizer

职责：

- 从已稳定结构中提炼 summary / highlights / tags / metrics 候选

### 3. Semantic Matcher

职责：

- 将候选项目与现有正式项目做语义匹配

### 4. Review Assistant

职责：

- 基于 candidate / validation / diff 生成可读报告

## AI provider 配置

已落地的第一个工程文件：

- [`provider-config.ts`](/d:/UGit/zgx197.github.io/scripts/lib/ai/provider-config.ts)

当前配置骨架已经覆盖：

- `AiProviderName`
- `AiTaskName`
- `AiProviderConfig`
- `AiTaskConfig`
- `ResolvedAiProviderConfig`
- 默认 provider 定义
- 任务级环境变量路由
- provider 解析和校验

### 建议环境变量

说明：当前代码验证使用的 Moonshot 可用模型名为 `moonshot-v1-8k`。后续如果你的账号开通了 Kimi K2.5，可直接通过 `KIMI_MODEL` 环境变量切换，不需要改调用代码。

```bash
KIMI_API_KEY=
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=moonshot-v1-8k

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

AI_DEFAULT_PROVIDER=kimi
AI_STRUCTURAL_PROVIDER=kimi
AI_SUMMARIZER_PROVIDER=kimi
AI_MATCHER_PROVIDER=kimi
AI_REVIEW_PROVIDER=kimi

AI_TIMEOUT_MS=60000
AI_ENABLE_STREAM=false
AI_MAX_RETRIES=2
AI_LOG_REQUESTS=false
AI_LOG_RESPONSES=false
```

## 实施总策略

采用 **“小步实现 + 每阶段测试 + 每阶段评估 + 再继续前进”** 的策略。

原则：

- 不做大爆炸重写
- 不一次性把 AI、校验、merge 全部接上
- 每完成若干步就做一次测试和评估
- 评估不过就不进入下一阶段

后续推进按 5 个阶段执行。

## 阶段 0：建立基线 [已完成]

### 目标

先把当前系统的输入、输出和已知错误冻结下来，避免后续重构没有对照。

### 要改的文件

- 暂不要求改现有业务脚本
- 新增样本和记录即可

### 要做的事

1. 固定 2 到 3 份简历样本
   - 当前 2026-03 PDF
   - 旧版 PDF
   - 一份文本版输入
2. 保存当前链路输出
   - `normalized.txt`
   - `report.json`
   - `resume-source.json`
3. 记录当前已知失败点
   - 最新经历被压成一段
   - 多项目拆分失败
   - 项目顺序错误
   - 指标单位失真

### 产物

- 样本清单
- 当前问题清单
- 当前输出基线

### 测试

- 用当前脚本重新跑一次样本
- 确认基线产物可复现

### 评估门槛

- 样本齐全
- 当前问题已记录
- 后续所有改动都可和基线对比

## 阶段 1：建立中间结构层 [已完成]

### 目标

先让系统稳定产出 `parsed-candidate@v1`，不接 merge，不追求最终网页效果。

### 要新增的文件

- `scripts/lib/resume-parser/candidate-schema.ts`
- `scripts/lib/resume-parser/line-tokenize.ts`
- `scripts/lib/resume-parser/section-segmentation.ts`
- `scripts/lib/resume-parser/experience-segmentation.ts`
- `scripts/lib/resume-parser/assemble-candidate.ts`

### 要改的文件

- [`import-resume-text.mjs`](/d:/UGit/zgx197.github.io/scripts/import-resume-text.mjs)
- [`import-resume-pdf.py`](/d:/UGit/zgx197.github.io/scripts/import-resume-pdf.py)

### 实现步骤

1. 定义 `parsed-candidate@v1` 类型
2. 实现行级 token 化
3. 实现 deterministic section segmentation
4. 实现 deterministic experience segmentation
5. 组装 candidate 输出
6. 导入入口新增 `--emit-candidate`

### 产物

- `*.parsed-candidate.json`

### 测试

每完成 2 步做一次测试：

- `Step 1-2` 后：
  检查 token 输出是否稳定
- `Step 3-4` 后：
  检查 section 和 experience 是否正确切分
- `Step 5-6` 后：
  检查 candidate 文件是否可读、结构是否完整

### 评估门槛

达到下面 4 条才进入阶段 2：

- 三层结构中的前两层已稳定：`section -> experience`
- 最新 PDF 至少能正确拆出“北京畅聊天下科技有限公司”这一段经历
- candidate 文件能完整输出
- 旧链路不受影响

## 阶段 2：接入 AI 结构识别 [已完成]

### 目标

让多项目经历拆分不再主要依赖规则。

### 要新增的文件

- `scripts/lib/ai/chat-client.ts`
- `scripts/lib/resume-parser/ai/structural-parser.ts`
- `scripts/lib/resume-parser/prompts/structural-parser.md`

### 要改的文件

- `scripts/lib/resume-parser/assemble-candidate.ts`
- `scripts/import-resume-text.mjs`

### 实现步骤

1. 实现通用 `chat-client`
   - 按 OpenAI-compatible `/chat/completions`
2. 按协议实现 `Structural Parser`
3. 先只在复杂 `experiences` section 上启用 AI
4. 合并规则层与 AI 层结果
5. 增加 `--use-ai-structure`

### 产物

- AI 结构解析后的 `parsed-candidate.json`
- `structure-report.json`

### 测试

每完成 1 到 2 步就测：

- `Step 1` 后：
  单独验证 provider 配置和模型调用
- `Step 2` 后：
  单独验证 AI 输出 JSON 是否符合协议
- `Step 3-4` 后：
  验证最新 PDF 中能否拆出多个项目

### 完成结果

截至 `2026-03-31`，阶段 2 已完成收口，验收结论如下：

- 文本入口已验证通过：
  [`generated/resume-stage2-final/text-ai-success`](/d:/UGit/zgx197.github.io/generated/resume-stage2-final/text-ai-success)
- PDF 入口已验证通过：
  [`generated/resume-stage2-final/pdf-ai-success`](/d:/UGit/zgx197.github.io/generated/resume-stage2-final/pdf-ai-success)
- AI 失败兜底已验证通过：
  [`generated/resume-stage2-final/text-ai-failure`](/d:/UGit/zgx197.github.io/generated/resume-stage2-final/text-ai-failure)
- 当前已验证可用的 Kimi provider 默认模型为 `moonshot-v1-8k`
- `structure-report.json` 已能记录：
  `attemptedExperienceIds`、`appliedExperienceIds`、`ai.warnings`、`ai.results`
- `parsed-candidate.json` 已能在 AI 失败时保留 deterministic 结果，并把 AI 失败原因写入 `diagnostics.warnings`
- 控制台输出已能在失败时显式打印 `AI warnings:`
- 与阶段 0 基线相比，最新样本从旧链路的 `3` 个项目提升到候选结构层的 `7` 个项目，且“北京畅聊天下科技有限公司”已稳定拆出 `4` 个项目

### 评估门槛 [已通过]

达到下面 5 条才进入阶段 3：

- “北京畅聊天下科技有限公司”下的多个项目能被拆出候选
- AI 输出异常不会让导入链路崩掉
- AI 输出能被 deterministic 组装层接受
- 规则层仍然保留兜底能力
- 输出结构比基线明显更好

## 阶段 3：候选校验与阶段报告 [已完成]

### 目标

在 merge 前发现错误，而不是在网页上发现错误。

### 要新增的文件

- `scripts/validate-parsed-candidate.mjs`
- `scripts/lib/resume-parser/candidate-validation.ts`

### 要改的文件

- [`scripts/import-resume-text.mjs`](/d:/UGit/zgx197.github.io/scripts/import-resume-text.mjs)

### 实现步骤

1. 增加 candidate 专用校验入口
2. 加入语义异常检查
3. 输出 `candidate-validation-report.json`
4. 输出 `structure-report.json`

### 第一批必须实现的语义校验

- summary 超长
- summary / bullet 重复
- 文本疑似截断
- 存在项目标题但没拆出项目
- 最新经历未排前
- metrics 单位异常

### 测试

- 对所有基线样本运行 candidate validation
- 检查报告是否能指出当前已知问题

### 完成结果

截至 `2026-03-31`，阶段 3 已完成收口，验收结论如下：

- 已新增独立校验入口：
  [`scripts/validate-parsed-candidate.mjs`](/d:/UGit/zgx197.github.io/scripts/validate-parsed-candidate.mjs)
- 已新增候选校验核心模块：
  [`scripts/lib/resume-parser/candidate-validation.ts`](/d:/UGit/zgx197.github.io/scripts/lib/resume-parser/candidate-validation.ts)
- 导入脚本在产出 `parsed-candidate.json` 时，已自动同时产出 `candidate-validation-report.json`
- 当前基线文本样本报告：
  [`generated/resume-stage3-check/text-current/张国鑫-U3D-202603-v2-text.candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage3-check/text-current/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.candidate-validation-report.json)
- 当前基线 PDF 样本报告：
  [`generated/resume-stage3-check/pdf-current/张国鑫-U3D-202603-v2.candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage3-check/pdf-current/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2.candidate-validation-report.json)
- 历史文本样本报告：
  [`generated/resume-stage3-check/text-202507/张国鑫-U3D-202507-text.candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage3-check/text-202507/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202507-text.candidate-validation-report.json)
- AI 候选样本报告：
  [`generated/resume-stage3-check/text-ai-success/张国鑫-U3D-202603-v2-text.candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage3-check/text-ai-success/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.candidate-validation-report.json)
- 当前样本已能在候选阶段指出 `个人优势` 和 `工作经历` 中的疑似截断/断行问题
- 历史样本已能保留并暴露 parser warning，同时指出多个 section 的疑似断行问题
- 第一批语义校验已覆盖：summary 超长、重复文本、疑似截断、项目拆分遗漏、经历顺序异常、指标单位异常

### 评估门槛 [已通过]

- 报告能在网页构建前指出关键错误
- 报告内容对人工 review 有价值

## 阶段 4：字段候选层 [已完成]

### 目标

在结构稳定之后，引入 summary / highlights / tags / metrics / slug match 候选生成，但仍然只停留在候选层，不直接发布到正式 source。

### 要新增的文件

- `scripts/lib/resume-parser/ai/summarizer.ts`
- `scripts/lib/resume-parser/ai/matcher.ts`
- `scripts/lib/resume-parser/prompts/summarizer.md`
- `scripts/lib/resume-parser/prompts/matcher.md`
- `scripts/lib/resume-mapper/project-index.ts`
- `scripts/lib/resume-parser/field-candidates.ts`
- `scripts/lib/resume-parser/field-candidate-validation.ts`
- `scripts/validate-field-candidates.mjs`

### 要改的文件

- [`import-resume-text.mjs`](/d:/UGit/zgx197.github.io/scripts/import-resume-text.mjs)
- [`import-resume-pdf.py`](/d:/UGit/zgx197.github.io/scripts/import-resume-pdf.py)

### 实现步骤 [已完成]

1. 实现 `Field Summarizer`
2. 实现 `Semantic Matcher`
3. 给 candidate 增加字段候选层
4. 给字段候选层增加独立 validation report
5. 只生成候选，不直接发布

### 当前阶段产物

导入链路现在会自动产出：

- `*.field-candidates.json`
- `*.field-candidate-validation-report.json`

当前阶段 3 门禁已接入阶段 4：

- `candidate-validation-report.json` 有 error 时，字段候选层整体阻断
- 被阶段 3 标记为 `review` 的经历，会在字段候选层按项目跳过
- AI 失败不会中断导入，deterministic 字段候选仍会保留
- 字段候选 validation 会继续把重复、低分匹配、项目跳过、字段 warning 暴露出来

### 完成结果

截至 `2026-03-31`，阶段 4 已完成收口，验收结论如下：

- 已落地字段候选核心模块：
  [`scripts/lib/resume-parser/field-candidates.ts`](/d:/UGit/zgx197.github.io/scripts/lib/resume-parser/field-candidates.ts)
- 已落地 AI 字段提炼与匹配模块：
  [`scripts/lib/resume-parser/ai/summarizer.ts`](/d:/UGit/zgx197.github.io/scripts/lib/resume-parser/ai/summarizer.ts)
  [`scripts/lib/resume-parser/ai/matcher.ts`](/d:/UGit/zgx197.github.io/scripts/lib/resume-parser/ai/matcher.ts)
- 已落地项目索引与旧 slug 引用层：
  [`scripts/lib/resume-mapper/project-index.ts`](/d:/UGit/zgx197.github.io/scripts/lib/resume-mapper/project-index.ts)
- 已落地字段候选 validation：
  [`scripts/lib/resume-parser/field-candidate-validation.ts`](/d:/UGit/zgx197.github.io/scripts/lib/resume-parser/field-candidate-validation.ts)
  [`scripts/validate-field-candidates.mjs`](/d:/UGit/zgx197.github.io/scripts/validate-field-candidates.mjs)
- 导入脚本已自动同时写出字段候选与字段候选校验报告：
  [`scripts/import-resume-text.mjs`](/d:/UGit/zgx197.github.io/scripts/import-resume-text.mjs)

已验证样本与结果：

- deterministic 文本入口：
  [`generated/resume-stage4-final/text-no-ai/张国鑫-U3D-202603-v2-text.field-candidates.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-no-ai/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.field-candidates.json)
  [`generated/resume-stage4-final/text-no-ai/张国鑫-U3D-202603-v2-text.field-candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-no-ai/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.field-candidate-validation-report.json)
- deterministic PDF 入口：
  [`generated/resume-stage4-final/pdf-no-ai/张国鑫-U3D-202603-v2.field-candidates.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/pdf-no-ai/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2.field-candidates.json)
  [`generated/resume-stage4-final/pdf-no-ai/张国鑫-U3D-202603-v2.field-candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/pdf-no-ai/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2.field-candidate-validation-report.json)
- AI 文本入口成功路径：
  [`generated/resume-stage4-final/text-ai-success-rerun/张国鑫-U3D-202603-v2-text.field-candidates.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-ai-success-rerun/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.field-candidates.json)
  [`generated/resume-stage4-final/text-ai-success-rerun/张国鑫-U3D-202603-v2-text.field-candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-ai-success-rerun/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.field-candidate-validation-report.json)
- AI PDF 入口成功路径：
  [`generated/resume-stage4-final/pdf-ai-success/张国鑫-U3D-202603-v2.field-candidates.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/pdf-ai-success/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2.field-candidates.json)
  [`generated/resume-stage4-final/pdf-ai-success/张国鑫-U3D-202603-v2.field-candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/pdf-ai-success/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2.field-candidate-validation-report.json)
- AI 失败兜底路径：
  [`generated/resume-stage4-final/text-ai-failure/张国鑫-U3D-202603-v2-text.field-candidates.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-ai-failure/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.field-candidates.json)
  [`generated/resume-stage4-final/text-ai-failure/张国鑫-U3D-202603-v2-text.field-candidate-validation-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-ai-failure/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.field-candidate-validation-report.json)

验证结论：

- deterministic 文本 / PDF 入口都能稳定产出字段候选，当前匹配到旧 slug 为 `2/7`
- AI 文本 / PDF 成功路径都能稳定提升到 `4/7`，且当前验证使用的 provider / model 为 `kimi + moonshot-v1-8k`
- AI 文本成功重跑样本的字段候选 validation 已达到 `0 error / 0 warning`
- AI 失败路径在故意传入错误模型名时，导入链路仍成功完成，字段候选仍落盘，当前回退结果为 `2/7`，并把 AI 失败原因写入 `Field AI warnings`
- 标签归一化、去重和 AI 低分匹配保护已接入 `field-candidates.ts`，避免阶段 4 自身继续放大噪音

### 评估门槛 [已通过]

- 候选字段质量已明显优于旧链路直接拼接原文的方式
- 阶段 4 没有绕过阶段 3 门禁
- AI 能提升匹配覆盖，但不会在失败时污染 deterministic 结果
- 当前新增噪音已被字段候选 validation 和 warning 机制显式暴露

## 阶段 5：安全 merge 与正式切换 [已完成]

### 目标

让 merge 正式切换到新链路消费，但保持保守，并保留旧链路回退开关。

### 要改的文件

- [`merge-imported-resume.mjs`](/d:/UGit/zgx197.github.io/scripts/merge-imported-resume.mjs)
- [`resume-publish.mjs`](/d:/UGit/zgx197.github.io/scripts/resume-publish.mjs)

### 实现步骤 [已完成]

1. merge 支持读取 `parsed-candidate`
2. merge 支持读取 `field-candidates` 与 `field-candidate-validation-report`
3. merge 支持字段级 diff report
4. merge 增加默认 `safe` 模式
5. `resume:publish` 默认走新链路
6. 保留旧链路回退开关

### 当前阶段产物

阶段 5 现在的默认 merge 输入已经不再只依赖旧的 `*.resume-source.json`，而是会联合消费：

- `*.parsed-candidate.json`
- `*.candidate-validation-report.json`
- `*.field-candidates.json`
- `*.field-candidate-validation-report.json`

当前 safe merge 行为：

- candidate validation 有 `error` 时整体阻断
- field candidate validation 有 `error` 时整体阻断
- merge 默认读取新链路产物构建项目集合，不再只消费旧 draft 中残缺的 3 个项目
- 对已存在项目只合并安全字段，保守保留高风险字段
- 对新项目允许以 imported draft 形式新增到正式 source
- 自动产出 `*.merge-report.json`
- 旧链路可通过 `--mode legacy` 或 `resume:publish --legacy-pipeline` 回退

### 高风险字段默认保守 [已落地]

safe merge 下默认保守处理：

- `profile.headline`
- `profile.summaryPoints`
- `profile.focusAreas`
- `profile.facts`
- 已存在项目的 `heroEyebrow`
- 已存在项目的 `showcase`
- 已存在 experience / project 的 `content.summary`，仅在原字段缺失时才允许直接顶入 summary 层

### 完成结果

截至 `2026-03-31`，阶段 5 已完成收口，验收结论如下：

- 已将 merge 改造成新链路默认消费入口：
  [`scripts/merge-imported-resume.mjs`](/d:/UGit/zgx197.github.io/scripts/merge-imported-resume.mjs)
- 已将一键发布脚本默认切换到新链路：
  [`scripts/resume-publish.mjs`](/d:/UGit/zgx197.github.io/scripts/resume-publish.mjs)
- safe merge 现在会基于 `parsed-candidate + field-candidates` 构建候选项目，而不是继续受旧 `resume-source.json` 中仅 `3` 个项目的限制
- merge report 已具备：
  `gate`、`preparation`、`summary`、`diff`、`skipped`
- safe merge 已保留旧链路回退开关：
  `merge-imported-resume.mjs --mode legacy`
  `resume-publish.mjs --legacy-pipeline`

已验证样本与结果：

- safe merge dry-run 成功路径：
  [`generated/resume-stage4-final/text-ai-success-rerun/张国鑫-U3D-202603-v2-text.merge-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-ai-success-rerun/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.merge-report.json)
  当前结果：构建 `7` 个候选项目，`4` 个匹配已有 slug，`3` 个作为新项目草稿加入 merge diff
- safe merge AI 失败回退路径：
  [`generated/resume-stage4-final/text-ai-failure/张国鑫-U3D-202603-v2-text.merge-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-ai-failure/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.merge-report.json)
  当前结果：在 field AI warning 存在时仍能完成 safe merge dry-run，构建 `7` 个候选项目，`2` 个匹配已有 slug，`5` 个以新项目草稿进入 diff
- legacy merge 回退路径：
  [`generated/resume-stage4-final/text-no-ai/张国鑫-U3D-202603-v2-text.merge-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage4-final/text-no-ai/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2-text.merge-report.json)
  当前结果：仍可回退到旧 draft merge，仅消费原有 `3` 个项目，不会触发新链路门禁
- safe merge 写入路径已在临时 target 上验证通过：
  [`generated/resume-stage5-final.resume-source.merge-test.ts`](/d:/UGit/zgx197.github.io/generated/resume-stage5-final.resume-source.merge-test.ts)
- 临时 target schema 校验通过：
  `node scripts/validate-resume-schema.mjs --source generated/resume-stage5-final.resume-source.merge-test.ts`
  当前结果：`0 error / 0 warning`
- 新链路一键发布 dry-run 已验证通过：
  [`generated/resume-stage5-publish-dryrun/merge-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage5-publish-dryrun/merge-report.json)
- 旧链路一键发布 dry-run 已验证通过：
  [`generated/resume-stage5-publish-legacy-dryrun/张国鑫-U3D-202603-v2.extracted.merge-report.json`](/d:/UGit/zgx197.github.io/generated/resume-stage5-publish-legacy-dryrun/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2.extracted.merge-report.json)
- 当前仓库 build 已验证通过：
  `npm run build`

### 评估门槛 [已通过]

- merge 行为已可解释，且有字段级 diff report
- 新链路项目不会再被旧 `resume-source.json` 的残缺项目集截断
- safe merge 已显式降低正式数据污染风险
- `resume:publish` 已默认切到新链路，同时保留 legacy fallback
- 当前仓库 schema 校验与站点 build 均已通过

## 详细任务顺序

后续实际实现建议按下面顺序推进，不要跳步：

1. 完成阶段 0 基线
2. 完成 `candidate-schema.ts`
3. 完成 `line-tokenize.ts`
4. 完成 `section-segmentation.ts`
5. 完成 `experience-segmentation.ts`
6. 完成 `assemble-candidate.ts`
7. 导入脚本支持 `--emit-candidate`
8. 完成 `chat-client.ts`
9. 完成 `ai/structural-parser.ts`
10. 接入 `--use-ai-structure`
11. 完成 `validate-parsed-candidate.mjs`
12. 完成 `structure-report.json`
13. 完成 `ai/summarizer.ts`
14. 完成 `ai/matcher.ts`
15. 改造 `merge-imported-resume.mjs`
16. 改造 `resume-publish.mjs`

## 每次测试和评估的节奏

后续执行不要按“全部做完再看结果”，而是按下面节奏推进：

### 节奏 A：每完成 1 个基础模块就做单测式验证

适用对象：

- token 化
- section segmentation
- experience segmentation
- provider-config
- chat-client

验证方式：

- 打印结构输出
- 对固定样本做快照

### 节奏 B：每完成 2 到 3 个连续步骤就做阶段集成测试

适用对象：

- candidate 组装
- AI 结构识别
- candidate validation

验证方式：

- 对基线 PDF 跑完整候选链路
- 对比与旧链路的差异

### 节奏 C：每完成一个大阶段就做人工评估

人工评估要回答的问题：

1. 最新 PDF 的结构识别是不是比之前更准
2. 多项目经历是不是已经正确拆出来
3. 报告是不是能指出问题
4. 当前阶段是否值得进入下一阶段

如果答案是否定的，就停在当前阶段修正，不继续向下推进。

## 阶段通过标准

后续每个阶段结束时，用下面的“通过 / 不通过”机制判断是否继续：

### 阶段 1 通过标准

- candidate 输出完整
- experience 切分稳定
- 不影响现有正式链路

### 阶段 2 通过标准

- 多项目经历拆分质量明显提升
- AI 输出稳定可解析
- 失败时可回退到规则层

### 阶段 3 通过标准

- 结构错误能在候选阶段暴露
- 报告足够支持人工判断

### 阶段 4 通过标准

- 字段候选质量优于旧链路
- 没有明显增加噪音

### 阶段 5 通过标准

- merge 行为可解释
- 正式数据污染风险显著下降
- 本地网页结果可信

## 本轮实现时不该优先改的部分

以下部分在解析重构完成前，不应作为优先项：

- [`src/pages/resume.astro`](/d:/UGit/zgx197.github.io/src/pages/resume.astro)
- [`src/pages/projects/[slug].astro`](/d:/UGit/zgx197.github.io/src/pages/projects/[slug].astro)
- [`src/pages/about.astro`](/d:/UGit/zgx197.github.io/src/pages/about.astro)

原因：

- 当前瓶颈不在页面层
- 页面改动会干扰我们判断解析结果是否真的改善

## 第一批立即执行项

如果现在开始干活，建议只做下面 4 件事：

1. 建立阶段 0 基线
2. 完成 `parsed-candidate@v1` 类型
3. 完成 token 化和 section segmentation
4. 让导入脚本能输出 `parsed-candidate.json`

为什么先做这 4 件：

- 它们不依赖 AI 完整接入
- 对现有正式链路影响最小
- 但能立刻把“结构层”从旧链路中剥离出来

## 最终验收标准

当下面这些条件同时成立时，说明这条解析重构链路已经进入可用状态：

- 新 PDF 能稳定输出 `parsed-candidate.json`
- 多项目经历能正确拆分
- AI 只做候选增强，没有绕过校验和 merge
- 语义异常能在候选阶段被报告出来
- merge 不再直接污染正式 source
- 本地网页内容大体可信，只需要少量人工收尾

## 当前建议

后续就按本文档执行，不再继续扩张方案范围。

当前状态：

1. 阶段 0 已完成，基线已冻结。
2. 阶段 1 已完成，`parsed-candidate@v1` 已可稳定输出。
3. 阶段 2 已完成，AI 结构识别链路已完成成功路径、失败路径和双入口验收。
4. 阶段 3 已完成，候选校验与阶段报告已进入可复用状态。
5. 阶段 4 已完成，字段候选层与字段候选 validation 已完成双入口、成功路径和失败路径验收。
6. 阶段 5 已完成，safe merge / legacy fallback / publish dry-run / schema 校验 / build 已完成验收。

当前只继续做：

1. 后续重点从“搭链路”转向“补内容”，即基于 merge report 做人工精修、override 收口和新项目素材补全。
2. 解析链路本身已经完成阶段 0 到阶段 5 收口，除非出现新样本回归，否则不再扩张解析侧范围。
3. 页面层仍然不是主改造面，后续优先做数据精修、项目素材和必要的内容校对。

阶段 0 到阶段 5 已全部完成。当前这条解析重构链路已经进入可用状态，后续以迭代内容质量为主，不再回头做流程层大改。








