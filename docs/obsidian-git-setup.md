# Obsidian Git 配置指南

## 1. 开启社区插件市场

1. 打开 Obsidian 设置（左下角齿轮图标）
2. 点击 **第三方插件（Community plugins）**
3. 关闭 **安全模式（Safe mode）**（切换开关）
4. 点击 **浏览（Browse）** 打开社区插件市场

> ⚠️ 如果看不到"第三方插件"选项，需要先关闭安全模式

## 2. 安装 Obsidian Git

1. 在搜索框输入 `Git`
2. 找到 **Obsidian Git**（作者：Denis Olehov，下载量最高的那个）
3. 点击 **安装（Install）**
4. 安装完成后点击 **启用（Enable）**

## 3. 配置 Obsidian Git

### 基础设置

进入 Obsidian Git 设置页面：

- **自动备份间隔**：建议设置为 `0`（手动提交）或 `30` 分钟
- **提交信息模板**：`vault backup: {{date}}`
- **显示状态栏图标**：开启（方便查看 Git 状态）

### 身份配置（首次使用）

在命令行配置 Git 用户名和邮箱（只需一次）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

## 4. 使用方式

### 推荐：直接用 Obsidian 打开博客仓库

1. 在 Obsidian 中选择「打开文件夹作为仓库」
2. 选择 `D:\UGit\zgx197.github.io` 目录
3. 在 `src/content/blog/` 下创建/编辑文章

### 常用命令（Ctrl+P 打开命令面板）

| 命令 | 作用 |
|------|------|
| `Obsidian Git: Commit all changes` | 提交所有更改 |
| `Obsidian Git: Push` | 推送到远程 |
| `Obsidian Git: Pull` | 拉取远程更新 |
| `Obsidian Git: Create backup` | 一键备份（提交+推送） |

### 添加快捷键（推荐）

1. 设置 → 快捷键
2. 搜索 `Obsidian Git`
3. 设置快捷键：
   - `Create backup` → `Ctrl+Shift+S`（保存并推送）

## 5. 文章模板

安装 **Templater** 插件后，创建模板文件：

```markdown
---
title: "<% tp.file.title %>"
description: ""
date: <% tp.date.now("YYYY-MM-DD") %>
tags: []
status: published
---

```

## 6. 完整工作流

```
1. Obsidian 打开博客仓库
2. 在 src/content/blog/ 下新建文章
3. 使用模板填充 frontmatter
4. 写作...
5. Ctrl+Shift+S 一键提交并推送
6. GitHub Actions 自动构建部署（约 1-2 分钟）
7. 访问 https://zgx197.github.io 查看
```

## 常见问题

**Q: 提示 "git not found"**
- 确保已安装 Git：https://git-scm.com/download/win
- 安装时选择 "Add to PATH"

**Q: 推送时要求输入密码**
- 使用 GitHub Token 或配置 SSH 密钥
- 或在命令行先推送一次，保存凭证

**Q: 如何查看提交历史？**
- 使用 `Obsidian Git: Open diff view` 查看更改
- 或在外部 Git 客户端查看
