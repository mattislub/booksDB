export async function compressImage(file, maxSizeMB = 5) {
  if (!file) return file;
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.src = objectUrl;
  await new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let scale = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
  if (scale > 1) scale = 1;

  let blob = null;
  while (true) {
    canvas.width = Math.max(1, image.width * scale);
    canvas.height = Math.max(1, image.height * scale);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    let quality = 0.92;
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );

    while (blob && blob.size > maxSizeMB * 1024 * 1024 && quality > 0.5) {
      quality -= 0.05;
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality)
      );
    }

    if (!blob || blob.size <= maxSizeMB * 1024 * 1024 || scale <= 0.1) {
      break;
    }

    // If the image is still too large, reduce dimensions further and retry
    scale *= 0.9;
  }

  URL.revokeObjectURL(objectUrl);

  if (blob && blob.size <= maxSizeMB * 1024 * 1024) {
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
      type: 'image/jpeg',
    });
  }

  // Fallback: return original file if compression failed
  return file;
}

export function trimEmptyMargins(
  src,
  opts = {}
) {
  const bg = opts.bg ?? 'white';
  const tolerance = opts.tolerance ?? 12;
  const paddingPx = Math.max(0, opts.paddingPx ?? 0);

  const w = src.width,
    h = src.height;
  const ctx = src.getContext('2d');
  const data = ctx.getImageData(0, 0, w, h).data;

  function isBackground(i) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];
    if (bg === 'transparent') {
      return a <= tolerance;
    }
    return 255 - r <= tolerance && 255 - g <= tolerance && 255 - b <= tolerance && a > 0;
  }

  let top = 0,
    bottom = h - 1,
    left = 0,
    right = w - 1;

  outerTop: for (; top < h; top++) {
    for (let x = 0; x < w; x++) {
      const i = (top * w + x) * 4;
      if (!isBackground(i)) break outerTop;
    }
  }

  outerBottom: for (; bottom >= top; bottom--) {
    for (let x = 0; x < w; x++) {
      const i = (bottom * w + x) * 4;
      if (!isBackground(i)) break outerBottom;
    }
  }

  outerLeft: for (; left < w; left++) {
    for (let y = top; y <= bottom; y++) {
      const i = (y * w + left) * 4;
      if (!isBackground(i)) break outerLeft;
    }
  }

  outerRight: for (; right >= left; right--) {
    for (let y = top; y <= bottom; y++) {
      const i = (y * w + right) * 4;
      if (!isBackground(i)) break outerRight;
    }
  }

  if (left > right || top > bottom) return src;

  const cropLeft = Math.max(0, left - paddingPx);
  const cropTop = Math.max(0, top - paddingPx);
  const cropRight = Math.min(w - 1, right + paddingPx);
  const cropBottom = Math.min(h - 1, bottom + paddingPx);
  const cw = cropRight - cropLeft + 1;
  const ch = cropBottom - cropTop + 1;

  const dst = document.createElement('canvas');
  dst.width = cw;
  dst.height = ch;
  const dctx = dst.getContext('2d');
  dctx.drawImage(src, cropLeft, cropTop, cw, ch, 0, 0, cw, ch);
  return dst;
}

