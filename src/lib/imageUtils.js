import { API_URL } from './apiClient';

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

export function normalizeApiImageUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const base = API_URL.replace(/\/+$/, '');
  if (trimmed.startsWith(base)) {
    const relative = trimmed.slice(base.length);
    if (!relative) return '/';
    return relative.startsWith('/') ? relative : `/${relative}`;
  }

  return trimmed;
}

export function getAbsoluteImageUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const base = API_URL.replace(/\/+$/, '');
  if (trimmed.startsWith('/')) {
    return `${base}${trimmed}`;
  }
  return `${base}/${trimmed}`;
}
