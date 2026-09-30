// Extract the site's real plan + unit-drawing SVG markup from the static export (read-only).
import fs from "node:fs";
const html = fs.readFileSync("../../out/fr/index.html", "utf8");
function grab(openMarker, name) {
  const i = html.indexOf(openMarker);
  if (i < 0) throw new Error("marker not found: " + name);
  const j = html.indexOf("</svg>", i);
  const svg = html.slice(i, j + 6);
  fs.writeFileSync(name, svg);
  console.log(name, svg.length, "bytes; nested <svg count:", (svg.match(/<svg/g) || []).length);
}
grab('<svg viewBox="-34 -38 549.5 138"', "plan.raw.svg");
grab('<svg viewBox="-3 -2.5 42.5 46"', "unit.raw.svg");
