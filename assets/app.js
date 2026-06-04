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
