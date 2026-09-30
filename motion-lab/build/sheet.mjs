// Contact-sheet helper (ffmpeg here has no glob support).
//   node build/sheet.mjs <out.png> <cols> <cellWidth> <file[::label]>...
import { spawnSync } from "node:child_process";
import path from "node:path";

const [out, colsS, wS, ...items] = process.argv.slice(2);
const cols = +colsS, W = +wS, H = Math.round((W * 9) / 16);
const files = items.map((s) => s.split("::")[0]);
const labels = items.map((s, i) => (s.includes("::") ? s.split("::")[1] : path.basename(files[i])));
const rows = Math.ceil(files.length / cols);
const args = ["-v", "error", "-y"];
for (const f of files) args.push("-i", f);
const font = "C\\:/Windows/Fonts/arial.ttf";
const parts = files.map((f, i) => `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,drawtext=fontfile='${font}':text='${labels[i].replace(/[:']/g, "")}':x=8:y=8:fontsize=${Math.max(14, Math.round(W / 22))}:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`);
const layout = files.map((_, i) => `${(i % cols) * W}_${Math.floor(i / cols) * H}`).join("|");
const fc = parts.join(";") + ";" + files.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${files.length}:layout=${layout}:fill=black[o]`;
args.push("-filter_complex", fc, "-map", "[o]", "-frames:v", "1", out);
const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
console.log("wrote", out, `${cols}x${rows} cells of ${W}x${H}`);
