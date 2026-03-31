# 简历自动发布优化方向记录

## 文档目的

本文档不替代 [`resume-parser-optimization-plan.md`](/d:/UGit/zgx197.github.io/docs/resume-parser-optimization-plan.md)。

它的作用只有两个：

- 记录阶段 5 之后，如何继续把流程从“安全 merge”推进到“尽量自动发布”
- 明确当前最近一步不是继续扩流程，而是先把当前 PDF 解析上站，观察真实效果，再决定下一轮自动化优化重点

## 当前阶段结论

截至 `2026-03-31`，阶段 0 到阶段 5 已完成。

当前链路已经具备：

- `PDF / TXT -> parsed-candidate -> candidate-validation -> field-candidates -> field-candidate-validation -> safe merge -> schema validate -> build`
- `safe merge` 默认消费新链路产物，而不是只依赖旧的 `resume-source.json`
- `resume:publish` 已支持新链路默认执行和 legacy fallback

这意味着当前问题已经不再是“链路能不能跑通”，而是：

- 如何减少后续人工精修量
- 如何让字段质量更接近可直接发布
- 如何让 merge 在更多情况下自动提升到可发布质量，而不是停在 imported draft

## 核心判断

如果目标是“尽量不要人工精修”，下一步不应该再围绕手工 `override` 做流程设计，而应该新增一层：

`自动生成 -> 自动校验 -> 自动评审 -> 自动修复 -> 自动发布`

也就是说，后续优化重点不是“再写几条 merge 规则”，而是把当前的字段候选层继续推进成“可发布字段层”。

## 后续目标链路

建议将后续自动化方向收束为下面这条链路：

`原始简历 -> 结构候选 -> 候选校验 -> 字段候选 -> 字段校验 -> 可发布字段 -> 自动评审 -> 自动修复 -> 自动 merge -> 网页`

相比当前阶段 5，多出来的部分是：

- `可发布字段`
- `自动评审`
- `自动修复`
- `自动发布门禁`

## 建议新增阶段

## 阶段 6：自动收敛与可发布生成

### 目标

把当前 `field-candidates` 从“候选可看”推进到“尽量可直接发布”，减少人工精修频次。

### 核心原则

#### 1. 不是让 AI 直接写正式 source

AI 不能直接绕过 merge 和校验写入 [`resume-source.ts`](/d:/UGit/zgx197.github.io/src/data/resume-source.ts)。

#### 2. 自动发布必须经过双重门禁

至少要经过：

- 结构 / 字段校验
- 自动评审

#### 3. 自动化的重点是“收敛”而不是“自由发挥”

模型输出必须继续受 JSON schema、长度、字段数、去重和事实约束限制。

#### 4. 允许自动重试，不允许无证据补写

可以重试生成，但不能生成超出原始简历证据的新事实。

## 阶段 6 的 4 个子层

### A. Publishable Field Composer

职责：

- 基于 `parsed-candidate + field-candidates` 生成“可发布字段包”

建议新增产物：

- `*.publishable-fields.json`
- `*.publishable-fields-validation-report.json`

建议覆盖字段：

- `profile.headline`
- `profile.summaryPoints`
- `profile.focusAreas`
- `project.heroEyebrow`
- `project.cardMeta`
- `project.cardTags`
- `project.content.summary`
- `project.storySections` 的标准化版本

设计要求：

- 必须输出结构化 JSON
- 每个字段都有明确长度约束
- 必须有重复控制
- 必须有“禁止夸张 / 禁止脱离简历证据”的约束

### B. Auto Reviewer

职责：

- 对“可发布字段包”做自动审查

输入：

- `parsed-candidate.json`
- `candidate-validation-report.json`
- `field-candidates.json`
- `field-candidate-validation-report.json`
- `publishable-fields.json`

重点判断：

- 是否重复
- 是否空泛
- 是否过度营销
- 是否遗漏关键技术点
- 是否与原始简历事实不一致
- 是否和现有站内项目风格差异过大
- 是否字段长度不适合网页展示
- 是否 summary / highlights / section 之间重复度过高

输出建议：

- `*.auto-review-report.json`

### C. Auto Repair Loop

职责：

- 自动修复第一轮生成未通过 review 的字段

典型场景：

- `headline` 太泛
- `summaryPoints` 多条表达相似
- `project summary` 太像原文复制
- `storySections` 结构不统一
- 某些字段长度过长或过短

建议机制：

