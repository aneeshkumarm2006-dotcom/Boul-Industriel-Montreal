// Turns an uploaded photo into the same responsive set the build makes for assets-src/
// (scripts/optimize-images.mjs): AVIF + WebP at the shared widths, plus a 16 px blur placeholder.
import "server-only";
import sharp from "sharp";
import { randomBytes } from "node:crypto";
import settings from "@/content/image-settings.json";
import { putMedia } from "./store";
import type { Photo } from "./types";

// AVIF effort 4 instead of the build's 6 keeps an upload to a few seconds
const AVIF = { ...settings.avif, effort: 4 };
const MAX_PIXELS = 80_000_000;

export async function processUpload(input: Buffer): Promise<Omit<Photo, "alt">> {
  const meta = await sharp(input, { limitInputPixels: MAX_PIXELS }).metadata();
  if (!meta.width || !meta.height) throw new Error("NOT_AN_IMAGE");
  // EXIF orientations 5–8 are rotated a quarter turn: width and height swap once .rotate() applies them
  const turned = (meta.orientation ?? 1) >= 5;
  const width = turned ? meta.height : meta.width;
  const height = turned ? meta.width : meta.height;

  const widths: number[] = settings.widths.filter((w) => w <= width);
  if (width < settings.widths[settings.widths.length - 1] && !widths.includes(width)) widths.push(width);

  const id = randomBytes(9).toString("base64url");
  // .rotate() bakes the EXIF orientation in; re-encoding drops the rest of the metadata (GPS included)
  const render = (w: number, fmt: "avif" | "webp") =>
    sharp(input, { limitInputPixels: MAX_PIXELS })
      .rotate()
      .resize({ width: w })
      .toFormat(fmt, fmt === "avif" ? AVIF : settings.webp)
      .toBuffer();

  const urls = await Promise.all(
    widths.flatMap((w) => (["avif", "webp"] as const).map(async (fmt) => putMedia(id, `${w}.${fmt}`, await render(w, fmt), `image/${fmt}`))),
  );
  const blur = await sharp(input, { limitInputPixels: MAX_PIXELS })
    .rotate()
    .resize({ width: settings.blur.width })
    .webp({ quality: settings.blur.quality })
    .toBuffer();

  return {
    key: `m-${id}`,
    base: urls[0].slice(0, urls[0].lastIndexOf("/") + 1),
    width,
    height,
    widths,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}
