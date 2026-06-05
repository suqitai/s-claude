# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是 **Claude Code 完全使用说明书**——一套渐进式、多维度的中文使用手册体系。从「5 分钟入门」到「自定义插件开发」，覆盖 Claude Code 全部内置命令、技能、工作流和插件生态。

## 技术架构

- **纯静态 HTML/CSS/JS**，零依赖，双击即可在浏览器中使用
- 所有子页面共享 `assets/style.css` 统一样式表（CSS 变量驱动主题，暖色 Amber 色调）
- `assets/app.js` 提供共享交互逻辑（侧边栏、搜索、导航高亮等）
- 语言：简体中文，技术术语保留英文；代码块使用等宽字体

## 文件结构

```
Claude使用说明书/
├── index.html                       # 🏠 门户导航页（Hero + 导航卡片矩阵）
├── Claude_Code_Skills_Manual.html   # ⭐ 核心文件：70+ 命令完整手册，含可点击详情面板
├── guides/
│   ├── quick-start.html             # 🚀 5 分钟快速入门
│   ├── workflow-guide.html          # 🔧 attune/spec-kit 实战工作流
│   └── plugin-dev.html              # 🧩 自定义技能/插件开发指南
├── manuals/
│   └── skills-manual.html           # 📋 旧版技能手册（功能已集成到核心文件）
├── assets/
│   ├── style.css                    # 🎨 统一样式表（CSS 变量、侧边栏、卡片、表格）
│   └── app.js                       # ⚡ 共享 JS（导航、搜索、主题）
├── docs/
│   ├── project-brief.md             # 📝 项目简报（目标、约束、方案选择）
│   ├── specification.md             # 📐 功能规范（用户故事、验收标准）
│   └── implementation-plan.md       # 📋 实现计划（阶段、任务分解）
├── .agents/skills/                  # 🤖 Claude Code skill 定义（插件生态，自动加载）
└── .claude/
    ├── settings.json                # 项目级配置（启用插件：spec-kit, leyline, abstract）
    └── settings.local.json          # 本地敏感配置（不提交）
```

## 核心文件说明

**`Claude_Code_Skills_Manual.html`** 是本项目最重要、最复杂的文件：
- 包含 75 条命令的详细数据（COMMAND_DETAILS 对象），每条含语法、参数、示例、注意事项、相关命令
- 基于 SPA 模式的详情面板系统：点击表格/卡片中的命令名 → 右侧滑入详情页 → `← 返回` 或 `Esc` 关闭
- 侧边栏目录导航 + 滚动高亮
- 所有样式和逻辑内联在单文件中，不依赖外部资源

**`assets/style.css`** 是其他页面的共享样式表：
- CSS 变量定义在 `:root`，以 Amber 橙 (`--primary: #d97706`) 为主色调
- 提供 `.sidebar`、`.card`、`.cmd-table-wrap`、`.info-box`、`.arch-diagram` 等可复用组件样式
- 各子页面用 `<link rel="stylesheet" href="assets/style.css">` 引用，再在 `<style>` 中覆盖/扩展

## 开发约定

- **新增子页面**：引用 `assets/style.css`，遵循现有 CSS 变量体系；侧边栏结构参考 `index.html`
- **修改核心手册**：直接编辑 `Claude_Code_Skills_Manual.html`（单文件自包含，不引用外部 CSS）
- **新增命令详情**：在 `Claude_Code_Skills_Manual.html` 的 `CMD` 对象中添加条目，遵循现有数据结构模板
- **视觉一致性**：所有页面使用相同的侧边栏结构、卡片样式、配色变量

## 测试方式

纯静态项目，无需构建。直接在浏览器中打开对应 HTML 文件即可验证：
```bash
open Claude_Code_Skills_Manual.html   # macOS
```
或在任意浏览器中 `File → Open File`。移动端响应式测试使用浏览器 DevTools 设备模拟。

## 项目开发工作流

本项目自身使用 Claude Code + Attune 工作流开发：
1. `/attune:brainstorm` → 生成 project-brief.md
2. `/attune:specify` → 生成 specification.md
3. `/attune:blueprint` → 生成 implementation-plan.md
4. `/attune:execute` → 逐页构建

启用的插件（`.claude/settings.json`）：`spec-kit`、`leyline`、`abstract`（来自 claude-night-market 插件市场）。
