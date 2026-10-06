// Turns stored overrides into the content the site renders, and checks what the editor sends.
// Runs in the browser (editor) and on the server (publish, page render).

import fr from "@/content/fr";
import en from "@/content/en";
import images from "@/content/images.json";
import { LOCALES, type Bi, type BuildingFacts, type Locale, type Overrides, type Photo, type SiteContent } from "./types";
import {
  ALL_KEYS,
  BUILDING_FACTS,
  LIST_BY_KEY,
  LOCKED_DRIVE_TIME,
  MAX_INBOXES,
  PHOTO_LIMITS,
  TEXT_BY_KEY,
  TEXT_FIELDS,
  tokensIn,
  type ListItem,
  type TextField,
} from "./registry";
import { DEFAULT_VALUES, type DriveTimeValue, type Values } from "./defaults";
import { deriveAvailability, UNIT_ROWS, type UnitState } from "./units";

export type { Values } from "./defaults";

// ---------- Small helpers ----------

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "514 298-7050", "(514) 298 7050", "+1 514…" → "+15142987050". Null when it isn't a phone number. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (input.trim().startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

/** "+15142987050" → "514 298-7050"; numbers outside North America are shown as stored. */
export function formatPhone(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `${m[1]} ${m[2]}-${m[3]}` : e164;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as unknown[];
    return a.length === bb.length && a.every((x, i) => deepEqual(x, bb[i]));
  }
  const ka = Object.keys(a).filter((k) => (a as Record<string, unknown>)[k] !== undefined);
  const kb = Object.keys(b).filter((k) => (b as Record<string, unknown>)[k] !== undefined);
  return ka.length === kb.length && ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function setPath(obj: object, path: string, value: unknown) {
  const keys = path.split(".");
  let o = obj as Record<string, unknown>;
  for (const k of keys.slice(0, -1)) o = o[k] as Record<string, unknown>;
  o[keys[keys.length - 1]] = value;
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isInt = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
const isNum = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const isBi = (v: unknown): v is Bi => isObj(v) && typeof v.fr === "string" && typeof v.en === "string";

// ---------- Checks ----------

export type IssueCode =
  | "required"
  | "tooLong"
  | "unknownToken"
  | "missingToken"
  | "invalid"
  | "count"
  | "translation"
  | "email"
  | "phone"
  | "range"
  | "a40"
  | "duplicate"
  | "altMissing"
  | "galleryLayout"
  | "areaOutsideRange";

export interface Issue {
  key: string;
  level: "error" | "warning";
  code: IssueCode;
  lang?: Locale;
  index?: number; // list item / photo / row
  detail?: string;
}

function textIssues(field: TextField, value: unknown, lang: Locale): Issue[] {
  const key = field.key;
  if (typeof value !== "string") return [{ key, level: "error", code: "invalid", lang }];
  const out: Issue[] = [];
  if (!value.trim()) out.push({ key, level: "error", code: "required", lang });
  if (value.length > field.max) out.push({ key, level: "error", code: "tooLong", lang, detail: String(field.max) });
  for (const t of tokensIn(value)) {
    if (!field.tokens.includes(t)) out.push({ key, level: "error", code: "unknownToken", lang, detail: `{${t}}` });
  }
  // An empty value already has its own error; a missing token only matters in real text
  for (const t of value.trim() ? tokensIn(field.defaults[lang]) : []) {
    if (!value.includes(`{${t}}`)) out.push({ key, level: "warning", code: "missingToken", lang, detail: `{${t}}` });
  }
  return out;
}

function biIssues(key: string, v: unknown, max: number, index: number, required: boolean): Issue[] {
  if (!isBi(v)) return [{ key, level: "error", code: "invalid", index }];
  const out: Issue[] = [];
  for (const lang of LOCALES) {
    if (required && !v[lang].trim()) out.push({ key, level: "error", code: "required", lang, index });
    if (v[lang].length > max) out.push({ key, level: "error", code: "tooLong", lang, index, detail: String(max) });
  }
  return out;
}

function listIssues(key: string, value: unknown): Issue[] {
  const def = LIST_BY_KEY.get(key)!;
  if (!Array.isArray(value)) return [{ key, level: "error", code: "invalid" }];
  const out: Issue[] = [];
  if (def.fixed ? value.length !== def.fixed : value.length < def.min || value.length > def.max) {
    out.push({ key, level: "error", code: "count", detail: def.fixed ? String(def.fixed) : `${def.min}–${def.max}` });
  }
  value.forEach((item: unknown, index) => {
    if (!isObj(item)) return out.push({ key, level: "error", code: "invalid", index });
    out.push(...biIssues(key, item.title, 300, index, true));
    if (item.body === undefined) {
      if (def.body === "required") out.push({ key, level: "error", code: "required", index, detail: "body" });
    } else if (def.body !== "none") {
      out.push(...biIssues(key, item.body, 1200, index, def.body === "required"));
      if (isBi(item.body) && !item.body.fr.trim() !== !item.body.en.trim()) {
        out.push({ key, level: "error", code: "translation", index, lang: item.body.fr.trim() ? "en" : "fr" });
      }
    }
  });
  return out;
}

const BUILTIN = images as Record<string, unknown>;
const MEDIA_BASES = [
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/cms\/media\/[A-Za-z0-9_-]{6,40}\/$/,
  /^\/_cms\/media\/[A-Za-z0-9_-]{6,40}\/$/,
];

export function isValidPhoto(p: unknown): p is Photo {
  if (!isObj(p) || typeof p.key !== "string" || typeof p.base !== "string") return false;
  const baseOk = p.key in BUILTIN ? p.base === `/images/${p.key}-` : /^m-[A-Za-z0-9_-]{6,40}$/.test(p.key) && MEDIA_BASES.some((r) => r.test(p.base as string));
  return (
    baseOk &&
    isInt(p.width, 1, 20_000) &&
    isInt(p.height, 1, 20_000) &&
    Array.isArray(p.widths) &&
    p.widths.length > 0 &&
    p.widths.length <= 8 &&
    p.widths.every((w) => isInt(w, 16, 4000)) &&
    typeof p.blur === "string" &&
    p.blur.startsWith("data:image/webp;base64,") &&
    p.blur.length < 4000 &&
    isBi(p.alt) &&
    p.alt.fr.length <= 300 &&
    p.alt.en.length <= 300
  );
}

function photoIssues(key: "m:gallery" | "m:interior", value: unknown): Issue[] {
  if (!Array.isArray(value)) return [{ key, level: "error", code: "invalid" }];
  const limits = PHOTO_LIMITS[key];
  const out: Issue[] = [];
  if (value.length < limits.min || value.length > limits.max) out.push({ key, level: "error", code: "count", detail: `${limits.min}–${limits.max}` });
  const seen = new Set<string>();
  value.forEach((p: unknown, index) => {
    if (!isValidPhoto(p)) return out.push({ key, level: "error", code: "invalid", index });
    if (seen.has(p.key)) out.push({ key, level: "error", code: "duplicate", index });
    seen.add(p.key);
    for (const lang of LOCALES) if (!p.alt[lang].trim()) out.push({ key, level: "warning", code: "altMissing", index, lang });
  });
  if (key === "m:gallery" && value.length >= limits.min && value.length !== PHOTO_LIMITS["m:gallery"].ideal) {
    out.push({ key, level: "warning", code: "galleryLayout" });
  }
  return out;
}

function driveTimeIssues(key: string, value: unknown): Issue[] {
  if (!Array.isArray(value)) return [{ key, level: "error", code: "invalid" }];
  const out: Issue[] = [];
  if (value.length < 1 || value.length > 12) out.push({ key, level: "error", code: "count", detail: "1–12" });
  const seen = new Set<string>();
  value.forEach((d: unknown, index) => {
    if (!isObj(d) || typeof d.key !== "string" || !/^[A-Za-z0-9-]{1,32}$/.test(d.key)) return out.push({ key, level: "error", code: "invalid", index });
    if (!isInt(d.min, 1, 600)) out.push({ key, level: "error", code: "range", index, detail: "1–600" });
    out.push(...biIssues(key, d.name, 80, index, true));
    if (seen.has(d.key)) out.push({ key, level: "error", code: "duplicate", index });
    seen.add(d.key);
  });
  if (!seen.has(LOCKED_DRIVE_TIME)) out.push({ key, level: "error", code: "a40" });
  return out;
}

/** Problems with one value; errors block publishing, warnings don't. */
export function checkValue(key: string, value: unknown): Issue[] {
  const field = TEXT_BY_KEY.get(key);
  if (field) {
    if (!isObj(value)) return [{ key, level: "error", code: "invalid" }];
    return LOCALES.flatMap((lang) => textIssues(field, value[lang], lang));
  }
  if (LIST_BY_KEY.has(key)) return listIssues(key, value);
  if (key === "m:gallery" || key === "m:interior") return photoIssues(key, value);
  if (key.startsWith("u:")) {
    const ok = isObj(value) && (value.status === "sale" || value.status === "sold") && (value.sqft === null || isInt(value.sqft, 1, 1_000_000));
    return ok ? [] : [{ key, level: "error", code: "invalid" }];
  }
  if (key.startsWith("p:building.")) {
    const fact = BUILDING_FACTS.find((f) => `p:building.${f.key}` === key)!;
    if (!("min" in fact)) {
      return typeof value === "string" && value.trim() && value.length <= 40 ? [] : [{ key, level: "error", code: "required" }];
    }
    return isNum(value, fact.min, fact.max) ? [] : [{ key, level: "error", code: "range", detail: `${fact.min}–${fact.max}` }];
  }
  switch (key) {
    case "p:areaRange": {
      const ok = Array.isArray(value) && value.length === 2 && isInt(value[0], 1, 10_000_000) && isInt(value[1], 1, 10_000_000) && value[0] <= value[1];
      return ok ? [] : [{ key, level: "error", code: "range" }];
    }
    case "p:availabilityAsOf":
      return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? [] : [{ key, level: "error", code: "invalid" }];
    case "p:phone":
      return typeof value === "string" && /^\+\d{8,15}$/.test(value) ? [] : [{ key, level: "error", code: "phone" }];
    case "p:email":
      return value === "" || (typeof value === "string" && value.length <= 200 && EMAIL_RE.test(value)) ? [] : [{ key, level: "error", code: "email" }];
    case "p:leadInboxes": {
      if (!Array.isArray(value) || value.length < 1 || value.length > MAX_INBOXES) return [{ key, level: "error", code: "count", detail: `1–${MAX_INBOXES}` }];
      const out: Issue[] = [];
      value.forEach((e: unknown, index) => {
        if (typeof e !== "string" || e.length > 200 || !EMAIL_RE.test(e)) out.push({ key, level: "error", code: "email", index });
      });
      if (new Set(value.map((e) => String(e).toLowerCase())).size !== value.length) out.push({ key, level: "error", code: "duplicate" });
      return out;
    }
    case "p:driveTimes":
      return driveTimeIssues(key, value);
  }
  return [{ key, level: "error", code: "invalid" }];
}

/** Every problem in a full set of values, including the checks that look at several values. */
export function validate(values: Values): Issue[] {
  const issues = ALL_KEYS.flatMap((key) => checkValue(key, values[key]));
  const range = values["p:areaRange"];
  if (Array.isArray(range)) {
    const [min, max] = range as [number, number];
    for (const r of UNIT_ROWS) {
      const s = values[`u:${r.id}`] as UnitState | undefined;
      if (s?.status === "sale" && s.sqft && (s.sqft < min || s.sqft > max)) {
        issues.push({ key: `u:${r.id}`, level: "warning", code: "areaOutsideRange" });
      }
    }
  }
  return issues;
}

// ---------- Overrides ↔ values ----------

/** Code defaults with the stored overrides applied. Anything invalid or unknown falls back to the default. */
export function effective(overrides?: Overrides | null): Values {
  const v: Values = {};
  for (const key of ALL_KEYS) {
    const def = DEFAULT_VALUES[key];
    const raw = overrides?.[key];
    if (raw === undefined) {
      v[key] = def;
      continue;
    }
    const field = TEXT_BY_KEY.get(key);
    if (field) {
      const out = { ...(def as Bi) };
      if (isObj(raw)) {
        for (const lang of LOCALES) {
          const s = raw[lang];
          if (s !== undefined && !textIssues(field, s, lang).some((i) => i.level === "error")) out[lang] = s as string;
        }
      }
      v[key] = out;
      continue;
    }
    v[key] = checkValue(key, raw).some((i) => i.level === "error") ? def : raw;
  }
  return v;
}

/** Defaults with the overrides applied as they are, unchecked: what the editor holds, ready for validate(). */
export function withOverrides(overrides: Overrides): Values {
  const v: Values = {};
  for (const key of ALL_KEYS) {
    const def = DEFAULT_VALUES[key];
    const raw = overrides[key];
    if (raw === undefined) v[key] = def;
    else if (TEXT_BY_KEY.has(key)) v[key] = isObj(raw) ? { fr: raw.fr ?? (def as Bi).fr, en: raw.en ?? (def as Bi).en } : raw;
    else v[key] = raw;
  }
  return v;
}

/** The overrides to store: only what differs from the code (texts per language). */
export function diff(values: Values): Overrides {
  const out: Overrides = {};
  for (const key of ALL_KEYS) {
    const v = values[key];
    const d = DEFAULT_VALUES[key];
    if (v === undefined) continue;
    if (TEXT_BY_KEY.has(key)) {
      const o: Partial<Bi> = {};
      for (const lang of LOCALES) if ((v as Bi)[lang] !== (d as Bi)[lang]) o[lang] = (v as Bi)[lang];
      if (Object.keys(o).length) out[key] = o;
    } else if (!deepEqual(v, d)) {
      out[key] = v;
    }
  }
  return out;
}

/** Keys whose value differs between two sets of values. */
export function changedKeys(a: Values, b: Values): string[] {
  return ALL_KEYS.filter((key) => !deepEqual(a[key], b[key]));
}

// ---------- Values → site ----------

export function toSiteContent(values: Values): SiteContent {
  const dict = { fr: structuredClone(fr), en: structuredClone(en) };
  for (const f of TEXT_FIELDS) {
    const v = values[f.key] as Bi;
    setPath(dict.fr, f.path, v.fr);
    setPath(dict.en, f.path, v.en);
  }

  const items = [...(values["l:included.callouts"] as ListItem[]), ...(values["l:included.extra"] as ListItem[])];
  const why = values["l:why.items"] as ListItem[];
  const points = values["l:why.points"] as ListItem[];
  const driveTimes = values["p:driveTimes"] as DriveTimeValue[];
  const gallery = values["m:gallery"] as Photo[];
  const interior = values["m:interior"] as Photo[];

  for (const lang of LOCALES) {
    const t = dict[lang];
    t.included.items = items.map((it) => (it.body ? { title: it.title[lang], body: it.body[lang] } : { title: it.title[lang] }));
    t.why.items = why.map((it) => ({ title: it.title[lang], body: it.body?.[lang] ?? "" }));
    t.why.investor.points = points.map((it) => it.title[lang]);
    t.location.places = Object.fromEntries(driveTimes.map((d) => [d.key, d.name[lang]]));
    t.gallery.alts = Object.fromEntries([...gallery, ...interior].map((p) => [p.key, p.alt[lang]]));
  }

  const states = Object.fromEntries(UNIT_ROWS.map((r) => [r.id, values[`u:${r.id}`] as UnitState]));
  const building = Object.fromEntries(BUILDING_FACTS.map((f) => [f.key, values[`p:building.${f.key}`]])) as unknown as BuildingFacts;
  const phone = values["p:phone"] as string;

  return {
    dict,
    ...deriveAvailability(states),
    availabilityAsOf: values["p:availabilityAsOf"] as string,
    areaRange: [...(values["p:areaRange"] as [number, number])],
    building,
    driveTimes: driveTimes.map((d) => ({ key: d.key, min: d.min })),
    contact: {
      phone,
      phoneDisplay: formatPhone(phone),
      email: values["p:email"] as string,
      inboxes: [...(values["p:leadInboxes"] as string[])],
    },
    gallery,
    interior,
  };
}
