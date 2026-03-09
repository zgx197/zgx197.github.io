# Obsidian Git 配置指南

## 安装步骤

### 1. 开启社区插件市场

1. 打开 Obsidian 设置（左下角齿轮图标）
2. 点击 **第三方插件（Community plugins）**
3. 关闭 **安全模式（Safe mode）**（切换开关）
4. 点击 **浏览（Browse）** 打开社区插件市场

### 2. 安装 Obsidian Git

1. 在搜索框输入 `Git`
2. 找到 **Obsidian Git**（作者：Vinzent，下载量最高的那个）
3. 点击 **安装（Install）**
4. 安装完成后点击 **启用（Enable）**

### 3. 配置 Git 身份（首次使用）

在命令行执行（只需一次）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 4. 插件设置（可选）

进入 Obsidian Git 设置页面：

- **Auto backup interval**: `0`（关闭自动，手动提交）
- **Auto push**: 开启
- **Pull updates on startup**: 开启

建议全部手动控制，避免误提交。

---

## 使用方法

### 提交并推送（最常用）

1. 修改文章后保存
2. `Ctrl+P` 打开命令面板
3. 输入 `commit and sync`
4. 选择 **Obsidian Git: Commit and Sync**
5. 等待底部状态栏显示完成（Committing → Pushing）
6. 1-2 分钟后博客自动更新

> ⚠️ **注意**：插件命令名是 **Commit and Sync**，不是 Create backup。

### 其他命令

| 命令 | 作用 |
|------|------|
| `Obsidian Git: Commit and Sync` | 提交 + 推送（**最常用**） |
| `Obsidian Git: Commit` | 只提交，不推送 |
| `Obsidian Git: Push` | 推送之前提交的 |
| `Obsidian Git: Pull` | 拉取远程更新 |

---

## 常见问题

**Q: 提示 "git not found"**
- 确保已安装 Git：https://git-scm.com/download/win
- 安装时选择 "Add to PATH"

**Q: 提交失败 "user.name not set"**
- 先在命令行配置 Git 身份（见步骤 3）

**Q: 推送时要求输入密码**
- 使用 GitHub Token 或配置 SSH 密钥
- 或在命令行先推送一次，保存凭证

**Q: 快捷键绑定不生效**
- 部分版本快捷键绑定有问题
- 建议直接使用命令面板（`Ctrl+P`）操作

---

## 完整工作流

```
1. Obsidian 打开博客仓库
2. 在 src/content/blog/ 下新建/编辑文章
3. 使用模板填充 frontmatter
4. 写作...
5. Ctrl+P → commit and sync → 回车
6. 等待底部状态栏完成
7. 1-2 分钟后访问 https://zgx197.github.io 查看
```
