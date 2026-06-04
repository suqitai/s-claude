# Claude 使用说明书 — 实施计划 v1.0

**作者**: Claude Code + Attune Workflow
**日期**: 2026-06-04
**输入**: docs/specification.md
**团队**: 1 开发者 + AI 辅助

---

## 1. 系统架构

### 1.1 静态站点架构

```
                    ┌─────────────────────┐
                    │   assets/style.css  │ ← 共享样式 (CSS变量、组件样式)
                    └──────┬──────────────┘
                           │ <link> 引用
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌──────────┐    ┌─────────────┐    ┌─────────────┐
   │index.html│    │guides/      │    │manuals/     │
   │ 🏠 门户  │    │quick-start  │    │skills-manual│
   │          │    │workflow     │    │ (增强)      │
   │          │    │plugin-dev   │    │             │
   └──────────┘    └─────────────┘    └─────────────┘
         │               │                   │
         └───────┬───────┴───────────────────┘
                 │
                 ▼
         统一 UI 模式:
         ┌──────────────────────┐
         │ 左侧边栏 (260px)     │ 主内容区 (fluid)
         │ · Logo + 版本        │
         │ · 导航链接           │ · Hero/EAR 区
         │ · 返回首页           │ · 内容卡片/表格
         │                     │ · Footer
         └──────────────────────┘
                 │
                 ▼
         共享 JS 模式:
         · 搜索过滤 (debounce)
         · 滚动高亮导航
         · 回到顶部按钮
         · 代码复制按钮
```

### 1.2 CSS 架构

```
style.css
├── :root (CSS 变量—主题色)
├── Reset/Normalize
├── 排版 (h1-h4, p, code, kbd, pre)
├── 布局 (.main-layout — flex body + sidebar + main)
├── 组件
│   ├── .sidebar (nav)
│   ├── .card / .cards (grid)
│   ├── .cmd-table-wrap / table
│   ├── .info-box (tip/warn 变体)
│   ├── .tag (7 color variants)
│   ├── .arch-diagram
│   ├── .flow-steps
│   ├── .timeline
│   ├── .stats-row / .stat-card
│   └── .back-top
├── 工具类 (.text-muted, .slash-badge)
├── 响应式 (@media max-width)
└── 打印 (@media print)
```

### 1.3 页面组件树

```
index.html                    quick-start.html
├── Sidebar                   ├── Sidebar
├── Hero (渐变标题)            ├── Hero
├── Feature Cards (4-grid)    ├── Step 1: 安装
├── Reading Path 引导          │   └── code-blocks (copy)
└── Footer                    ├── Step 2: 首次对话
                              ├── Step 3: 核心概念
                              │   └── concept-cards (3)
                              ├── Step 4: 5 个命令
                              │   └── cmd-table
                              ├── Next-Step CTA
                              └── Footer

workflow-guide.html           plugin-dev.html
├── Sidebar                   ├── Sidebar
├── Hero                      ├── Hero
├── Workflow 1 (Attune)       ├── Part 1: Skill 开发
│   ├── flow-diagram          │   ├── SKILL.md 详解
│   └── step-cards (4)        │   └── Hello World 示例
├── Workflow 2 (Spec-Kit)     ├── Part 2: Hook 开发
│   ├── flow-diagram          │   ├── 类型表
│   └── step-cards (4)        │   └── 2 个实战示例
├── Workflow 3 (Daily Dev)    ├── Part 3: Command 开发
│   ├── flow-diagram          │   └── /deploy 示例
│   └── step-cards (5)        ├── Part 4: Plugin 打包
└── Footer                    └── Footer

skills-manual.html (增强)
├── Sidebar
├── Hero
├── Search Bar + Filter Tags ← NEW
├── Stats Row
├── Sections (现有内容)
└── Footer
```

---

## 2. 依赖图

```
FR-005 (style.css) ───────── BLOCKS ALL ─────────┐
                                                  │
    ┌─────────────────────────────────────────────┤
    │                                             │
    ▼              ▼              ▼               ▼
FR-001         FR-002         FR-003          FR-006
(index)      (quick-start)  (workflow)     (manual增强)
    │              │              │               │
    └──────────────┴──────────────┴───────────────┤
                                                  │
                                                  ▼
                                              FR-004
                                            (plugin-dev)
                                         (最后: 依赖概念铺垫)
```

**并行机会**: FR-001、FR-002、FR-003、FR-006 无相互依赖，可同时构建。

