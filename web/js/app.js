/* ==================== 全局错误提示 ==================== */
window.__errs = [];
function showError(msg) {
  window.__errs.push(String(msg));
  const banner = document.getElementById('err-banner');
  if (!banner) return;
  banner.classList.remove('hidden');
  banner.textContent = window.__errs.join('\n');
}
window.addEventListener('error', (e) => {
  showError((e.message || '未知错误') + (e.filename ? ' @ ' + e.filename + ':' + e.lineno : ''));
});
window.addEventListener('unhandledrejection', (e) => {
  showError('Promise 异常: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
});

/* ==================== 多语言 ==================== */
const I18N = {
  zh: {
    undo: '撤销',
    redo: '恢复',
    theme: '主题',
    undoTitle: '撤销 (Ctrl+Z)',
    redoTitle: '恢复 (Ctrl+Y)',
    themeToDark: '切换到深色主题',
    themeToLight: '切换到浅色主题',
  },
};

let currentLang = 'zh';

function t(key) {
  const dict = I18N[currentLang] || I18N.zh;
  if (dict[key] !== undefined) return dict[key];
  return I18N.zh[key] !== undefined ? I18N.zh[key] : key;
}

function applyI18n() {
  const undoBtn = document.getElementById('btn-undo');
  const redoBtn = document.getElementById('btn-redo');
  const themeBtn = document.getElementById('btn-theme');
  if (undoBtn) { undoBtn.textContent = t('undo'); undoBtn.title = t('undoTitle'); }
  if (redoBtn) { redoBtn.textContent = t('redo'); redoBtn.title = t('redoTitle'); }
  if (themeBtn) {
    themeBtn.textContent = t('theme');
    themeBtn.title = state.theme === 'dark' ? t('themeToLight') : t('themeToDark');
  }
}

/* ==================== 状态 ==================== */
const state = {
  tabs: [],          // { id, path, content, dirty, cursor }
  activeId: null,
  seq: 1,
  baseFontSize: 14,
  zoomLevel: 100,
  fontFamily: '微软雅黑',
  mode: 'split',
  theme: 'light',
};

/* ==================== DOM 引用 ==================== */
const mainEl = document.getElementById('main');
const previewEl = document.getElementById('preview');
const fontSelect = document.getElementById('font-family');
const sizeSelect = document.getElementById('font-size');
const statusFile = document.getElementById('status-file');
const statusModified = document.getElementById('status-modified');
const statusZoom = document.getElementById('status-zoom');
const statusCursor = document.getElementById('status-cursor');
const statusCount = document.getElementById('status-count');
const findBar = document.getElementById('find-bar');
const findInput = document.getElementById('find-input');
const replaceInput = document.getElementById('replace-input');
const findInfo = document.getElementById('find-info');
const hljsTheme = document.getElementById('hljs-theme');
const tabsBox = document.getElementById('tabs');

let cm = null;              // CodeMirror 实例
let suppressChange = false; // 程序化切换内容时抑制 change 事件

/* ==================== marked 配置 ==================== */
const mdRenderer = new marked.Renderer();
// 兼容 marked v12（位置参数）与 v13+（token 对象）两种签名
mdRenderer.code = function (codeOrToken, infostring) {
  let text, lang;
  if (typeof codeOrToken === 'string') {
    text = codeOrToken;
    lang = infostring || '';
  } else {
    text = codeOrToken.text || '';
    lang = codeOrToken.lang || '';
  }
  let highlighted;
  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(text, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
  } catch (e) {
    highlighted = text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }
  const cls = lang ? ' class="hljs language-' + lang + '"' : ' class="hljs"';
  return '<pre><code' + cls + '>' + highlighted + '</code></pre>';
};
marked.use({ gfm: true, breaks: true, renderer: mdRenderer });

/* ==================== 标签管理 ==================== */
function tabTitle(tab) {
  if (!tab) return '未命名';
  if (!tab.path) return '未命名';
  const parts = tab.path.split(/[\\/]/);
  return parts[parts.length - 1] || tab.path;
}

function activeTab() {
  for (let i = 0; i < state.tabs.length; i++) {
    if (state.tabs[i].id === state.activeId) return state.tabs[i];
  }
  return null;
}

function syncActiveFromEditor() {
  const tab = activeTab();
  if (tab && cm) tab.content = cm.getValue();
}

function createTab(opts) {
  opts = opts || {};
  const tab = {
    id: 't' + (state.seq++),
    path: opts.path || null,
    content: opts.content || '',
    dirty: !!opts.dirty,
    // 每个标签独立文档，保留各自的撤销/重做历史
    doc: CodeMirror.Doc(opts.content || '', 'gfm'),
  };
  state.tabs.push(tab);
  if (opts.activate !== false) {
    activateTab(tab.id);
  } else {
    renderTabs();
  }
  persistTabs();
  return tab;
}

function activateTab(id) {
  if (!cm) return;
  if (id === state.activeId) { renderTabs(); return; }

  syncActiveFromEditor();

  const tab = state.tabs.find((t) => t.id === id);
  if (!tab) return;

  state.activeId = id;
  suppressChange = true;
  if (!tab.doc) tab.doc = CodeMirror.Doc(tab.content || '', 'gfm');
  // 用 swapDoc 切换文档：保留每个标签自己的撤销历史与光标位置
  cm.swapDoc(tab.doc);
  suppressChange = false;

  clearTimeout(renderTimer);
  render();
  updateStatus();
  renderTabs();
  persistTabs();
  cm.focus();
}

function closeTab(id) {
  const idx = state.tabs.findIndex((t) => t.id === id);
  if (idx < 0) return;

  const tab = state.tabs[idx];
  if (id === state.activeId) syncActiveFromEditor();

  if (tab.dirty && !confirm('「' + tabTitle(tab) + '」有未保存的修改，确定关闭吗？')) return;

  state.tabs.splice(idx, 1);

  if (state.tabs.length === 0) {
    state.activeId = null;
    createTab({});
    return;
  }

  if (id === state.activeId) {
    const next = state.tabs[Math.min(idx, state.tabs.length - 1)];
    state.activeId = null;   // 强制切换
    activateTab(next.id);
  } else {
    renderTabs();
    persistTabs();
  }
}

function switchTabByOffset(offset) {
  if (state.tabs.length < 2) return;
  let idx = state.tabs.findIndex((t) => t.id === state.activeId);
  if (idx < 0) idx = 0;
  idx = (idx + offset + state.tabs.length) % state.tabs.length;
  activateTab(state.tabs[idx].id);
}

function newTab() {
  const tab = activeTab();
  if (tab && !tab.path && !tab.dirty && cm && cm.getValue().trim() === '') {
    cm.focus();
    return;
  }
  createTab({});
}

function addBlankTab() {
  createTab({});
}

function openInTab(path, content) {
  const lower = path.toLowerCase();
  const existing = state.tabs.find((t) => t.path && t.path.toLowerCase() === lower);
  if (existing) {
    activateTab(existing.id);
    return;
  }

  const cur = activeTab();
  if (cur && !cur.path && !cur.dirty && cm && cm.getValue().trim() === '') {
    // 复用空白标签
    cur.path = path;
    cur.content = content || '';
    cur.dirty = false;
    cur.doc.setValue(cur.content);   // 新载入文件，历史从零开始
    clearTimeout(renderTimer);
    render();
    updateStatus();
    renderTabs();
    persistTabs();
    cm.focus();
    return;
  }

  createTab({ path: path, content: content || '' });
}

/* ==================== 标签栏渲染 ==================== */
function renderTabs() {
  if (!tabsBox) return;
  tabsBox.innerHTML = '';
  state.tabs.forEach((tab) => {
    const el = document.createElement('div');
    el.className = 'tab' + (tab.id === state.activeId ? ' active' : '');
    el.dataset.tabId = tab.id;
    el.title = tab.path || '未命名';

    const dot = document.createElement('span');
    dot.className = 'tab-dot' + (tab.dirty ? ' on' : '');

    const name = document.createElement('span');
    name.className = 'tab-name';
    name.textContent = tabTitle(tab);

    const close = document.createElement('span');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = '关闭标签 (Ctrl+W)';
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });

    el.addEventListener('click', () => activateTab(tab.id));
    el.addEventListener('auxclick', (e) => {
      if (e.button === 1) closeTab(tab.id);
    });

    el.appendChild(dot);
    el.appendChild(name);
    el.appendChild(close);
    tabsBox.appendChild(el);
  });

  const act = tabsBox.querySelector('.tab.active');
  if (act) act.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function updateTabDot(tab) {
  if (!tab) return;
  const el = tabsBox && tabsBox.querySelector('[data-tab-id="' + tab.id + '"]');
  if (!el) return;
  const dot = el.querySelector('.tab-dot');
  if (dot) dot.classList.toggle('on', !!tab.dirty);
  el.title = tab.path || '未命名';
  const name = el.querySelector('.tab-name');
  if (name) name.textContent = tabTitle(tab);
}

