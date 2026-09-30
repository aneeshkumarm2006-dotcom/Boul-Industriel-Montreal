// Single source of truth for project facts.
// Sources: LoopNet listing 35093549 (industrial condo units, last updated 2026-09-08),
// the building's earlier sale listing (unit features), and the client's unit plan.
// To update availability, edit `forSale` below; every section reads from it.

export interface UnitForSale {
  id: string; // civic number used as the unit id
  civics: readonly string[]; // more than one when units were combined
  sqft?: number; // leave out when the area isn't confirmed: the site shows "on request"
}

export interface PlanColumn {
  w: number; // width in feet, measured off the client's floor plan
  top?: string; // civic number of the unit in the 12680–12702 row
  bottom?: string; // civic number of the unit in the 12650–12672 row
  deep?: boolean; // the office block at the boulevard end runs ~10 ft deeper on each side
  through?: boolean; // top and bottom cells form a single unit
  service?: boolean; // electrical room
}

export const project = {
  company: "Boul-Industriel-Montreal",
  street: "boulevard Industriel",
  civicRange: "12650–12702",
  borough: "Pointe-aux-Trembles",
  city: "Montréal",
  province: "QC",
  postalCode: "H1A 3V2",
  mapsQuery: "12650 Boulevard Industriel, Montréal, QC",
  geo: { lat: 45.6548, lng: -73.51611 },

  building: {
    sqft: 33_129,
    units: 24,
    lengthFt: 490,
    depthFt: 70,
    yearBuilt: 1989,
    lotAcres: 2.2,
    parkingPer1000: 3.41,
    zoning: "I269",
  },

  // Every unit in the building has these (per the listing)
  unitFeatures: {
    garageDoor: "10' × 12'",
    voltage: "110 V / 220 V / 550 V",
    waterHeaterGallons: 15,
  },

  availabilityAsOf: "2026-10-01",
  // Every civic number not listed in `sold` is shown as available.
  // Areas: LoopNet 35093549 where known; add the others as the client confirms them.
  forSale: [
    { id: "12654", civics: ["12654"] },
    { id: "12656", civics: ["12656"], sqft: 1252 },
    { id: "12658", civics: ["12658"], sqft: 1780 },
    { id: "12660", civics: ["12660"], sqft: 1776 },
    { id: "12664", civics: ["12664"] },
    { id: "12668", civics: ["12668"] },
    { id: "12670", civics: ["12670"] },
    { id: "12672", civics: ["12672"] },
    { id: "12680", civics: ["12680"] },
    { id: "12682", civics: ["12682"] },
    { id: "12686", civics: ["12686"] },
    { id: "12688", civics: ["12688"] },
    { id: "12690", civics: ["12690"] },
    { id: "12694", civics: ["12694"] },
    { id: "12696", civics: ["12696"], sqft: 1259 },
    { id: "12698", civics: ["12698"] },
  ] as readonly UnitForSale[],

  // Shown as "VENDU" on the plan (client, 2026-10-01)
  sold: ["12650", "12652", "12662", "12666", "12684", "12692", "12700", "12702"],

  // Range quoted in the hero and meta description (client-approved copy; units can be combined)
  areaRange: [1252, 2509],

  // Left to right from the boulevard end. Row depth 35 ft (70 ft total).
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
  ] satisfies readonly PlanColumn[],

  // Free-flow drive times (OSRM routing from the building), rounded to the minute
  driveTimes: [
    { key: "a40", min: 3 },
    { key: "a25", min: 10 },
    { key: "repentigny", min: 14 },
    { key: "southShore", min: 23 },
    { key: "laval", min: 30 },
    { key: "downtown", min: 31 },
    { key: "airport", min: 36 },
  ],

  contact: {
    phone: "+15142987050",
    phoneDisplay: "514 298-7050",
    email: "management@bayviewpartners.ca",
    // app/api/contact emails each submission from automations@davnoot.com to `email` (SMTP env vars on Vercel)
    formEndpoint: "/api/contact/",
  },

  images: {
    hero: "hero-aerial",
    building: "aerial-outlined",
    map: "aerial-top",
    gallery: ["aerial-summer", "aerial-southwest", "aerial-top", "aerial-outlined", "building-end"],
    // Interior photos, in display order. Drop the files in assets-src/ (e.g. interior-12656-shop.jpg),
    // run `npm run images`, then list their names here. The section stays hidden while this is empty.
    interior: [] as string[],
  },
} as const;

export const forSale = project.forSale;
export const sqftRange = project.areaRange;
export const soldCivics: ReadonlySet<string> = new Set(project.sold);

/** "12652 + 12700" for combined units. */
export function unitName(u: UnitForSale): string {
  return u.civics.join(" + ");
}

/** Civic number → the unit for sale that contains it, if any. */
export const saleByCivic: Record<string, UnitForSale> = Object.fromEntries(
  forSale.flatMap((u) => u.civics.map((c) => [c, u])),
);
