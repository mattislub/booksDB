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
  let scale = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
  if (scale > 1) scale = 1;
  canvas.width = image.width * scale;
  canvas.height = image.height * scale;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.92;
  let blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );
  while (blob && blob.size > maxSizeMB * 1024 * 1024 && quality > 0.5) {
    quality -= 0.05;
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
  }

  URL.revokeObjectURL(objectUrl);
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
  });
}