/* ==================== 持久化 ==================== */
let persistTimer = null;

function persistTabsNow() {
  try {
    const data = {
      seq: state.seq,
      active: state.tabs.findIndex((t) => t.id === state.activeId),
      tabs: state.tabs.map((t) => ({ path: t.path, content: t.content, dirty: t.dirty })),
    };
    localStorage.setItem('md_tabs_v2', JSON.stringify(data));
  } catch (e) {}
}

function persistTabs() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistTabsNow, 400);
}

function restoreTabs() {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem('md_tabs_v2') || 'null');
  } catch (e) {
    data = null;
  }

  if (data && Array.isArray(data.tabs) && data.tabs.length > 0) {
    state.seq = data.seq || 1;
    state.tabs = data.tabs.map((t) => ({
      id: 't' + (state.seq++),
      path: t.path || null,
      content: t.content || '',
      dirty: !!t.dirty,
      doc: CodeMirror.Doc(t.content || '', 'gfm'),
    }));
    let idx = typeof data.active === 'number' ? data.active : 0;
    if (idx < 0 || idx >= state.tabs.length) idx = 0;
    state.activeId = null;
    activateTab(state.tabs[idx].id);
    return;
  }

  createTab({});
}

/* ==================== 渲染预览 ==================== */
let renderTimer = null;
function render() {
  const src = cm ? cm.getValue() : '';
  try {
    previewEl.innerHTML = marked.parse(src);
  } catch (e) {
    previewEl.innerHTML = '<p style="color:#d1242f">渲染失败: ' + e.message + '</p>';
  }

  // 重新渲染后，若正处于预览查找状态，重新应用高亮
  if (previewQuery) {
    const count = highlightPreview(previewQuery);
    if (count > 0) {
      if (previewHitIndex >= count) previewHitIndex = count - 1;
      if (previewHitIndex < 0) previewHitIndex = 0;
      previewHits[previewHitIndex].classList.add('current');
      findInfo.textContent = (previewHitIndex + 1) + '/' + count;
    } else {
      previewHitIndex = -1;
      findInfo.textContent = '预览中未找到';
    }
  }
}
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 120);
}

