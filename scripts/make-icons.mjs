// Rasterizes public/favicon.svg into the files browsers request on their own
// (/favicon.ico, /apple-touch-icon.png), so those requests never fall through to /[lang].
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("public/favicon.svg");

// Apple touch icon: full-bleed square (iOS rounds the corners itself)
const touch = Buffer.from(svg.toString().replace('rx="7"', 'rx="0"'));
await sharp(touch, { density: 900 }).resize(180, 180).png().toFile("public/apple-touch-icon.png");

// favicon.ico: one 32×32 PNG wrapped in an ICO container
const png = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
await writeFile("public/favicon.ico", Buffer.concat([header, png]));

console.log("Icons → public/favicon.ico, public/apple-touch-icon.png");
