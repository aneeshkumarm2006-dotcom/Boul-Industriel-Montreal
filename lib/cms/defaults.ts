import fr from "@/content/fr";
import en from "@/content/en";
import images from "@/content/images.json";
import { project } from "@/content/project";
import type { Bi, ImageSource, Photo } from "./types";
import { BUILDING_FACTS, CALLOUTS, LISTS, TEXT_FIELDS, type ListItem } from "./registry";
import { codeUnitStates, UNIT_ROWS } from "./units";

/** Every editable value, keyed like the stored overrides (see registry.ts). */
export type Values = Record<string, unknown>;

export interface DriveTimeValue {
  key: string;
  min: number;
  name: Bi;
}

type Manifest = Record<string, { width: number; height: number; widths: number[]; blur: string }>;
const manifest = images as Manifest;

/** A photo from the build-time set (assets-src → public/images, see scripts/optimize-images.mjs). */
export function builtinImage(name: string): ImageSource | null {
  const img = manifest[name];
  return img ? { base: `/images/${name}-`, width: img.width, height: img.height, widths: [...img.widths], blur: img.blur } : null;
}

export function builtinPhoto(name: string): Photo | null {
  const img = builtinImage(name);
  return img && { key: name, ...img, alt: { fr: fr.gallery.alts[name] ?? "", en: en.gallery.alts[name] ?? "" } };
}

/** Built-in photos the client can put back in a gallery (the hero aerial has its own traced outline). */
export const BUILTIN_PHOTOS = Object.keys(manifest).filter((name) => name !== project.images.hero);

function pairItems(frItems: readonly { title: string; body?: string }[], enItems: readonly { title: string; body?: string }[]): ListItem[] {
  return frItems.map((a, i) => {
    const b = enItems[i] ?? a;
    return a.body || b.body ? { title: { fr: a.title, en: b.title }, body: { fr: a.body ?? "", en: b.body ?? "" } } : { title: { fr: a.title, en: b.title } };
  });
}

function buildDefaults(): Values {
  const v: Values = {};
  for (const f of TEXT_FIELDS) v[f.key] = { ...f.defaults };

  v["l:included.callouts"] = pairItems(fr.included.items.slice(0, CALLOUTS), en.included.items.slice(0, CALLOUTS));
  v["l:included.extra"] = pairItems(fr.included.items.slice(CALLOUTS), en.included.items.slice(CALLOUTS));
  v["l:why.items"] = pairItems(fr.why.items, en.why.items);
  v["l:why.points"] = fr.why.investor.points.map((p, i) => ({ title: { fr: p, en: en.why.investor.points[i] ?? p } }));
  for (const l of LISTS) if (!(l.key in v)) throw new Error(`No default for ${l.key}`);

  v["p:areaRange"] = [...project.areaRange];
  v["p:availabilityAsOf"] = project.availabilityAsOf;
  for (const f of BUILDING_FACTS) v[`p:building.${f.key}`] = project.building[f.key];
  v["p:phone"] = project.contact.phone;
  v["p:email"] = project.contact.email;
  v["p:leadInboxes"] = [project.contact.email];
  v["p:driveTimes"] = project.driveTimes.map(
    (d): DriveTimeValue => ({ key: d.key, min: d.min, name: { fr: fr.location.places[d.key] ?? d.key, en: en.location.places[d.key] ?? d.key } }),
  );

  const states = codeUnitStates();
  for (const r of UNIT_ROWS) v[`u:${r.id}`] = states[r.id];

  v["m:gallery"] = project.images.gallery.map(builtinPhoto).filter(Boolean);
  v["m:interior"] = project.images.interior.map(builtinPhoto).filter(Boolean);
  return v;
}

export const DEFAULT_VALUES: Values = buildDefaults();
