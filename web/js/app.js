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
  showError((e.message || t('unknownError')) + (e.filename ? ' @ ' + e.filename + ':' + e.lineno : ''));
});
window.addEventListener('unhandledrejection', (e) => {
  showError(t('promiseError', { error: e.reason && e.reason.message ? e.reason.message : e.reason }));
});

/* ==================== 多语言 ==================== */
const I18N = {
  zh: {
    appTitle: 'Markdown 编辑器',
    new: '新建', newTitle: '新建 (Ctrl+N)',
    open: '打开', openTitle: '打开 (Ctrl+O)',
    save: '保存', saveTitle: '保存 (Ctrl+S)',
    saveAs: '另存为', saveAsTitle: '另存为 (Ctrl+Shift+S)',
    undo: '撤销', undoTitle: '撤销 (Ctrl+Z)',
    redo: '恢复', redoTitle: '恢复 (Ctrl+Y)',
    find: '查找', findTitle: '查找 (Ctrl+F)',
    fontLabel: '字体',
    sizeLabel: '字号',
    zoomReset: '重置缩放', zoomResetTitle: '重置缩放 (Ctrl+0)',
    modeEdit: '编辑', modeEditTitle: '仅编辑',
    modeSplit: '分屏', modeSplitTitle: '分屏',
    modePreview: '预览', modePreviewTitle: '仅预览',
    theme: '主题', themeTitle: '切换主题',
    themeToDark: '切换到深色主题',
    themeToLight: '切换到浅色主题',
    about: '关于', aboutTitle: '关于',
    lang: 'EN', langTitle: '切换到英文',
    aboutHeading: 'Markdown 编辑器',
    aboutVersion: '版本', aboutAuthor: '作者', aboutHomepage: '主页',
    aboutHomepageEmpty: '待补充',
    aboutClose: '关闭',
    unknownError: '未知错误',
    promiseError: 'Promise 异常: {error}',
    initFailed: '初始化失败: {error}',
    newTabTitle: '新建标签 (Ctrl+N)',
    closeTabTitle: '关闭标签 (Ctrl+W)',
    untitled: '未命名',
    modified: '● 已修改',
    cursorText: '行 {line}, 列 {col}',
    countText: '{chars} 字 / {words} 词 / {lines} 行',
    dropOverlay: '松开鼠标即可打开文件（新标签）',
    findPlaceholder: '查找...',
    replacePlaceholder: '替换为...',
    findNext: '下一个',
    replace: '替换',
    replaceAll: '全部替换',
    findClose: '关闭',
    notFound: '未找到',
    previewNotFound: '预览中未找到',
    position: '位置 {pos}',
    replaced: '已替换 {count} 处',
    previewReadonly: '预览模式为只读，请切到编辑或分屏模式替换',
    renderFailed: '渲染失败: {error}',
    insertText: '文本',
    saveDialogTitle: '未保存的修改',
    savePrompt: '「{name}」有未保存的修改，是否保存？',
    discardChanges: '不保存',
    cancel: '取消',
    apiUnavailable: '文件接口不可用，请通过 exe 启动程序',
    openFailed: '打开失败: {error}',
    openNoPath: '打开失败: 未获取到文件路径',
    openError: '打开文件异常: {error}',
    saveFailed: '保存失败: {error}',
    saveError: '保存异常: {error}',
    saveAsFailed: '另存为失败: {error}',
    saveAsError: '另存为异常: {error}',
    dropOpenFailed: '打开「{name}」失败: {error}',
    dropOpenError: '打开拖入文件失败: {error}',
    startupFailed: '打开启动文件失败: {error}',
    fontYahei: '微软雅黑', fontSong: '宋体', fontDeng: '等线',
  },
  en: {
    appTitle: 'Markdown Editor',
    new: 'New', newTitle: 'New (Ctrl+N)',
    open: 'Open', openTitle: 'Open (Ctrl+O)',
    save: 'Save', saveTitle: 'Save (Ctrl+S)',
    saveAs: 'Save As', saveAsTitle: 'Save As (Ctrl+Shift+S)',
    undo: 'Undo', undoTitle: 'Undo (Ctrl+Z)',
    redo: 'Redo', redoTitle: 'Redo (Ctrl+Y)',
    find: 'Find', findTitle: 'Find (Ctrl+F)',
    fontLabel: 'Font',
    sizeLabel: 'Size',
    zoomReset: 'Reset Zoom', zoomResetTitle: 'Reset Zoom (Ctrl+0)',
    modeEdit: 'Edit', modeEditTitle: 'Editor only',
    modeSplit: 'Split', modeSplitTitle: 'Split view',
    modePreview: 'Preview', modePreviewTitle: 'Preview only',
    theme: 'Theme', themeTitle: 'Toggle theme',
    themeToDark: 'Switch to dark theme',
    themeToLight: 'Switch to light theme',
    about: 'About', aboutTitle: 'About',
    lang: '中文', langTitle: '切换到中文',
    aboutHeading: 'Markdown Editor',
    aboutVersion: 'Version', aboutAuthor: 'Author', aboutHomepage: 'Homepage',
    aboutHomepageEmpty: 'Not set',
    aboutClose: 'Close',
    unknownError: 'Unknown error',
    promiseError: 'Promise error: {error}',
    initFailed: 'Initialization failed: {error}',
    newTabTitle: 'New tab (Ctrl+N)',
    closeTabTitle: 'Close tab (Ctrl+W)',
    untitled: 'Untitled',
    modified: '● Modified',
    cursorText: 'Ln {line}, Col {col}',
    countText: '{chars} chars / {words} words / {lines} lines',
    dropOverlay: 'Drop to open file in a new tab',
    findPlaceholder: 'Find...',
    replacePlaceholder: 'Replace with...',
    findNext: 'Next',
    replace: 'Replace',
    replaceAll: 'Replace All',
    findClose: 'Close',
    notFound: 'Not found',
    previewNotFound: 'Not found in preview',
    position: 'Position {pos}',
    replaced: 'Replaced {count} occurrence(s)',
    previewReadonly: 'Preview is read-only. Switch to Edit or Split to replace.',
    renderFailed: 'Render failed: {error}',
    insertText: 'text',
    saveDialogTitle: 'Unsaved Changes',
    savePrompt: '"{name}" has unsaved changes. Save before closing?',
    discardChanges: "Don't Save",
    cancel: 'Cancel',
    apiUnavailable: 'File API unavailable. Please launch the desktop app.',
    openFailed: 'Open failed: {error}',
    openNoPath: 'Open failed: no file path returned',
    openError: 'Open error: {error}',
    saveFailed: 'Save failed: {error}',
    saveError: 'Save error: {error}',
    saveAsFailed: 'Save As failed: {error}',
    saveAsError: 'Save As error: {error}',
    dropOpenFailed: 'Failed to open "{name}": {error}',
    dropOpenError: 'Failed to open dropped file: {error}',
    startupFailed: 'Failed to open startup file: {error}',
    fontYahei: 'Microsoft YaHei', fontSong: 'SimSun', fontDeng: 'DengXian',
  },
};

