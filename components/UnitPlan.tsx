"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/fr";
import { forSale, project, saleByCivic, soldCivics, type PlanColumn, type UnitForSale } from "@/content/project";
import { fill, formatDate, formatNumber } from "@/lib/i18n";
import { requestUnit } from "@/lib/unit-events";
import { Arrow, ArrowDown } from "./icons";

type Strings = Dictionary["plan"];

// ---------- Geometry (feet) ----------
const ROW = 35; // each row of units is 35 ft deep; 70 ft for the building
const DEEP = 10; // the office block at the boulevard end sticks out 10 ft on both sides
const MAN_DOOR = [3, 6] as const; // offset from the unit's left wall
const GARAGE = 10;

type Side = "top" | "bottom";
interface Cell {
  civics: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  walls: Side[];
  sale?: UnitForSale;
  sold?: boolean;
}
interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function buildPlan() {
  const cols = project.plan as readonly PlanColumn[];
  const cells: Cell[] = [];
  const services: { x: number; w: number }[] = [];
  const partitions: Seg[] = [];
  const demising: Seg[] = [];
  const walls: Seg[] = [];
  const span = (c: PlanColumn) => (c.deep ? [-DEEP, 2 * ROW + DEEP] : [0, 2 * ROW]);

  let x = 0;
  cols.forEach((c, i) => {
    const [top, bottom] = span(c);
    const unitCol = !c.service;

    if (c.service) {
      services.push({ x, w: c.w });
    } else if (c.through) {
      const sale = saleByCivic[c.top!] ?? saleByCivic[c.bottom!];
      cells.push({ civics: [c.top!, c.bottom!], x, y: top, w: c.w, h: bottom - top, walls: ["top", "bottom"], sale, sold: !sale && soldCivics.has(c.top!) });
    } else {
      cells.push({ civics: [c.top!], x, y: top, w: c.w, h: ROW - top, walls: ["top"], sale: saleByCivic[c.top!], sold: soldCivics.has(c.top!) });
      cells.push({ civics: [c.bottom!], x, y: ROW, w: c.w, h: bottom - ROW, walls: ["bottom"], sale: saleByCivic[c.bottom!], sold: soldCivics.has(c.bottom!) });
      demising.push({ x1: x, y1: ROW, x2: x + c.w, y2: ROW });
    }

    // Exterior walls along both long sides, broken where the walk-in and garage doors are
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
      // Where the office block steps back to the main bar, the step is exterior wall
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

const PLAN = buildPlan();
const L = PLAN.length;
const VB = { x: -34, y: -38, w: L + 34 + 26, h: 2 * ROW + 2 * DEEP + 38 + 10 };
const saleOrder = new Map(forSale.map((u, i) => [u.id, i]));

// ---------- Component ----------
export default function UnitPlan({ s, locale, sqft }: { s: Strings; locale: string; sqft: string }) {
  const n = (v: number) => formatNumber(locale, v);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const [lit, setLit] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const active = hover ?? selected;

  // A unit hovered or picked on the plan (or in the hero) is brought into view inside the scrolling list
  const showInList = (id: string | null) => {
    const list = listRef.current;
    const row = id ? list?.querySelector<HTMLElement>(`[data-row="${id}"]`) : null;
    if (!list || !row) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ top: row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2, behavior: smooth ? "smooth" : "auto" });
  };
  useEffect(() => showInList(selected), [selected]);

  // Units for sale switch on, one after another, the first time the plan scrolls into view
  useEffect(() => {
    const el = planRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setArmed(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLit(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Civic plates in the hero point at a unit
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>("[data-unit]")?.dataset.unit;
      if (id) {
        setSelected(id);
        setLit(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // On phones the plan scrolls sideways; start on the stretch where the units for sale are
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc || sc.scrollWidth <= sc.clientWidth) return;
    const saleX = PLAN.cells.filter((c) => c.sale).map((c) => c.x + c.w / 2);
    const mid = (Math.min(...saleX) + Math.max(...saleX)) / 2;
    sc.scrollLeft = ((mid - VB.x) / VB.w) * sc.scrollWidth - sc.clientWidth / 2;
  }, []);

  const list = forSale.map((u) => u.civics.join(" + ")).join(", ");
  const soldList = project.sold.join(", ");

  return (
    <div>
      <div
        ref={planRef}
        className={`plan ${armed ? "is-armed" : ""} ${lit ? "is-lit" : ""}`}
        onMouseLeave={() => setHover(null)}
      >
        <p className="eyebrow mb-3 flex items-center gap-2 text-white/55 lg:hidden">
          {s.scrollHint}
          <Arrow className="h-3.5 w-3.5" />
        </p>
        <div ref={scrollRef} className="plan-scroll -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0">
          <svg
            viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
            role="img"
            aria-label={fill(s.aria, { list, sold: soldList })}
            className="block w-full min-w-[860px] select-none lg:min-w-0"
          >
            <defs>
              <pattern id="sold" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                <rect width="3" height="3" fill="#0f1d1e" fillOpacity=".35" />
                <line x1="0" y1="0" x2="0" y2="3" stroke="#d4f0c9" strokeOpacity=".08" strokeWidth=".6" />
              </pattern>
              <pattern id="hatch" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="2.2" stroke="#d4f0c9" strokeOpacity=".4" strokeWidth=".5" />
              </pattern>
            </defs>

            {/* Boulevard at the office end */}
            <line x1={-17} y1={-30} x2={-17} y2={86} stroke="#d4f0c9" strokeOpacity=".3" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
            <text x={-25} y={ROW} transform={`rotate(-90 -25 ${ROW})`} textAnchor="middle" dominantBaseline="middle" className="pl-anno mono uppercase" fill="#d4f0c9" fillOpacity=".6">
              {s.street}
            </text>

            {/* Overall length */}
            <g stroke="#d4f0c9" strokeOpacity=".45" vectorEffect="non-scaling-stroke">
              <line x1={0} y1={-14} x2={0} y2={-29} vectorEffect="non-scaling-stroke" />
              <line x1={L} y1={-3} x2={L} y2={-29} vectorEffect="non-scaling-stroke" />
              <line x1={0} y1={-25} x2={L} y2={-25} vectorEffect="non-scaling-stroke" />
              <line x1={-1.6} y1={-23.4} x2={1.6} y2={-26.6} vectorEffect="non-scaling-stroke" />
              <line x1={L - 1.6} y1={-23.4} x2={L + 1.6} y2={-26.6} vectorEffect="non-scaling-stroke" />
            </g>
            <rect x={L / 2 - 17} y={-29} width={34} height={8} fill="#1d3a3c" />
            <text x={L / 2} y={-25} textAnchor="middle" dominantBaseline="central" className="pl-anno mono" fill="#d4f0c9" fillOpacity=".8">
              {s.length}
            </text>

            {/* Depth */}
            <g stroke="#d4f0c9" strokeOpacity=".45">
              <line x1={L + 3} y1={0} x2={L + 17} y2={0} vectorEffect="non-scaling-stroke" />
              <line x1={L + 3} y1={2 * ROW} x2={L + 17} y2={2 * ROW} vectorEffect="non-scaling-stroke" />
              <line x1={L + 13} y1={0} x2={L + 13} y2={2 * ROW} vectorEffect="non-scaling-stroke" />
              <line x1={L + 11.4} y1={1.6} x2={L + 14.6} y2={-1.6} vectorEffect="non-scaling-stroke" />
              <line x1={L + 11.4} y1={2 * ROW + 1.6} x2={L + 14.6} y2={2 * ROW - 1.6} vectorEffect="non-scaling-stroke" />
            </g>
            <rect x={L + 9} y={ROW - 11} width={8} height={22} fill="#1d3a3c" />
            <text x={L + 13} y={ROW} transform={`rotate(90 ${L + 13} ${ROW})`} textAnchor="middle" dominantBaseline="central" className="pl-anno mono" fill="#d4f0c9" fillOpacity=".8">
              {s.depth}
            </text>

            {/* Sold units */}
            {PLAN.cells.map((c) =>
              c.sold ? <rect key={`s-${c.civics[0]}`} x={c.x} y={c.y} width={c.w} height={c.h} fill="url(#sold)" /> : null,
            )}

            {/* Units for sale */}
            {PLAN.cells.map((c) => {
              if (!c.sale) return null;
              const on = active === c.sale.id;
              const order = saleOrder.get(c.sale.id) ?? 0;
              return (
                <rect
                  key={`f-${c.civics[0]}`}
                  x={c.x}
                  y={c.y}
                  width={c.w}
                  height={c.h}
                  className="sale-fill cursor-pointer"
                  fill={on ? "#ffffff" : "#d4f0c9"}
                  style={{ transitionDelay: `${lit ? 120 + order * 110 : 0}ms, 0ms` }}
                  onMouseEnter={() => {
                    setHover(c.sale!.id);
                    showInList(c.sale!.id);
                  }}
                  onClick={() => setSelected(c.sale!.id)}
                />
              );
            })}

            {/* Electrical room */}
            {PLAN.services.map((sv) => (
              <rect key={sv.x} x={sv.x} y={0} width={sv.w} height={2 * ROW} fill="url(#hatch)" />
            ))}

            {/* Walls */}
            <g stroke="#d4f0c9" strokeOpacity=".4" vectorEffect="non-scaling-stroke">
              {[...PLAN.partitions, ...PLAN.demising].map((p, i) => (
                <line key={i} {...p} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            {/* Units for sale keep their own walls visible where they meet another unit for sale */}
            {PLAN.cells.map((c) =>
              c.sale ? (
                <rect key={`o-${c.civics[0]}`} x={c.x} y={c.y} width={c.w} height={c.h} fill="none" stroke="#1d3a3c" strokeOpacity={0.6} vectorEffect="non-scaling-stroke" pointerEvents="none" />
              ) : null,
            )}
            <g stroke="#d4f0c9" strokeWidth={2} strokeLinecap="square">
              {PLAN.walls.map((p, i) => (
                <line key={i} {...p} vectorEffect="non-scaling-stroke" />
              ))}
            </g>

            {/* Doors: overhead door (dashed) and walk-in door (leaf + swing) on each unit's outside wall */}
            {PLAN.cells.map((c) =>
              c.walls.map((side) => {
                const wy = side === "top" ? c.y : c.y + c.h;
                const dir = side === "top" ? 1 : -1;
                const g0 = c.x + c.w - 4 - GARAGE;
                const h0 = c.x + MAN_DOOR[0];
                const stroke = c.sale ? "#1d3a3c" : "#d4f0c9";
                const op = c.sale ? 0.55 : 0.5;
                return (
                  <g key={`${c.civics[0]}-${side}`} stroke={stroke} strokeOpacity={op} fill="none" pointerEvents="none">
                    <line x1={g0} y1={wy + dir * 1.8} x2={g0 + GARAGE} y2={wy + dir * 1.8} strokeDasharray="3 2.5" vectorEffect="non-scaling-stroke" />
                    <line x1={h0} y1={wy} x2={h0} y2={wy + dir * 3} vectorEffect="non-scaling-stroke" />
                    <path d={`M${h0 + 3} ${wy} A3 3 0 0 ${dir === 1 ? 1 : 0} ${h0} ${wy + dir * 3}`} vectorEffect="non-scaling-stroke" />
                  </g>
                );
              }),
            )}

            {/* Highlight */}
            {PLAN.cells.map((c) =>
              c.sale && active === c.sale.id ? (
                <rect key={`h-${c.civics[0]}`} x={c.x} y={c.y} width={c.w} height={c.h} fill="none" stroke="#fff" strokeWidth={3} vectorEffect="non-scaling-stroke" pointerEvents="none" />
              ) : null,
            )}

            {/* Labels */}
            {PLAN.cells.map((c) => {
              const cx = c.x + c.w / 2;
              if (c.sold) {
                const stamp = (y: number) => (
                  <>
                    <rect x={cx - 12.5} y={y - 4.3} width={25} height={8.6} rx={1.2} fill="#0f1d1e" fillOpacity=".5" stroke="#d4f0c9" strokeOpacity=".8" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                    <text x={cx} y={y + 0.2} textAnchor="middle" dominantBaseline="central" className="pl-sold mono" fill="#d4f0c9">
                      {s.sold}
                    </text>
                  </>
                );
                const civic = (y: number, v: string) => (
                  <text x={cx} y={y} textAnchor="middle" dominantBaseline="central" className="pl-code mono" fill="#d4f0c9" fillOpacity=".45">
                    {v}
                  </text>
                );
                const cy = c.y + c.h / 2;
                return (
                  <g key={`l-${c.civics[0]}`} pointerEvents="none">
                    {c.civics.length > 1 ? (
                      <>
                        {civic(ROW / 2 - 2, c.civics[0])}
                        {stamp(ROW)}
                        {civic(ROW + ROW / 2 + 2, c.civics[1])}
                      </>
                    ) : (
                      <>
                        {civic(cy - 7, c.civics[0])}
                        {stamp(cy + 2.5)}
                      </>
                    )}
                  </g>
                );
              }
              if (!c.sale) {
                return (
                  <text key={`l-${c.civics[0]}`} x={cx} y={c.y + c.h / 2} textAnchor="middle" dominantBaseline="central" className="pl-code mono" fill="#d4f0c9" fillOpacity=".5" pointerEvents="none">
                    {c.civics[0]}
                  </text>
                );
              }
              const area = c.sale.sqft ? `${n(c.sale.sqft)} ${sqft}` : "";
              if (c.civics.length > 1) {
                return (
                  <g key={`l-${c.civics[0]}`} className="sale-label" pointerEvents="none" fill="#1d3a3c">
                    <text x={cx} y={ROW / 2} textAnchor="middle" dominantBaseline="central" className="pl-civic civic">
                      {c.civics[0]}
                    </text>
                    <text x={cx} y={ROW} textAnchor="middle" dominantBaseline="central" className="pl-area mono" fillOpacity=".75">
                      {area}
                    </text>
                    <text x={cx} y={ROW + ROW / 2} textAnchor="middle" dominantBaseline="central" className="pl-civic civic">
                      {c.civics[1]}
                    </text>
                  </g>
                );
              }
              const cy = c.y + c.h / 2;
              return (
                <g key={`l-${c.civics[0]}`} className="sale-label" pointerEvents="none" fill="#1d3a3c">
                  <text x={cx} y={area ? cy - 3 : cy} textAnchor="middle" dominantBaseline="central" className="pl-civic civic">
                    {c.civics[0]}
                  </text>
                  {area && (
                    <text x={cx} y={cy + 4.6} textAnchor="middle" dominantBaseline="central" className="pl-area mono" fillOpacity=".75">
                      {area}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <ul className="mx-auto mt-5 flex max-w-7xl flex-wrap gap-x-7 gap-y-2 text-sm text-white/70">
          <li className="flex items-center gap-2.5">
            <span aria-hidden className="h-3.5 w-5 rounded-[2px] bg-mint" />
            {s.legendSale}
          </li>
          <li className="flex items-center gap-2.5">
            <span aria-hidden className="grid h-3.5 place-items-center rounded-[2px] border border-mint/55 bg-ink/35 px-1 font-mono text-[0.5rem] leading-none tracking-wider text-mint/85">
              {s.sold}
            </span>
            {s.legendSold}
          </li>
          <li className="flex items-center gap-2.5">
            <span aria-hidden className="h-3.5 w-5 rounded-[2px] border border-mint/40 bg-[repeating-linear-gradient(45deg,rgb(212_240_201/.45)_0_1px,transparent_1px_4px)]" />
            {s.service}
          </li>
        </ul>
      </div>

      {/* Directory */}
      <div className="mx-auto mt-14 grid max-w-7xl gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h3 className="h3 text-2xl text-white">{s.listTitle}</h3>
          <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-white/60">
            {fill(s.note, { date: formatDate(locale, project.availabilityAsOf) })}
          </p>
          <p className="eyebrow mt-5 flex items-center gap-2 text-mint/70">
            <ArrowDown className="h-3.5 w-3.5" />
            {s.listHint}
          </p>
        </div>
        <div className="relative lg:col-span-8">
          <ul
            ref={listRef}
            tabIndex={0}
            aria-label={s.listTitle}
            className="unit-list max-h-[27rem] overflow-y-auto overscroll-contain border-y border-white/15 pb-8 sm:max-h-[23.5rem]"
            onMouseLeave={() => setHover(null)}
          >
          {forSale.map((u) => {
            const on = active === u.id;
            const name = u.civics.join(" + ");
            return (
              <li
                key={u.id}
                data-row={u.id}
                onMouseEnter={() => setHover(u.id)}
                onFocus={() => setHover(u.id)}
                onBlur={() => setHover(null)}
                className={`grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 border-b border-white/15 py-5 pl-4 pr-1 transition-[background-color,box-shadow] duration-200 sm:grid-cols-[10.5rem_8.75rem_1fr_auto] sm:py-4 ${
                  on ? "bg-slate-2 shadow-[inset_4px_0_0_var(--color-mint)]" : "shadow-[inset_0_0_0_transparent]"
                }`}
              >
                <p className="flex items-baseline gap-1.5">
                  <span className="civic text-[1.75rem] text-mint">{u.civics[0]}</span>
                  {u.civics.length > 1 && <span className="mono text-sm text-mint/70">+{u.civics[1]}</span>}
                </p>
                <p className="mono whitespace-nowrap text-right text-lg text-white sm:text-left">
                  {u.sqft ? (
                    <>
                      {n(u.sqft)} <span className="text-white/60">{sqft}</span>
                    </>
                  ) : (
                    <span className="text-[0.9375rem] text-white/60">{s.areaOnRequest}</span>
                  )}
                </p>
                <p className="col-span-2 text-sm text-white/65 sm:col-span-1">{u.civics.length > 1 ? s.through : s.standard}</p>
                <button
                  type="button"
                  onClick={() => requestUnit(u.id)}
                  aria-label={fill(s.requestAria, { unit: name })}
                  className="btn btn-mint col-span-2 mt-2 !min-h-11 text-sm sm:col-span-1 sm:mt-0"
                >
                  {s.request}
                  <Arrow />
                </button>
              </li>
            );
          })}
          </ul>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-px h-12 bg-gradient-to-t from-slate to-slate/0" />
        </div>
      </div>
    </div>
  );
}