/* ==================== 状态栏 ==================== */
function updateStatus() {
  const tab = activeTab();
  const text = cm ? cm.getValue() : '';

  statusFile.textContent = tab && tab.path ? tab.path : '未命名';
  statusModified.textContent = tab && tab.dirty ? '● 已修改' : '';
  statusZoom.textContent = state.zoomLevel + '%';

  const chars = text.length;
  const lines = text.split('\n').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  statusCount.textContent = chars + ' 字 / ' + words + ' 词 / ' + lines + ' 行';

  if (cm) {
    const cur = cm.getCursor();
    statusCursor.textContent = '行 ' + (cur.line + 1) + ', 列 ' + (cur.ch + 1);
  }
}

/* ==================== 字体 / 字号 / 缩放 ==================== */
function applyFont() {
  document.documentElement.style.setProperty('--font-family', state.fontFamily);
  document.documentElement.style.setProperty('--font-size', state.baseFontSize + 'px');
  if (cm) {
    const wrapper = cm.getWrapperElement();
    wrapper.style.fontFamily = state.fontFamily;
    cm.refresh();
  }
  previewEl.style.fontFamily = state.fontFamily;
  localStorage.setItem('md_font_family', state.fontFamily);
  localStorage.setItem('md_font_size', state.baseFontSize);
  setZoom(state.zoomLevel);
}