let currentLang = 'zh';

function t(key, vars) {
  const dict = I18N[currentLang] || I18N.zh;
  let text = dict[key] !== undefined ? dict[key] : (I18N.zh[key] !== undefined ? I18N.zh[key] : key);
  if (vars) {
    Object.keys(vars).forEach(function (name) {
      text = text.split('{' + name + '}').join(String(vars[name]));
    });
  }
  return text;
}

/* 工具栏等静态元素的文案绑定：[元素 id, 文本 key, title key] */
const I18N_BUTTONS = [
  ['btn-new', 'new', 'newTitle'],
  ['btn-open', 'open', 'openTitle'],
  ['btn-save', 'save', 'saveTitle'],
  ['btn-saveas', 'saveAs', 'saveAsTitle'],
  ['btn-undo', 'undo', 'undoTitle'],
  ['btn-redo', 'redo', 'redoTitle'],
  ['btn-find', 'find', 'findTitle'],
  ['btn-zoom-reset', 'zoomReset', 'zoomResetTitle'],
  ['btn-mode-edit', 'modeEdit', 'modeEditTitle'],
  ['btn-mode-split', 'modeSplit', 'modeSplitTitle'],
  ['btn-mode-preview', 'modePreview', 'modePreviewTitle'],
  ['btn-theme', 'theme', null],
  ['btn-about', 'about', 'aboutTitle'],
  ['btn-lang', 'lang', 'langTitle'],
  ['btn-find-next', 'findNext', null],
  ['btn-replace', 'replace', null],
  ['btn-replace-all', 'replaceAll', null],
  ['btn-find-close', 'findClose', null],
  ['btn-about-close', 'aboutClose', null],
  ['btn-save-confirm', 'save', null],
  ['btn-save-discard', 'discardChanges', null],
  ['btn-save-cancel', 'cancel', null],
];

