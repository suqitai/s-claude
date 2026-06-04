# Claude 使用说明书 — 项目规范 v1.0

**作者**: Claude Code + Attune Workflow
**日期**: 2026-06-04
**状态**: Draft → 待审批
**输入**: docs/project-brief.md

---

## 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-06-04 | 初始规范，覆盖全部 5 个页面 |

---

## 1. 概述

### 1.1 目的
构建一套**渐进式、多维度**的 Claude Code 中文使用说明书体系。从「5 分钟入门」到「自定义插件开发」，让不同水平的开发者都能找到适合的阅读路径。

### 1.2 范围

| IN | OUT |
|----|-----|
| 门户导航页 `index.html` | 视频教程 |
| 快速入门指南 `quick-start.html` | 后端 API 服务 |
| 工作流实战指南 `workflow-guide.html` | 英文版本 |
| 插件开发指南 `plugin-dev.html` | 移动端 App |
| 技能手册增强 `skills-manual.html` | PDF 导出 |
| 统一样式表 `assets/style.css` | 用户评论系统 |

### 1.3 干系人

| 角色 | 需求 |
|------|------|
| 🆕 Claude Code 新手 | 快速上手、理解核心概念 |
| 🛠️ 日常用户 | 技能速查、工作流参考 |
| 🚀 高级用户 | 自定义技能/插件开发 |
| 👑 团队管理者 | 配置策略、权限管控 |

---

## 2. 功能需求

---

### FR-001: 门户导航页 (index.html)

**描述**: 项目首页，提供美观的导航卡片引导用户进入对应手册。顶部 Hero 区域展示项目定位，下方用卡片矩阵引导到 4 份子页面。

**视觉布局**:
```
┌──────────────────────────────────────┐
│         🦾 Claude Code 使用说明书      │
│      为中文开发者准备的完全指南         │
│    [🚀 快速入门] [📋 技能速查]         │
├──────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐    │
│ │🚀 5分钟│ │📋 技能 │ │🔧 工作流│    │
│ │ 入门   │ │ 手册   │ │ 实战   │    │
│ └────────┘ └────────┘ └────────┘    │
│ ┌────────┐ ┌────────┐               │
│ │🧩 插件 │ │📊 关于 │               │
│ │ 开发   │ │ 本项目 │               │
│ └────────┘ └────────┘               │
├──────────────────────────────────────┤
│  阅读路径: 🆕新手 → 🛠️日常 → 🚀进阶  │
└──────────────────────────────────────┘
```

**验收标准**:
- [ ] Given 用户在浏览器打开 index.html，when 页面加载完成，then 看到 Hero 标题、副标题、4 张导航卡片
- [ ] Given 门户页，when 用户点击任意导航卡片，then 跳转到对应子页面
- [ ] Given 门户页，when 在移动端打开，then 卡片自动适配为单列布局
- [ ] Given 门户页，when 页面加载，then Hero 区域有渐入动画
- [ ] Given 门户页，when 用户滚动页面，then 看到「阅读路径」推荐区域（新手→日常→进阶）

**优先级**: High
**依赖**: FR-005 (共享样式)
**预估工作量**: M

---

### FR-002: 5 分钟快速入门 (quick-start.html)

**描述**: 面向零基础用户，5 分钟内完成从安装到首次有效对话的全流程引导。

**内容大纲**:
```
1. 安装 Claude Code (2 分钟)
   - macOS: brew install claude-code
   - 其他: npm install -g @anthropic-ai/claude-code
   - 登录: claude login
   - 截图式终端命令展示

2. 第一次对话 (1 分钟)
   - 启动: 在终端输入 claude
   - 试试看: "帮我创建一个 Python 计算器"
   - 实时输出预览

3. 理解三个核心概念 (1 分钟)
   - 会话 (Session): 一次对话的上下文
   - 工具 (Tools): Read/Write/Bash 等
   - 权限 (Permissions): Claude 需要你同意的操作

4. 最常用的 5 个命令 (1 分钟)
   - /help /clear /model /cost /diff
   - 每个命令一行解释 + 示例
```

**验收标准**:
- [ ] Given 新手用户，when 按页面顺序阅读，then 能在 5 分钟内完成首次 `claude` 对话
- [ ] Given 快速入门页，when 用户看安装步骤，then 每个代码块带有「一键复制」按钮
- [ ] Given 快速入门页，when 用户阅读核心概念，then 配有图解（ASCII art 或 CSS 绘制）
- [ ] Given 快速入门页末尾，when 用户完成阅读，then 有明确的「下一步：查看技能手册」引导链接
- [ ] Given 代码块，when 用户悬停，then 显示复制按钮

**优先级**: High
**依赖**: FR-005
**预估工作量**: M

---

### FR-003: 工作流实战指南 (workflow-guide.html)

