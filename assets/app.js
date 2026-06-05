/* ============================================================
   Claude Code 使用说明书 — 共享脚本 v1.0
   通用功能: 导航高亮、回到顶部、代码复制
   ============================================================ */

(function() {
  'use strict';

  // ========== 滚动高亮当前导航项 ==========
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', function() {
      let current = '';
      sections.forEach(function(s) {
        var top = s.offsetTop - 100;
        if (window.scrollY >= top) current = s.getAttribute('id');
      });
      navLinks.forEach(function(a) {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + current) a.classList.add('active');
      });
    });
  }

  // ========== 回到顶部按钮 ==========
  function initBackToTop() {
    var btn = document.querySelector('.back-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 600) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== 代码块复制按钮 ==========
  function initCodeCopy() {
    var blocks = document.querySelectorAll('.code-block');
    blocks.forEach(function(block) {
      // Skip if already has a copy button
      if (block.querySelector('.copy-btn')) return;

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '📋 复制';
      btn.addEventListener('click', function() {
        var text = block.innerText.replace(/📋 复制\n?/, '').trim();
        copyToClipboard(text, btn);
      });
      block.appendChild(btn);
    });
  }

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopied(btn);
      }).catch(function() {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showCopied(btn); }
    catch(e) { btn.textContent = '❌ 失败'; }
    document.body.removeChild(ta);
  }

  function showCopied(btn) {
    var orig = btn.textContent;
    btn.textContent = '✅ 已复制';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 1500);
  }

  // ========== 搜索过滤功能 ==========
  function initSearch() {
    var input = document.getElementById('searchInput');
    if (!input) return;

    var filterTags = document.querySelectorAll('.filter-tag');
    var activeFilter = 'all';

    // 需要搜索的行/卡片需要 [data-search] 属性
    function getSearchableItems() {
      return document.querySelectorAll('[data-search]');
    }

    function doFilter() {
      var query = input.value.toLowerCase().trim();
      var items = getSearchableItems();
      var visibleCount = 0;

      items.forEach(function(item) {
        var text = (item.getAttribute('data-search') || '').toLowerCase();
        var category = item.getAttribute('data-category') || '';

        var matchSearch = !query || text.indexOf(query) !== -1;
        var matchFilter = activeFilter === 'all' || category === activeFilter;
        var visible = matchSearch && matchFilter;

        item.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
      });

      // 无结果提示
      var noResults = document.getElementById('noResults');
      if (noResults) {
        noResults.style.display = visibleCount === 0 ? '' : 'none';
      }

      // 隐藏空 section
      document.querySelectorAll('section[id]').forEach(function(section) {
        var items = section.querySelectorAll('[data-search]');
        if (items.length > 0) {
          var allHidden = true;
          items.forEach(function(item) {
            if (item.style.display !== 'none') allHidden = false;
          });
          section.style.display = allHidden ? 'none' : '';
        }
      });
    }

    // Debounced search
    var debounceTimer;
    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(doFilter, 150);
    });

    // Esc to clear
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        input.value = '';
        doFilter();
      }
    });

    // Filter tags
    filterTags.forEach(function(tag) {
      tag.addEventListener('click', function() {
        filterTags.forEach(function(t) { t.classList.remove('active'); });
        tag.classList.add('active');
        activeFilter = tag.getAttribute('data-filter') || 'all';
        doFilter();
      });
    });
  }

  // ========== Init All ==========
  initScrollSpy();
  initBackToTop();
  initCodeCopy();
  initSearch();
})();

/* ============================================================
   Detail Panel — 命令详情数据与交互逻辑
   ============================================================ */

