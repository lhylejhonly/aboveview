/**
 * Makes uploaded product photos easier to use in the catalogue.
 * It trims the quiet border around a product, then adds a small, consistent
 * breathing room so the product sits neatly inside the card frame.
 */
export async function fitProductImage(file: File): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) return file;

  const source = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return file;

  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, source.width, source.height);
  const { data, width, height } = pixels;
  const corner = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
  };
  const corners = [corner(0, 0), corner(width - 1, 0), corner(0, height - 1), corner(width - 1, height - 1)];
  const background = corners.reduce((total, color) => total.map((value, index) => value + color[index]), [0, 0, 0, 0]).map(value => value / corners.length);
  const threshold = 22;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];
      const difference = Math.abs(data[index] - background[0]) + Math.abs(data[index + 1] - background[1]) + Math.abs(data[index + 2] - background[2]);
      if (alpha > 12 && (alpha < 245 || difference > threshold)) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  // If the image has no reliably detectable subject, keep the original.
  if (right < 0 || bottom < 0 || right - left < width * 0.12 || bottom - top < height * 0.12) {
    source.close();
    return file;
  }

  const paddingX = Math.round((right - left) * 0.08);
  const paddingY = Math.round((bottom - top) * 0.08);
  left = Math.max(0, left - paddingX);
  top = Math.max(0, top - paddingY);
  right = Math.min(width - 1, right + paddingX);
  bottom = Math.min(height - 1, bottom + paddingY);

  const output = document.createElement("canvas");
  output.width = right - left + 1;
  output.height = bottom - top + 1;
  output.getContext("2d")?.drawImage(source, left, top, output.width, output.height, 0, 0, output.width, output.height);
  source.close();

  const blob = await new Promise<Blob | null>(resolve => output.toBlob(resolve, file.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
  return blob ? new File([blob], file.name, { type: blob.type, lastModified: Date.now() }) : file;
}