**描述**: 展示 3 个完整的端到端开发工作流，覆盖 attune 全周期、spec-kit 规范驱动、日常开发循环。

**3 个实战工作流**:

#### 工作流 1: Attune 全周期开发
```
/brainstorm → /specify → /blueprint → /execute
场景: 从零构建一个 CLI 工具
每个阶段: 输入示例 + 输出截图 + 阶段目标说明
```

#### 工作流 2: Spec-Kit 规范驱动
```
/speckit-specify → /speckit-plan → /speckit-tasks → /speckit-implement
场景: 为已有项目添加「用户认证」功能
```

#### 工作流 3: 日常开发循环
```
写代码 → /code-review → /simplify → /verify → 提交
场景: 开发一个功能 + 质量检查
```

**验收标准**:
- [ ] Given 工作流指南，when 用户阅读，then 看到 3 个完整的端到端示例
- [ ] Given 每个工作流，when 展示步骤，then 包含：命令→输入→输出→说明 四要素
- [ ] Given 工作流步骤，when 涉及多个阶段，then 用流程图 CSS 可视化展示阶段流转
- [ ] Given 工作流页面，when 用户想做但没装对应插件，then 看到安装提示
- [ ] Given 每个工作流末尾，when 完成阅读，then 有「实际试试」的建议练习

**优先级**: High
**依赖**: FR-005, quick-start.html (作为前置阅读)
**预估工作量**: L

---

### FR-004: 插件开发指南 (plugin-dev.html)

**描述**: 从零开始教用户创建自定义 Skill、Hook、Command，并打包为 Plugin 发布。

**内容大纲**:
```
Part 1: 自定义技能 (Skill)
  - SKILL.md 完整结构拆解
  - Hello World 技能: 从创建到使用
  - 渐进式加载策略
  - allowed-tools / disallowed-tools 安全模型

Part 2: 自定义 Hook
  - Hook 类型一览 (PreToolUse / PostToolUse / SessionStart...)
  - 实战: 提交前自动运行测试
  - 实战: 编辑文件后自动格式化

Part 3: 自定义 Command
  - Command vs Skill 的区别
  - 创建 /deploy 命令的完整示例

Part 4: 打包为 Plugin
  - 目录结构规范
  - marketplace.json 编写
  - 发布到 GitHub 市场
```

**验收标准**:
- [ ] Given 插件开发指南，when 用户按 Part 1 操作，then 能创建并运行一个 Hello World 技能
- [ ] Given Hook 章节，when 展示示例，then 每个 Hook 包含：触发条件→执行命令→效果说明
- [ ] Given 代码示例，when 用户复制粘贴，then 代码可直接运行（路径用占位符标注）
- [ ] Given 打包章节，when 用户完成阅读，then 知道如何发布自己的插件到社区市场
- [ ] Given 整个指南，when 用户阅读完成，then 所有示例代码总量 < 200 行

**优先级**: Medium
**依赖**: FR-005, skills-manual.html (作为前置参考)
**预估工作量**: L

---

### FR-005: 统一样式表 (assets/style.css)

**描述**: 从现有 skills-manual.html 中提取 CSS 变量和通用样式，创建被所有页面共享的基础样式表。

**提取范围**:
```
assets/style.css 应包含:
✅ CSS 变量 (:root)
✅ Reset/Normalize
✅ 排版 (h1-h4, p, code, kbd)
✅ 侧边栏 (.sidebar)
✅ 卡片 (.card, .cards)
✅ 表格 (.cmd-table-wrap, table)
✅ 信息框 (.info-box)
✅ 标签 (.tag-*)
✅ 架构图 (.arch-diagram)
✅ 响应式断点 (@media)
✅ 打印样式 (@media print)
```

**验收标准**:
- [ ] Given style.css，when 被任意子页面引用，then 与该页面内联样式无冲突
- [ ] Given style.css，when 从 skills-manual.html 提取后，then skills-manual.html 内联样式减少 ≥ 70%
- [ ] Given style.css，when 页面加载，then 所有 CSS 变量可在子页面按需覆盖
- [ ] Given 任何新页面，when 引用 style.css，then 无需额外样式即可获得统一外观

**优先级**: High (阻塞所有页面)
**依赖**: 无
**预估工作量**: M

---

### FR-006: 技能手册增强 (skills-manual.html)

**描述**: 在现有手册基础上增加客户端搜索功能和分类筛选。

**增强内容**:
```
1. 搜索栏 (新增)
   - 位置: 页面顶部，Hero 区域下方
   - 功能: 实时过滤命令/技能名称和描述
   - 实现: 纯 JS，监听 input 事件，遍历表格行

2. 分类筛选 (新增)
   - 位置: 搜索栏旁
   - 选项: 全部 / 会话 / 配置 / 项目 / 诊断 / 扩展 / 技能
   - 交互: 点击标签筛选，支持与搜索组合

3. 回到顶部按钮 (已有 → 保留)
```