---

## 3. 任务拆分

---

### Phase 1: 基础 — 统一样式提取

#### TASK-001: 从现有手册提取共享 CSS

**描述**: 分析 `Claude_Code_Skills_Manual.html` 中的 `<style>` 块，提取所有可复用的 CSS 到 `assets/style.css`。

**类型**: 重构
**优先级**: P0 (阻塞所有页面)
**工作量**: M (2-3 小时)
**依赖**: 无

**涉及内容**:
```
提取清单:
✅ CSS 变量 (:root) — 完整迁移
✅ Reset/Normalize — 完整迁移
✅ 排版样式 — 完整迁移
✅ 布局系统 (.sidebar, .main) — 完整迁移
✅ 卡片系统 (.card, .cards, .stat-card) — 完整迁移
✅ 表格系统 (.cmd-table-wrap, table) — 完整迁移
✅ 信息框 (.info-box, .tip, .warn) — 完整迁移
✅ 标签 (.tag, .tag-session, .tag-config, ...) — 完整迁移
✅ 架构图 (.arch-diagram, .arch-row, .arch-box) — 完整迁移
✅ 流程图 (.flow-steps, .flow-step) — 完整迁移
✅ 时间线 (.timeline) — 完整迁移
✅ 进度条 (.priority-bar) — 完整迁移
✅ 响应式断点 — 完整迁移
✅ 打印样式 — 完整迁移
✅ kbd 键盘样式 — 完整迁移
✅ .back-top 按钮 — 完整迁移
❌ 页面特定样式 — 保留在原文件中
```

**验收标准**:
- [ ] style.css 创建完成，包含所有共享组件样式
- [ ] skills-manual.html 改用 `<link rel="stylesheet">` 引用 style.css
- [ ] skills-manual.html 的 `<style>` 块减少 ≥ 70%
- [ ] skills-manual.html 浏览器打开外观与提取前完全一致
- [ ] 提取后无样式冲突

**技术要点**:
- CSS 变量命名保持 `--*` 格式
- 不改变任何选择器名称（避免破坏现有页面）
- 在 skills-manual.html 中添加页面特定样式的内联 `<style>` 块

---

### Phase 2: 并行构建 — 4 个页面

#### TASK-002: 创建门户导航页 index.html

**描述**: 创建项目首页，包含 Hero 区域、4 张导航卡片、阅读路径引导。

**类型**: 实现
**优先级**: P1
**工作量**: M (2-3 小时)
**依赖**: TASK-001 (style.css)

**页面结构**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code 使用说明书</title>
  <link rel="stylesheet" href="assets/style.css">
  <style> /* 门户页特定样式 */ </style>
</head>
<body>
  <aside class="sidebar"> <!-- 统一导航栏 --> </aside>
  <main class="main">
    <section class="hero"> <!-- 大标题 + 副标题 + CTA --> </section>
    <section class="cards"> <!-- 4 张导航卡片 --> </section>
    <section class="reading-path"> <!-- 阅读路径推荐 --> </section>
    <footer>...</footer>
  </main>
</body>
</html>
```

**验收标准**:
- [ ] Hero 区域: 渐入动画、渐变标题、副标题
- [ ] 4 张导航卡片: 图标、标题、描述、跳转链接
- [ ] 阅读路径: 新手→日常→进阶 三段推荐
- [ ] 侧边栏链接指向所有已存在页面
- [ ] 移动端响应式: 卡片单列

**卡片链接映射**:
| 卡片 | 链接 |
|------|------|
| 🚀 5 分钟快速入门 | `guides/quick-start.html` |
| 📋 技能命令速查 | `manuals/skills-manual.html` |
| 🔧 工作流实战 | `guides/workflow-guide.html` |
| 🧩 插件开发指南 | `guides/plugin-dev.html` |

---

#### TASK-003: 创建快速入门指南 quick-start.html

**描述**: 5 分钟从上手到首次对话的引导页面。

**类型**: 实现
**优先级**: P1
**工作量**: M (2-3 小时)
**依赖**: TASK-001 (style.css)

**内容骨架**:
```
Step 1: 安装 Claude Code
  - macOS: brew install claude-code
  - 通用: npm install -g @anthropic-ai/claude-code
  - 登录验证: claude login
  - 显示方式: 终端风格代码块 (深色背景 + 等宽字体)

