// Port of components/UnitPlan.tsx buildPlan() geometry -> static SVG markup for the video.
// Data from content/project.ts (copied verbatim). Output: JSON with svg markup + layout constants.
import fs from "node:fs";

const forSale = [
  { id: "12652", civics: ["12652", "12700"], sqft: 2509 },
  { id: "12656", civics: ["12656"], sqft: 1252 },
  { id: "12658", civics: ["12658"], sqft: 1780 },
  { id: "12660", civics: ["12660"], sqft: 1776 },
  { id: "12696", civics: ["12696"], sqft: 1259 },
];
const saleByCivic = Object.fromEntries(forSale.flatMap((u) => u.civics.map((c) => [c, u])));
const plan = [
  { w: 52.2, top: "12680", bottom: "12672", deep: true },
  { w: 32.9, top: "12682", bottom: "12670", deep: true },
  { w: 29.4, top: "12684", bottom: "12668" },
  { w: 30.5, top: "12686", bottom: "12666" },
  { w: 43.1, top: "12688", bottom: "12664" },
  { w: 42.5, top: "12690", bottom: "12662" },
  { w: 56.5, top: "12692", bottom: "12660" },
  { w: 4.7, service: true },
  { w: 56.5, top: "12694", bottom: "12658" },
  { w: 38.4, top: "12696", bottom: "12656" },
  { w: 37, top: "12698", bottom: "12654" },
  { w: 37, top: "12700", bottom: "12652", through: true },
  { w: 28.8, top: "12702", bottom: "12650" },
];

const ROW = 35, DEEP = 10, MAN_DOOR = [3, 6], GARAGE = 10;
const span = (c) => (c.deep ? [-DEEP, 2 * ROW + DEEP] : [0, 2 * ROW]);

const cells = [], services = [], partitions = [], demising = [], walls = [];
let x = 0;
plan.forEach((c, i) => {
  const [top, bottom] = span(c);
  const unitCol = !c.service;
  if (c.service) services.push({ x, w: c.w });
  else if (c.through) {
    cells.push({ civics: [c.top, c.bottom], x, y: top, w: c.w, h: bottom - top, walls: ["top", "bottom"], sale: saleByCivic[c.top] ?? saleByCivic[c.bottom] });
  } else {
    cells.push({ civics: [c.top], x, y: top, w: c.w, h: ROW - top, walls: ["top"], sale: saleByCivic[c.top] });
    cells.push({ civics: [c.bottom], x, y: ROW, w: c.w, h: bottom - ROW, walls: ["bottom"], sale: saleByCivic[c.bottom] });
    demising.push({ x1: x, y1: ROW, x2: x + c.w, y2: ROW });
  }
  for (const y of [top, bottom]) {
    const gaps = unitCol ? [[x + MAN_DOOR[0], x + MAN_DOOR[1]], [x + c.w - 4 - GARAGE, x + c.w - 4]] : [];
    let from = x;
    for (const [a, b] of gaps) {
      walls.push({ x1: from, y1: y, x2: a, y2: y });
      from = b;
    }
    walls.push({ x1: from, y1: y, x2: x + c.w, y2: y });
  }
  const next = plan[i + 1];
  if (next) {
    const [nTop, nBottom] = span(next);
    if (nTop !== top) {
      walls.push({ x1: x + c.w, y1: Math.min(top, nTop), x2: x + c.w, y2: Math.max(top, nTop) });
      walls.push({ x1: x + c.w, y1: Math.min(bottom, nBottom), x2: x + c.w, y2: Math.max(bottom, nBottom) });
    }
    partitions.push({ x1: x + c.w, y1: Math.max(top, nTop), x2: x + c.w, y2: Math.min(bottom, nBottom) });
  }
  x += c.w;
});
const first = span(plan[0]);
const last = span(plan[plan.length - 1]);
walls.push({ x1: 0, y1: first[0], x2: 0, y2: first[1] });
walls.push({ x1: x, y1: last[0], x2: x, y2: last[1] });
const L = x;
const VB = { x: -34, y: -38, w: L + 34 + 26, h: 2 * ROW + 2 * DEEP + 38 + 10 };

// ---- placement on the 1920x1080 canvas ----
const PX = { x0: 96, y0: 236, w: 1728 };
const sc = PX.w / VB.w;
const PXH = VB.h * sc;
const toPx = (px, py) => [PX.x0 + (px - VB.x) * sc, PX.y0 + (py - VB.y) * sc];

const f = (n) => Number(n.toFixed(2));
const NB = (n) => n.toLocaleString("en-US").replace(/,/g, " "); // 2 509 with NBSP
const area = (u) => `${NB(u.sqft)} pi²`;

// stroke widths in screen px (non-scaling-stroke, as on the site, but heavier for video)
const W_WALL = 3.2, W_PART = 1.8, W_OUT = 2.4, W_DIM = 1.8;
const MINT = "#d4f0c9", SLATE = "#1d3a3c";