// ── Command Details Database ──
var CMD = {

  // ── 会话与上下文管理 ──
  clear: {
    name:'/clear', category:'会话管理', catClass:'tag-session',
    desc:'清空当前对话的全部历史记录，释放上下文窗口，开始一个全新的对话。适用于切换任务话题、清理不相关上下文、重置对话状态。',
    syntax:'/clear', params:[],
    examples:[
      {desc:'开始全新对话，清除所有聊天历史', code:'/clear'},
      {desc:'在长对话后重置上下文，开始新任务', code:'/clear\n# 然后输入新的任务描述'}
    ],
    notes:[
      {type:'warn', text:'清空后无法恢复之前的对话历史，请确保已保存需要的信息。'},
      {type:'tip', text:'如果只是想压缩上下文而非清空，使用 /compact 更合适。'},
      {type:'info', text:'别名：/reset、/new。'}
    ],
    related:['compact','rewind','resume']
  },
  compact: {
    name:'/compact', category:'会话管理', catClass:'tag-session',
    desc:'压缩当前对话历史，通过摘要方式保留关键信息，释放上下文窗口空间。可选参数 focus 可指定压缩时保留的重点内容。',
    syntax:'/compact [focus]',
    params:[
      {name:'focus', type:'string', required:'否', default:'—', desc:'指定压缩时需要重点保留的内容主题'}
    ],
    examples:[
      {desc:'基本压缩，自动保留关键信息', code:'/compact'},
      {desc:'指定保留重点内容', code:'/compact 保留数据库 schema 变更记录'}
    ],
    notes:[
      {type:'tip', text:'压缩后 Claude 会记住对话摘要，但细节可能丢失。重要内容建议先导出。'},
      {type:'warn', text:'压缩后可能会丢失精确的代码片段引用，重要内容建议记录到文件。'}
    ],
    related:['clear','context','rewind','export']
  },
  resume: {
    name:'/resume', category:'会话管理', catClass:'tag-session',
    desc:'恢复之前保存的会话继续工作。可以按会话名称或 ID 恢复。不提供参数则列出所有可恢复的会话。',
    syntax:'/resume [name|ID]',
    params:[
      {name:'name|ID', type:'string', required:'否', desc:'会话的名称或 ID。不提供则列出所有可恢复的会话'}
    ],
    examples:[
      {desc:'列出所有可恢复的会话', code:'/resume'},
      {desc:'按名称恢复会话', code:'/resume fix-auth-bug'}
    ],
    notes:[
      {type:'tip', text:'使用 /rename 给会话起个好记的名字，方便后续用 /resume 恢复。'},
      {type:'info', text:'别名：/continue。'}
    ],
    related:['rename','branch','rewind']
  },
  rename: {
    name:'/rename', category:'会话管理', catClass:'tag-session',
    desc:'重命名当前会话，起一个有意义的名字方便后续通过 /resume 查找和恢复。',
    syntax:'/rename [name]',
    params:[
      {name:'name', type:'string', required:'否', desc:'新的会话名称。不提供则显示当前名称'}
    ],
    examples:[
      {desc:'设置会话名称', code:'/rename implement-user-auth'},
      {desc:'查看当前会话名称', code:'/rename'}
    ],
    notes:[
      {type:'tip', text:'好的命名习惯：项目-功能-状态，如 "myapp-oauth-refactor"。'}
    ],
    related:['resume','branch']
  },
  rewind: {
    name:'/rewind', category:'会话管理', catClass:'tag-session',
    desc:'回滚对话和代码更改到上一个检查点。Claude Code 会在关键操作（如 git commit）时自动创建检查点。',
    syntax:'/rewind', params:[],
    examples:[
      {desc:'回滚到上一个检查点', code:'/rewind'},
      {desc:'在实验性代码修改后回滚', code:'# 进行了一些测试性修改...\n/rewind  # 回滚所有更改'}
    ],
    notes:[
      {type:'warn', text:'回滚会丢弃自上一个检查点以来的所有对话和代码更改，不可逆。'},
      {type:'info', text:'别名：/checkpoint。'},
      {type:'tip', text:'如果不确定要不要回滚，可以先用 /branch 创建分支保留当前状态。'}
    ],
    related:['branch','clear','compact']
  },
  branch: {
    name:'/branch', category:'会话管理', catClass:'tag-session',
    desc:'从当前对话状态创建一个对话分支（fork），保留当前进度同时探索不同方案。新分支拥有独立的对话历史和代码更改。',
    syntax:'/branch [name]',
    params:[
      {name:'name', type:'string', required:'否', desc:'分支名称，不提供则自动生成'}
    ],
    examples:[
      {desc:'创建命名分支尝试不同方案', code:'/branch try-redis-cache'},
      {desc:'创建自动命名分支', code:'/branch'}
    ],
    notes:[
      {type:'tip', text:'分支是探索不同技术方案的理想方式。'},
      {type:'info', text:'别名：/fork。分支之间完全独立，互不影响。'}
    ],
    related:['rewind','resume','rename']
  },
  diff: {
    name:'/diff', category:'会话管理', catClass:'tag-session',
    desc:'打开交互式差异查看器，展示当前会话中所有待提交的文件更改。支持逐文件查看 diff、选择性暂存、提交。',
    syntax:'/diff', params:[],
    examples:[
      {desc:'查看所有待提交更改的差异', code:'/diff'},
      {desc:'在提交前审查所有更改', code:'/diff\n# 交互式浏览每个文件的变更\n# 确认无误后再 git commit'}
    ],
    notes:[
      {type:'tip', text:'在提交前使用 /diff 可以系统性地审查所有更改。'},
      {type:'info', text:'差异查看器支持键盘导航：j/k 上下移动，空格切换暂存。'}
    ],
    related:['commit','code-review']
  },
  copy: {
    name:'/copy', category:'会话管理', catClass:'tag-session',
    desc:'复制第 N 条最近的回复或其中的代码块到系统剪贴板。',
    syntax:'/copy [N]',
    params:[
      {name:'N', type:'number', required:'否', desc:'要复制的回复序号（1=最近一条）。不提供则复制最后一条'}
    ],
    examples:[
      {desc:'复制最近一条回复', code:'/copy'},
      {desc:'复制倒数第3条回复', code:'/copy 3'}
    ],
    notes:[
      {type:'tip', text:'适合快速复制 Claude 生成的代码块到编辑器中。'}
    ],
    related:['export']
  },
  export: {
    name:'/export', category:'会话管理', catClass:'tag-session',
    desc:'将当前对话的全部记录导出到文本文件，方便存档、分享或离线查看。',
    syntax:'/export [filename]',
    params:[
      {name:'filename', type:'string', required:'否', desc:'导出文件名（不含扩展名）。不提供则自动生成带时间戳的文件名'}
    ],
    examples:[
      {desc:'导出对话到自动命名的文件', code:'/export'},
      {desc:'导出到指定文件名', code:'/export auth-implementation-log'}
    ],
    notes:[
      {type:'info', text:'导出文件保存为 Markdown 格式。'}
    ],
    related:['copy','resume']
  },
  exit: {
    name:'/exit', category:'会话管理', catClass:'tag-session',
    desc:'退出 Claude Code 交互式会话。退出前会提示保存未提交的更改。',
    syntax:'/exit', params:[],
    examples:[
      {desc:'退出 Claude Code', code:'/exit'},
      {desc:'使用快捷键退出', code:'Ctrl+D'}
    ],
    notes:[
      {type:'info', text:'别名：/quit。快捷键：Ctrl+D。'},
      {type:'warn', text:'退出前请确保代码更改已提交或保存。'}
    ],
    related:['background']
  },
  background: {
    name:'/background', category:'会话管理', catClass:'tag-session',
    desc:'将当前会话移至后台运行，释放终端界面。后台会话继续执行任务，可随时切回。',
    syntax:'/background', params:[],
    examples:[
      {desc:'将长时间任务移至后台', code:'/background'},
      {desc:'查看后台任务', code:'/tasks'}
    ],
    notes:[
      {type:'tip', text:'适合需要长时间运行的任务。使用 /tasks 查看后台任务状态。'}
    ],
    related:['tasks','resume','exit']
  },

  // ── 配置与环境 ──
  config: {
    name:'/config', category:'配置', catClass:'tag-config',
    desc:'打开交互式设置界面，配置主题、模型、输出风格等。也可直接编辑 settings.json。',
    syntax:'/config', params:[],
    examples:[
      {desc:'打开设置 UI', code:'/config'},
      {desc:'直接编辑全局设置文件', code:'# 手动编辑 ~/.claude/settings.json'}
    ],
    notes:[
      {type:'info', text:'别名：/settings。设置分为全局（~/.claude/）和项目级（.claude/），项目级优先级更高。'},
      {type:'tip', text:'复杂的自动化行为配置推荐使用 /update-config 技能。'}
    ],
    related:['model','theme','permissions','hooks','update-config']
  },
  model: {
    name:'/model', category:'配置', catClass:'tag-config',
    desc:'切换当前会话使用的 AI 模型。可在 sonnet（均衡）、opus（最强）、haiku（最快）之间切换。',
    syntax:'/model [name]',
    params:[
      {name:'name', type:'string', required:'否', desc:'模型名称：sonnet / opus / haiku。不提供则列出可选模型'}
    ],
    examples:[
      {desc:'切换到 Opus 模型', code:'/model opus'},
      {desc:'切换到 Haiku 模型', code:'/model haiku'},
      {desc:'查看可用模型列表', code:'/model'}
    ],
    notes:[
      {type:'info', text:'Sonnet：均衡；Opus：最强推理；Haiku：最快响应。不同模型费用不同。'},
      {type:'tip', text:'模型切换立即生效，无需重启。'}
    ],
    related:['effort','fast','cost','status']
  },
  effort: {
    name:'/effort', category:'配置', catClass:'tag-config',
    desc:'设置推理深度。low=简单问答、medium=日常开发、high=复杂重构、xhigh=架构设计、max=关键任务。',
    syntax:'/effort [level]',
    params:[
      {name:'level', type:'string', required:'否', desc:'推理级别：low / medium / high / xhigh / max'}
    ],
    examples:[
      {desc:'设为高推理深度', code:'/effort high'},
      {desc:'设为最高推理深度', code:'/effort max'},
      {desc:'设为低推理深度', code:'/effort low'}
    ],
    notes:[
      {type:'tip', text:'高级别推理消耗更多 Token。日常开发推荐 medium 或 high。'}
    ],
    related:['model','fast','cost']
  },
  fast: {
    name:'/fast', category:'配置', catClass:'tag-config',
    desc:'切换快速模式。使用相同模型但优化输出速度，不降级模型。仅在 Opus 4.8/4.7/4.6 上可用。',
    syntax:'/fast [on|off]',
    params:[
      {name:'on|off', type:'string', required:'否', desc:'开启或关闭快速模式'}
    ],
    examples:[
      {desc:'开启快速模式', code:'/fast on'},
      {desc:'切换快速模式', code:'/fast'}
    ],
    notes:[
      {type:'tip', text:'追求速度但不希望降低模型能力时使用，比切换到 haiku 更合适。'}
    ],
    related:['model','effort']
  },
  permissions: {
    name:'/permissions', category:'配置', catClass:'tag-config',
    desc:'管理工具权限规则。可设置特定工具为 allow（自动允许）、ask（每次询问）或 deny（禁止）。',
    syntax:'/permissions', params:[],
    examples:[
      {desc:'打开权限管理', code:'/permissions'},
      {desc:'允许所有 Bash 命令', code:'# 在权限界面中添加 Bash: allow'}
    ],
    notes:[
      {type:'info', text:'别名：/allowed-tools。使用 /fewer-permission-prompts 可自动优化权限配置。'}
    ],
    related:['fewer-permission-prompts','hooks','config']
  },
  theme: {
    name:'/theme', category:'配置', catClass:'tag-config',
    desc:'更改 Claude Code 终端的配色主题，支持多种内置主题方案。',
    syntax:'/theme', params:[],
    examples:[
      {desc:'打开主题选择器', code:'/theme'}
    ],
    notes:[
      {type:'tip', text:'主题更改即时生效。也可在 /config 中找到主题选项。'}
    ],
    related:['config','statusline']
  },
  vim: {
    name:'/vim', category:'配置', catClass:'tag-config',
    desc:'切换 Vim 键位绑定模式。开启后输入框支持 Vim 风格的 Normal/Insert 模式编辑。',
    syntax:'/vim', params:[],
    examples:[
      {desc:'切换 Vim 模式', code:'/vim'}
    ],
    notes:[
      {type:'info', text:'支持 hjkl 移动、w/b 跳词等常用 Vim 操作。不熟悉 Vim 不建议开启。'}
    ],
    related:['keybindings','config']
  },
  'terminal-setup': {
    name:'/terminal-setup', category:'配置', catClass:'tag-config',
    desc:'配置终端 Shell 集成，使 Claude Code 能更好地与你的 Shell 环境协作。',
    syntax:'/terminal-setup', params:[],
    examples:[
      {desc:'运行终端设置向导', code:'/terminal-setup'}
    ],
    notes:[
      {type:'tip', text:'建议首次使用时运行此命令，确保环境配置正确。'}
    ],
    related:['config','doctor']
  },
  keybindings: {
    name:'/keybindings', category:'配置', catClass:'tag-config',
    desc:'自定义键盘快捷键。配置文件位于 ~/.claude/keybindings.json。',
    syntax:'/keybindings', params:[],
    examples:[
      {desc:'打开快捷键配置', code:'/keybindings'},
      {desc:'获取详细帮助', code:'/keybindings-help'}
    ],
    notes:[
      {type:'tip', text:'复杂需求推荐使用 /keybindings-help 技能获取分步指导。'}
    ],
    related:['keybindings-help','config','vim']
  },
  hooks: {
    name:'/hooks', category:'配置', catClass:'tag-config',
    desc:'查看和管理 Hook 配置。Hooks 是事件拦截器，可在工具执行前后、会话生命周期等节点注入自定义逻辑。支持 14 种事件类型。',
    syntax:'/hooks', params:[],
    examples:[
      {desc:'查看当前 Hook 配置', code:'/hooks'},
      {desc:'添加 PreToolUse Hook', code:'# 在 settings.json 中添加:\n"PreToolUse": [{"matcher": "Bash", "hooks": [{"type": "command", "command": "./validate.sh"}]}]'}
    ],
    notes:[
      {type:'tip', text:'复杂场景推荐使用 /update-config 技能配置 Hooks。'}
    ],
    related:['update-config','permissions','config']
  },
  statusline: {
    name:'/statusline', category:'配置', catClass:'tag-config',
    desc:'自定义状态栏显示内容，可添加当前模型、Token 用量等信息。',
    syntax:'/statusline', params:[],
    examples:[
      {desc:'配置状态栏', code:'/statusline'}
    ],
    notes:[
      {type:'tip', text:'支持自定义模板，组合显示多种信息。'}
    ],
    related:['config','context','cost']
  },

  // ── 项目工具 ──
  init: {
    name:'/init', category:'项目工具', catClass:'tag-project',
    desc:'初始化项目 CLAUDE.md 记忆文件。Claude 分析项目结构后自动生成包含架构、技术栈、约定的文档。',
    syntax:'/init', params:[],
    examples:[
      {desc:'为新项目生成 CLAUDE.md', code:'/init'},
      {desc:'更新已有项目的记忆文件', code:'/init'}
    ],
    notes:[
      {type:'tip', text:'建议在项目初期和重大架构变更后运行 /init。'},
      {type:'info', text:'CLAUDE.md 应提交到 Git 与团队共享。'}
    ],
    related:['memory','add-dir']
  },
  memory: {
    name:'/memory', category:'项目工具', catClass:'tag-project',
    desc:'查看和编辑持久化记忆文件（CLAUDE.md 和自动记忆）。可手动添加项目约定、偏好设置等。',
    syntax:'/memory', params:[],
    examples:[
      {desc:'查看当前记忆', code:'/memory'},
      {desc:'添加项目约定', code:'# 在打开的 CLAUDE.md 中编辑'}
    ],
    notes:[
      {type:'tip', text:'在 CLAUDE.md 中记录编码规范、命名约定、架构决策。'},
      {type:'info', text:'记忆分为项目级（CLAUDE.md）和自动记忆。'}
    ],
    related:['init','add-dir']
  },
  'add-dir': {
    name:'/add-dir', category:'项目工具', catClass:'tag-project',
    desc:'添加额外工作目录到上下文。适用于多仓库项目或跨目录操作。',
    syntax:'/add-dir <path>',
    params:[
      {name:'path', type:'string', required:'是', desc:'要添加的目录路径'}
    ],
    examples:[
      {desc:'添加共享库目录', code:'/add-dir ../shared-lib'},
      {desc:'添加多个外部目录', code:'/add-dir ~/other-project\n/add-dir /usr/local/configs'}
    ],
    notes:[
      {type:'warn', text:'添加目录会赋予 Claude 访问权限，注意不要添加含敏感信息的目录。'}
    ],
    related:['init','memory']
  },
  todos: {
    name:'/todos', category:'项目工具', catClass:'tag-project',
    desc:'查看当前会话的待办任务列表和进度。',
    syntax:'/todos', params:[],
    examples:[
      {desc:'查看当前任务进度', code:'/todos'}
    ],
    notes:[
      {type:'tip', text:'任务列表由 Claude 在复杂任务中自动创建。'}
    ],
    related:['plan','tasks']
  },
  plan: {
    name:'/plan', category:'项目工具', catClass:'tag-project',
    desc:'进入计划模式。Claude 只读探索代码库、设计方案，不修改文件。用户确认后才进入实施阶段。',
    syntax:'/plan [description]',
    params:[
      {name:'description', type:'string', required:'否', desc:'任务描述'}
    ],
    examples:[
      {desc:'规划新功能', code:'/plan 添加用户角色权限系统'},
      {desc:'规划重构方案', code:'/plan 将 Express 迁移到 Fastify'}
    ],
    notes:[
      {type:'info', text:'流程：1) 只读探索 2) 设计方案 3) 用户审批 4) 自动执行。'},
      {type:'tip', text:'超过 2-3 个文件修改的任务建议先用 /plan。'}
    ],
    related:['ultraplan','todos','init']
  },
  ultraplan: {
    name:'/ultraplan', category:'项目工具', catClass:'tag-project',
    desc:'深度多步骤任务规划。比 /plan 更详尽的代码库分析和实施步骤，适合大型架构变更。',
    syntax:'/ultraplan <prompt>',
    params:[
      {name:'prompt', type:'string', required:'是', desc:'详细任务描述'}
    ],
    examples:[
      {desc:'大型架构迁移', code:'/ultraplan 将后端从 REST API 迁移到 GraphQL'}
    ],
    notes:[
      {type:'warn', text:'消耗更多 Token。先用 /plan 评估，确实复杂再升级到 /ultraplan。'}
    ],
    related:['plan','ultrareview']
  },
  ultrareview: {
    name:'/ultrareview', category:'项目工具', catClass:'tag-project',
    desc:'高级代码审查，比 /code-review 更深入，覆盖更多维度和文件。',
    syntax:'/ultrareview', params:[],
    examples:[
      {desc:'深度审查当前更改', code:'/ultrareview'}
    ],
    notes:[
      {type:'tip', text:'关键业务逻辑或安全敏感代码建议使用。日常代码用 /code-review。'}
    ],
    related:['code-review','review','security-review']
  },
  bug: {
    name:'/bug', category:'项目工具', catClass:'tag-project',
    desc:'向 Anthropic 提交 Bug 报告，自动附带会话日志和系统信息。',
    syntax:'/bug', params:[],
    examples:[
      {desc:'提交 Bug 报告', code:'/bug'}
    ],
    notes:[
      {type:'tip', text:'先运行 /doctor 诊断，问题依旧再用 /bug。'}
    ],
    related:['doctor','version']
  },
  'pr-comments': {
    name:'/pr-comments', category:'项目工具', catClass:'tag-project',
    desc:'获取 GitHub PR 评论，帮助 Claude 理解评审反馈并据此修改代码。',
    syntax:'/pr-comments [PR]',
    params:[
      {name:'PR', type:'string', required:'否', desc:'PR 编号或 URL'}
    ],
    examples:[
      {desc:'获取当前分支 PR 评论', code:'/pr-comments'},
      {desc:'获取指定 PR', code:'/pr-comments 42'}
    ],
    notes:[
      {type:'info', text:'需要 gh CLI 工具或 GitHub token 认证。'}
    ],
    related:['autofix-pr','review']
  },
  'autofix-pr': {
    name:'/autofix-pr', category:'项目工具', catClass:'tag-project',
    desc:'持续监控 PR 评审评论，自动根据反馈修复代码并推送更新。',
    syntax:'/autofix-pr [prompt]',
    params:[
      {name:'prompt', type:'string', required:'否', desc:'额外的修复指导或约束条件'}
    ],
    examples:[
      {desc:'启动自动 PR 修复', code:'/autofix-pr'},
      {desc:'带约束的自动修复', code:'/autofix-pr 不要修改 API 接口签名'}
    ],
    notes:[
      {type:'warn', text:'自动推送可能触发 CI。确保 CI 配置能处理频繁提交。'}
    ],
    related:['pr-comments','loop','review']
  },

  // ── 诊断与调试 ──
  help: {
    name:'/help', category:'诊断', catClass:'tag-debug',
    desc:'列出所有可用命令和功能。新用户的第一站。',
    syntax:'/help', params:[],
    examples:[
      {desc:'显示所有命令', code:'/help'},
      {desc:'在终端启动时查看帮助', code:'claude --help'}
    ],
    notes:[
      {type:'info', text:'自定义技能和插件命令可通过 /skills 查看。'}
    ],
    related:['skills','status','version']
  },
  status: {
    name:'/status', category:'诊断', catClass:'tag-debug',
    desc:'显示版本号、当前模型、账户信息、会话时长等状态信息。',
    syntax:'/status', params:[],
    examples:[
      {desc:'查看当前状态', code:'/status'}
    ],
    related:['version','cost','model','context']
  },
  cost: {
    name:'/cost', category:'诊断', catClass:'tag-debug',
    desc:'查看当前会话的 Token 消耗量和费用估算。',
    syntax:'/cost', params:[],
    examples:[
      {desc:'查看当前会话费用', code:'/cost'},
      {desc:'切换模型对比成本', code:'/cost\n/model haiku'}
    ],
    notes:[
      {type:'info', text:'费用为估算值，最终以 Anthropic 账单为准。'},
      {type:'tip', text:'定期查看 /cost 了解花费。'}
    ],
    related:['usage','insights','context','model']
  },
  context: {
    name:'/context', category:'诊断', catClass:'tag-debug',
    desc:'可视化上下文窗口使用情况。显示已用 Token 数、剩余空间、各部分占比。',
    syntax:'/context', params:[],
    examples:[
      {desc:'查看上下文使用情况', code:'/context'},
      {desc:'上下文快满时压缩', code:'/context\n# >80% 建议 /compact'}
    ],
    notes:[
      {type:'tip', text:'使用率 >70% 时考虑压缩或清理。'}
    ],
    related:['compact','clear','cost']
  },
  usage: {
    name:'/usage', category:'诊断', catClass:'tag-debug',
    desc:'显示当前套餐的 API 用量和速率限制。',
    syntax:'/usage', params:[],
    examples:[
      {desc:'查看用量和配额', code:'/usage'}
    ],
    notes:[
      {type:'tip', text:'接近配额时考虑降低 /effort 级别或使用 /model haiku。'}
    ],
    related:['cost','insights','stats']
  },
  insights: {
    name:'/insights', category:'诊断', catClass:'tag-debug',
    desc:'生成用量分析报告：Token 消耗趋势、模型使用分布、会话时长统计。',
    syntax:'/insights', params:[],
    examples:[
      {desc:'生成用量分析', code:'/insights'}
    ],
    related:['stats','usage','cost']
  },
  stats: {
    name:'/stats', category:'诊断', catClass:'tag-debug',
    desc:'可视化每日用量统计和会话历史。',
    syntax:'/stats', params:[],
    examples:[
      {desc:'查看使用统计', code:'/stats'}
    ],
    related:['insights','usage','cost']
  },
  doctor: {
    name:'/doctor', category:'诊断', catClass:'tag-debug',
    desc:'自动诊断安装、配置、MCP 连接等问题。遇到异常的首选排查工具。',
    syntax:'/doctor', params:[],
    examples:[
      {desc:'运行诊断', code:'/doctor'},
      {desc:'排查 MCP 连接', code:'/doctor\n# 检查 MCP 相关诊断信息'}
    ],
    notes:[
      {type:'tip', text:'遇到任何异常行为，先运行 /doctor。'}
    ],
    related:['bug','version','status']
  },
  version: {
    name:'/version', category:'诊断', catClass:'tag-debug',
    desc:'显示当前 Claude Code 版本号。',
    syntax:'/version', params:[],
    examples:[
      {desc:'查看版本', code:'/version'},
      {desc:'终端查看版本', code:'claude --version'}
    ],
    related:['release-notes','status','doctor']
  },
  'release-notes': {
    name:'/release-notes', category:'诊断', catClass:'tag-debug',
    desc:'查看版本更新日志（Changelog），了解最新功能和修复。',
    syntax:'/release-notes', params:[],
    examples:[
      {desc:'查看更新日志', code:'/release-notes'}
    ],
    notes:[
      {type:'tip', text:'升级前建议先查看，了解 breaking changes。'}
    ],
    related:['version','status']
  },
  login: {
    name:'/login', category:'诊断', catClass:'tag-debug',
    desc:'登录 Anthropic 账户。首次使用或 Token 过期时需要。',
    syntax:'/login', params:[],
    examples:[
      {desc:'登录账户', code:'/login\n# 按提示在浏览器中完成认证'}
    ],
    notes:[
      {type:'info', text:'登录后保存认证 Token，后续无需重复登录。'}
    ],
    related:['logout','status']
  },
  logout: {
    name:'/logout', category:'诊断', catClass:'tag-debug',
    desc:'登出当前账户，清除本地认证信息。',
    syntax:'/logout', params:[],
    examples:[
      {desc:'登出账户', code:'/logout'}
    ],
    notes:[
      {type:'warn', text:'登出后需重新登录才能继续使用。'}
    ],
    related:['login']
  },

  // ── 扩展与 MCP ──
  mcp: {
    name:'/mcp', category:'扩展', catClass:'tag-ext',
    desc:'管理 MCP（Model Context Protocol）服务器。MCP 允许连接外部工具和数据源（数据库、API 等）。支持 OAuth 认证。',
    syntax:'/mcp', params:[],
    examples:[
      {desc:'打开 MCP 管理', code:'/mcp'},
      {desc:'配置 MCP 服务器', code:'# 编辑 ~/.claude/claude.json\n{"mcpServers": {"my-db": {"command": "npx", "args": ["-y", "@modelcontextprotocol/server-postgres"]}}}'}
    ],
    notes:[
      {type:'tip', text:'使用 /doctor 诊断 MCP 连接问题。'}
    ],
    related:['plugin','doctor','agents']
  },
  plugin: {
    name:'/plugin', category:'扩展', catClass:'tag-ext',
    desc:'管理插件：安装、启用、禁用、列出、浏览市场、验证结构。',
    syntax:'/plugin <action> [name]',
    params:[
      {name:'action', type:'string', required:'是', desc:'操作：install / enable / disable / list / marketplace / validate'},
      {name:'name', type:'string', required:'视操作', desc:'插件名称'}
    ],
    examples:[
      {desc:'安装插件', code:'/plugin install my-plugin'},
      {desc:'列出已安装插件', code:'/plugin list'},
      {desc:'浏览插件市场', code:'/plugin marketplace'},
      {desc:'验证插件结构', code:'/plugin validate'}
    ],
    notes:[
      {type:'tip', text:'安装插件后可能需要 /reload-skills 加载技能。'}
    ],
    related:['skills','reload-skills','agents','mcp']
  },
  agents: {
    name:'/agents', category:'扩展', catClass:'tag-ext',
    desc:'管理自定义 Agent（子代理）。Agent 是具有特定能力和工具集的独立工作单元。',
    syntax:'/agents', params:[],
    examples:[
      {desc:'查看可用 Agent', code:'/agents'},
      {desc:'定义 Agent', code:'# 编辑 ~/.claude/claude.json\n"agents": {"code-reviewer": {"description": "专门审查代码质量", "tools": ["Read", "Grep", "Glob"]}}'}
    ],
    notes:[
      {type:'info', text:'可通过 --agent 标志启动：claude --agent code-reviewer。'}
    ],
    related:['agent','plugin','skills']
  },
  skills: {
    name:'/skills', category:'扩展', catClass:'tag-ext',
    desc:'列出所有可用技能（内置 + 自定义），包含名称、描述和触发方式。',
    syntax:'/skills', params:[],
    examples:[
      {desc:'查看所有技能', code:'/skills'}
    ],
    notes:[
      {type:'tip', text:'修改技能后运行 /reload-skills 生效，无需重启。'}
    ],
    related:['reload-skills','plugin','help']
  },
  'reload-skills': {
    name:'/reload-skills', category:'扩展', catClass:'tag-ext',
    desc:'重新扫描技能目录，无需重启即可加载新增或修改的技能（v2.1.152 新增）。',
    syntax:'/reload-skills', params:[],
    examples:[
      {desc:'修改技能后重新加载', code:'# 编辑 SKILL.md\n/reload-skills'},
      {desc:'安装插件后加载', code:'/plugin install some-plugin\n/reload-skills'}
    ],
    notes:[
      {type:'tip', text:'开发自定义技能时的利器——无需重启 Claude Code。'}
    ],
    related:['skills','plugin']
  },

  // ── 高级自动化 ──
  agent: {
    name:'/agent', category:'自动化', catClass:'tag-auto',
    desc:'创建子代理独立执行任务。多个子代理可并行运行，每个拥有独立上下文窗口。',
    syntax:'/agent <prompt>',
    params:[
      {name:'prompt', type:'string', required:'是', desc:'子代理的任务描述'}
    ],
    examples:[
      {desc:'创建子代理执行审查', code:'/agent 审查 src/auth/ 目录下的安全漏洞'},
      {desc:'并行执行多个任务', code:'/agent 为 src/api/ 写单元测试\n/agent 更新 README 文档'}
    ],
    notes:[
      {type:'warn', text:'每个子代理消耗独立 Token 配额，并行过多可能快速消耗配额。'}
    ],
    related:['agents','loop','btw','tasks']
  },
  loop: {
    name:'/loop', category:'自动化', catClass:'tag-auto',
    desc:'按时间间隔重复运行命令。本地进程内运行，最长存活 3 天。',
    syntax:'/loop <interval> <prompt>',
    params:[
      {name:'interval', type:'string', required:'是', desc:'时间间隔：5m、1h、30s'},
      {name:'prompt', type:'string', required:'是', desc:'每次循环执行的命令或提示'}
    ],
    examples:[
      {desc:'每5分钟检查 CI', code:'/loop 5m 检查 CI 运行状态'},
      {desc:'每30分钟拉取 PR 评论', code:'/loop 30m /pr-comments'}
    ],
    notes:[
      {type:'info', text:'关闭终端即停止。需要持久化用 /schedule。'}
    ],
    related:['schedule','tasks','agent','autofix-pr']
  },
  schedule: {
    name:'/schedule', category:'自动化', catClass:'tag-auto',
    desc:'创建云端持久化定时任务。支持 Cron 表达式，关机/休眠也运行，重启后自动恢复。',
    syntax:'/schedule [description]',
    params:[
      {name:'description', type:'string', required:'否', desc:'定时任务的描述和调度需求'}
    ],
    examples:[
      {desc:'每日工作日报', code:'/schedule 每个工作日早上9点生成开发进度报告'},
      {desc:'每周检查依赖', code:'/schedule 每周一早上检查 npm 依赖更新'}
    ],
    notes:[
      {type:'info', text:'持久化到 .claude/scheduled_tasks.json。与 /loop 区别：/schedule 持久化、/loop 本地临时。'}
    ],
    related:['loop','tasks','agent']
  },
  tasks: {
    name:'/tasks', category:'自动化', catClass:'tag-auto',
    desc:'查看所有后台任务状态：子代理、循环、定时任务、后台会话。',
    syntax:'/tasks', params:[],
    examples:[
      {desc:'查看后台任务', code:'/tasks'}
    ],
    related:['agent','loop','schedule','background']
  },
  btw: {
    name:'/btw', category:'自动化', catClass:'tag-auto',
    desc:'弹出临时只读子代理快速提问。不污染主会话历史。BTW = By The Way。',
    syntax:'/btw <question>',
    params:[
      {name:'question', type:'string', required:'是', desc:'要快速查询的问题'}
    ],
    examples:[
      {desc:'快速查语法', code:'/btw TypeScript 中 Record 类型的用法'},
      {desc:'搜索代码库', code:'/btw 这个项目中哪里使用了 JWT 认证'}
    ],
    notes:[
      {type:'info', text:'BTW 代理只读，不能修改文件。结果不添加上下文。'},
      {type:'tip', text:'不想干扰当前对话的快速问题都用 /btw。'}
    ],
    related:['agent','plan']
  },
  'remote-control': {
    name:'/remote-control', category:'自动化', catClass:'tag-auto',
    desc:'授权从 claude.ai 网页端远程控制当前终端会话。',
    syntax:'/remote-control', params:[],
    examples:[
      {desc:'开启远程控制', code:'/remote-control'}
    ],
    notes:[
      {type:'info', text:'需登录同一 Anthropic 账户。'}
    ],
    related:['teleport','desktop']
  },
  teleport: {
    name:'/teleport', category:'自动化', catClass:'tag-auto',
    desc:'将 Web/iOS 端会话"传送"到当前终端。跨设备无缝切换。',
    syntax:'/teleport', params:[],
    examples:[
      {desc:'拉取 Web 端会话', code:'/teleport\n# 选择要传送的会话'}
    ],
    notes:[
      {type:'tip', text:'手机上开始分析，用 /teleport 拉到终端继续编码。'}
    ],
    related:['remote-control','desktop']
  },
  desktop: {
    name:'/desktop', category:'自动化', catClass:'tag-auto',
    desc:'将终端会话转移到 Claude Code 桌面应用（Mac/Windows）中继续。',
    syntax:'/desktop', params:[],
    examples:[
      {desc:'转移到桌面应用', code:'/desktop'}
    ],
    related:['teleport','remote-control']
  },
  voice: {
    name:'/voice', category:'自动化', catClass:'tag-auto',
    desc:'启用语音输入。长按空格键说话，Claude Code 将语音转为文字。',
    syntax:'/voice', params:[],
    examples:[
      {desc:'开启语音输入', code:'/voice\n# 长按空格键开始说话'}
    ],
    notes:[
      {type:'info', text:'使用本地语音识别引擎，需麦克风权限。'}
    ],
    related:['chrome','ide']
  },
  chrome: {
    name:'/chrome', category:'自动化', catClass:'tag-auto',
    desc:'启用 Chrome 浏览器集成。通过 CDP 控制浏览器，进行网页自动化、截图、测试。',
    syntax:'/chrome', params:[],
    examples:[
      {desc:'开启浏览器集成', code:'/chrome'}
    ],
    notes:[
      {type:'info', text:'需要 Chrome/Chromium 浏览器。'}
    ],
    related:['ide','voice']
  },
  ide: {
    name:'/ide', category:'自动化', catClass:'tag-auto',
    desc:'自动检测并连接正在运行的 IDE（VS Code、JetBrains 等）。',
    syntax:'/ide', params:[],
    examples:[
      {desc:'连接 IDE', code:'/ide'}
    ],
    notes:[
      {type:'info', text:'需要 IDE 安装对应的 Claude Code 扩展/插件。'}
    ],
    related:['chrome','desktop']
  },
  'setup-bedrock': {
    name:'/setup-bedrock', category:'自动化', catClass:'tag-auto',
    desc:'配置 Amazon Bedrock 作为模型后端。通过 AWS Bedrock API 调用模型。',
    syntax:'/setup-bedrock', params:[],
    examples:[
      {desc:'配置 Bedrock', code:'/setup-bedrock\n# 按提示输入 AWS 凭证和区域'}
    ],
    notes:[
      {type:'warn', text:'确保 AWS 凭证安全，不要提交到 Git。'}
    ],
    related:['setup-vertex','config']
  },
  'setup-vertex': {
    name:'/setup-vertex', category:'自动化', catClass:'tag-auto',
    desc:'配置 Google Cloud Vertex AI 作为模型后端。通过 Vertex AI API 调用模型。',
    syntax:'/setup-vertex', params:[],
    examples:[
      {desc:'配置 Vertex AI', code:'/setup-vertex\n# 按提示输入 GCP 项目和凭证'}
    ],
    notes:[
      {type:'warn', text:'确保 GCP 凭证安全，不要提交到 Git。'}
    ],
    related:['setup-bedrock','config']
  },

  // ── 内置技能 ──
  batch: {
    name:'/batch', category:'内置技能', catClass:'tag-skill',
    desc:'大规模并行迁移工具。将大型重构拆分为 5-30 个隔离的 worktree 子代理并发执行。',
    syntax:'/batch <prompt>',
    params:[
      {name:'prompt', type:'string', required:'是', desc:'批量迁移任务描述'}
    ],
    examples:[
      {desc:'大规模框架迁移', code:'/batch 将所有 React class 组件迁移为函数组件'},
      {desc:'批量代码转换', code:'/batch 将所有 .js 文件重命名为 .ts 并添加类型注解'}
    ],
    notes:[
      {type:'warn', text:'消耗大量 Token。建议先在单个文件上测试，确认无误再批量运行。'},
      {type:'tip', text:'先在 3-5 个文件上验证迁移逻辑，再扩展到全量。'}
    ],
    related:['agent','ultraplan']
  },
  'claude-api': {
    name:'/claude-api', category:'内置技能', catClass:'tag-skill',
    desc:'Claude API 开发助手。检测到 anthropic SDK 导入时自动激活。支持模型迁移、Prompt 缓存、Managed Agents。覆盖 Python/JS/TS。',
    syntax:'/claude-api', params:[],
    examples:[
      {desc:'模型版本迁移', code:'/claude-api 将项目从 Claude 3.5 迁移到 4.6'},
      {desc:'优化 Prompt 缓存', code:'/claude-api 为这个 API 调用添加 prompt caching'}
    ],
    notes:[
      {type:'tip', text:'开发 Claude API 应用的首选工具——涵盖最佳实践、缓存策略、模型选择。'}
    ],
    related:['debug','code-review']
  },
  debug: {
    name:'/debug', category:'内置技能', catClass:'tag-skill',
    desc:'会话调试工具。读取调试日志，诊断工具调用失败和异常行为。',
    syntax:'/debug', params:[],
    examples:[
      {desc:'排查工具调用失败', code:'/debug\n# 查看日志中的错误信息'},
      {desc:'理解权限拒绝原因', code:'/debug\n# 查看权限模块的日志'}
    ],
    notes:[
      {type:'tip', text:'遇到莫名其妙的行为时（Hook 不触发、工具被静默拒绝），/debug 是首选。'}
    ],
    related:['doctor','bug']
  },
  'code-review': {
    name:'/code-review', category:'内置技能', catClass:'tag-skill',
    desc:'多维度代码审查，专注正确性 Bug：逻辑错误、空指针、边界条件、并发问题。支持 4 级深度。可选 --fix 自动修复、--comment 发布 PR 评论。',
    syntax:'/code-review [--fix] [--comment] [effort]',
    params:[
      {name:'--fix', type:'flag', required:'否', desc:'自动将修复建议应用到代码'},
      {name:'--comment', type:'flag', required:'否', desc:'发布为 GitHub PR 行内评论'},
      {name:'effort', type:'string', required:'否', desc:'审查深度：low / medium / high / max'}
    ],
    examples:[
      {desc:'基本代码审查', code:'/code-review'},
      {desc:'深度审查并自动修复', code:'/code-review --fix high'},
      {desc:'审查并发布 PR 评论', code:'/code-review --comment medium'}
    ],
    notes:[
      {type:'info', text:'专注正确性 Bug。复用/简化问题用 /simplify。'},
      {type:'tip', text:'日常用 medium，关键代码用 high，发布前用 max。'}
    ],
    related:['simplify','review','security-review','ultrareview']
  },
  simplify: {
    name:'/simplify', category:'内置技能', catClass:'tag-skill',
    desc:'纯代码清理：检查复用机会、简化逻辑、优化效率、确保 CLAUDE.md 合规。不查 Bug。2026年5月从 code-review 独立。',
    syntax:'/simplify', params:[],
    examples:[
      {desc:'清理当前更改', code:'/simplify'},
      {desc:'代码审查 + 简化', code:'/code-review medium\n/simplify'}
    ],
    notes:[
      {type:'info', text:'与 /code-review 分工：/code-review 查 Bug，/simplify 做清理。'},
      {type:'tip', text:'建议工作流：先 /code-review 修复 Bug，再 /simplify 优化。'}
    ],
    related:['code-review','review']
  },
  'deep-research': {
    name:'/deep-research', category:'内置技能', catClass:'tag-skill',
    desc:'深度调研：扇形网络搜索 → 获取来源 → 对抗性验证 → 综合引用报告。',
    syntax:'/deep-research <question>',
    params:[
      {name:'question', type:'string', required:'是', desc:'调研问题，越具体越好'}
    ],
    examples:[
      {desc:'技术选型调研', code:'/deep-research 2025年 Node.js 后端框架性能对比'},
      {desc:'最佳实践调研', code:'/deep-research 微服务架构中分布式事务的最佳实践'}
    ],
    notes:[
      {type:'warn', text:'消耗大量 Token 和时间。简单问题用 /btw 即可。'}
    ],
    related:['btw','plan']
  },
  'update-config': {
    name:'/update-config', category:'内置技能', catClass:'tag-skill',
    desc:'通过 settings.json 配置自动化行为。管理 Hooks、权限、环境变量。适合"当 X 时自动 Y"的持久化设置。',
    syntax:'/update-config <description>',
    params:[
      {name:'description', type:'string', required:'是', desc:'想要配置的自动化行为描述'}
    ],
    examples:[
      {desc:'添加自动化 Hook', code:'/update-config 每次 Bash 命令执行后记录日志'},
      {desc:'减少权限弹窗', code:'/update-config 自动允许所有 Read 操作'}
    ],
    notes:[
      {type:'info', text:'配置写入 settings.json。Hooks、权限由系统执行，不是 Claude 的记忆。'}
    ],
    related:['hooks','permissions','fewer-permission-prompts','config']
  },
  'keybindings-help': {
    name:'/keybindings-help', category:'内置技能', catClass:'tag-skill',
    desc:'键盘快捷键自定义向导。修改 ~/.claude/keybindings.json，支持普通绑定和和弦绑定。',
    syntax:'/keybindings-help', params:[],
    examples:[
      {desc:'获取快捷键帮助', code:'/keybindings-help'}
    ],
    notes:[
      {type:'tip', text:'简单修改用 /keybindings，复杂自定义用 /keybindings-help。'}
    ],
    related:['keybindings','vim']
  },
  verify: {
    name:'/verify', category:'内置技能', catClass:'tag-skill',
    desc:'验证代码变更的实际效果。启动应用并观察行为，确认修改是否达到预期。',
    syntax:'/verify', params:[],
    examples:[
      {desc:'验证当前修改', code:'/verify'},
      {desc:'验证 Bug 修复', code:'# 修改 bug 后\n/verify  # 确认修复有效'}
    ],
    notes:[
      {type:'info', text:'与 /run 区别：/verify 侧重验证变更效果，/run 侧重启动应用。'}
    ],
    related:['run','code-review']
  },
  'fewer-permission-prompts': {
    name:'/fewer-permission-prompts', category:'内置技能', catClass:'tag-skill',
    desc:'分析对话历史中的常用只读工具，自动生成优先允许列表写入 .claude/settings.json。',
    syntax:'/fewer-permission-prompts', params:[],
    examples:[
      {desc:'自动减少权限弹窗', code:'/fewer-permission-prompts'}
    ],
    notes:[
      {type:'info', text:'只对只读工具（Read、Grep、Glob）生成 allow 规则。写入操作不会自动允许。'}
    ],
    related:['permissions','update-config']
  },
  run: {
    name:'/run', category:'内置技能', catClass:'tag-skill',
    desc:'启动并驱动项目应用。先找项目级技能定义的启动方式，找不到则使用内置模式。',
    syntax:'/run', params:[],
    examples:[
      {desc:'启动应用', code:'/run'}
    ],
    notes:[
      {type:'info', text:'支持：CLI、Server、TUI、Electron、浏览器驱动应用等。'}
    ],
    related:['verify','init']
  },
  review: {
    name:'/review', category:'内置技能', catClass:'tag-skill',
    desc:'PR 综合审查。分析代码变更、测试覆盖、潜在问题，生成结构化审查报告。',
    syntax:'/review', params:[],
    examples:[
      {desc:'审查当前 PR', code:'/review'},
      {desc:'指定 PR 审查', code:'/review\n# 输入 PR 编号或 URL'}
    ],
    notes:[
      {type:'info', text:'与 /code-review 区别：/review 面向 PR 审查流程，/code-review 面向代码正确性。'}
    ],
    related:['code-review','security-review','pr-comments']
  },
  'security-review': {
    name:'/security-review', category:'内置技能', catClass:'tag-skill',
    desc:'对当前分支待提交更改进行完整安全审查。覆盖 OWASP Top 10、密钥泄露、注入风险等。',
    syntax:'/security-review', params:[],
    examples:[
      {desc:'运行安全审查', code:'/security-review'},
      {desc:'发布前安全检查', code:'/security-review\n# 修复发现的问题后再发布'}
    ],
    notes:[
      {type:'warn', text:'不能替代专业安全审计，但可发现常见安全漏洞和不良实践。'}
    ],
    related:['code-review','review','ultrareview']
  }
};

