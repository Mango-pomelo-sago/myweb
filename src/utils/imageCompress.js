// 客户端图片压缩：上传作品集前先压缩，与 scripts/optimize_images.py 的参数保持一致
export const MAX_DIM = 1600 // 最长边上限（像素）
export const QUALITY = 0.8 // webp 编码质量

function loadBitmap(file) {
  // 优先用 createImageBitmap（无需挂 DOM），不支持时回退到 Image + objectURL
  if (typeof createImageBitmap !== 'undefined') {
    return createImageBitmap(file).catch(() => loadViaImage(file))
  }
  return loadViaImage(file)
}

function loadViaImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

/**
 * 压缩图片文件 → webp 的 Blob
 * @param {File} file 用户选择的文件
 * @returns {Promise<{ blob: Blob, width: number, height: number, compressed: boolean }>}
 *   width/height 为压缩前的原始尺寸（供宽高比 ratio 用）
 *   compressed 表示是否实际走了压缩（false = 原样透传）
 */
export async function compressImage(file) {
  const isWebp = /\.webp$/i.test(file.name)

  let bitmap
  try {
    bitmap = await loadBitmap(file)
  } catch {
    // 解码失败（非图片文件等）→ 原样透传，交给上传链路报错
    return { blob: file, width: 0, height: 0, compressed: false }
  }

  const srcW = bitmap.naturalWidth || bitmap.width
  const srcH = bitmap.naturalHeight || bitmap.height
  if (!srcW || !srcH) {
    return { blob: file, width: 0, height: 0, compressed: false }
  }

  // 已 webp 且最长边 ≤1600 → 直接透传原文件（避免二次编码损失）
  if (isWebp && srcW <= MAX_DIM && srcH <= MAX_DIM) {
    return { blob: file, width: srcW, height: srcH, compressed: false }
  }

  // 等比缩放到 MAX_DIM
  const scale = Math.min(1, MAX_DIM / Math.max(srcW, srcH))
  const w = Math.round(srcW * scale)
  const h = Math.round(srcH * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, w, h)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
  if (!blob) {
    // canvas 编码失败兜底：原样上传
    return { blob: file, width: srcW, height: srcH, compressed: false }
  }

  return { blob, width: srcW, height: srcH, compressed: true }
}