**验收标准**:
- [ ] Given 搜索框，when 输入 "clear"，then 页面实时只显示包含 "clear" 的行/卡片
- [ ] Given 搜索框为空，when 点击分类标签 "配置"，then 只显示配置类命令
- [ ] Given 搜索 "model" + 分类 "配置"，when 两者同时生效，then 只显示配置类中包含 model 的结果
- [ ] Given 搜索无结果，when 列表为空，then 显示 "未找到匹配结果" 提示
- [ ] Given 搜索框，when 按 Esc，then 清空搜索、恢复全部显示

**优先级**: Medium
**依赖**: FR-005
**预估工作量**: S

---

## 3. 非功能需求

### NFR-001: 性能
- 所有页面首次加载 < 1 秒（纯静态，无网络请求）
- 搜索过滤响应 < 50ms（DOM 操作，无框架开销）
- 页面大小: 每页 < 80KB（含内联样式）

### NFR-002: 兼容性
- 浏览器: Chrome 90+, Safari 15+, Firefox 90+, Edge 90+
- 分辨率: 320px ~ 4K
- 操作系统: macOS / Windows / Linux

### NFR-003: 可维护性
- CSS 变量驱动主题，修改色值一处生效
- HTML 结构语义化（`<section>`, `<article>`, `<nav>`）
- 代码注释率 > 20%

### NFR-004: 可用性
- 所有链接可键盘导航（Tab 键）
- 色彩对比度满足 WCAG AA
- 代码块等宽字体，最小字号 13px

### NFR-005: 零依赖
- 不引用任何外部 CSS/JS 库
- 不发起任何网络请求
- 字体使用系统原生栈

---

## 4. 技术约束

| 约束 | 详情 |
|------|------|
| **语言** | HTML5 + CSS3 + 原生 JS (ES6+) |
| **样式** | CSS 自定义属性 (`--*`)，BEM 命名 |
| **布局** | Flexbox + CSS Grid |
| **图标** | Emoji（零依赖） |
| **字体** | `-apple-system, BlinkMacSystemFont, "Noto Sans SC", "PingFang SC", ...` |
| **存储** | 无需 localStorage/cookie |
| **分发** | 文件夹打包，浏览器直接打开 |

---

## 5. 页面间导航关系

```
index.html (门户)
  ├─→ quick-start.html (新手)
  │     └─→ skills-manual.html (深入)
  ├─→ skills-manual.html (速查)
  │     └─→ plugin-dev.html (进阶)
  ├─→ workflow-guide.html (实战)
  │     └─→ plugin-dev.html (定制)
  └─→ plugin-dev.html (专家)
```

每个子页面顶部有统一的面包屑导航栏：
```
🏠 首页 > 📋 技能手册
```

---

## 6. 排除范围 (显式声明)

| 排除项 | 理由 |
|--------|------|
| 视频/GIF 教程 | 制作成本高，静态页面不适合 |
| 暗色模式切换 | Phase 2，当前暖色主题已适配 |
| 多语言 (i18n) | 目标明确为中文开发者 |
| PDF 生成 | 浏览器「打印→保存为 PDF」已满足 |
| 评论区/反馈表单 | 保持纯静态 |
| 版本对照 (v1/v2) | 维护成本高，跟随最新版 |
| 性能测试数据 | 非功能性项目 |

---

## 7. 成功指标

| # | 指标 | 验证方式 |
|---|------|----------|
| 1 | 新手 5 分钟内完成首次对话 | 按 quick-start 步骤操作计时 |
| 2 | 50+ 命令 3 秒内查找到 | 使用搜索功能计时 |
| 3 | 3 个完整工作流示例 | 计数 workflow-guide 中的工作流 |
| 4 | 插件开发示例可直接运行 | 按 plugin-dev 步骤操作验证 |
| 5 | 视觉质量 ≥ 现有手册 | 并排对比评审 |

---

## 8. 术语表

| 术语 | 说明 |
|------|------|
| Skill | 技能 — Claude Code 的可扩展能力单元 |
| Hook | 钩子 — 在特定事件前后自动执行的脚本 |
| Plugin | 插件 — Skill + Hook + Command 的打包分发单元 |
| Marketplace | 市场 — 插件托管仓库 |
| MCP | Model Context Protocol — 模型上下文协议 |
| Worktree | 工作树 — Git 隔离开发环境 |

---

## 9. 参考资料

- 项目简报: `docs/project-brief.md`
- 现有手册: `Claude_Code_Skills_Manual.html`
- 官方文档: https://code.claude.com/docs
- Agent Skills 规范: https://agentskills.io
- 官方插件仓库: https://github.com/anthropics/skills
