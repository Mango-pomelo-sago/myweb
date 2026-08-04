# -*- coding: utf-8 -*-
"""
图片压缩脚本：把 design / paint / photo 文件夹里的图片
缩放到最长边不超过 MAX_DIM，并转成 WebP 输出到 webp/<分类>/ 目录。

同时每张图会生成一张 120px 的模糊占位小图（webp/<分类>/thumb/），
以及一张 sizes.json（文件名 -> 宽高比），用于前端瀑布流预占位、消除加载闪跳。

原图保留不动，运行后按提示用 npm run optimize:images 即可。
新增图片后重新运行本脚本即可自动处理。
"""
import os
import json
from PIL import Image, ImageOps

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, 'src', 'assets', 'images')
OUT = os.path.join(SRC, 'webp')

CATEGORIES = ['design', 'paint', 'photo']
MAX_DIM = 1600      # 最长边像素上限（完整图）
QUALITY = 80        # WebP 质量
THUMB_DIM = 120     # 模糊占位小图最长边像素
THUMB_QUALITY = 50  # 占位图质量
EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.tif', '.tiff'}


def normalize(im):
    """统一到 Pillow 支持的 WebP 模式，尽量保留透明通道。"""
    if im.mode == 'P':
        return im.convert('RGBA')
    if im.mode == 'LA':
        return im.convert('RGBA')
    if im.mode == 'L':
        return im.convert('RGB')
    if im.mode in ('CMYK', 'YCbCr', 'LAB', 'HSV', 'I', 'F'):
        return im.convert('RGB')
    return im


def fit(im, limit):
    """等比缩放到最长边不超过 limit，返回缩放后的图。"""
    w, h = im.size
    if max(w, h) > limit:
        r = limit / max(w, h)
        return im.resize((round(w * r), round(h * r)), Image.LANCZOS)
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    total_src = 0
    total_out = 0
    count = 0
    skipped = []
    all_sizes = {}

    for cat in CATEGORIES:
        src_dir = os.path.join(SRC, cat)
        out_dir = os.path.join(OUT, cat)
        thumb_dir = os.path.join(out_dir, 'thumb')
        os.makedirs(out_dir, exist_ok=True)
        os.makedirs(thumb_dir, exist_ok=True)
        sizes = {}

        for fname in sorted(os.listdir(src_dir)):
            src_path = os.path.join(src_dir, fname)
            if not os.path.isfile(src_path):
                continue
            ext = os.path.splitext(fname)[1].lower()
            if ext not in EXTS:
                continue

            base = os.path.splitext(fname)[0]
            out_path = os.path.join(out_dir, base + '.webp')

            try:
                with Image.open(src_path) as im:
                    im = ImageOps.exif_transpose(im)  # 处理手机照片旋转
                    im = normalize(im)
                    im = fit(im, MAX_DIM)
                    w, h = im.size
                    im.save(out_path, 'WEBP', quality=QUALITY, method=6)

                    # 模糊占位小图（与完整图同比例）
                    thumb = fit(im, THUMB_DIM)
                    thumb.save(
                        os.path.join(thumb_dir, base + '.webp'),
                        'WEBP', quality=THUMB_QUALITY, method=6,
                    )

                    sizes[base] = round(w / h, 4)

                src_size = os.path.getsize(src_path)
                out_size = os.path.getsize(out_path)
                total_src += src_size
                total_out += out_size
                count += 1
                print(f'{cat}/{fname}: {src_size/1e6:.1f}MB -> {out_size/1e6:.1f}MB')
            except Exception as e:
                skipped.append(fname)
                print(f'SKIP {fname}: {e}')

        all_sizes[cat] = sizes

    # 写出尺寸表（前端瀑布流用宽高比预占位，避免图片加载导致的排版跳动）
    with open(os.path.join(OUT, 'sizes.json'), 'w', encoding='utf-8') as f:
        json.dump(all_sizes, f, ensure_ascii=False, indent=2)

    print(f'\n处理 {count} 张图片')
    print(f'总量 {total_src/1e6:.1f}MB -> {total_out/1e6:.1f}MB '
          f'(节省 {(1 - total_out/total_src)*100:.0f}%)')
    if skipped:
        print('跳过（无法读取）:', ', '.join(skipped))


if __name__ == '__main__':
    main()
