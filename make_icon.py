# -*- coding: utf-8 -*-
"""生成 Markdown 编辑器图标：圆角渐变底 + 白色 M↓ 标记"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = 1024          # 基准尺寸
SS = 2            # 超采样倍数
W = S * SS

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
os.makedirs(OUT_DIR, exist_ok=True)

# ---------- 渐变背景 ----------
def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

TOP = (94, 132, 255)      # #5E84FF 明亮蓝紫
BOT = (43, 71, 214)       # #2B47D6 深蓝

grad = Image.new('RGB', (W, W), BOT)
gd = ImageDraw.Draw(grad)
for y in range(W):
    gd.line([(0, y), (W, y)], fill=lerp(TOP, BOT, y / (W - 1)))

# 左上角柔光
glow = Image.new('L', (W, W), 0)
ImageDraw.Draw(glow).ellipse([-W * 0.35, -W * 0.55, W * 0.75, W * 0.55], fill=70)
glow = glow.filter(ImageFilter.GaussianBlur(W // 8))
white = Image.new('RGB', (W, W), (255, 255, 255))
grad = Image.composite(white, grad, glow.point(lambda v: int(v * 0.55)))

# 圆角遮罩
radius = int(W * 0.225)
mask = Image.new('L', (W, W), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, W - 1], radius=radius, fill=255)

icon = Image.new('RGBA', (W, W), (0, 0, 0, 0))
icon.paste(grad, (0, 0), mask)

d = ImageDraw.Draw(icon)

# ---------- 白色 M + 向下箭头 ----------
font = ImageFont.truetype(r'C:\Windows\Fonts\segoeuib.ttf', int(W * 0.50))
text = 'M'
bb = d.textbbox((0, 0), text, font=font)
tw, th = bb[2] - bb[0], bb[3] - bb[1]

arrow_w = int(W * 0.185)
gap = int(W * 0.035)
group_w = tw + gap + arrow_w
left = (W - group_w) // 2
top = (W - th) // 2 - bb[1]

d.text((left - bb[0], top), text, font=font, fill=(255, 255, 255, 255))

# 箭头：底部与 M 基线对齐（以字形墨迹范围为准）
ax = left + tw + gap + arrow_w // 2
stroke = int(W * 0.078)
ink_top = top + bb[1]
ay0 = ink_top + int(th * 0.26)
ay1 = ink_top + int(th * 0.94)
d.line([(ax, ay0), (ax, ay1)], fill=(255, 255, 255, 255), width=stroke)
che = int(arrow_w * 0.50)
d.line([(ax - che, ay1 - che), (ax, ay1)], fill=(255, 255, 255, 255), width=stroke, joint='curve')
d.line([(ax, ay1), (ax + che, ay1 - che)], fill=(255, 255, 255, 255), width=stroke, joint='curve')
# 圆头
for px, py in [(ax, ay0), (ax - che, ay1 - che), (ax + che, ay1 - che), (ax, ay1)]:
    r = stroke // 2
    d.ellipse([px - r, py - r, px + r, py + r], fill=(255, 255, 255, 255))

icon = icon.resize((S, S), Image.LANCZOS)

png_path = os.path.join(OUT_DIR, 'app.png')
icon.save(png_path)

ico_path = os.path.join(OUT_DIR, 'app.ico')
icon.save(ico_path, format='ICO',
          sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

print('PNG:', png_path, icon.size)
print('ICO:', ico_path, os.path.getsize(ico_path), 'bytes')
