# zgx197.github.io

个人知识博客，使用 [Astro](https://astro.build/) 构建，部署于 [GitHub Pages](https://pages.github.com/)。

🔗 **在线地址**: https://zgx197.github.io

## 技术栈

- [Astro](https://astro.build/) - 静态站点生成器
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Pagefind](https://pagefind.app/) - 静态搜索
- [GitHub Pages](https://pages.github.com/) - 托管和部署
- [GitHub Actions](https://github.com/features/actions) - CI/CD 自动化

## 文章来源

博客文章自动同步自 [KnowledgeSystem](https://github.com/zgx197/KnowledgeSystem)。

写作流程：
1. 在 Obsidian 的 `notes/blog/` 目录写作
2. 提交到 KnowledgeSystem 仓库
3. GitHub Actions 自动同步到本仓库
4. 自动构建并部署到 GitHub Pages

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 部署配置
├── public/                 # 静态资源
├── src/
│   ├── components/         # Astro 组件
│   ├── content/
│   │   └── blog/          # 博客文章（从 KnowledgeSystem 同步）
│   ├── layouts/           # 页面布局
│   └── pages/             # 页面路由
├── astro.config.mjs       # Astro 配置
├── tailwind.config.mjs    # Tailwind 配置
└── package.json
```

## 部署

推送到 `main` 分支自动触发 GitHub Actions 部署到 GitHub Pages。

部署状态：[![Deploy to GitHub Pages](https://github.com/zgx197/zgx197.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/zgx197/zgx197.github.io/actions/workflows/deploy.yml)

## 配置说明

### 站点配置

编辑 `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://zgx197.github.io',
  base: '/',
  // ...
});
```

### 文章格式

文章位于 `src/content/blog/`，支持 Markdown 和 MDX 格式。

Frontmatter 示例：

```yaml
---
title: "文章标题"
description: "文章描述"
pubDate: 2024-01-15
updatedDate: 2024-01-16
heroImage: "/blog-placeholder-1.jpg"
tags: ["标签1", "标签2"]
---

文章内容...
```

## 搜索功能

使用 Pagefind 实现站内搜索，构建时自动生成搜索索引。

搜索页面：`/search`

## License

- 代码：MIT License
- 文章：保留原作者版权
