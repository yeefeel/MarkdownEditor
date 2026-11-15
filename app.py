"""
Markdown 编辑器 - pywebview 入口
文件打开/保存使用 Windows 原生文件对话框（WinForms 公共对话框，win32 兜底）
"""
import os
import sys
import time
import json
import traceback

import webview

HAS_WIN32UI = False
try:
    import win32ui
    import win32con
    HAS_WIN32UI = True
except ImportError:
    pass

OPEN_FILTER = "Markdown 文件 (*.md;*.markdown;*.txt)|*.md;*.markdown;*.txt|所有文件 (*.*)|*.*||"
SAVE_FILTER = "Markdown 文件 (*.md)|*.md|文本文件 (*.txt)|*.txt|所有文件 (*.*)|*.*||"

window = None


def resource_path(relative):
    """获取资源路径，兼容 PyInstaller onefile 的 _MEIPASS"""
    if hasattr(sys, '_MEIPASS'):
        base = sys._MEIPASS
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, relative)


def _normalize_dialog_result(result):
    """统一处理 pywebview 对话框返回值（str / tuple / list / None）"""
    if not result:
        return None
    if isinstance(result, str):
        return result
    if isinstance(result, (list, tuple)):
        return result[0] if len(result) > 0 else None
    return None


class Api:
    """暴露给前端 JS 调用的 Python 接口"""

    def __init__(self, startup_file=None):
        self.startup_file = startup_file

    def get_startup_file(self):
        """取命令行传入的文件（仅返回一次）"""
        path = self.startup_file
        self.startup_file = None
        return path

    def open_file(self):
        """原生打开对话框 → {path, content} / None(取消) / {error}"""
        path = None
        try:
            path = _normalize_dialog_result(window.create_file_dialog(
                webview.OPEN_DIALOG,
                allow_multiple=False,
                file_types=('Markdown 文件 (*.md;*.markdown;*.txt)', '所有文件 (*.*)'),
            ))
        except Exception:
            path = None

        if not path:
            path = self._win32_open()

        if not path:
            return None

        return self.read_file(path)

    def open_url(self, url):
        """用系统默认浏览器打开链接（关于页主页用）"""
        try:
            import webbrowser
            webbrowser.open(url)
            return True
        except Exception as e:
            return {'error': str(e)}

    def read_file(self, path):
        """读取指定文件，返回 {path, content} 或 {error}"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            try:
                with open(path, 'r', encoding='gbk', errors='replace') as f:
                    content = f.read()
            except Exception as e:
                return {'error': str(e)}
        except Exception as e:
            return {'error': str(e)}
        return {'path': path, 'content': content}

    def save_file(self, path, content):
        """写入指定路径，成功返回 True"""
        try:
            with open(path, 'w', encoding='utf-8', newline='') as f:
                f.write(content)
            return True
        except Exception as e:
            return {'error': str(e)}

    def save_as(self, content):
        """原生另存为对话框 → {path, ok} / None(取消) / {error}"""
        path = None
        try:
            path = _normalize_dialog_result(window.create_file_dialog(
                webview.SAVE_DIALOG,
                save_filename='未命名.md',
                file_types=('Markdown 文件 (*.md)', '文本文件 (*.txt)', '所有文件 (*.*)'),
            ))
        except Exception:
            path = None

        if not path:
            path = self._win32_save()

        if not path:
            return None

        result = self.save_file(path, content)
        if result is True:
            return {'path': path, 'ok': True}
        return result

    # ---------- win32 兜底对话框 ----------
    def _win32_open(self):
        if not HAS_WIN32UI:
            return None
        try:
            dlg = win32ui.CreateFileDialog(
                1, None, None,
                win32con.OFN_FILEMUSTEXIST | win32con.OFN_HIDEREADONLY,
                OPEN_FILTER,
            )
            if dlg.DoModal() == win32con.IDOK:
                return dlg.GetPathName() or None
        except Exception:
            pass
        return None

    def _win32_save(self):
        if not HAS_WIN32UI:
            return None
        try:
            dlg = win32ui.CreateFileDialog(
                0, 'md', '未命名.md',
                win32con.OFN_OVERWRITEPROMPT | win32con.OFN_PATHMUSTEXIST,
                SAVE_FILTER,
            )
            if dlg.DoModal() == win32con.IDOK:
                return dlg.GetPathName() or None
        except Exception:
            pass
        return None


def _log_path():
    if getattr(sys, 'frozen', False):
        base = os.path.dirname(sys.executable)
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, 'selftest.log')


def run_selftest(win, api):
    """自测：把关键检查结果写入 selftest.log 后退出"""
    time.sleep(3.0)
    lines = []

    def js(expr):
        try:
            return win.evaluate_js(expr)
        except Exception as e:
            return 'EXC: %s' % e

    def rec(name, expr):
        lines.append('%-18s => %r' % (name, js(expr)))

    try:
        lines.append('python      => %s' % sys.version.split()[0])
        lines.append('frozen      => %s' % getattr(sys, 'frozen', False))
        lines.append('html_exists => %s' % os.path.exists(resource_path('web/index.html')))

        rec('marked', "typeof marked")
        rec('hljs', "typeof hljs")
        rec('codemirror', "typeof CodeMirror")
        rec('cm_instance', "typeof window.__cm")
        rec('api_open', "typeof (window.pywebview && window.pywebview.api.open_file)")
        rec('toolbar_btns', "document.querySelectorAll('#toolbar button').length")

        # 写入 Markdown 内容并等待渲染
        js("window.__cm.setValue('# 标题测试\\n\\n**粗体** 与 *斜体*\\n\\n- 项目一\\n- 项目二\\n\\n> 引用\\n\\n"
           "```js\\nvar a = 1;\\nconsole.log(a);\\n```\\n\\n| A | B |\\n|---|---|\\n| 1 | 2 |')")
        time.sleep(1.2)

        rec('preview_len', "document.getElementById('preview').innerHTML.length")
        rec('preview_h1', "document.querySelectorAll('#preview h1').length")
        rec('preview_table', "document.querySelectorAll('#preview table').length")
        rec('preview_code', "document.querySelectorAll('#preview pre code').length")
        rec('preview_hl_spans', "document.querySelectorAll('#preview pre code span').length")
        rec('cm_md_header', "document.querySelectorAll('.cm-header').length")
        rec('cm_md_strong', "document.querySelectorAll('.cm-strong').length")
        rec('cm_visible', "document.querySelector('.CodeMirror').offsetHeight > 0")

        # 预览模式切换
        js("document.getElementById('btn-mode-preview').click()")
        time.sleep(0.4)
        rec('mode_preview', "document.getElementById('main').className + '|' + (document.getElementById('preview-pane').offsetWidth > 0)")
        js("document.getElementById('btn-mode-split').click()")

        # 多标签
        rec('tab_count', "document.querySelectorAll('#tabs .tab').length")
        js("window.__cm.setValue('# 标签一内容')")
        js("document.getElementById('btn-new-tab').click()")
        time.sleep(0.4)
        rec('tab_count_after_new', "document.querySelectorAll('#tabs .tab').length")
        js("window.__cm.setValue('# 标签二内容 **粗体**')")
        time.sleep(0.4)
        js("document.querySelectorAll('#tabs .tab')[0].click()")
        time.sleep(0.4)
        rec('tab1_content', "window.__cm.getValue()")
        js("document.querySelectorAll('#tabs .tab')[1].click()")
        time.sleep(0.4)
        rec('tab2_content', "window.__cm.getValue()")
        rec('tabs_persisted', "typeof localStorage.getItem('md_tabs_v2')")

        # 撤销/重做粒度 + 跨标签保留历史
        js("window.__cm.setValue('')")
        time.sleep(0.3)
        for seg in ('AAA', 'BBB', 'CCC'):
            js("window.__cm.replaceRange('%s', window.__cm.getCursor())" % seg)
            time.sleep(0.55)
        rec('undo_history_len', "window.__cm.historySize().undo")
        rec('content_before_undo', "window.__cm.getValue()")
        js("window.__cm.undo()")
        time.sleep(0.25)
        rec('undo_one_step', "window.__cm.getValue()")
        js("window.__cm.undo()")
        time.sleep(0.25)
        rec('undo_two_steps', "window.__cm.getValue()")
        js("window.__cm.redo()")
        time.sleep(0.2)
        rec('redo_one_step', "window.__cm.getValue()")

        js("window.__keepId = state.activeId")
        js("(function(){var o=state.tabs.filter(function(t){return t.id!==window.__keepId})[0];"
           "if(o){activateTab(o.id);}})()")
        time.sleep(0.3)
        js("activateTab(window.__keepId)")
        time.sleep(0.3)
        rec('history_after_switch', "window.__cm.historySize().undo")

        # 预览模式查找
        js("window.__cm.setValue('# 搜索测试\\n\\n关键字 A\\n\\n关键字 B\\n\\n关键字 C')")
        time.sleep(0.4)
        js("document.getElementById('btn-mode-preview').click()")
        js("document.getElementById('btn-find').click()")
        js("document.getElementById('find-input').value = '关键字'")
        js("document.getElementById('btn-find-next').click()")
        time.sleep(0.5)
        rec('preview_find_marks', "document.querySelectorAll('#preview mark.find-hit').length")
        rec('preview_find_info', "document.getElementById('find-info').textContent")
        js("document.getElementById('btn-find-next').click()")
        time.sleep(0.3)
        rec('preview_find_next', "document.getElementById('find-info').textContent")
        js("document.getElementById('btn-find-close').click()")
        rec('preview_find_cleared', "document.querySelectorAll('#preview mark.find-hit').length")
        js("document.getElementById('btn-mode-split').click()")

        # 分屏滚动联动
        js("window.__cm.setValue(Array(120).join('## 小节\\n\\n用于测试滚动联动的正文内容，撑开足够高度。\\n\\n'))")
        time.sleep(0.8)
        js("window.__cm.refresh()")
        time.sleep(0.3)
        js("(function(){var s=window.__cm.getWrapperElement().querySelector('.CodeMirror-scroll');"
           "s.scrollTop=(s.scrollHeight-s.clientHeight)*0.5;})()")
        time.sleep(0.5)
        rec('sync_editor_ratio', "(function(){var s=window.__cm.getWrapperElement().querySelector('.CodeMirror-scroll');"
                                 "return (s.scrollTop/(s.scrollHeight-s.clientHeight)).toFixed(2);})()")
        rec('sync_preview_ratio', "(function(){var p=document.getElementById('preview-pane');"
                                  "return (p.scrollTop/(p.scrollHeight-p.clientHeight)).toFixed(2);})()")
        js("(function(){var p=document.getElementById('preview-pane');p.scrollTop=p.scrollHeight;})()")
        time.sleep(0.5)
        rec('sync_editor_ratio_after_preview', "(function(){var s=window.__cm.getWrapperElement().querySelector('.CodeMirror-scroll');"
                                               "return (s.scrollTop/(s.scrollHeight-s.clientHeight)).toFixed(2);})()")

        # 拖放打开文件到新标签（路径来源由 pywebview drop 事件提供，这里直接验证 JS 入口）
        try:
            from webview.dom import _dnd_state
            lines.append('%-18s => %d' % ('drop_listeners', _dnd_state['num_listeners']))
        except Exception as e:
            lines.append('%-18s => EXC %s' % ('drop_listeners', e))

        drop_file = os.path.join(os.path.dirname(_log_path()), '_selftest_drop.md')
        try:
            with open(drop_file, 'w', encoding='utf-8') as f:
                f.write('# 拖入文件\n\n拖放内容')
            before = js("state.tabs.length")
            js("window.openDroppedPaths(%s)" % json.dumps([drop_file.replace('\\', '/')]))
            time.sleep(1.2)
            rec('drop_tab_delta', "state.tabs.length - %d" % int(before or 0))
            rec('drop_active_path', "activeTab() && activeTab().path ? activeTab().path.split(/[\\\\/]/).pop() : null")
            rec('drop_content', "window.__cm.getValue()")
            os.remove(drop_file)
        except Exception as e:
            lines.append('%-18s => EXC %s' % ('drop_test', e))

        # 关于对话框
        js("document.getElementById('btn-about').click()")
        time.sleep(0.3)
        rec('about_visible', "!document.getElementById('about-mask').classList.contains('hidden')")
        rec('about_version', "document.getElementById('about-version').textContent")
        rec('about_author', "document.getElementById('about-author').textContent")
        rec('about_homepage', "document.getElementById('about-homepage').textContent")
        rec('about_homepage_link', "document.querySelector('#about-homepage a') ? document.querySelector('#about-homepage a').textContent : 'NONE'")
        js("document.getElementById('btn-about-close').click()")
        time.sleep(0.2)
        rec('about_closed', "document.getElementById('about-mask').classList.contains('hidden')")

        # 按钮中文文案（i18n）
        rec('undo_btn_text', "document.getElementById('btn-undo').textContent")
        rec('redo_btn_text', "document.getElementById('btn-redo').textContent")
        rec('theme_btn_text', "document.getElementById('btn-theme').textContent")
        rec('theme_btn_title', "document.getElementById('btn-theme').title")

        # 文件读写
        tmp = os.path.join(os.path.dirname(_log_path()), '_selftest_file.md')
        saved = api.save_file(tmp, '# hello\n中文内容')
        lines.append('%-18s => %r' % ('api_save_file', saved))
        try:
            with open(tmp, 'r', encoding='utf-8') as f:
                read_back = f.read()
            lines.append('%-18s => %r' % ('api_read_back', read_back))
            os.remove(tmp)
        except Exception as e:
            lines.append('%-18s => EXC %s' % ('api_read_back', e))

        rec('js_errors', "window.__errs")
        ok = (js("document.querySelectorAll('#tabs .tab').length") >= 2
              and js("document.querySelectorAll('.cm-header').length") > 0
              and js("document.getElementById('preview').innerHTML.length") > 0
              and js("window.__errs.length") == 0)
        lines.append('RESULT => ' + ('PASS' if ok else 'FAIL'))
    except Exception:
        lines.append('SELFTEST EXCEPTION:\n' + traceback.format_exc())

    try:
        with open(_log_path(), 'w', encoding='utf-8') as f:
            f.write('\n'.join(str(x) for x in lines))
    except Exception:
        pass
    win.destroy()


def main():
    global window

    # 命令行传入的文件（关联 *.md 后双击打开时从这里进来）
    startup_file = None
    for arg in sys.argv[1:]:
        if arg.startswith('-'):
            continue
        if os.path.isfile(arg):
            startup_file = os.path.abspath(arg)
            break

    api = Api(startup_file=startup_file)
    html_path = os.path.abspath(resource_path('web/index.html'))

    window = webview.create_window(
        'Markdown 编辑器',
        url=html_path,
        width=1280,
        height=800,
        min_size=(800, 600),
        js_api=api,
        text_select=True,
    )

    # 文件拖放：注册 DOM drop 监听后才能拿到被拖入文件的完整路径
    def on_drop(event):
        try:
            files = (event.get('dataTransfer') or {}).get('files') or []
            paths = [f.get('pywebviewFullPath') for f in files
                     if isinstance(f, dict) and f.get('pywebviewFullPath')]
            if paths:
                window.evaluate_js('window.openDroppedPaths(%s)' % json.dumps(paths))
        except Exception:
            traceback.print_exc()

    def register_drop():
        try:
            from webview.dom import DOMEventHandler
            handler = DOMEventHandler(on_drop, prevent_default=True, stop_propagation=True)
            window.dom.body.on('drop', handler)
        except Exception:
            traceback.print_exc()

    window.events.loaded += register_drop

    if '--selftest' in sys.argv:
        webview.start(lambda: run_selftest(window, api), gui='edgechromium', debug=False)
        return

    try:
        webview.start(gui='edgechromium', debug=False)
    except Exception:
        # 极端情况下 WebView2 不可用，回退默认渲染器
        webview.start(debug=False)


if __name__ == '__main__':
    main()
