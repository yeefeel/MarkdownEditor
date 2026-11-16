# Markdown 编辑器

**简体中文** | [English](README.en.md)

一款面向 Windows 的免费轻量级 Markdown 桌面编辑器。**单文件绿色版，双击即用**，不需要安装、不需要 Python 环境，也不写系统目录。

## 亮点

- **单文件绿色版**：整个程序就是一个 17 MB 的 `MarkdownEditor.exe`，拷到 U 盘、丢进任意目录都能直接运行，删除即卸载
- **零依赖安装**：仅依赖 Windows 10/11 自带的 WebView2 运行时，无需配置环境
- **操作简单易用**：常用功能全部摆在工具栏，中英文界面一键切换，开箱即用
- **多标签编辑**：同时打开多个文件来回切换，每个标签的撤销历史、光标位置互不干扰
- **实时预览**：边写边看，支持编辑 / 分屏 / 预览三种模式
- **原生文件对话框**：打开、保存走 Windows 原生对话框，符合使用习惯

## 下载

直接下载编译好的单文件程序，解压或放到任意目录即可使用，无需安装：

- GitHub：**[⬇ 下载最新版本](https://github.com/yeefeel/MarkdownEditor/releases/latest)**
- Gitee：**[⬇ 下载最新版本](https://gitee.com/yeefeel/MarkdownEditor/releases/latest)**

> 程序未做代码签名，首次运行时 Windows SmartScreen 可能提示“已保护你的电脑”，点“更多信息 → 仍要运行”即可。

## 快速开始

**方式一：直接使用（推荐）**

1. 双击 `MarkdownEditor.exe` 启动
2. 需要让 `.md` 文件默认用它打开时，双击 `关联Markdown文件.bat`，之后双击任意 Markdown 文件即可直接编辑

**方式二：从源码运行**

```bash
pip install pywebview pyinstaller pillow pywin32
python app.py
```

**方式三：自行打包**

```bash
python make_icon.py          # 需要重新生成图标时才执行
python -m PyInstaller build.spec --clean --noconfirm
# 产物：dist\MarkdownEditor.exe
```

## 功能一览

| 分类     | 功能                                                           |
| -------- | -------------------------------------------------------------- |
| 编辑     | Markdown 语法高亮、行号、自动补全括号、Tab 缩进                |
| 预览     | 实时渲染、GFM 表格 / 任务列表、代码块语法高亮、明暗两套主题    |
| 文件     | 新建、打开、保存、另存为、拖放文件打开、双击 `.md` 打开      |
| 多标签   | 新建 / 切换 / 关闭标签，未保存标记，关闭前确认，重启自动恢复   |
| 编辑辅助 | 撤销 / 恢复（按标签独立）、查找替换（编辑区与预览区均支持）    |
| 显示     | 字体与字号切换、`Ctrl` + 滚轮缩放、明暗主题、分屏滚动联动    |
| 其他     | 状态栏统计（字数 / 行数 / 光标位置）、草稿自动保存、关于对话框 |

## 快捷键

| 快捷键                                     | 功能                      |
| ------------------------------------------ | ------------------------- |
| `Ctrl + N`                               | 新建标签                  |
| `Ctrl + O`                               | 打开文件                  |
| `Ctrl + S` / `Ctrl + Shift + S`        | 保存 / 另存为             |
| `Ctrl + W`                               | 关闭当前标签              |
| `Ctrl + Tab` / `Ctrl + Shift + Tab`    | 切换到下一个 / 上一个标签 |
| `Ctrl + Z` / `Ctrl + Y`                | 撤销 / 恢复               |
| `Ctrl + F` / `Ctrl + H`                | 查找 / 替换               |
| `Ctrl + B` / `Ctrl + I`                | 加粗 / 斜体               |
| `Ctrl + +` / `Ctrl + -` / `Ctrl + 0` | 放大 / 缩小 / 重置缩放    |
| `Ctrl + 鼠标滚轮`                        | 缩放编辑区与预览区        |

## 文件关联

关联脚本只写入当前用户注册表（`HKCU`），**不需要管理员权限**，也不影响其他用户和程序：

- `关联Markdown文件.bat` —— 把 `.md` / `.markdown` 关联到本工具
- `取消关联Markdown文件.bat` —— 恢复系统默认

脚本会自动在脚本所在目录、`dist\` 子目录、上级目录中查找 `MarkdownEditor.exe`；如果移动了 exe 的位置，重新双击一次关联脚本即可。

> 首次双击 `.md` 若弹出“你要如何打开此文件”，选择本程序一次即可记住。

## 项目结构

```
markdown/
├─ app.py                     # 程序入口：pywebview 窗口、文件读写、拖放、命令行参数
├─ build.spec                 # PyInstaller 打包配置
├─ make_icon.py               # 图标生成脚本（Pillow 绘制）
├─ assets/
│  ├─ app.ico                 # 应用图标（多尺寸）
│  └─ app.png                 # 图标主图（1024×1024）
├─ web/
│  ├─ index.html              # 界面结构
│  ├─ css/style.css           # 样式与明暗主题
│  ├─ js/app.js               # 编辑器逻辑（标签、预览、查找、缩放、拖放）
│  └─ assets/                 # CodeMirror、marked、highlight.js 等前端库
├─ 关联Markdown文件.bat
└─ 取消关联Markdown文件.bat
```

## 技术栈

- **界面**：pywebview（WebView2）+ 原生 HTML/CSS/JavaScript，无前端构建步骤
- **编辑器**：CodeMirror 5（Markdown 语法高亮、多文档切换）
- **渲染**：marked.js + highlight.js
- **打包**：PyInstaller 单文件模式
- **图标**：Pillow 程序化绘制，输出多尺寸 ICO

## 反馈

作者：flyfeel@gmail.com

主页：https://github.com/yeefeel/MarkdownEditor
