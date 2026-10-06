import { project, type PlanColumn } from "@/content/project";
import type { UnitForSale } from "./types";

export interface UnitRow {
  id: string;
  civics: string[];
  through: boolean; // one unit with doors on both rows
}

export interface UnitState {
  status: "sale" | "sold";
  sqft: number | null; // null: the site shows "on request"
}

const byCivic = (a: string, b: string) => Number(a) - Number(b);

/** One row per unit in civic order; the through unit spans both rows but is a single unit. */
export function unitRows(cols: readonly PlanColumn[]): UnitRow[] {
  const rows: UnitRow[] = [];
  for (const c of cols) {
    if (c.service) continue;
    if (c.through) {
      const civics = [c.top!, c.bottom!].sort(byCivic);
      rows.push({ id: civics[0], civics, through: true });
    } else {
      rows.push({ id: c.top!, civics: [c.top!], through: false });
      rows.push({ id: c.bottom!, civics: [c.bottom!], through: false });
    }
  }
  return rows.sort((a, b) => byCivic(a.id, b.id));
}

export const UNIT_ROWS = unitRows(project.plan);

/** Unit states as written in content/project.ts: listed for sale, otherwise sold. */
export function codeUnitStates(): Record<string, UnitState> {
  const listed = new Map<string, UnitForSale>(project.forSale.flatMap((u) => u.civics.map((c) => [c, u] as const)));
  return Object.fromEntries(
    UNIT_ROWS.map((r) => {
      const u = r.civics.map((c) => listed.get(c)).find(Boolean);
      return [r.id, u ? { status: "sale", sqft: u.sqft ?? null } : { status: "sold", sqft: null }];
    }),
  );
}

/** Units for sale (civic order) and sold civic numbers, the shape every section renders from. */
export function deriveAvailability(states: Record<string, UnitState>): { forSale: UnitForSale[]; sold: string[] } {
  const forSale: UnitForSale[] = [];
  const sold: string[] = [];
  for (const r of UNIT_ROWS) {
    const s = states[r.id];
    if (s?.status === "sale") forSale.push(s.sqft ? { id: r.id, civics: r.civics, sqft: s.sqft } : { id: r.id, civics: r.civics });
    else sold.push(...r.civics);
  }
  return { forSale, sold: sold.sort(byCivic) };
}
