import type { ImageMetadata } from "astro";

type CatalogImageId = string;

const byFileName = import.meta.glob("./*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
}) as Record<string, { default: ImageMetadata }>;

function fileNameFromId(id: CatalogImageId, ext: string): string {
  return `./${id}.${ext}`;
}

export function getCatalogImageById(
  id: CatalogImageId,
): ImageMetadata | undefined {
  const png = byFileName[fileNameFromId(id, "png")]?.default;
  if (png != null) return png;

  const jpg = byFileName[fileNameFromId(id, "jpg")]?.default;
  if (jpg != null) return jpg;

  const jpeg = byFileName[fileNameFromId(id, "jpeg")]?.default;
  if (jpeg != null) return jpeg;

  const webp = byFileName[fileNameFromId(id, "webp")]?.default;
  if (webp != null) return webp;

  const avif = byFileName[fileNameFromId(id, "avif")]?.default;
  if (avif != null) return avif;

  return undefined;
}