let svg = "";
svg += `<svg id="plan" xmlns="http://www.w3.org/2000/svg" viewBox="${VB.x} ${VB.y} ${f(VB.w)} ${VB.h}" width="${PX.w}" height="${f(PXH)}" style="position:absolute;left:0;top:0;overflow:visible">`;
svg += `<defs><pattern id="hatch" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2.2" stroke="${MINT}" stroke-opacity=".45" stroke-width=".5"/></pattern></defs>`;

// annotations: boulevard line + label, overall length, depth
svg += `<g id="plan-anno">`;
svg += `<line x1="-17" y1="-30" x2="-17" y2="86" stroke="${MINT}" stroke-opacity=".45" stroke-dasharray="6 5" stroke-width="${W_DIM}" vector-effect="non-scaling-stroke"/>`;
svg += `<text x="-25.5" y="${ROW}" transform="rotate(-90 -25.5 ${ROW})" text-anchor="middle" dominant-baseline="middle" class="pl-anno" fill="${MINT}" fill-opacity=".8">BOULEVARD INDUSTRIEL</text>`;
svg += `<g stroke="${MINT}" stroke-opacity=".6" stroke-width="${W_DIM}" vector-effect="non-scaling-stroke">`;
svg += `<line x1="0" y1="-14" x2="0" y2="-29" vector-effect="non-scaling-stroke"/><line x1="${L}" y1="-3" x2="${L}" y2="-29" vector-effect="non-scaling-stroke"/><line x1="0" y1="-25" x2="${L}" y2="-25" vector-effect="non-scaling-stroke"/>`;
svg += `<line x1="-1.6" y1="-23.4" x2="1.6" y2="-26.6" vector-effect="non-scaling-stroke"/><line x1="${f(L - 1.6)}" y1="-23.4" x2="${f(L + 1.6)}" y2="-26.6" vector-effect="non-scaling-stroke"/></g>`;
svg += `<rect x="${f(L / 2 - 17)}" y="-29.5" width="34" height="9" fill="${SLATE}"/>`;
svg += `<text x="${f(L / 2)}" y="-25" text-anchor="middle" dominant-baseline="central" class="pl-anno" fill="${MINT}" fill-opacity=".9">~ 490 PI</text>`;
svg += `<g stroke="${MINT}" stroke-opacity=".6" stroke-width="${W_DIM}" vector-effect="non-scaling-stroke">`;
svg += `<line x1="${L + 3}" y1="0" x2="${L + 17}" y2="0" vector-effect="non-scaling-stroke"/><line x1="${L + 3}" y1="${2 * ROW}" x2="${L + 17}" y2="${2 * ROW}" vector-effect="non-scaling-stroke"/><line x1="${L + 13}" y1="0" x2="${L + 13}" y2="${2 * ROW}" vector-effect="non-scaling-stroke"/>`;
svg += `<line x1="${f(L + 11.4)}" y1="1.6" x2="${f(L + 14.6)}" y2="-1.6" vector-effect="non-scaling-stroke"/><line x1="${f(L + 11.4)}" y1="${2 * ROW + 1.6}" x2="${f(L + 14.6)}" y2="${2 * ROW - 1.6}" vector-effect="non-scaling-stroke"/></g>`;
svg += `<rect x="${L + 8}" y="${ROW - 12}" width="10" height="24" fill="${SLATE}"/>`;
svg += `<text x="${L + 13}" y="${ROW}" transform="rotate(90 ${L + 13} ${ROW})" text-anchor="middle" dominant-baseline="central" class="pl-anno" fill="${MINT}" fill-opacity=".9">70 PI</text>`;
svg += `</g>`;

