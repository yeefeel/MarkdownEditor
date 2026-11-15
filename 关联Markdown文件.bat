@echo off
chcp 65001 >nul
title 关联 Markdown 文件
setlocal

rem 依次在几个常见位置查找 MarkdownEditor.exe
set "EXE=%~dp0dist\MarkdownEditor.exe"
if not exist "%EXE%" set "EXE=%~dp0MarkdownEditor.exe"
if not exist "%EXE%" set "EXE=%~dp0..\dist\MarkdownEditor.exe"

if not exist "%EXE%" (
    echo.
    echo [错误] 没有找到 MarkdownEditor.exe
    echo 请把本脚本放在程序目录下（exe 在 dist 子目录里，或与脚本同目录）。
    echo.
    pause
    exit /b 1
)

echo.
echo 正在把 .md / .markdown 关联到：
echo   %EXE%
echo.

reg add "HKCU\Software\Classes\MarkdownEditor.md" /ve /t REG_SZ /d "Markdown 文档" /f >nul
reg add "HKCU\Software\Classes\MarkdownEditor.md" /v "FriendlyTypeName" /t REG_SZ /d "Markdown 文档" /f >nul
reg add "HKCU\Software\Classes\MarkdownEditor.md\DefaultIcon" /ve /t REG_SZ /d "\"%EXE%\",0" /f >nul
reg add "HKCU\Software\Classes\MarkdownEditor.md\shell\open\command" /ve /t REG_SZ /d "\"%EXE%\" \"%%1\"" /f >nul

for %%E in (.md .markdown) do (
    reg add "HKCU\Software\Classes\%%E" /ve /t REG_SZ /d "MarkdownEditor.md" /f >nul
    reg add "HKCU\Software\Classes\%%E" /v "Content Type" /t REG_SZ /d "text/markdown" /f >nul
    reg add "HKCU\Software\Classes\%%E\OpenWithProgids" /v "MarkdownEditor.md" /t REG_NONE /d "" /f >nul
    reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\%%E\UserChoice" /f >nul 2>&1
)

set "PS1=%TEMP%\md_assoc_notify.ps1"
> "%PS1%" echo $sig = '[DllImport("shell32.dll")] public static extern void SHChangeNotify(int e, int f, IntPtr a, IntPtr b);'
>> "%PS1%" echo $t = Add-Type -MemberDefinition $sig -Name S -Namespace W -PassThru
>> "%PS1%" echo [W.S]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" >nul 2>&1
del "%PS1%" >nul 2>&1

echo 关联完成！现在双击 .md 文件即可用本工具打开。
echo 如果第一次仍弹出“你要如何打开此文件”，选择本程序一次即可记住。
echo.
pause
exit /b 0