const I18N_LABELS = [
  ['label-font', 'fontLabel'],
  ['label-size', 'sizeLabel'],
  ['about-title', 'aboutHeading'],
  ['about-label-version', 'aboutVersion'],
  ['about-label-author', 'aboutAuthor'],
  ['about-label-homepage', 'aboutHomepage'],
  ['save-title', 'saveDialogTitle'],
];

/* 字体下拉：值不变，仅翻译显示名 */
const I18N_FONT_OPTIONS = [
  ['微软雅黑', 'fontYahei'],
  ['宋体', 'fontSong'],
  ['等线', 'fontDeng'],
];

function applyI18n() {
  document.title = t('appTitle');
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';

  I18N_BUTTONS.forEach(function (item) {
    const el = document.getElementById(item[0]);
    if (!el) return;
    el.textContent = t(item[1]);
    if (item[2]) el.title = t(item[2]);
  });

  I18N_LABELS.forEach(function (item) {
    const el = document.getElementById(item[0]);
    if (el) el.textContent = t(item[1]);
  });

  I18N_FONT_OPTIONS.forEach(function (item) {
    const opt = fontSelect && fontSelect.querySelector('option[value="' + item[0] + '"]');
    if (opt) opt.textContent = t(item[1]);
  });

  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) {
    themeBtn.title = state.theme === 'dark' ? t('themeToLight') : t('themeToDark');
  }

  const newTabBtn = document.getElementById('btn-new-tab');
  if (newTabBtn) newTabBtn.title = t('newTabTitle');

  if (findInput) findInput.placeholder = t('findPlaceholder');
  if (replaceInput) replaceInput.placeholder = t('replacePlaceholder');

  const overlay = document.getElementById('drop-overlay');
  if (overlay) overlay.textContent = t('dropOverlay');
}

function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'zh';
  localStorage.setItem('md_lang', currentLang);
  applyI18n();
  renderTabs();
  updateStatus();
}

