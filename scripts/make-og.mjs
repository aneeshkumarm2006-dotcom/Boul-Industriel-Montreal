// Builds the 1200×630 social preview (WhatsApp, Facebook, LinkedIn) from the hero aerial:
// the building stays bright, the surroundings are toned down so it reads at thumbnail size.
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const hero = JSON.parse(await readFile("content/hero.json", "utf8"));
const OUT_W = 1200;
const OUT_H = 630;

// Widest 1200:630 window that fits the photo, centred on the building
const cropW = Math.round(hero.height * (OUT_W / OUT_H));
const xs = hero.outline.map(([x]) => x);
const centre = (Math.min(...xs) + Math.max(...xs)) / 2;
const left = Math.round(Math.min(Math.max(centre - cropW / 2, 0), hero.width - cropW));
const k = OUT_W / cropW;

const pts = hero.outline.map(([x, y]) => `${((x - left) * k).toFixed(1)},${(y * k).toFixed(1)}`).join(" ");
const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${OUT_W}" height="${OUT_H}">
  <path fill="#0f1d1e" fill-opacity="0.42" fill-rule="evenodd" d="M0 0H${OUT_W}V${OUT_H}H0Z M${pts.replaceAll(" ", " L")}Z"/>
  <polygon points="${pts}" fill="#d4f0c9" fill-opacity="0.18" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
</svg>`);

await sharp(`assets-src/${hero.image}.jpg`)
  .extract({ left, top: 0, width: cropW, height: hero.height })
  .resize(OUT_W, OUT_H)
  .composite([{ input: overlay }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/og.jpg");

console.log("Social preview → public/og.jpg");
