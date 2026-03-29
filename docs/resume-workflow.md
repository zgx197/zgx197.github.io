# 简历站点工作流

## 核心命令

### 1. 从文本导入简历草稿

```bash
npm run import:resume:text -- <你的简历文本文件>
```

### 2. 从 PDF 导入简历草稿

```bash
npm run import:resume:pdf -- "张国鑫-U3D-202507.pdf"
```

### 2.5 一键执行导入到构建

```bash
npm run resume:publish -- "张国鑫-U3D-202507.pdf"
```

这条命令会自动执行：导入 -> 合并写入正式数据 -> schema 校验 -> 站点构建。

需要注意：它不会自动提交或推送 GitHub，适合先本地生成并检查页面效果。

### 3. 校验正式简历数据

```bash
npm run validate:resume
```

### 4. 预览导入结果与正式数据的合并结果

```bash
npm run merge:resume
```

默认是 dry-run，不会真正覆盖正式数据。

### 5. 真正写入正式数据

```bash
npm run merge:resume -- --write
```

### 6. 本地预览网站

```bash
npm run dev
```

### 7. 构建静态站点

```bash
npm run build
```

## 关键目录说明

### `src/data/`

这里是正式数据层与转换层。

- `resume-source.ts`
  正式简历数据源，是导入与人工整理后的基础数据。
- `resume-overrides.ts`
  人工修订层，优先级高于正式数据源。
- `resume-transform.ts`
  把正式数据、override、项目素材一起整合成前端可直接消费的数据结构。
- `resume-validation.ts`
  负责正式数据校验。
- `project-assets.ts`
  负责读取项目素材目录。

### `generated/resume-import/`

这里是导入阶段生成的中间文件。

- `*.extracted.txt`
  PDF 抽取出的原始文本。
- `*.normalized.txt`
  清洗后的文本。
- `*.draft.json`
  导入草稿，保留更多中间信息和 `importMeta`。
- `*.resume-source.json`
  可用于合并的正式结构草稿。
- `*.report.json`
  导入报告，包含 warning、缺失字段和待人工检查项。

### `public/project-assets/`

这里是项目素材目录。
仓库里已经自带一个可运行样例：`public/project-assets/sceneblueprint/`，可以直接作为后续补真实截图和录屏时的参考模板。


约定结构如下：

```text
public/project-assets/
  <project-slug>/
    manifest.json
    cover.png
    remote-video.url
    gallery-1.png
    gallery-2.png
```

其中 `manifest.json` 用于声明素材。当前图片、视频都支持本地路径或外链，视频还支持 `embed` 类型，例如 Bilibili 页面链接：

```json
{
  "featured": {
    "kind": "image",
    "title": "主展示图",
    "src": "cover.png",
    "alt": "项目主展示图"
  },
  "gallery": [
    {
      "kind": "image",
      "title": "界面截图",
      "src": "gallery-1.png",
      "description": "核心系统界面"
    },
    {
      "kind": "video",
      "title": "演示视频",
      "src": "https://cdn.example.com/demo.mp4",
      "poster": "cover.png",
      "description": "关键流程录屏",
      "external": true
    },
    {
      "kind": "embed",
      "title": "Bilibili 演示",
      "src": "https://www.bilibili.com/video/BV1xx411c7mD/",
      "description": "也可以直接放外部嵌入页链接"
    }
  ],
  "resources": [
    {
      "label": "外部演示",
      "href": "https://example.com/demo",
      "external": true
    }
  ],
  "note": "如果当前还没有正式素材，可以先不创建 manifest。"
}
```

## 推荐编辑顺序

建议按这个顺序工作：

1. 先导入 PDF / 文本生成草稿。
2. 先看 `generated/resume-import/*.report.json`，确认有哪些字段需要人工补。
3. 用 `npm run merge:resume` 先做 dry-run。
4. 需要保留的人工润色内容，优先写到 `resume-overrides.ts`。
5. 确认无误后再执行 `npm run merge:resume -- --write`。
6. 如果项目需要补图片 / 视频，把素材放到 `public/project-assets/<slug>/`。
7. 最后运行 `npm run validate:resume` 和 `npm run build`。

## 当前分层原则

当前这套框架遵循以下优先级：

`导入草稿 < 正式数据源 < 人工 override`

也就是说：

- 导入器负责“把简历变成结构”。
- `resume-source.ts` 负责“沉淀正式内容”。
- `resume-overrides.ts` 负责“保留人工打磨过的最终表达”。

这样后续重复导入时，已经整理过的内容不会轻易被覆盖。