// ── Detail Panel Logic ──
var _detailLastScrollY = 0;

function openDetail(cmdName) {
  var data = CMD[cmdName];
  if (!data) return;

  _detailLastScrollY = window.scrollY;

  // Update header
  document.getElementById('detail-cmd-name').textContent = data.name;
  var catEl = document.getElementById('detail-category');
  catEl.textContent = data.category;
  catEl.className = 'detail-category ' + (data.catClass || '');

  // Build body
  var html = '';

  html += '<div class="detail-section">';
  html += '<h3><span class="sec-icon">📖</span> 功能概述</h3>';
  html += '<p style="font-size:.9rem;line-height:1.7;color:#44403c;">' + data.desc + '</p>';
  html += '</div>';

  html += '<div class="detail-section">';
  html += '<h3><span class="sec-icon">⌨️</span> 语法格式</h3>';
  html += '<div class="syntax-block">' + escapeHtml(data.syntax) + '</div>';
  html += '</div>';

  if (data.params && data.params.length > 0) {
    html += '<div class="detail-section">';
    html += '<h3><span class="sec-icon">📋</span> 参数说明</h3>';
    html += '<div style="overflow-x:auto;"><table class="param-table">';
    html += '<thead><tr><th>参数</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody>';
    data.params.forEach(function(p) {
      html += '<tr><td>' + p.name + '</td><td>' + (p.type || '—') + '</td>';
      html += '<td>' + (p.required || '—') + '</td><td>' + (p.default || '—') + '</td>';
      html += '<td>' + (p.desc || '—') + '</td></tr>';
    });
    html += '</tbody></table></div></div>';
  }

  if (data.examples && data.examples.length > 0) {
    html += '<div class="detail-section">';
    html += '<h3><span class="sec-icon">💡</span> 使用示例</h3>';
    data.examples.forEach(function(ex) {
      html += '<div class="example-block">';
      html += '<div class="ex-desc">' + ex.desc + '</div>';
      html += '<code>' + escapeHtml(ex.code) + '</code>';
      html += '</div>';
    });
    html += '</div>';
  }

  if (data.notes && data.notes.length > 0) {
    html += '<div class="detail-section">';
    html += '<h3><span class="sec-icon">⚠️</span> 注意事项</h3>';
    html += '<ul class="notes-list">';
    data.notes.forEach(function(n) {
      html += '<li class="' + (n.type || '') + '">' + n.text + '</li>';
    });
    html += '</ul></div>';
  }

  if (data.related && data.related.length > 0) {
    html += '<div class="detail-section">';
    html += '<h3><span class="sec-icon">🔗</span> 相关命令</h3>';
    html += '<div class="detail-related">';
    data.related.forEach(function(rel) {
      var relData = CMD[rel];
      var relName = relData ? relData.name : '/' + rel;
      html += '<span class="rel-cmd" onclick="event.stopPropagation();openDetail(\'' + rel + '\');">' + relName + '</span>';
    });
    html += '</div></div>';
  }

  var bodyEl = document.getElementById('detail-body');
  if (bodyEl) { bodyEl.innerHTML = html; bodyEl.scrollTop = 0; }

  document.getElementById('detail-overlay').classList.add('active');
  document.getElementById('detail-panel').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.remove('active');
  document.getElementById('detail-panel').classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(function() {
    window.scrollTo({ top: _detailLastScrollY, behavior: 'instant' });
  }, 50);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Event Binding ──
document.addEventListener('click', function(e) {
  var cmdEl = e.target.closest('.cmd-clickable');
  if (!cmdEl) return;
  var cmdName = cmdEl.getAttribute('data-cmd');
  if (cmdName && CMD[cmdName]) {
    e.preventDefault();
    openDetail(cmdName);
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var panel = document.getElementById('detail-panel');
    if (panel && panel.classList.contains('active')) closeDetail();
  }
});

// Close panel when clicking sidebar links
document.addEventListener('DOMContentLoaded', function() {
  var sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  sidebarLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      var panel = document.getElementById('detail-panel');
      if (panel && panel.classList.contains('active')) closeDetail();
    });
  });
});