// sale fills (start at 0 opacity: they "switch on")
svg += `<g id="plan-sale-fills">`;
for (const c of cells) {
  if (!c.sale) continue;
  svg += `<rect id="u-${c.sale.id}" class="sale-fill" x="${f(c.x)}" y="${f(c.y)}" width="${f(c.w)}" height="${f(c.h)}" fill="${MINT}" fill-opacity="0"/>`;
}
svg += `</g>`;
// electrical room
svg += `<g id="plan-hatch">`;
for (const s of services) svg += `<rect x="${f(s.x)}" y="0" width="${f(s.w)}" height="${2 * ROW}" fill="url(#hatch)"/>`;
svg += `</g>`;
// thin walls (partitions + demising)
svg += `<g id="plan-thin" stroke="${MINT}" stroke-opacity=".55" stroke-width="${W_PART}">`;
for (const p of [...partitions, ...demising]) svg += `<line x1="${f(p.x1)}" y1="${f(p.y1)}" x2="${f(p.x2)}" y2="${f(p.y2)}" vector-effect="non-scaling-stroke"/>`;
svg += `</g>`;
// for-sale outlines in slate (visible on the mint)
svg += `<g id="plan-sale-outlines" fill="none" stroke="${SLATE}" stroke-opacity=".7" stroke-width="${W_OUT}">`;
for (const c of cells) if (c.sale) svg += `<rect x="${f(c.x)}" y="${f(c.y)}" width="${f(c.w)}" height="${f(c.h)}" vector-effect="non-scaling-stroke"/>`;
svg += `</g>`;
// exterior walls
svg += `<g id="plan-walls" stroke="${MINT}" stroke-width="${W_WALL}" stroke-linecap="square">`;
for (const p of walls) svg += `<line x1="${f(p.x1)}" y1="${f(p.y1)}" x2="${f(p.x2)}" y2="${f(p.y2)}" vector-effect="non-scaling-stroke"/>`;
svg += `</g>`;
// doors
svg += `<g id="plan-doors" fill="none" stroke-width="${W_PART}">`;
for (const c of cells) {
  for (const side of c.walls) {
    const wy = side === "top" ? c.y : c.y + c.h;
    const dir = side === "top" ? 1 : -1;
    const g0 = c.x + c.w - 4 - GARAGE;
    const h0 = c.x + MAN_DOOR[0];
    const stroke = c.sale ? SLATE : MINT;
    const op = c.sale ? 0.75 : 0.55;
    svg += `<g class="door${c.sale ? " door-sale" : ""}" stroke="${stroke}" stroke-opacity="${op}">`;
    svg += `<line x1="${f(g0)}" y1="${f(wy + dir * 1.8)}" x2="${f(g0 + GARAGE)}" y2="${f(wy + dir * 1.8)}" stroke-dasharray="3 2.5" vector-effect="non-scaling-stroke"/>`;
    svg += `<line x1="${f(h0)}" y1="${f(wy)}" x2="${f(h0)}" y2="${f(wy + dir * 3)}" vector-effect="non-scaling-stroke"/>`;
    svg += `<path d="M${f(h0 + 3)} ${f(wy)} A3 3 0 0 ${dir === 1 ? 1 : 0} ${f(h0)} ${f(wy + dir * 3)}" vector-effect="non-scaling-stroke"/>`;
    svg += `</g>`;
  }
}
svg += `</g>`;
// selection highlight ring for the picked unit (12656)
const pick = cells.find((c) => c.civics[0] === "12656");
svg += `<rect id="hl-12656" x="${f(pick.x)}" y="${f(pick.y)}" width="${f(pick.w)}" height="${f(pick.h)}" fill="none" stroke="#fff" stroke-width="5" vector-effect="non-scaling-stroke" opacity="0"/>`;
// labels
svg += `<g id="plan-labels">`;
for (const c of cells) {
  const cx = c.x + c.w / 2;
  if (!c.sale) {
    svg += `<text x="${f(cx)}" y="${f(c.y + c.h / 2)}" text-anchor="middle" dominant-baseline="central" class="pl-code" fill="${MINT}" fill-opacity=".66">${c.civics[0]}</text>`;
    continue;
  }
  const a = area(c.sale);
  if (c.civics.length > 1) {
    svg += `<g id="lbl-${c.sale.id}" class="sale-label" fill="${SLATE}" opacity="0">`;
    svg += `<text x="${f(cx)}" y="${f(ROW / 2)}" text-anchor="middle" dominant-baseline="central" class="pl-civic">${c.civics[0]}</text>`;
    svg += `<text x="${f(cx)}" y="${ROW}" text-anchor="middle" dominant-baseline="central" class="pl-area">${a}</text>`;
    svg += `<text x="${f(cx)}" y="${f(ROW + ROW / 2)}" text-anchor="middle" dominant-baseline="central" class="pl-civic">${c.civics[1]}</text>`;
    svg += `</g>`;
  } else {
    const cy = c.y + c.h / 2;
    svg += `<g id="lbl-${c.sale.id}" class="sale-label" fill="${SLATE}" opacity="0">`;
    svg += `<text x="${f(cx)}" y="${f(cy - 3.6)}" text-anchor="middle" dominant-baseline="central" class="pl-civic">${c.civics[0]}</text>`;
    svg += `<text x="${f(cx)}" y="${f(cy + 5.6)}" text-anchor="middle" dominant-baseline="central" class="pl-area">${a}</text>`;
    svg += `</g>`;
  }
}
svg += `</g>`;
svg += `</svg>`;

// layout constants for the timeline (canvas px)
const centers = {};
for (const c of cells) {
  if (!c.sale) continue;
  const [px, py] = toPx(c.x + c.w / 2, c.y + c.h / 2);
  centers[c.civics[0]] = [f(px), f(py)];
}
const out = { svg, sc: f(sc), PX, PXH: f(PXH), L: f(L), VB, centers, saleCells: cells.filter((c) => c.sale).map((c) => ({ id: c.sale.id, civics: c.civics, x: c.x, w: c.w })) };
fs.writeFileSync(process.argv[2] || "plan.json", JSON.stringify(out, null, 1));
console.log("plan px height", f(PXH), "scale", f(sc), "L", f(L));
console.log("centers", JSON.stringify(centers));
