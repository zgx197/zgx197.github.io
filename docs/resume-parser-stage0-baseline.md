# 阶段 0 基线冻结 [已完成]

本文档对应 [`阶段 0：建立基线`](/d:/UGit/zgx197.github.io/docs/resume-parser-optimization-plan.md)，目标不是修解析，而是把“当前链路实际会产出什么、已经错在哪里”冻结为可复现证据。

## 产物位置

- 基线输出目录：[`generated/resume-baseline/stage0`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0)
- 样本清单：[`manifest.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/manifest.json)
- 哈希清单：[`hashes.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/hashes.json)
- 已知问题：[`known-issues.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/known-issues.json)
- 重跑脚本：[`scripts/rebuild-resume-stage0-baseline.ps1`](/d:/UGit/zgx197.github.io/scripts/rebuild-resume-stage0-baseline.ps1)

## 阶段 0 范围

阶段 0 只做 4 件事：

1. 固定样本。
2. 在隔离目录重跑现有链路。
3. 保存可对比产物与文件哈希。
4. 明确写出当前已知失败点。

明确不做：

- 不调整网页 UI。
- 不修改解析规则来“顺手修问题”。
- 不改 merge 策略。

## 固定样本

本轮固定 3 个样本：

1. `pdf-current`
   输入：[`张国鑫-U3D-202603-v2.pdf`](/d:/UGit/zgx197.github.io/张国鑫-U3D-202603-v2.pdf)
   目的：冻结当前真实 PDF 的端到端行为。
2. `text-current`
   输入：[`generated/resume-import/张国鑫-U3D-202603-v2.extracted.txt`](/d:/UGit/zgx197.github.io/generated/resume-import/张国鑫-U3D-202603-v2.extracted.txt)
   目的：隔离验证文本解析层。
3. `text-202507`
   输入：[`generated/resume-import/张国鑫-U3D-202507.extracted.txt`](/d:/UGit/zgx197.github.io/generated/resume-import/张国鑫-U3D-202507.extracted.txt)
   目的：保留一份历史文本样本做回归比较。

约束说明：

- 旧版 PDF 原件当前不在仓库里，所以历史样本只能使用已保留的 `extracted.txt`。
- 这不是理想状态，但它已经足够支撑阶段 0 的“固定对照样本”目标，且限制已被明确记录在 [`manifest.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/manifest.json)。

## 重跑方式

在仓库根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\rebuild-resume-stage0-baseline.ps1
```

脚本会重跑以下 3 条命令：

```powershell
python scripts/import-resume-pdf.py "张国鑫-U3D-202603-v2.pdf" --out-dir "generated/resume-baseline/stage0/pdf-current"
node scripts/import-resume-text.mjs "generated/resume-import/张国鑫-U3D-202603-v2.extracted.txt" --out-dir "generated/resume-baseline/stage0/text-current" --stem "张国鑫-U3D-202603-v2-text"
node scripts/import-resume-text.mjs "generated/resume-import/张国鑫-U3D-202507.extracted.txt" --out-dir "generated/resume-baseline/stage0/text-202507" --stem "张国鑫-U3D-202507-text"
```

脚本额外会自动刷新：

- [`manifest.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/manifest.json)
- [`hashes.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/hashes.json)
- [`known-issues.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/known-issues.json)

## 当前基线结论

### 结论 1：当前主问题在文本解析层，不在 PDF 与文本导入差异

`pdf-current` 与 `text-current` 的 [`resume-source.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/pdf-current/张国鑫-U3D-202603-v2.resume-source.json) 哈希一致，说明：

- 当前 202603 样本的主要问题不是 PDF 抽取与文本导入不一致。
- 问题主要集中在 `import-resume-text.mjs` 这一层的结构识别与字段提炼逻辑。

### 结论 2：最新经历结构切分失败

当前 202603 基线中：

- 共识别 `4` 段经历。
- 只识别 `3` 个项目。
- 最新经历 `北京畅聊天下科技有限公司 / Unity开发工程师 / 2025.07-至今` 没有任何 `relatedProjects`。

这意味着最新经历没有被拆成可审阅的项目级结构，而是退化成整段 summary。

### 结论 3：历史样本与当前样本行为差异明显

历史文本样本 `text-202507` 能识别 `5` 个项目，而当前 202603 样本只能识别 `3` 个项目。这说明：

- 旧逻辑对不同简历版本的鲁棒性不够。
- 我们后续必须把“结构切分”从直接产出正式字段的旧逻辑中剥离出来。

## 已冻结的已知问题

当前正式冻结的问题以 [`known-issues.json`](/d:/UGit/zgx197.github.io/generated/resume-baseline/stage0/known-issues.json) 为准，核心包括：

1. 最新经历未拆出项目。
2. 最新经历被压成超长 summary。
3. 当前 202603 样本会触发 `profile.strengths` 缺失告警。
4. 多个项目缺少 metrics 提取。
5. 历史基线暂时只能依赖保留的文本样本。

这些问题是后续阶段 1 到阶段 4 的客观对照，不允许“凭感觉说变好了”。

## 阶段 0 验收

当前阶段 0 已达到以下 5 条：

- 已固定样本，不再口头描述。
- 已在独立目录重跑现有链路。
- 已保存 `normalized.txt`、`draft.json`、`report.json`、`resume-source.json`、`resume-source.ts`。
- 已保存文件哈希，可严格比较后续输出变化。
- 已明确记录当前失败点和样本约束。

因此，阶段 0 在“建立基线”这一目标上已经闭环，可以作为后续阶段 1 的唯一对照基线。