- 首轮生成
- Reviewer 打分 / 给出问题原因
- 按问题原因重试生成
- 最多重试 `2` 到 `3` 轮
- 仍不通过则回退到 safe merge，不自动 promote

### D. Auto Promote

职责：

- 当且仅当满足阈值时，允许自动写进正式 source

建议门槛：

- candidate validation `error = 0`
- field candidate validation `error = 0`
- publishable field validation `error = 0`
- auto review `rejected = false`
- diff 在允许范围内
- 未命中高风险回退规则

否则：

- 只产出 report
- 不自动写正式数据

## 哪些字段最值得优先自动化

### 第一优先级

- `profile.headline`
- `profile.summaryPoints`
- `project.content.summary`
- `project.cardTags`
- `project.cardMeta`

原因：

- 这些字段最影响页面第一观感
- 它们已经有较好的结构基础
- 它们的自动化收益高于风险

### 第二优先级

- `profile.focusAreas`
- `experience.content.summary`
- `experience.highlights`
- `project.storySections`

原因：

- 可以自动化
- 但需要更强的风格统一约束

### 第三优先级

- `project.heroEyebrow`
- `showcase` 区文案
- 项目页长文案风格统一

原因：

- 这些字段也能自动生成
- 但相对于前两层收益更低
- 容易显得“自动草稿味道太重”

## 哪些部分不适合强推全自动

下面这些内容不应该被当作“全自动一定能做好”的目标：

- 项目素材本身
  例如截图、流程图、录屏、展示图
- 原始简历中不存在的新事实
- 需要明确业务上下文才能成立的价值判断

结论：

- 事实抽取、结构整理、字段压缩、风格收敛：适合自动化
- 展示资产和新事实补充：不适合无约束自动化

## 建议新增工程文件

如果后续正式进入阶段 6，建议优先新增这些文件：

- `scripts/lib/resume-parser/publishable-fields.ts`
- `scripts/lib/resume-parser/publishable-fields-validation.ts`
- `scripts/lib/resume-parser/ai/publishable-composer.ts`
- `scripts/lib/resume-parser/ai/auto-reviewer.ts`
- `scripts/lib/resume-parser/ai/auto-repair.ts`
- `scripts/validate-publishable-fields.mjs`

建议新增产物：

- `*.publishable-fields.json`
- `*.publishable-fields-validation-report.json`
- `*.auto-review-report.json`
- `*.auto-repair-report.json`

## 后续评估指标

后续如果继续优化自动流程，建议用这些指标衡量是否真的在前进：

### 1. 自动可发布率

定义：

- 不需要人工修改即可通过 auto promote 的样本比例

### 2. 字段回退率

定义：

- 因为 review / validation 未通过而回退到 safe merge 的字段占比

### 3. 新项目自动上线率

定义：

- 新识别项目中，能够直接以可发布质量进入正式 source 的比例

### 4. 页面人工修正量

定义：

- 每次导入后，人工还需要改多少字段、多少项目、多少段文案

如果这些指标没有明显改善，就说明流程虽然更复杂，但没有真正减少人工成本。

## 当前最近一步的实际执行顺序

虽然长期方向是继续自动化，但最近一步不应该立刻进入阶段 6 开发。

当前建议顺序：

1. 使用当前链路解析 [`张国鑫-U3D-202603-v2.pdf`](/d:/UGit/zgx197.github.io/%E5%BC%A0%E5%9B%BD%E9%91%AB-U3D-202603-v2.pdf)
2. 将结果放到网站本地可查看状态
3. 观察：
   - 简历主页效果
   - 新项目是否上站
   - 已有项目页是否被正确关联
   - 文案是否已经达到“基本可发布”标准
4. 基于真实网页效果记录问题
5. 只做必要精修
6. 再决定阶段 6 优先从哪一类字段开始自动化

原因：

- 当前我们已经有一整条可运行链路
- 先看真实网页结果，能避免在抽象层继续过度设计
- 网页上的真实问题，才是下一轮自动化优化的最高优先级输入

## 当前结论

当前阶段不建议继续扩张大而全的新方案，而是明确区分：

- 近期动作：先把当前 PDF 解析上站，查看真实效果，做必要精修
- 中期动作：进入阶段 6，把字段候选推进到可发布字段层
- 长期目标：尽量把流程做成“自动生成 + 自动评审 + 自动修复 + 自动发布”

也就是说，后续不是放弃自动化，而是先拿当前样本的真实网页结果作为下一轮自动化设计输入。
