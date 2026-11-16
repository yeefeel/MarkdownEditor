# Markdown Editor

[简体中文](README.md) | **English**

A free, lightweight Markdown desktop editor for Windows. **Single-file portable build — double-click and go.** No installation, no Python runtime, and nothing written to system directories.

## Highlights

- **Single-file portable**: the whole program is one 17 MB `MarkdownEditor.exe`. Copy it to a USB drive or any folder and run it directly; delete the file to uninstall
- **Zero setup**: only requires the WebView2 runtime that ships with Windows 10/11
- **Easy to use**: common actions are right on the toolbar, with a bilingual Chinese/English interface that works out of the box
- **Multi-tab editing**: open several files at once; each tab keeps its own undo history and cursor position
- **Live preview**: write and preview as you go, with Edit / Split / Preview modes
- **Native file dialogs**: Open and Save use standard Windows dialogs, so they feel familiar

## Download

Download the prebuilt single-file program, put it in any folder, and run it — no installation needed:

- GitHub: **[⬇ Download latest release](https://github.com/yeefeel/MarkdownEditor/releases/latest)**
- Gitee: **[⬇ Download latest release](https://gitee.com/yeefeel/MarkdownEditor/releases/latest)**

> The executable is not code-signed. On first launch, Windows SmartScreen may show "Windows protected your PC" — click **More info → Run anyway**.

## Getting started

**Option 1: Use the prebuilt executable (recommended)**

1. Double-click `MarkdownEditor.exe` to launch
2. To make `.md` files open with this editor by default, double-click `关联Markdown文件.bat`, then double-click any Markdown file

> The association scripts have Chinese filenames but work on any Windows locale.

**Option 2: Run from source**

```bash
pip install pywebview pyinstaller pillow pywin32
python app.py
```

**Option 3: Build it yourself**

```bash
python make_icon.py          # only needed to regenerate the icon
python -m PyInstaller build.spec --clean --noconfirm
# output: dist\MarkdownEditor.exe
```

## Features

| Area          | Features                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Editing       | Markdown syntax highlighting, line numbers, auto-closing brackets, Tab indentation                           |
| Preview       | Live rendering, GFM tables and task lists, code block highlighting, light and dark themes                    |
| Files         | New, open, save, save as, drag-and-drop to open, double-click `.md` to open                                  |
| Tabs          | Create / switch / close tabs, unsaved markers, save prompt before closing, session restore on restart        |
| Editing aids  | Undo / redo (independent per tab), find and replace in both the editor and the preview                       |
| Display       | Font family and size, `Ctrl` + mouse wheel zoom, light/dark theme, synchronized split-view scrolling          |
| Other         | Status bar stats (characters / words / lines / cursor), draft autosave, About dialog, Chinese/English UI      |

## Keyboard shortcuts

| Shortcut                                | Action                          |
| --------------------------------------- | ------------------------------- |
| `Ctrl + N`                              | New tab                         |
| `Ctrl + O`                              | Open file                       |
| `Ctrl + S` / `Ctrl + Shift + S`         | Save / Save As                  |
| `Ctrl + W`                              | Close current tab               |
| `Ctrl + Tab` / `Ctrl + Shift + Tab`     | Next / previous tab             |
| `Ctrl + Z` / `Ctrl + Y`                 | Undo / Redo                     |
| `Ctrl + F` / `Ctrl + H`                 | Find / Replace                  |
| `Ctrl + B` / `Ctrl + I`                 | Bold / Italic                   |
| `Ctrl + +` / `Ctrl + -` / `Ctrl + 0`    | Zoom in / out / reset zoom      |
| `Ctrl` + mouse wheel                    | Zoom editor and preview         |

## File association

The scripts only write to the current user's registry (`HKCU`). **No administrator rights required**, and other users or programs are not affected:

- `关联Markdown文件.bat` — associate `.md` / `.markdown` with this editor
- `取消关联Markdown文件.bat` — restore the system default

The scripts look for `MarkdownEditor.exe` in their own folder, the `dist\` subfolder, and the parent folder. If you move the executable, just run the association script again.

> If Windows asks "How do you want to open this file?" the first time you double-click a `.md` file, select this program once and it will be remembered.

## Project structure

```
markdown/
├─ app.py                     # Entry point: pywebview window, file I/O, drag-and-drop, CLI args
├─ build.spec                 # PyInstaller build configuration
├─ make_icon.py               # Icon generator (drawn with Pillow)
├─ assets/
│  ├─ app.ico                 # Application icon (multiple sizes)
│  └─ app.png                 # Master icon image (1024×1024)
├─ web/
│  ├─ index.html              # UI layout
│  ├─ css/style.css           # Styles and light/dark themes
│  ├─ js/app.js               # Editor logic (tabs, preview, find, zoom, drag-and-drop)
│  └─ assets/                 # Front-end libraries: CodeMirror, marked, highlight.js, etc.
├─ 关联Markdown文件.bat
└─ 取消关联Markdown文件.bat
```

## Tech stack

- **UI**: pywebview (WebView2) + plain HTML/CSS/JavaScript, no front-end build step
- **Editor**: CodeMirror 5 (Markdown syntax highlighting, multi-document switching)
- **Rendering**: marked.js + highlight.js
- **Packaging**: PyInstaller single-file mode
- **Icon**: programmatically drawn with Pillow, exported as a multi-size ICO

## Feedback

Author: flyfeel@gmail.com

Homepage: https://github.com/yeefeel/MarkdownEditor
