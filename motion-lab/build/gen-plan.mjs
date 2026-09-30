// Rebuilds the site's real building plan (components/UnitPlan.tsx + content/project.ts) as animation-ready SVG.
// Geometry logic is ported 1:1 from buildPlan(); output is checked against the built page by check-plan.mjs.
import fs from "node:fs";

export const project = {
  forSale: [
    { id: "12652", civics: ["12652", "12700"], sqft: 2509 },
    { id: "12656", civics: ["12656"], sqft: 1252 },
    { id: "12658", civics: ["12658"], sqft: 1780 },
    { id: "12660", civics: ["12660"], sqft: 1776 },
    { id: "12696", civics: ["12696"], sqft: 1259 },
  ],
  plan: [
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
  ],
};

const saleByCivic = Object.fromEntries(project.forSale.flatMap((u) => u.civics.map((c) => [c, u])));

const ROW = 35;
const DEEP = 10;
const MAN_DOOR = [3, 6];
const GARAGE = 10;

export function buildPlan() {
  const cols = project.plan;
  const cells = [];
  const services = [];
  const partitions = [];
  const demising = [];
  const walls = [];
  const span = (c) => (c.deep ? [-DEEP, 2 * ROW + DEEP] : [0, 2 * ROW]);
  let x = 0;
  cols.forEach((c, i) => {
    const [top, bottom] = span(c);
    const unitCol = !c.service;
    if (c.service) {
      services.push({ x, w: c.w });
    } else if (c.through) {
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
    const next = cols[i + 1];
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
  const first = span(cols[0]);
  const last = span(cols[cols.length - 1]);
  walls.push({ x1: 0, y1: first[0], x2: 0, y2: first[1] });
  walls.push({ x1: x, y1: last[0], x2: x, y2: last[1] });
  return { cells, services, partitions, demising, walls, length: x };
}

const r = (n) => Math.round(n * 1000) / 1000;
const len = (s) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
const line = (s, extra = "") => `<line x1="${r(s.x1)}" y1="${r(s.y1)}" x2="${r(s.x2)}" y2="${r(s.y2)}" ${extra}/>`;

export function planSvg({ widthPx = 1536 } = {}) {
  const P = buildPlan();
  const L = P.length;
  const VB = { x: -34, y: -38, w: L + 34 + 26, h: 2 * ROW + 2 * DEEP + 38 + 10 };
  const k = widthPx / VB.w; // px per foot
  const mint = "#d4f0c9";
  const slate = "#1d3a3c";
  const out = [];
  out.push(`<svg id="pl-svg" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" width="${r(widthPx)}" height="${r(VB.h * k)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-k="${r(k)}">`);
  out.push(`<defs><pattern id="pl-hatch" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2.2" stroke="${mint}" stroke-opacity=".4" stroke-width=".5"/></pattern></defs>`);

  // Boulevard at the office end
  out.push(`<g id="pl-boulevard">`);
  out.push(`<line x1="-17" y1="-30" x2="-17" y2="86" stroke="${mint}" stroke-opacity=".45" stroke-width=".55" stroke-dasharray="6 5"/>`);
  out.push(`<text class="pl-anno" x="-25" y="${ROW}" transform="rotate(-90 -25 ${ROW})" text-anchor="middle" dominant-baseline="middle" fill="${mint}" fill-opacity=".75">Boulevard Industriel</text>`);
  out.push(`</g>`);

  // Overall length dimension
  out.push(`<g id="pl-dim-len">`);
  out.push(`<g class="pl-dimline" stroke="${mint}" stroke-opacity=".6" stroke-width=".5">`);
  out.push(`<line class="pl-draw" x1="0" y1="-14" x2="0" y2="-29"/><line class="pl-draw" x1="${L}" y1="-3" x2="${L}" y2="-29"/><line class="pl-draw" x1="0" y1="-25" x2="${L}" y2="-25"/>`);
  out.push(`<line x1="-1.6" y1="-23.4" x2="1.6" y2="-26.6"/><line x1="${r(L - 1.6)}" y1="-23.4" x2="${r(L + 1.6)}" y2="-26.6"/>`);
  out.push(`</g>`);
  out.push(`<rect class="pl-dimbox" x="${r(L / 2 - 17)}" y="-29" width="34" height="8" fill="${slate}"/>`);
  out.push(`<text class="pl-anno pl-dimtext" x="${r(L / 2)}" y="-25" text-anchor="middle" dominant-baseline="central" fill="${mint}" fill-opacity=".9">490 pi</text>`);
  out.push(`</g>`);

  // Depth dimension
  out.push(`<g id="pl-dim-dep">`);
  out.push(`<g class="pl-dimline" stroke="${mint}" stroke-opacity=".6" stroke-width=".5">`);
  out.push(`<line class="pl-draw" x1="${r(L + 3)}" y1="0" x2="${r(L + 17)}" y2="0"/><line class="pl-draw" x1="${r(L + 3)}" y1="${2 * ROW}" x2="${r(L + 17)}" y2="${2 * ROW}"/><line class="pl-draw" x1="${r(L + 13)}" y1="0" x2="${r(L + 13)}" y2="${2 * ROW}"/>`);
  out.push(`<line x1="${r(L + 11.4)}" y1="1.6" x2="${r(L + 14.6)}" y2="-1.6"/><line x1="${r(L + 11.4)}" y1="${2 * ROW + 1.6}" x2="${r(L + 14.6)}" y2="${2 * ROW - 1.6}"/>`);
  out.push(`</g>`);
  out.push(`<rect class="pl-dimbox" x="${r(L + 9)}" y="${ROW - 11}" width="8" height="22" fill="${slate}"/>`);
  out.push(`<text class="pl-anno pl-dimtext" x="${r(L + 13)}" y="${ROW}" transform="rotate(90 ${r(L + 13)} ${ROW})" text-anchor="middle" dominant-baseline="central" fill="${mint}" fill-opacity=".9">70 pi</text>`);
  out.push(`</g>`);

  // Units for sale: mint fills (below linework)
  out.push(`<g id="pl-fills">`);
  for (const c of P.cells) {
    if (!c.sale) continue;
    out.push(`<rect id="pl-fill-${c.civics[0]}" class="pl-fill" x="${r(c.x)}" y="${r(c.y)}" width="${r(c.w)}" height="${r(c.h)}" fill="${mint}" fill-opacity="0" data-sale="${c.sale.id}"/>`);
  }
  out.push(`</g>`);

  // Electrical room hatch
  out.push(`<g id="pl-service">`);
  for (const sv of P.services) out.push(`<rect class="pl-hatch" x="${r(sv.x)}" y="0" width="${r(sv.w)}" height="${2 * ROW}" fill="url(#pl-hatch)"/>`);
  out.push(`</g>`);

  // Partitions and demising walls (hairlines)
  out.push(`<g id="pl-partitions" stroke="${mint}" stroke-opacity=".5" stroke-width=".55">`);
  for (const p of [...P.partitions, ...P.demising]) out.push(line(p, `class="pl-draw"`));
  out.push(`</g>`);

  // Outlines of the units for sale (keep their own walls visible against the mint)
  out.push(`<g id="pl-sale-outlines" fill="none" stroke="${slate}" stroke-opacity=".6" stroke-width=".55">`);
  for (const c of P.cells) if (c.sale) out.push(`<rect class="pl-saleoutline" x="${r(c.x)}" y="${r(c.y)}" width="${r(c.w)}" height="${r(c.h)}" opacity="0"/>`);
  out.push(`</g>`);

  // Exterior walls (heavy)
  out.push(`<g id="pl-walls" stroke="${mint}" stroke-width="1.1" stroke-linecap="square">`);
  for (const w of P.walls) out.push(line(w, `class="pl-draw pl-wall"`));
  out.push(`</g>`);

  // Doors
  out.push(`<g id="pl-doors" fill="none" pointer-events="none">`);
  for (const c of P.cells) {
    for (const side of c.walls) {
      const wy = side === "top" ? c.y : c.y + c.h;
      const dir = side === "top" ? 1 : -1;
      const g0 = c.x + c.w - 4 - GARAGE;
      const h0 = c.x + MAN_DOOR[0];
      const stroke = c.sale ? slate : mint;
      const op = c.sale ? 0.55 : 0.55;
      out.push(`<g class="pl-door${c.sale ? " pl-door-sale" : ""}" data-civic="${c.civics[0]}" stroke="${stroke}" stroke-opacity="${op}" stroke-width=".5">`);
      out.push(`<line x1="${r(g0)}" y1="${r(wy + dir * 1.8)}" x2="${r(g0 + GARAGE)}" y2="${r(wy + dir * 1.8)}" stroke-dasharray="3 2.5"/>`);
      out.push(`<line x1="${r(h0)}" y1="${r(wy)}" x2="${r(h0)}" y2="${r(wy + dir * 3)}"/>`);
      out.push(`<path d="M${r(h0 + 3)} ${r(wy)} A3 3 0 0 ${dir === 1 ? 1 : 0} ${r(h0)} ${r(wy + dir * 3)}"/>`);
      out.push(`</g>`);
    }
  }
  out.push(`</g>`);

  // Labels
  out.push(`<g id="pl-labels" pointer-events="none">`);
  for (const c of P.cells) {
    const cx = c.x + c.w / 2;
    const code = c.civics[0];
    if (!c.sale) {
      out.push(`<text class="pl-code" x="${r(cx)}" y="${r(c.y + c.h / 2)}" text-anchor="middle" dominant-baseline="central" fill="${mint}" fill-opacity=".7">${code}</text>`);
      continue;
    }
    // small code shown until the unit lights
    const cyOff = c.civics.length > 1 ? ROW : c.y + c.h / 2;
    out.push(`<text id="pl-off-${code}" class="pl-code pl-off" x="${r(cx)}" y="${r(cyOff)}" text-anchor="middle" dominant-baseline="central" fill="${mint}" fill-opacity=".7">${code}</text>`);
    if (c.civics.length > 1) {
      out.push(`<g id="pl-on-${code}" class="pl-on" fill="${slate}" opacity="0">`);
      out.push(`<text class="pl-civic" x="${r(cx)}" y="${r(ROW / 2)}" text-anchor="middle" dominant-baseline="central">${c.civics[0]}</text>`);
      out.push(`<text class="pl-plus" x="${r(cx)}" y="${r(ROW)}" text-anchor="middle" dominant-baseline="central">+</text>`);
      out.push(`<text class="pl-civic" x="${r(cx)}" y="${r(ROW + ROW / 2)}" text-anchor="middle" dominant-baseline="central">${c.civics[1]}</text>`);
      out.push(`</g>`);
    } else {
      const cy = c.y + c.h / 2;
      out.push(`<g id="pl-on-${code}" class="pl-on" fill="${slate}" opacity="0">`);
      out.push(`<text class="pl-civic" x="${r(cx)}" y="${r(cy)}" text-anchor="middle" dominant-baseline="central">${code}</text>`);
      out.push(`</g>`);
    }
  }
  out.push(`</g>`);
  out.push(`</svg>`);
  return { svg: out.join(""), plan: P, vb: VB, k, cells: P.cells.map((c) => ({ civics: c.civics, x: c.x, y: c.y, w: c.w, h: c.h, sale: c.sale?.id ?? null })) };
}

if (process.argv[1] && process.argv[1].endsWith("gen-plan.mjs")) {
  const res = planSvg();
  fs.mkdirSync("out", { recursive: true });
  fs.writeFileSync("out/plan.svg", res.svg);
  fs.writeFileSync("out/plan.meta.json", JSON.stringify({ vb: res.vb, k: res.k, cells: res.cells }, null, 2));
  console.log("plan.svg", res.svg.length, "bytes; cells:", res.cells.length, "sale:", res.cells.filter((c) => c.sale).length, "walls:", res.plan.walls.length, "k=", res.k);
}
