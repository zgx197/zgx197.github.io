# zgx197.github.io

**⚠️ 重要说明：本博客与 KnowledgeSystem 完全独立**

- **本博客** = 原创内容发布平台（自己写的文章）
  - 技术笔记、教程、思考
  - 手动添加到 `src/content/blog/`
  
- **KnowledgeSystem** = 待阅读内容管理（稍后读工具）
  - 收集想读的文章链接
  - 与博客内容无直接关联

**两者不互通，数据不共享。**

---

个人知识博客，使用 [Astro](https://astro.build/) 构建，部署于 [GitHub Pages](https://pages.github.com/)。

🔗 **在线地址**: https://zgx197.github.io

## 技术栈

- [Astro](https://astro.build/) - 静态站点生成器
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Pagefind](https://pagefind.app/) - 静态搜索
- [GitHub Pages](https://pages.github.com/) - 托管和部署
- [GitHub Actions](https://github.com/features/actions) - CI/CD 自动化

## 添加文章

将 Markdown 文件放入 `src/content/blog/` 目录：

```bash
src/content/blog/
├── hello-world.md
├── my-article.md
└── ...
```

文章格式：

```yaml
---
title: "文章标题"
description: "文章描述"
date: 2024-01-15
tags: ["标签1", "标签2"]
status: published
---

文章内容...
```

提交后 GitHub Actions 自动构建部署。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 部署配置
├── public/                 # 静态资源
├── src/
│   ├── content/
│   │   └── blog/          # 博客文章
│   └── pages/             # 页面路由
├── astro.config.mjs       # Astro 配置
└── package.json
```

## License

- 代码：MIT License
- 文章：保留原作者版权
