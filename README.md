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

## 使用 Obsidian 写作（推荐）

### 1. 用 Obsidian 打开博客仓库

1. Obsidian → 「打开文件夹作为仓库」
2. 选择 `D:\UGit\zgx197.github.io`
3. 左侧文件树只显示 `src/content/blog/`（其他目录已排除）

### 2. 创建新文章

在 `src/content/blog/` 下新建 Markdown 文件：

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

### 3. 提交并发布

**方法：使用 Obsidian Git 插件**

1. 安装并启用 **Obsidian Git** 插件
2. `Ctrl+P` 打开命令面板
3. 输入 `commit and sync` → 选择 **Obsidian Git: Commit and Sync**
4. 等待底部状态栏显示完成
5. 1-2 分钟后，博客自动更新

> ⚠️ 注意：快捷键绑定可能有问题，建议使用命令面板操作。

**或者：使用命令行**

```bash
cd D:\UGit\zgx197.github.io
git add .
git commit -m "添加新文章"
git push
```

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
├── docs/                  # 文档
│   └── obsidian-git-setup.md  # Obsidian Git 详细配置
├── astro.config.mjs       # Astro 配置
└── package.json
```

## 详细文档

- [Obsidian Git 配置指南](docs/obsidian-git-setup.md)

## License

- 代码：MIT License
- 文章：保留原作者版权
