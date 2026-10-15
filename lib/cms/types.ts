import type { Dictionary } from "@/content/fr";

export type Locale = "fr" | "en";
export const LOCALES: readonly Locale[] = ["fr", "en"];

/** A string in both languages. */
export interface Bi {
  fr: string;
  en: string;
}

/** A responsive photo: each rendition lives at `${base}${w}.avif` and `${base}${w}.webp`. */
export interface ImageSource {
  base: string;
  width: number;
  height: number;
  widths: number[];
  blur: string;
}

/** A photo placed in a gallery. `key` is the built-in image name, or `m-<id>` for an upload. */
export interface Photo extends ImageSource {
  key: string;
  alt: Bi;
}

export interface UnitForSale {
  id: string; // first civic number, used as the unit id
  civics: string[]; // two when the unit spans both rows (the through unit)
  sqft?: number; // left out when the area isn't confirmed: the site shows "on request"
}

export interface DriveTime {
  key: string;
  min: number;
}

export interface BuildingFacts {
  sqft: number;
  units: number;
  lengthFt: number;
  depthFt: number;
  zoning: string;
}

export interface ContactInfo {
  phone: string; // E.164, used for tel: links
  phoneDisplay: string;
  email: string; // shown on the site; empty hides the email block
  inboxes: string[]; // receive the contact form, never sent to the browser
}

/** Everything the public site renders: code defaults with the published overrides applied. */
export interface SiteContent {
  dict: Record<Locale, Dictionary>;
  forSale: UnitForSale[];
  reserved: string[];
  sold: string[];
  availabilityAsOf: string;
  areaRange: [number, number];
  building: BuildingFacts;
  driveTimes: DriveTime[];
  contact: ContactInfo;
  gallery: Photo[];
  interior: Photo[];
}

/** Stored overrides, keyed as described in lib/cms/registry.ts. Only values that differ from the code are kept. */
export type Overrides = Record<string, unknown>;

/** One published version or draft, as saved in the store. */
export interface ContentDoc {
  schema: 1;
  overrides: Overrides;
  basedOn: string | null; // id of the version the edit started from
  savedAt: string; // ISO date
  savedBy?: string;
  note?: string;
  restoredFrom?: string; // savedAt of the version this one restores
}

export interface VersionRef {
  id: string; // pathname inside the store, e.g. cms/versions/20261006T120000123Z-x8Fq.json
  savedAt: string;
  url: string;
}
