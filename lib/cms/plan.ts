import type { PlanColumn } from "@/content/project";
import type { UnitForSale } from "./types";

// ---------- Geometry (feet) ----------
export const ROW = 35; // each row of units is 35 ft deep; 70 ft for the building
export const DEEP = 10; // the office block at the boulevard end sticks out 10 ft on both sides
export const MAN_DOOR = [3, 6] as const; // offset from the unit's left wall
export const GARAGE = 10;

export type Side = "top" | "bottom";
export interface Cell {
  civics: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  walls: Side[];
  sale?: UnitForSale;
  reserved?: boolean;
  sold?: boolean;
}
export interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface PlanLayout {
  cells: Cell[];
  services: { x: number; w: number }[];
  partitions: Seg[];
  demising: Seg[];
  walls: Seg[];
  length: number;
}

/** Lays out the plan columns as unit cells and wall segments, marking the units for sale, the reserved and the sold ones. */
export function buildPlan(cols: readonly PlanColumn[], forSale: readonly UnitForSale[], reserved: readonly string[], sold: readonly string[]): PlanLayout {
  const saleByCivic: Record<string, UnitForSale> = Object.fromEntries(forSale.flatMap((u) => u.civics.map((c) => [c, u])));
  const reservedCivics = new Set(reserved);
  const soldCivics = new Set(sold);
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
      cells.push({ civics: [c.top!, c.bottom!], x, y: top, w: c.w, h: bottom - top, walls: ["top", "bottom"], sale, reserved: !sale && reservedCivics.has(c.top!), sold: !sale && soldCivics.has(c.top!) });
    } else {
      cells.push({ civics: [c.top!], x, y: top, w: c.w, h: ROW - top, walls: ["top"], sale: saleByCivic[c.top!], reserved: reservedCivics.has(c.top!), sold: soldCivics.has(c.top!) });
      cells.push({ civics: [c.bottom!], x, y: ROW, w: c.w, h: bottom - ROW, walls: ["bottom"], sale: saleByCivic[c.bottom!], reserved: reservedCivics.has(c.bottom!), sold: soldCivics.has(c.bottom!) });
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