Step 2: 第一次对话
  - 启动: cd 项目目录 && claude
  - 第一句话示例: "帮我创建一个 Python 计算器"
  - 预期输出: Claude 创建文件、解释代码

Step 3: 理解三个核心概念
  - 3 张概念卡片:
    💬 会话 Session — 上下文窗口、历史记录
    🔧 工具 Tools — Read/Write/Bash/Edit
    🔐 权限 Permissions — allow/ask/deny

Step 4: 最常用的 5 个命令
  - /help /clear /model /cost /diff
  - 紧凑表格: 命令 | 用途 | 示例

页尾 CTA:
  → 下一步: 查阅技能手册深入学习
```

**验收标准**:
- [ ] 4 个 Steps 按垂直流程排列，每步有步骤编号
- [ ] 代码块: 深色背景 + 等宽字体 + 悬停显示复制按钮
- [ ] 概念卡片: 3 列 grid，图标+标题+一句话描述
- [ ] 命令表: 5 行紧凑表格
- [ ] CTA 链接指向 `skills-manual.html`
- [ ] 页面顶部面包屑: 🏠 首页 > 🚀 快速入门

---

#### TASK-004: 创建工作流实战指南 workflow-guide.html

**描述**: 3 个完整的端到端开发工作流，展示实际使用场景。

**类型**: 实现
**优先级**: P1
**工作量**: L (4-5 小时)
**依赖**: TASK-001 (style.css)

**工作流 1: Attune 全周期开发**
```
阶段图: /brainstorm → /specify → /blueprint → /execute
场景: 从零构建 "CLI 待办事项工具"
4 张阶段卡片:
  1. 💡 brainstorm — 输入示例 + 输出 brief 片段
  2. 📋 specify — 输入示例 + 输出 spec 片段
  3. 🏗️ blueprint — 输入示例 + 输出 plan 片段
  4. ⚡ execute — 输入示例 + 输出代码目录结构
底部: 完整命令速记卡
```

**工作流 2: Spec-Kit 规范驱动**
```
阶段图: specify → plan → tasks → implement
场景: 为已有项目添加 "JWT 认证功能"
4 张阶段卡片 + spec/plan/tasks 文件示例
```

**工作流 3: 日常开发循环**
```
循环图: 写代码 → /code-review → /simplify → /verify → 提交
5 个步骤卡片:
  1. ✏️ 编写功能代码
  2. 🔍 /code-review high — 发现 Bug
  3. ✨ /simplify — 清理代码
  4. ✅ /verify — 验证修复
  5. 📦 git commit — 提交
```

**验收标准**:
- [ ] 3 个完整工作流，每个有流程图 + 步骤卡片
- [ ] 流程图使用 CSS flex 绘制（箭头连接）
- [ ] 每个工作流包含: 场景说明 + 每步输入/输出示例
- [ ] 底部「实际试试」建议练习
- [ ] 涉及 attune/spec-kit 的地方标注安装命令

---

#### TASK-005: 增强技能手册 skills-manual.html

**描述**: 在现有手册上添加客户端搜索和分类筛选。

**类型**: 增强
**优先级**: P2
**工作量**: S (1 小时)
**依赖**: TASK-001 (style.css)

**新增内容**:
```html
<!-- 搜索栏: 插入在 Hero 区域下方 -->
<div class="search-bar">
  <input type="text" id="searchInput"
         placeholder="🔍 搜索命令或技能..."
         autocomplete="off">
  <div class="filter-tags">
    <button class="filter-tag active" data-filter="all">全部</button>
    <button class="filter-tag" data-filter="session">💬 会话</button>
    <button class="filter-tag" data-filter="config">⚙️ 配置</button>
    <button class="filter-tag" data-filter="project">🛠️ 项目</button>
    <button class="filter-tag" data-filter="debug">🔍 诊断</button>
    <button class="filter-tag" data-filter="ext">🔌 扩展</button>
    <button class="filter-tag" data-filter="skill">⭐ 技能</button>
  </div>
