@echo off
chcp 65001 >nul
title 取消关联 Markdown 文件
setlocal enabledelayedexpansion

echo.
echo 正在取消 .md / .markdown 与本工具的关联...
echo.

reg delete "HKCU\Software\Classes\MarkdownEditor.md" /f >nul 2>&1

for %%E in (.md .markdown) do (
    reg delete "HKCU\Software\Classes\%%E\OpenWithProgids" /v "MarkdownEditor.md" /f >nul 2>&1
    set "CUR="
    for /f "tokens=3" %%V in ('reg query "HKCU\Software\Classes\%%E" /ve 2^>nul ^| findstr /i "REG_SZ"') do set "CUR=%%V"
    if /i "!CUR!"=="MarkdownEditor.md" reg delete "HKCU\Software\Classes\%%E" /ve /f >nul 2>&1
)

set "PS1=%TEMP%\md_assoc_notify.ps1"
> "%PS1%" echo $sig = '[DllImport("shell32.dll")] public static extern void SHChangeNotify(int e, int f, IntPtr a, IntPtr b);'
>> "%PS1%" echo $t = Add-Type -MemberDefinition $sig -Name S -Namespace W -PassThru
>> "%PS1%" echo [W.S]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" >nul 2>&1
del "%PS1%" >nul 2>&1

echo 已取消关联，双击 .md 将不再默认用本工具打开。
echo.
pause
exit /b 0