function setZoom(percent) {
  state.zoomLevel = Math.max(50, Math.min(300, Math.round(percent)));
  const effective = Math.round(state.baseFontSize * state.zoomLevel / 100);
  if (cm) {
    cm.getWrapperElement().style.fontSize = effective + 'px';
    cm.refresh();
  }
  previewEl.style.fontSize = effective + 'px';
  updateStatus();
}

function resetZoom() {
  setZoom(100);
}

/* ==================== 模式 / 主题 ==================== */
function setMode(mode) {
  state.mode = mode;
  mainEl.className = mode === 'edit' ? 'edit-only' : mode === 'preview' ? 'preview-only' : 'split';
  document.getElementById('btn-mode-edit').classList.toggle('active', mode === 'edit');
  document.getElementById('btn-mode-split').classList.toggle('active', mode === 'split');
  document.getElementById('btn-mode-preview').classList.toggle('active', mode === 'preview');
  localStorage.setItem('md_mode', mode);

  // 离开预览模式时清除预览区查找高亮
  if (mode !== 'preview' && previewQuery) {
    clearPreviewHits();
    previewQuery = '';
    previewHitIndex = -1;
    findInfo.textContent = '';
  }
  if (cm) setTimeout(() => cm.refresh(), 30);
}

function setTheme(theme) {
  state.theme = theme;
  document.body.classList.toggle('dark', theme === 'dark');
  hljsTheme.href = theme === 'dark' ? 'assets/github-dark.min.css' : 'assets/github.min.css';
  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) {
    themeBtn.textContent = t('theme');
    themeBtn.title = theme === 'dark' ? t('themeToLight') : t('themeToDark');
  }
  localStorage.setItem('md_theme', theme);
}

/* ==================== 文件操作 ==================== */
function api() {
  if (!window.pywebview || !window.pywebview.api) return null;
  return window.pywebview.api;
}

async function openFile() {
  const a = api();
  if (!a) { alert('文件接口不可用，请通过 exe 启动程序'); return; }
  try {
    const result = await a.open_file();
    if (!result || result === null) return;                 // 用户取消
    if (result.error) { alert('打开失败: ' + result.error); return; }
    if (!result.path) { alert('打开失败: 未获取到文件路径'); return; }
    openInTab(result.path, result.content || '');
  } catch (e) {
    alert('打开文件异常: ' + (e && e.message ? e.message : e));
  }
}

async function saveFile() {
  const tab = activeTab();
  if (!tab) return;
  if (!tab.path) return saveAsFile();

  const a = api();
  if (!a) { alert('文件接口不可用，请通过 exe 启动程序'); return; }
  try {
    const result = await a.save_file(tab.path, cm ? cm.getValue() : '');
    if (result === true) {
      tab.dirty = false;
      updateTabDot(tab);
      updateStatus();
      persistTabsNow();
    } else if (result && result.error) {
      alert('保存失败: ' + result.error);
    }
  } catch (e) {
    alert('保存异常: ' + (e && e.message ? e.message : e));
  }
}

