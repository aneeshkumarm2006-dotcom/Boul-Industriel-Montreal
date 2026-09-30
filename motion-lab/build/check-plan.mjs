import fs from "node:fs";
import { planSvg } from "./gen-plan.mjs";
const raw = fs.readFileSync("plan.raw.svg", "utf8");
const mine = planSvg().svg;
const r3 = (v) => (Math.round(parseFloat(v) * 1000) / 1000).toString();
const lines = (s) => [...s.matchAll(/<line\s+([^>]*?)\/?>/g)].map((m) => {
  const a = Object.fromEntries([...m[1].matchAll(/(\w[\w-]*)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
  return ["x1","y1","x2","y2"].map((k) => r3(a[k])).join(",");
});
const rects = (s) => [...s.matchAll(/<rect\s+([^>]*?)\/?>/g)].map((m) => {
  const a = Object.fromEntries([...m[1].matchAll(/(\w[\w-]*)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
  return ["x","y","width","height"].map((k) => r3(a[k])).join(",");
});
const texts = (s) => [...s.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
const rawL = new Set(lines(raw)), mineL = lines(mine);
const missingLines = mineL.filter((l) => !rawL.has(l));
console.log("my lines:", mineL.length, " raw lines:", rawL.size, " my lines not in raw:", missingLines.length, missingLines.slice(0,8));
const rawR = new Set(rects(raw)), mineR = rects(mine);
const missingRects = mineR.filter((l) => !rawR.has(l));
console.log("my rects:", mineR.length, " raw rects:", rawR.size, " my rects not in raw:", missingRects.length, missingRects.slice(0,8));
const rawT = texts(raw).filter((t) => /^\d{5}$/.test(t));
const mineT = texts(mine).filter((t) => /^\d{5}$/.test(t));
console.log("raw 5-digit labels (unique):", new Set(rawT).size, " mine:", new Set(mineT).size, "sets equal:", [...new Set(rawT)].sort().join() === [...new Set(mineT)].sort().join());
// raw wall count: lines inside the stroke-width=2 group
const wallsRaw = raw.match(/<g stroke="#d4f0c9" stroke-width="2"[^>]*>([\s\S]*?)<\/g>/);
console.log("raw wall lines:", wallsRaw ? lines(wallsRaw[1]).length : "n/a");
const wallsMine = mine.match(/<g id="pl-walls"[^>]*>([\s\S]*?)<\/g>/);
console.log("mine wall lines:", wallsMine ? lines(wallsMine[1]).length : "n/a");
