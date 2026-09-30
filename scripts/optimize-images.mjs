// Pre-optimizes source photos into responsive AVIF/WebP sets + a tiny blur placeholder.
// Output: public/images/<name>-<w>.<ext> and content/images.json (dimensions + blur data URI).
import { readdir, mkdir, writeFile, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets-src";
const OUT = "public/images";
const MANIFEST = "content/images.json";
const WIDTHS = [480, 800, 1200, 1800];

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const manifest = {};
const expected = new Set();

for (const file of files) {
  const name = path.parse(file).name;
  const { width, height } = await sharp(path.join(SRC, file)).metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  // Sources narrower than the largest step still get a full-resolution rendition
  if (width < WIDTHS.at(-1) && !widths.includes(width)) widths.push(width);

  for (const w of widths) {
    for (const [fmt, opts] of [
      ["avif", { quality: 50, effort: 6 }],
      ["webp", { quality: 74 }],
    ]) {
      const dest = path.join(OUT, `${name}-${w}.${fmt}`);
      expected.add(path.basename(dest));
      if (await stat(dest).catch(() => null)) continue;
      await sharp(path.join(SRC, file)).resize({ width: w }).toFormat(fmt, opts).toFile(dest);
    }
  }

  const blur = await sharp(path.join(SRC, file)).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  manifest[name] = {
    width,
    height,
    widths,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

// Drop renditions whose source photo was removed or renamed
for (const f of await readdir(OUT)) {
  if (!expected.has(f)) await unlink(path.join(OUT, f));
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`Optimized ${files.length} images → ${OUT}`);