async function saveAsFile() {
  const tab = activeTab();
  if (!tab) return;

  const a = api();
  if (!a) { alert('文件接口不可用，请通过 exe 启动程序'); return; }
  try {
    const result = await a.save_as(cm ? cm.getValue() : '');
    if (!result) return;                                     // 用户取消
    if (result.error) { alert('另存为失败: ' + result.error); return; }
    if (result.path) {
      tab.path = result.path;
      tab.dirty = false;
      updateTabDot(tab);
      updateStatus();
      persistTabsNow();
    }
  } catch (e) {
    alert('另存为异常: ' + (e && e.message ? e.message : e));
  }
}

/* ==================== 关于 ==================== */
const APP_VERSION = '1.0.0';
const APP_AUTHOR = 'flyfeel@gmail.com';
const APP_HOMEPAGE = 'https://github.com/yeefeel/MarkdownEditor';

function openExternal(url) {
  const a = api();
  if (a && a.open_url) {
    a.open_url(url).catch(function () {});
    return;
  }
  window.open(url, '_blank');
}

function renderHomepage(url) {
  const hp = document.getElementById('about-homepage');
  if (!hp) return;
  hp.innerHTML = '';
  if (!url) {
    hp.textContent = '待补充';
    return;
  }
  const a = document.createElement('a');
  a.textContent = url;
  a.href = 'javascript:void(0)';
  a.addEventListener('click', function () { openExternal(url); });
  hp.appendChild(a);
}

function openAbout() {
  document.getElementById('about-version').textContent = APP_VERSION;
  document.getElementById('about-author').textContent = APP_AUTHOR;
  renderHomepage(APP_HOMEPAGE);
  document.getElementById('about-mask').classList.remove('hidden');
}

function closeAbout() {
  const mask = document.getElementById('about-mask');
  if (mask) mask.classList.add('hidden');
}

/* ==================== 启动文件（双击 .md / 命令行参数） ==================== */
async function openStartupFile() {
  const a = api();
  if (!a || !a.get_startup_file) return;
  try {
    const path = await a.get_startup_file();
    if (path) await openDroppedPaths([path]);
  } catch (e) {
    showError('打开启动文件失败: ' + (e && e.message ? e.message : e));
  }
}

/* ==================== 文件拖放 ==================== */
async function openDroppedPaths(paths) {
  const a = api();
  if (!a || !paths || !paths.length) return;
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    try {
      const r = await a.read_file(p);
      if (!r) continue;
      if (r.error) { alert('打开「' + p + '」失败: ' + r.error); continue; }
      if (r.path) openInTab(r.path, r.content || '');
    } catch (e) {
      alert('打开拖入文件失败: ' + (e && e.message ? e.message : e));
    }
  }
}
window.openDroppedPaths = openDroppedPaths;

let dragDepth = 0;

function isFileDrag(e) {
  const t = e.dataTransfer && e.dataTransfer.types;
  return !!t && Array.prototype.indexOf.call(t, 'Files') >= 0;
}

function toggleDropOverlay(show) {
  const overlay = document.getElementById('drop-overlay');
  if (overlay) overlay.classList.toggle('hidden', !show);
}

function bindDropEvents() {
  document.addEventListener('dragenter', (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragDepth++;
    toggleDropOverlay(true);
  }, true);

  document.addEventListener('dragover', (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }, true);

  document.addEventListener('dragleave', (e) => {
    if (!isFileDrag(e)) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) toggleDropOverlay(false);
  }, true);

  // 注意：不要 stopPropagation，pywebview 在 body 上的 drop 监听才能拿到文件路径
  document.addEventListener('drop', (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragDepth = 0;
    toggleDropOverlay(false);
  }, true);
}

/* ==================== 查找替换 ==================== */
let lastFindIndex = 0;

/* 预览模式查找：在 #preview 的文本节点上做 mark 高亮 */
let previewQuery = '';
let previewHits = [];
let previewHitIndex = -1;

