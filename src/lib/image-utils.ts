/**
 * Compress a base64 image to a smaller size suitable for MockAPI storage
 * @param base64 Original base64 image string
 * @param maxWidth Maximum width in pixels (default 400)
 * @param quality JPEG quality 0-1 (default 0.5)
 * @returns Compressed base64 string
 */
export function compressImage(
  base64: string,
  maxWidth: number = 400,
  quality: number = 0.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64); // fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(base64); // fallback to original on error
    };
    img.src = base64;
  });
}