</div>
```

**JavaScript 逻辑**:
```javascript
// 搜索: input 事件 → debounce 150ms → 遍历所有可搜索行
// 筛选: click 事件 → 切换 active → 与搜索条件 AND 组合
// 无结果: 显示 "未找到匹配结果"
// Esc: 清空搜索
```

**验收标准**:
- [ ] 搜索框实时过滤 (debounce 150ms)
- [ ] 7 个分类筛选标签，支持与搜索组合
- [ ] 无结果时显示提示
- [ ] Esc 清空搜索框
- [ ] 搜索框样式与现有设计一致

---

### Phase 3: 进阶 — 插件开发指南

#### TASK-006: 创建插件开发指南 plugin-dev.html

**描述**: 从零教用户创建 Skill、Hook、Command，最终打包发布 Plugin。

**类型**: 实现
**优先级**: P3
**工作量**: L (4-5 小时)
**依赖**: TASK-001 (style.css), TASK-005 (概念铺垫)

**4 个 Part 结构**:

```
Part 1: 自定义技能 Skill
  - SKILL.md 字段参考表 (9 行)
  - Hello World 实战:
    1. mkdir .claude/skills/hello
    2. 编写 SKILL.md (完整代码块)
    3. /reload-skills
    4. /hello 触发
  - 渐进式加载策略图解

Part 2: 自定义 Hook
  - Hook 事件类型表 (15+ 事件)
  - 实战 A: 提交前自动运行测试 (PreToolUse + Bash)
  - 实战 B: 编辑后自动格式化 (PostToolUse + Edit)

Part 3: 自定义 Command (旧版)
  - Command vs Skill 对比表
  - /deploy 命令完整示例

Part 4: 打包发布 Plugin
  - 目录结构图
  - marketplace.json 字段说明
  - push 到 GitHub → 团队安装
```

**验收标准**:
- [ ] 4 个 Part 垂直排列，每 Part 有清晰的标题和图标
- [ ] 所有代码块可直接复制粘贴执行
- [ ] Hello World 技能完整可运行 (< 20 行 SKILL.md)
- [ ] Hook 示例包含: 触发条件 → 执行命令 → 效果
- [ ] 末尾链接到社区市场

---

## 4. 实施时间线

```
Phase 1: 基础 (1 个任务)
  TASK-001 ████████░░ style.css 提取               [M] 阻塞项

Phase 2: 并行构建 (4 个任务，可同时进行)
  TASK-002 ████████░░ index.html                   [M]
  TASK-003 ████████░░ quick-start.html             [M]
  TASK-004 ██████████████ workflow-guide.html      [L]
  TASK-005 ████░░░░░░ skills-manual 增强           [S]

Phase 3: 进阶 (1 个任务)
  TASK-006 ██████████████ plugin-dev.html          [L]
```

| Phase | 任务 | 工作量 | 状态 |
|-------|------|--------|------|
| 1 | TASK-001 style.css | M | ⬜ 待开始 |
| 2 | TASK-002 index.html | M | ⬜ 待开始 |
| 2 | TASK-003 quick-start.html | M | ⬜ 待开始 |
| 2 | TASK-004 workflow-guide.html | L | ⬜ 待开始 |
| 2 | TASK-005 skills-manual 增强 | S | ⬜ 待开始 |
| 3 | TASK-006 plugin-dev.html | L | ⬜ 待开始 |

**总工作量**: ~15-19 小时

---

## 5. 风险矩阵

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| CSS 提取破坏现有页面 | High | Low | 提取前后并排对比，逐组件验证 |
| 搜索性能不达标 | Low | Low | 纯 DOM 操作 < 50ms 足够 |
| 内容过时 (Claude Code 更新) | Medium | High | 标注版本号，FR-006 搜索覆盖新命令 |
| 跨浏览器兼容 | Medium | Low | 使用标准 CSS/JS，不用实验性 API |
| 代码块复制按钮兼容性 | Low | Low | Clipboard API + execCommand 降级 |

---

## 6. 下一步

1. ✅ 审批本计划
2. ⬜ 开始 **TASK-001**: 提取 `assets/style.css`
3. ⬜ 并行执行 **TASK-002 ~ TASK-005**
4. ⬜ 最后完成 **TASK-006**

---

## 7. 附录: 文件清单 (完成后)

```
Claude使用说明书/
├── index.html                     ← TASK-002
├── assets/
│   └── style.css                  ← TASK-001
├── guides/
│   ├── quick-start.html           ← TASK-003
│   ├── workflow-guide.html        ← TASK-004
│   └── plugin-dev.html            ← TASK-006
├── manuals/
│   └── skills-manual.html         ← TASK-005 (增强)
├── docs/
│   ├── project-brief.md           ← 已有
│   ├── specification.md           ← 已有
│   └── implementation-plan.md     ← 本文档
└── .claude/
    ├── settings.json
    └── settings.local.json
```