function toggleLang() {
  setLang(currentLang === 'zh' ? 'en' : 'zh');
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
  if (!tab) return t('untitled');
  if (!tab.path) return t('untitled');
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

async function closeTab(id) {
  let idx = state.tabs.findIndex((t) => t.id === id);
  if (idx < 0) return;

  const tab = state.tabs[idx];
  if (id === state.activeId) syncActiveFromEditor();

  // 有未保存修改时先询问，避免误操作丢数据
  if (tab.dirty) {
    const choice = await askSave(t('savePrompt', { name: tabTitle(tab) }));
    if (choice === 'cancel') return;
    if (choice === 'save' && !(await saveTab(tab, false))) return;
  }

  idx = state.tabs.findIndex((t) => t.id === id);
  if (idx < 0) return;

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
    el.title = tab.path || t('untitled');

    const dot = document.createElement('span');
    dot.className = 'tab-dot' + (tab.dirty ? ' on' : '');

    const name = document.createElement('span');
    name.className = 'tab-name';
    name.textContent = tabTitle(tab);

    const close = document.createElement('span');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = t('closeTabTitle');
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
  el.title = tab.path || t('untitled');
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
    previewEl.innerHTML = '<p style="color:#d1242f">' + t('renderFailed', { error: e.message }) + '</p>';
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
      findInfo.textContent = t('previewNotFound');
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

  statusFile.textContent = tab && tab.path ? tab.path : t('untitled');
  statusModified.textContent = tab && tab.dirty ? t('modified') : '';
  statusZoom.textContent = state.zoomLevel + '%';

  const chars = text.length;
  const lines = text.split('\n').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  statusCount.textContent = t('countText', { chars: chars, words: words, lines: lines });

  if (cm) {
    const cur = cm.getCursor();
    statusCursor.textContent = t('cursorText', { line: cur.line + 1, col: cur.ch + 1 });
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
  if (!a) { alert(t('apiUnavailable')); return; }
  try {
    const result = await a.open_file();
    if (!result || result === null) return;                 // 用户取消
    if (result.error) { alert(t('openFailed', { error: result.error })); return; }
    if (!result.path) { alert(t('openNoPath')); return; }
    openInTab(result.path, result.content || '');
  } catch (e) {
    alert(t('openError', { error: e && e.message ? e.message : e }));
  }
}

/* 保存指定标签；forceAs 强制弹出另存为对话框。返回是否保存成功 */
async function saveTab(tab, forceAs) {
  if (!tab) return false;
  const a = api();
  if (!a) { alert(t('apiUnavailable')); return false; }

  if (tab.id === state.activeId && cm) tab.content = cm.getValue();

  try {
    if (!forceAs && tab.path) {
      const result = await a.save_file(tab.path, tab.content);
      if (result === true) {
        tab.dirty = false;
        updateTabDot(tab);
        updateStatus();
        persistTabsNow();
        return true;
      }
      if (result && result.error) alert(t('saveFailed', { error: result.error }));
      return false;
    }

    const result = await a.save_as(tab.content);
    if (!result) return false;                               // 用户取消
    if (result.error) { alert(t('saveAsFailed', { error: result.error })); return false; }
    if (result.path) {
      tab.path = result.path;
      tab.dirty = false;
      updateTabDot(tab);
      updateStatus();
      persistTabsNow();
      return true;
    }
    return false;
  } catch (e) {
    alert(t('saveError', { error: e && e.message ? e.message : e }));
    return false;
  }
}

async function saveFile() {
  const tab = activeTab();
  if (tab) await saveTab(tab, false);
}

async function saveAsFile() {
  const tab = activeTab();
  if (tab) await saveTab(tab, true);
}

/* ==================== 关于 ==================== */
const APP_VERSION = '1.1.0';
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
    hp.textContent = t('aboutHomepageEmpty');
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

/* ==================== 未保存提醒 ==================== */
let saveDialogResolve = null;

/* 弹出保存提醒，返回 Promise<'save'|'discard'|'cancel'> */
function askSave(message) {
  return new Promise(function (resolve) {
    if (saveDialogResolve) { resolve('cancel'); return; }   // 已有对话框时不再叠加
    saveDialogResolve = resolve;
    document.getElementById('save-message').textContent = message;
    document.getElementById('save-mask').classList.remove('hidden');
    document.getElementById('btn-save-confirm').focus();
  });
}

function finishSaveDialog(choice) {
  const mask = document.getElementById('save-mask');
  if (mask) mask.classList.add('hidden');
  const resolve = saveDialogResolve;
  saveDialogResolve = null;
  if (resolve) resolve(choice);
}

function bindSaveDialog() {
  document.getElementById('btn-save-confirm').addEventListener('click', function () { finishSaveDialog('save'); });
  document.getElementById('btn-save-discard').addEventListener('click', function () { finishSaveDialog('discard'); });
  document.getElementById('btn-save-cancel').addEventListener('click', function () { finishSaveDialog('cancel'); });
  document.getElementById('save-mask').addEventListener('click', function (e) {
    if (e.target.id === 'save-mask') finishSaveDialog('cancel');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const mask = document.getElementById('save-mask');
    if (mask && !mask.classList.contains('hidden')) {
      e.stopPropagation();
      finishSaveDialog('cancel');
    }
  }, true);
}

/* 应用窗口关闭：逐个处理未保存标签，全部处理完才真正退出 */
let appClosePending = false;

async function handleAppClose() {
  if (appClosePending || saveDialogResolve) return;
  appClosePending = true;
  try {
    syncActiveFromEditor();
    const dirtyTabs = state.tabs.filter(function (t) { return t.dirty; });
    for (let i = 0; i < dirtyTabs.length; i++) {
      const tab = dirtyTabs[i];
      if (tab.id === state.activeId && cm) tab.content = cm.getValue();
      const choice = await askSave(t('savePrompt', { name: tabTitle(tab) }));
      if (choice === 'cancel') return;
      if (choice === 'save' && !(await saveTab(tab, false))) return;
    }
    const a = api();
    if (a && a.quit_app) await a.quit_app();
  } finally {
    appClosePending = false;
  }
}
window.handleAppClose = handleAppClose;

/* ==================== 启动文件（双击 .md / 命令行参数） ==================== */
async function openStartupFile() {
  const a = api();
  if (!a || !a.get_startup_file) return;
  try {
    const path = await a.get_startup_file();
    if (path) await openDroppedPaths([path]);
  } catch (e) {
    showError(t('startupFailed', { error: e && e.message ? e.message : e }));
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
      if (r.error) { alert(t('dropOpenFailed', { name: p, error: r.error })); continue; }
      if (r.path) openInTab(r.path, r.content || '');
    } catch (e) {
      alert(t('dropOpenError', { error: e && e.message ? e.message : e }));
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
    findInfo.textContent = t('previewNotFound');
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
    findInfo.textContent = t('notFound');
    return;
  }
  const from = cm.posFromIndex(index);
  const to = cm.posFromIndex(index + query.length);
  cm.setSelection(from, to);
  cm.scrollIntoView({ from: from, to: to }, 60);
  lastFindIndex = index + query.length;
  findInfo.textContent = t('position', { pos: index + 1 });
}

function replaceOne() {
  if (state.mode === 'preview') { findInfo.textContent = t('previewReadonly'); return; }
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
  if (state.mode === 'preview') { findInfo.textContent = t('previewReadonly'); return; }
  const query = findInput.value;
  if (!query || !cm) return;
  const text = cm.getValue();
  const count = text.split(query).length - 1;
  if (count === 0) { findInfo.textContent = t('notFound'); return; }
  // 用 replaceRange 替换全文，使“全部替换”本身也是一次可撤销的操作
  cm.operation(function () {
    cm.replaceRange(text.split(query).join(replaceInput.value),
      { line: 0, ch: 0 }, cm.posFromIndex(text.length));
  });
  markDirty();
  findInfo.textContent = t('replaced', { count: count });
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
  const body = sel || t('insertText');
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
  document.getElementById('btn-lang').addEventListener('click', toggleLang);

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
    const savedLang = localStorage.getItem('md_lang');

    if (savedLang === 'en' || savedLang === 'zh') currentLang = savedLang;
    if (savedFamily) { state.fontFamily = savedFamily; fontSelect.value = savedFamily; }
    if (savedSize) { state.baseFontSize = parseInt(savedSize, 10); sizeSelect.value = savedSize; }
    setTheme(savedTheme || 'light');
    setMode(savedMode || 'split');

    initEditor();
    bindEvents();
    bindSaveDialog();
    bindDropEvents();
    applyI18n();
    applyFont();
    restoreTabs();
    updateStatus();
    cm.focus();
    openStartupFile();
  } catch (e) {
    showError(t('initFailed', { error: e.message }) + '\n' + (e.stack || ''));
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