function clearPreviewHits() {
  previewEl.querySelectorAll('mark.find-hit').forEach(function (m) {
    const parent = m.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
  previewHits = [];
}

function highlightPreview(query) {
  clearPreviewHits();
  if (!query) return 0;
  const q = query.toLowerCase();
  const walker = document.createTreeWalker(previewEl, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeValue && n.nodeValue.toLowerCase().indexOf(q) >= 0) nodes.push(n);
  }
  nodes.forEach(function (node) {
    const text = node.nodeValue;
    const lower = text.toLowerCase();
    const frag = document.createDocumentFragment();
    let pos = 0;
    let idx;
    while ((idx = lower.indexOf(q, pos)) >= 0) {
      if (idx > pos) frag.appendChild(document.createTextNode(text.slice(pos, idx)));
      const mark = document.createElement('mark');
      mark.className = 'find-hit';
      mark.textContent = text.slice(idx, idx + query.length);
      frag.appendChild(mark);
      pos = idx + query.length;
    }
    if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
    node.parentNode.replaceChild(frag, node);
  });
  previewHits = Array.prototype.slice.call(previewEl.querySelectorAll('mark.find-hit'));
  return previewHits.length;
}

function findNextInPreview() {
  const query = findInput.value;
  if (!query) return;

  if (query !== previewQuery) {
    previewQuery = query;
    highlightPreview(query);
    previewHitIndex = -1;
  }

  if (previewHits.length === 0) {
    findInfo.textContent = '预览中未找到';
    return;
  }

  previewHitIndex = (previewHitIndex + 1) % previewHits.length;
  previewHits.forEach(function (h) { h.classList.remove('current'); });
  const hit = previewHits[previewHitIndex];
  hit.classList.add('current');
  hit.scrollIntoView({ block: 'center', behavior: 'smooth' });
  findInfo.textContent = (previewHitIndex + 1) + '/' + previewHits.length;
}

function openFind() {
  findBar.classList.remove('hidden');
  findInput.focus();
  findInput.select();
}

function closeFind() {
  findBar.classList.add('hidden');
  if (previewQuery) {
    clearPreviewHits();
    previewQuery = '';
    previewHitIndex = -1;
  }
  if (cm && state.mode !== 'preview') cm.focus();
}

function findNext() {
  // 预览模式下编辑器不可见，改为在预览区查找
  if (state.mode === 'preview') {
    findNextInPreview();
    return;
  }
  const query = findInput.value;
  if (!query || !cm) return;
  const text = cm.getValue();
  let index = text.indexOf(query, lastFindIndex);
  if (index < 0) index = text.indexOf(query, 0);
  if (index < 0) {
    findInfo.textContent = '未找到';
    return;
  }
  const from = cm.posFromIndex(index);
  const to = cm.posFromIndex(index + query.length);
  cm.setSelection(from, to);
  cm.scrollIntoView({ from: from, to: to }, 60);
  lastFindIndex = index + query.length;
  findInfo.textContent = '位置 ' + (index + 1);
}

function replaceOne() {
  if (state.mode === 'preview') { findInfo.textContent = '预览模式为只读，请切到编辑或分屏模式替换'; return; }
  const query = findInput.value;
  if (!query || !cm) return;
  const sel = cm.getSelection();
  if (sel === query) {
    cm.replaceSelection(replaceInput.value, 'around');
    markDirty();
  }
  findNext();
}

function replaceAll() {
  if (state.mode === 'preview') { findInfo.textContent = '预览模式为只读，请切到编辑或分屏模式替换'; return; }
  const query = findInput.value;
  if (!query || !cm) return;
  const text = cm.getValue();
  const count = text.split(query).length - 1;
  if (count === 0) { findInfo.textContent = '未找到'; return; }
  // 用 replaceRange 替换全文，使“全部替换”本身也是一次可撤销的操作
  cm.operation(function () {
    cm.replaceRange(text.split(query).join(replaceInput.value),
      { line: 0, ch: 0 }, cm.posFromIndex(text.length));
  });
  markDirty();
  findInfo.textContent = '已替换 ' + count + ' 处';
}

/* ==================== 编辑辅助 ==================== */
function markDirty() {
  const tab = activeTab();
  if (tab) {
    tab.dirty = true;
    tab.content = cm ? cm.getValue() : '';
    updateTabDot(tab);
  }
  render();
  persistTabs();
  updateStatus();
}

function insertMarkdown(prefix, suffix) {
  if (!cm) return;
  const sel = cm.getSelection() || '';
  const body = sel || '文本';
  cm.replaceSelection(prefix + body + suffix, 'around');
  const cur = cm.getCursor();
  if (!sel) {
    cm.setSelection(
      { line: cur.line, ch: Math.max(0, cur.ch - (body.length + suffix.length)) },
      { line: cur.line, ch: Math.max(0, cur.ch - suffix.length) }
    );
  }
  cm.focus();
  markDirty();
}

/* ==================== 初始化编辑器 ==================== */
function initEditor() {
  cm = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: 'gfm',
    lineNumbers: true,
    lineWrapping: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    tabSize: 4,
    indentUnit: 4,
    // 缩短历史事件合并窗口，让撤销更细粒度（默认 1250ms 会一次撤销一大段）
    historyEventDelay: 400,
    theme: 'default',
  });
  window.__cm = cm;

  cm.on('change', () => {
    if (suppressChange) return;
    const tab = activeTab();
    if (tab) {
      tab.content = cm.getValue();
      tab.dirty = true;
      updateTabDot(tab);
    }
    scheduleRender();
    persistTabs();
    updateStatus();
  });

  cm.on('cursorActivity', updateStatus);

  // Ctrl + 滚轮缩放（编辑区）
  cm.getWrapperElement().addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom(state.zoomLevel + (e.deltaY > 0 ? -10 : 10));
    }
  }, { passive: false });

  // 分屏滚动联动（编辑区 → 预览区）
  const scroller = cmScroller();
  if (scroller) scroller.addEventListener('scroll', syncScrollFromEditor, { passive: true });
}

/* ==================== 分屏滚动联动 ==================== */
let scrollLock = false;

function cmScroller() {
  return cm ? cm.getWrapperElement().querySelector('.CodeMirror-scroll') : null;
}

function previewPaneEl() {
  return document.getElementById('preview-pane');
}

function scrollRatio(el) {
  const max = el.scrollHeight - el.clientHeight;
  return max > 0 ? el.scrollTop / max : 0;
}

function syncScrollTo(from, to) {
  if (state.mode !== 'split' || scrollLock || !from || !to) return;
  const max = to.scrollHeight - to.clientHeight;
  if (max <= 0) return;
  scrollLock = true;
  to.scrollTop = scrollRatio(from) * max;
  requestAnimationFrame(() => { scrollLock = false; });
}

function syncScrollFromEditor() {
  syncScrollTo(cmScroller(), previewPaneEl());
}

function syncScrollFromPreview() {
  syncScrollTo(previewPaneEl(), cmScroller());
}

function bindEvents() {
  document.getElementById('btn-new').addEventListener('click', newTab);
  document.getElementById('btn-open').addEventListener('click', openFile);
  document.getElementById('btn-save').addEventListener('click', saveFile);
  document.getElementById('btn-saveas').addEventListener('click', saveAsFile);
  document.getElementById('btn-undo').addEventListener('click', () => cm && cm.undo());
  document.getElementById('btn-redo').addEventListener('click', () => cm && cm.redo());
  document.getElementById('btn-find').addEventListener('click', openFind);
  document.getElementById('btn-zoom-reset').addEventListener('click', resetZoom);
  document.getElementById('btn-mode-edit').addEventListener('click', () => setMode('edit'));
  document.getElementById('btn-mode-split').addEventListener('click', () => setMode('split'));
  document.getElementById('btn-mode-preview').addEventListener('click', () => setMode('preview'));
  document.getElementById('btn-theme').addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));

  const newTabBtn = document.getElementById('btn-new-tab');
  if (newTabBtn) newTabBtn.addEventListener('click', addBlankTab);

  // 关于对话框
  const aboutBtn = document.getElementById('btn-about');
  if (aboutBtn) aboutBtn.addEventListener('click', openAbout);
  const aboutClose = document.getElementById('btn-about-close');
  if (aboutClose) aboutClose.addEventListener('click', closeAbout);
  const aboutMask = document.getElementById('about-mask');
  if (aboutMask) {
    aboutMask.addEventListener('click', function (e) {
      if (e.target === aboutMask) closeAbout();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAbout();
  });

  fontSelect.addEventListener('change', (e) => { state.fontFamily = e.target.value; applyFont(); });
  sizeSelect.addEventListener('change', (e) => {
    state.baseFontSize = parseInt(e.target.value, 10);
    applyFont();
  });

  // 预览区 Ctrl + 滚轮缩放
  document.getElementById('preview-pane').addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom(state.zoomLevel + (e.deltaY > 0 ? -10 : 10));
    }
  }, { passive: false });

  // 分屏滚动联动（预览区 → 编辑区）
  previewPaneEl().addEventListener('scroll', syncScrollFromPreview, { passive: true });

  // 查找替换
  document.getElementById('btn-find-next').addEventListener('click', findNext);
  document.getElementById('btn-replace').addEventListener('click', replaceOne);
  document.getElementById('btn-replace-all').addEventListener('click', replaceAll);
  document.getElementById('btn-find-close').addEventListener('click', closeFind);
  findInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); findNext(); }
    if (e.key === 'Escape') closeFind();
  });

  // 快捷键（捕获阶段，避免被 CodeMirror 拦截）
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;
    const key = (e.key || '').toLowerCase();

    if (key === 'tab') {
      e.preventDefault();
      switchTabByOffset(e.shiftKey ? -1 : 1);
      return;
    }
    if (key === 'w') { e.preventDefault(); if (state.activeId) closeTab(state.activeId); return; }
    if (key === 'n') { e.preventDefault(); newTab(); }
    else if (key === 'o') { e.preventDefault(); openFile(); }
    else if (key === 's') { e.preventDefault(); e.shiftKey ? saveAsFile() : saveFile(); }
    else if (key === 'f') { e.preventDefault(); openFind(); }
    else if (key === 'h') { e.preventDefault(); openFind(); replaceInput.focus(); }
    else if (key === 'b') { e.preventDefault(); insertMarkdown('**', '**'); }
    else if (key === 'i') { e.preventDefault(); insertMarkdown('*', '*'); }
    else if (key === '=' || key === '+') { e.preventDefault(); setZoom(state.zoomLevel + 10); }
    else if (key === '-') { e.preventDefault(); setZoom(state.zoomLevel - 10); }
    else if (key === '0') { e.preventDefault(); resetZoom(); }
  }, true);

  // 关闭前立即落盘草稿
  window.addEventListener('beforeunload', () => {
    syncActiveFromEditor();
    persistTabsNow();
  });
}

/* ==================== 启动 ==================== */
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;
  try {
    const savedFamily = localStorage.getItem('md_font_family');
    const savedSize = localStorage.getItem('md_font_size');
    const savedTheme = localStorage.getItem('md_theme');
    const savedMode = localStorage.getItem('md_mode');

    if (savedFamily) { state.fontFamily = savedFamily; fontSelect.value = savedFamily; }
    if (savedSize) { state.baseFontSize = parseInt(savedSize, 10); sizeSelect.value = savedSize; }
    setTheme(savedTheme || 'light');
    setMode(savedMode || 'split');

    initEditor();
    bindEvents();
    bindDropEvents();
    applyI18n();
    applyFont();
    restoreTabs();
    updateStatus();
    cm.focus();
    openStartupFile();
  } catch (e) {
    showError('初始化失败: ' + e.message + '\n' + (e.stack || ''));
  }
}

if (window.pywebview && window.pywebview.api) {
  init();
} else {
  window.addEventListener('pywebviewready', () => {
    if (!cm) init();
  });
  // 浏览器直接打开调试时也能初始化界面
  setTimeout(() => { if (!cm) init(); }, 1200);
}
