// What the admin can edit, and how each value is stored.
//
// Stored overrides are a flat map; a key is present only when the client's value differs from the code:
//   t:<dictPath>          {fr?, en?}                 one text, only the changed languages
//   l:<list>              ListItem[]                 a bilingual list, stored whole
//   p:<field>             value                      project facts (units range, building, contact, drive times)
//   u:<unitId>            {status, sqft}             one unit
//   m:gallery|m:interior  Photo[]                    a photo gallery
// Texts are generated from the leaves of content/fr.ts, so strings added there show up in the admin
// on their own; META below only gives them friendly labels.

import fr, { type Dictionary } from "@/content/fr";
import en from "@/content/en";
import type { Bi } from "./types";
import { UNIT_ROWS } from "./units";

export type SectionId =
  | "seo"
  | "menu"
  | "hero"
  | "plan"
  | "included"
  | "why"
  | "building"
  | "photos"
  | "location"
  | "contact"
  | "footer";

export interface Section {
  id: SectionId;
  label: Bi;
  anchor: string; // where the section sits on the page
}

export const SECTIONS: Section[] = [
  { id: "seo", label: { fr: "Google et partages", en: "Google & link previews" }, anchor: "" },
  { id: "menu", label: { fr: "Menu et barre mobile", en: "Menu & mobile bar" }, anchor: "" },
  { id: "hero", label: { fr: "Haut de page", en: "Top of page" }, anchor: "#top" },
  { id: "plan", label: { fr: "Plan et liste des unités", en: "Plan & unit list" }, anchor: "#units" },
  { id: "included", label: { fr: "Ce qui est inclus", en: "What's included" }, anchor: "#included" },
  { id: "why", label: { fr: "Propriétaire plutôt que locataire", en: "Own instead of rent" }, anchor: "#included" },
  { id: "building", label: { fr: "Le bâtiment", en: "The building" }, anchor: "#building" },
  { id: "photos", label: { fr: "Photos", en: "Photos" }, anchor: "#photos" },
  { id: "location", label: { fr: "Emplacement", en: "Location" }, anchor: "#location" },
  { id: "contact", label: { fr: "Contact et formulaire", en: "Contact & form" }, anchor: "#contact" },
  { id: "footer", label: { fr: "Pied de page", en: "Footer" }, anchor: "" },
];

// ---------- Texts ----------

type StringLeaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends readonly unknown[]
      ? never
      : T[K] extends object
        ? StringLeaves<T[K], `${P}${K}.`>
        : never;
}[keyof T & string];
export type TextPath = StringLeaves<Dictionary>;

interface Meta {
  label: [fr: string, en: string];
  hint?: [fr: string, en: string];
  multiline?: boolean;
  max?: number; // hard limit
  recommended?: number; // soft limit, shown as a counter
  advanced?: boolean; // screen-reader labels, alt texts, error messages
}

const LOCKED = new Set(["locale", "footer.credit", "nav.langNames.fr", "nav.langNames.en", "units.sqft", "units.ft"]);
// Kept in the dictionaries but nothing renders them (the form always has an endpoint)
const HIDDEN = new Set([
  "plan.headUnit",
  "plan.headArea",
  "plan.headAccess",
  "plan.status",
  "contact.call",
  "contact.mailSubject",
  "contact.mailtoNote",
]);
// Edited in the Photos and Drive times tabs
const ELSEWHERE = ["gallery.alts.", "location.places."];

const SECTION_OF: Record<string, SectionId> = {
  meta: "seo",
  nav: "menu",
  mobileBar: "menu",
  hero: "hero",
  plan: "plan",
  included: "included",
  why: "why",
  building: "building",
  interior: "photos",
  gallery: "photos",
  location: "location",
  contact: "contact",
  footer: "footer",
};

const EYEBROW: Meta["label"] = ["Petite ligne au-dessus du titre", "Small line above the heading"];
const TITLE: Meta["label"] = ["Titre de la section", "Section heading"];
const LEAD: Meta["label"] = ["Texte d'introduction", "Intro text"];

const META: Partial<Record<TextPath, Meta>> = {
  "meta.title": {
    label: ["Titre dans Google et l'onglet du navigateur", "Title in Google and the browser tab"],
    recommended: 60,
    max: 120,
  },
  "meta.description": {
    label: ["Description dans Google et les partages", "Description in Google and link previews"],
    multiline: true,
    recommended: 160,
    max: 320,
  },

  "nav.units": { label: ["Menu : Unités", "Menu: Units"] },
  "nav.included": { label: ["Menu : Inclus", "Menu: Included"] },
  "nav.building": { label: ["Menu : Bâtiment", "Menu: Building"] },
  "nav.location": { label: ["Menu : Emplacement", "Menu: Location"] },
  "nav.photos": { label: ["Menu : Photos", "Menu: Photos"] },
  "nav.cta": { label: ["Bouton du menu", "Menu button"] },
  "mobileBar.call": { label: ["Barre mobile : bouton Appeler", "Mobile bar: call button"] },
  "mobileBar.cta": { label: ["Barre mobile : bouton principal", "Mobile bar: main button"] },
  "nav.skip": { label: ["Lien « Aller au contenu » (clavier)", "“Skip to content” link (keyboard)"], advanced: true },
  "nav.menu": { label: ["Nom du menu (lecteurs d'écran)", "Menu name (screen readers)"], advanced: true },
  "nav.langLabel": { label: ["Nom du sélecteur de langue", "Language switch name"], advanced: true },
  "nav.home": { label: ["Logo (lecteurs d'écran)", "Logo (screen readers)"], advanced: true },

  "hero.eyebrow": { label: EYEBROW },
  "hero.title": { label: ["Titre principal de la page", "Main page heading"], max: 140 },
  "hero.lead": { label: LEAD, multiline: true },
  "hero.ctaPrimary": { label: ["Bouton principal", "Main button"] },
  "hero.ctaSecondary": { label: ["Bouton secondaire", "Second button"] },
  "hero.pinTitle": { label: ["Étiquette sur la photo : titre", "Photo label: title"] },
  "hero.pinDetail": { label: ["Étiquette sur la photo : détail", "Photo label: detail"] },
  "hero.platesLabel": { label: ["Bandeau des unités : titre", "Unit strip: title"] },
  "hero.platesHint": { label: ["Bandeau des unités : indication", "Unit strip: hint"] },
  "hero.areaOnRequest": { label: ["Bandeau : superficie non confirmée", "Strip: unconfirmed area"] },
  "hero.price": { label: ["Carte des prix : texte", "Price card: text"] },
  "hero.priceCta": { label: ["Carte des prix : bouton", "Price card: button"] },
  "hero.photoAlt": { label: ["Photo aérienne : description (alt)", "Aerial photo: description (alt)"], multiline: true, advanced: true },
  "hero.plateAria": { label: ["Unité du bandeau (lecteurs d'écran)", "Strip unit (screen readers)"], advanced: true },

  "plan.eyebrow": { label: EYEBROW },
  "plan.title": { label: TITLE },
  "plan.intro": {
    label: LEAD,
    multiline: true,
    hint: ["Mentionne le nombre d'unités : gardez-le à jour.", "Mentions the number of units: keep it current."],
  },
  "plan.street": { label: ["Plan : nom de la rue", "Plan: street name"] },
  "plan.length": { label: ["Plan : longueur du bâtiment", "Plan: building length"] },
  "plan.depth": { label: ["Plan : profondeur du bâtiment", "Plan: building depth"] },
  "plan.service": { label: ["Plan : salle électrique", "Plan: electrical room"] },
  "plan.legendSale": { label: ["Légende : à vendre", "Legend: for sale"] },
  "plan.legendSold": { label: ["Légende : vendu", "Legend: sold"] },
  "plan.sold": { label: ["Tampon sur les unités vendues", "Stamp on sold units"] },
  "plan.scrollHint": { label: ["Indication de défilement (mobile)", "Scroll hint (mobile)"] },
  "plan.note": { label: ["Note à côté de la liste", "Note beside the list"] },
  "plan.listTitle": { label: ["Liste : titre", "List: heading"] },
  "plan.listHint": { label: ["Liste : indication", "List: hint"] },
  "plan.areaOnRequest": { label: ["Liste : superficie non confirmée", "List: unconfirmed area"] },
  "plan.through": { label: ["Liste : description de l'unité traversante", "List: through-unit description"] },
  "plan.standard": { label: ["Liste : description d'une unité", "List: unit description"] },
  "plan.request": { label: ["Liste : bouton", "List: button"] },
  "plan.aria": { label: ["Plan (lecteurs d'écran)", "Plan (screen readers)"], multiline: true, advanced: true },
  "plan.requestAria": { label: ["Bouton de la liste (lecteurs d'écran)", "List button (screen readers)"], advanced: true },

  "included.eyebrow": { label: EYEBROW },
  "included.title": { label: TITLE },
  "included.lead": { label: LEAD, multiline: true },
  "included.drawingTitle": { label: ["Dessin : titre", "Drawing: title"] },
  "included.drawingNote": { label: ["Dessin : note", "Drawing: note"] },
  "included.drawing.garage": { label: ["Dessin : porte de garage", "Drawing: garage door"] },
  "included.drawing.door": { label: ["Dessin : porte", "Drawing: door"] },
  "included.drawing.window": { label: ["Dessin : fenêtre", "Drawing: window"] },
  "included.drawing.panel": { label: ["Dessin : électricité", "Drawing: electrical"] },
  "included.drawing.washroom": { label: ["Dessin : salle de bain", "Drawing: washroom"] },
  "included.drawing.heater": { label: ["Dessin : chauffe-eau", "Drawing: water heater"] },
  "included.drawing.open": { label: ["Dessin : aire ouverte", "Drawing: open floor"] },
  "included.drawing.width": { label: ["Dessin : largeur de la porte", "Drawing: door width"] },

  "why.eyebrow": { label: EYEBROW },
  "why.title": { label: TITLE },
  "why.lead": { label: LEAD, multiline: true },
  "why.ownerTitle": { label: ["Carte entreprises : titre", "Business card: title"] },
  "why.investor.eyebrow": { label: ["Carte investisseurs : petite ligne", "Investor card: small line"] },
  "why.investor.title": { label: ["Carte investisseurs : titre", "Investor card: title"] },
  "why.investor.body": { label: ["Carte investisseurs : texte", "Investor card: text"], multiline: true },
  "why.investor.cta": { label: ["Carte investisseurs : bouton", "Investor card: button"] },

  "building.eyebrow": { label: EYEBROW },
  "building.title": {
    label: TITLE,
    hint: ["Mentionne le nombre d'unités : gardez-le à jour.", "Mentions the number of units: keep it current."],
  },
  "building.lead": { label: LEAD, multiline: true },
  "building.facts.area": { label: ["Fiche : libellé « superficie »", "Facts: “area” label"] },
  "building.facts.units": { label: ["Fiche : libellé « unités »", "Facts: “units” label"] },
  "building.facts.unitsValue": { label: ["Fiche : nombre d'unités", "Facts: number of units"] },
  "building.facts.size": { label: ["Fiche : libellé « dimensions »", "Facts: “dimensions” label"] },
  "building.facts.year": { label: ["Fiche : libellé « construction »", "Facts: “built” label"] },
  "building.facts.lot": { label: ["Fiche : libellé « terrain »", "Facts: “lot” label"] },
  "building.facts.lotValue": { label: ["Fiche : valeur du terrain", "Facts: lot value"] },
  "building.facts.parking": { label: ["Fiche : libellé « stationnement »", "Facts: “parking” label"] },
  "building.facts.parkingValue": { label: ["Fiche : valeur du stationnement", "Facts: parking value"] },
  "building.facts.zoning": { label: ["Fiche : libellé « zonage »", "Facts: “zoning” label"] },
  "building.facts.transit": { label: ["Fiche : libellé « transport »", "Facts: “transit” label"] },
  "building.facts.transitValue": { label: ["Fiche : transport en commun", "Facts: public transit"] },
  "building.photoAlt": { label: ["Photo : description (alt)", "Photo: description (alt)"], multiline: true, advanced: true },

  "gallery.eyebrow": { label: ["Photos extérieures : petite ligne", "Exterior photos: small line"] },
  "gallery.title": { label: ["Photos extérieures : titre", "Exterior photos: heading"] },
  "interior.eyebrow": { label: ["Photos intérieures : petite ligne", "Interior photos: small line"] },
  "interior.title": { label: ["Photos intérieures : titre", "Interior photos: heading"] },
  "interior.alt": {
    label: ["Photo intérieure sans description (alt par défaut)", "Interior photo without a description (default alt)"],
    advanced: true,
  },
  "gallery.open": { label: ["Bouton « agrandir » (lecteurs d'écran)", "“Enlarge” button (screen readers)"], advanced: true },
  "gallery.close": { label: ["Visionneuse : fermer", "Viewer: close"], advanced: true },
  "gallery.prev": { label: ["Visionneuse : photo précédente", "Viewer: previous photo"], advanced: true },
  "gallery.next": { label: ["Visionneuse : photo suivante", "Viewer: next photo"], advanced: true },
  "gallery.counter": { label: ["Visionneuse : compteur", "Viewer: counter"], advanced: true },

  "location.eyebrow": { label: EYEBROW },
  "location.title": { label: TITLE },
  "location.lead": { label: LEAD, multiline: true },
  "location.timesTitle": { label: ["Panneau des trajets : titre", "Drive-time sign: heading"] },
  "location.min": { label: ["Panneau : abréviation de « minutes »", "Sign: “minutes” abbreviation"] },
  "location.timesNote": { label: ["Note sous le panneau", "Note under the sign"] },
  "location.address": {
    label: ["Adresse sur la carte", "Address on the map"],
    multiline: true,
    hint: ["Un retour à la ligne s'affiche tel quel.", "Line breaks show as typed."],
  },
  "location.loadMap": { label: ["Bouton « afficher la carte »", "“Show map” button"] },
  "location.openMaps": { label: ["Bouton Google Maps", "Google Maps button"] },
  "location.mapTitle": { label: ["Carte (lecteurs d'écran)", "Map (screen readers)"], advanced: true },

  "contact.eyebrow": { label: EYEBROW },
  "contact.title": { label: TITLE },
  "contact.lead": { label: LEAD, multiline: true },
  "contact.phoneLabel": { label: ["Libellé du téléphone", "Phone label"] },
  "contact.team": { label: ["Sous le numéro de téléphone", "Under the phone number"] },
  "contact.emailLabel": { label: ["Libellé du courriel", "Email label"] },
  "contact.fields.name": { label: ["Formulaire : champ nom", "Form: name field"] },
  "contact.fields.company": { label: ["Formulaire : champ entreprise", "Form: company field"] },
  "contact.fields.email": { label: ["Formulaire : champ courriel", "Form: email field"] },
  "contact.fields.phone": { label: ["Formulaire : champ téléphone", "Form: phone field"] },
  "contact.fields.unit": { label: ["Formulaire : champ unité", "Form: unit field"] },
  "contact.fields.anyUnit": { label: ["Formulaire : aucune unité choisie", "Form: no unit chosen"] },
  "contact.fields.intent": { label: ["Formulaire : type de demande", "Form: request type"] },
  "contact.fields.message": { label: ["Formulaire : champ message", "Form: message field"] },
  "contact.intents.prices": { label: ["Choix : recevoir les prix", "Choice: get pricing"] },
  "contact.intents.visit": { label: ["Choix : visiter", "Choice: visit"] },
  "contact.intents.question": { label: ["Choix : poser une question", "Choice: ask a question"] },
  "contact.submit": { label: ["Bouton d'envoi", "Submit button"] },
  "contact.consent": { label: ["Mention sous le formulaire", "Note under the form"], multiline: true },
  "contact.successTitle": { label: ["Confirmation : titre", "Confirmation: heading"] },
  "contact.success": { label: ["Confirmation : message", "Confirmation: message"] },
  "contact.faster": { label: ["Confirmation : invitation à appeler", "Confirmation: call prompt"] },
  "contact.sending": { label: ["Bouton pendant l'envoi", "Button while sending"], advanced: true },
  "contact.sendError": { label: ["Erreur d'envoi", "Send error"], advanced: true },
  "contact.errors.name": { label: ["Erreur : nom manquant", "Error: missing name"], advanced: true },
  "contact.errors.email": { label: ["Erreur : courriel invalide", "Error: invalid email"], advanced: true },
  "contact.errors.phone": { label: ["Erreur : téléphone invalide", "Error: invalid phone"], advanced: true },

  "footer.disclaimer": { label: ["Avis (superficies, disponibilités)", "Notice (areas, availability)"], multiline: true },
  "footer.rights": { label: ["Droits réservés", "Rights reserved"] },
};

/** What each {token} is replaced with on the site. */
export const TOKEN_HELP: Record<string, Bi> = {
  min: { fr: "la plus petite superficie (onglet Unités)", en: "the smallest area (Units tab)" },
  max: { fr: "la plus grande superficie (onglet Unités)", en: "the largest area (Units tab)" },
  a40: { fr: "minutes jusqu'à l'autoroute 40 (onglet Bâtiment)", en: "minutes to Highway 40 (Building tab)" },
  sqft: { fr: "une superficie en pi²", en: "an area in sq ft" },
  year: { fr: "l'année de construction", en: "the year built" },
  acres: { fr: "la superficie du terrain", en: "the lot size" },
  ratio: { fr: "le ratio de stationnement", en: "the parking ratio" },
  date: { fr: "la date des disponibilités", en: "the availability date" },
  list: { fr: "la liste des unités à vendre", en: "the list of units for sale" },
  sold: { fr: "la liste des unités vendues", en: "the list of sold units" },
  unit: { fr: "le numéro de l'unité", en: "the unit number" },
  name: { fr: "le prénom du visiteur", en: "the visitor's first name" },
  phone: { fr: "le numéro de téléphone", en: "the phone number" },
  alt: { fr: "la description de la photo", en: "the photo description" },
  i: { fr: "le numéro de la photo", en: "the photo number" },
  n: { fr: "le nombre de photos", en: "the number of photos" },
};

export interface TextField {
  key: string; // "t:hero.title"
  path: string;
  section: SectionId;
  label: Bi;
  hint?: Bi;
  multiline: boolean;
  max: number;
  recommended?: number;
  advanced: boolean;
  tokens: string[]; // the {tokens} the defaults use
  defaults: Bi;
}

const TOKEN_RE = /\{(\w+)\}/g;
export function tokensIn(s: string): string[] {
  return [...new Set([...s.matchAll(TOKEN_RE)].map((m) => m[1]))];
}

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

const bi = ([f, e]: [string, string]): Bi => ({ fr: f, en: e });

function buildTextFields(): TextField[] {
  const out: TextField[] = [];
  const walk = (node: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(node)) {
      const path = prefix + k;
      if (typeof v === "string") {
        if (LOCKED.has(path) || HIDDEN.has(path) || ELSEWHERE.some((p) => path.startsWith(p))) continue;
        const meta = META[path as TextPath];
        const enValue = getPath(en, path);
        const defaults = { fr: v, en: typeof enValue === "string" ? enValue : v };
        out.push({
          key: `t:${path}`,
          path,
          section: SECTION_OF[path.split(".")[0]] ?? "footer",
          label: meta ? bi(meta.label) : { fr: path, en: path },
          hint: meta?.hint && bi(meta.hint),
          multiline: meta?.multiline ?? false,
          max: meta?.max ?? (meta?.multiline ? 1200 : 300),
          recommended: meta?.recommended,
          advanced: meta?.advanced ?? !meta,
          tokens: tokensIn(defaults.fr + " " + defaults.en),
          defaults,
        });
      } else if (v && typeof v === "object" && !Array.isArray(v)) {
        walk(v as Record<string, unknown>, path + ".");
      }
    }
  };
  walk(fr as unknown as Record<string, unknown>, "");
  return out;
}

export const TEXT_FIELDS = buildTextFields();
export const TEXT_BY_KEY = new Map(TEXT_FIELDS.map((f) => [f.key, f]));

// ---------- Lists ----------

export interface ListItem {
  title: Bi;
  body?: Bi;
}

export interface ListDef {
  key: string;
  section: SectionId;
  label: Bi;
  hint?: Bi;
  fixed?: number; // exact number of items
  after: TextPath; // shown in the admin right after this text
  min: number;
  max: number;
  body: "none" | "optional" | "required";
}

/** The first four "included" items are the numbered callouts on the unit drawing. */
export const CALLOUTS = 4;

export const LISTS: ListDef[] = [
  {
    key: "l:included.callouts",
    section: "included",
    label: { fr: "Points numérotés sur le dessin", en: "Numbered points on the drawing" },
    hint: {
      fr: "Les numéros 1 à 4 du dessin renvoient à ces quatre points, dans cet ordre.",
      en: "Numbers 1 to 4 on the drawing point to these four items, in this order.",
    },
    fixed: CALLOUTS,
    after: "included.lead",
    min: CALLOUTS,
    max: CALLOUTS,
    body: "optional",
  },
  {
    key: "l:included.extra",
    section: "included",
    label: { fr: "Autres points inclus", en: "Other included points" },
    after: "included.lead",
    min: 0,
    max: 8,
    body: "optional",
  },
  {
    key: "l:why.items",
    section: "why",
    label: { fr: "Avantages pour votre entreprise", en: "Benefits for your business" },
    after: "why.ownerTitle",
    min: 1,
    max: 8,
    body: "required",
  },
  {
    key: "l:why.points",
    section: "why",
    label: { fr: "Carte investisseurs : points", en: "Investor card: points" },
    after: "why.investor.body",
    min: 1,
    max: 6,
    body: "none",
  },
];
export const LIST_BY_KEY = new Map(LISTS.map((l) => [l.key, l]));

// ---------- Project facts, units, photos ----------

export const BUILDING_FACTS = [
  { key: "sqft", label: { fr: "Superficie du bâtiment (pi²)", en: "Building area (sq ft)" }, min: 100, max: 10_000_000, step: 1 },
  { key: "units", label: { fr: "Nombre d'unités", en: "Number of units" }, min: 1, max: 1000, step: 1 },
  { key: "lengthFt", label: { fr: "Longueur (pi)", en: "Length (ft)" }, min: 1, max: 10_000, step: 1 },
  { key: "depthFt", label: { fr: "Profondeur (pi)", en: "Depth (ft)" }, min: 1, max: 10_000, step: 1 },
  { key: "yearBuilt", label: { fr: "Année de construction", en: "Year built" }, min: 1800, max: 2100, step: 1 },
  { key: "lotAcres", label: { fr: "Terrain (acres)", en: "Lot (acres)" }, min: 0.1, max: 10_000, step: 0.1 },
  { key: "parkingPer1000", label: { fr: "Stationnement (cases / 1 000 pi²)", en: "Parking (spaces / 1,000 sq ft)" }, min: 0, max: 100, step: 0.01 },
  { key: "zoning", label: { fr: "Zonage", en: "Zoning" } },
] as const;

export type BuildingFactKey = (typeof BUILDING_FACTS)[number]["key"];

export const PROJECT_KEYS = [
  "p:areaRange",
  "p:availabilityAsOf",
  ...BUILDING_FACTS.map((f) => `p:building.${f.key}`),
  "p:phone",
  "p:email",
  "p:leadInboxes",
  "p:driveTimes",
] as const;

export const UNIT_KEYS = UNIT_ROWS.map((r) => `u:${r.id}`);
export const MEDIA_KEYS = ["m:gallery", "m:interior"] as const;

/** The drive time the copy refers to as {a40}; it can't be removed. */
export const LOCKED_DRIVE_TIME = "a40";

export const PHOTO_LIMITS = { "m:gallery": { min: 1, max: 12, ideal: 5 }, "m:interior": { min: 0, max: 12 } } as const;
export const MAX_INBOXES = 5;

/** Every key the store may hold. Anything else in a stored document is ignored. */
export const ALL_KEYS: string[] = [
  ...TEXT_FIELDS.map((f) => f.key),
  ...LISTS.map((l) => l.key),
  ...PROJECT_KEYS,
  ...UNIT_KEYS,
  ...MEDIA_KEYS,
];

const PROJECT_LABELS: Record<string, Bi> = {
  "p:areaRange": { fr: "Superficies annoncées (min – max)", en: "Advertised areas (min – max)" },
  "p:availabilityAsOf": { fr: "Date des disponibilités", en: "Availability date" },
  "p:phone": { fr: "Téléphone", en: "Phone" },
  "p:email": { fr: "Courriel affiché", en: "Email shown" },
  "p:leadInboxes": { fr: "Destinataires du formulaire", en: "Form recipients" },
  "p:driveTimes": { fr: "Temps de route", en: "Drive times" },
  "m:gallery": { fr: "Photos extérieures", en: "Exterior photos" },
  "m:interior": { fr: "Photos intérieures", en: "Interior photos" },
};

/** A readable name for any key, for the publish summary. */
export function keyLabel(key: string): Bi {
  const text = TEXT_BY_KEY.get(key);
  if (text) {
    const section = SECTIONS.find((s) => s.id === text.section)!;
    return { fr: `${section.label.fr} › ${text.label.fr}`, en: `${section.label.en} › ${text.label.en}` };
  }
  const list = LIST_BY_KEY.get(key);
  if (list) return list.label;
  if (key.startsWith("u:")) {
    const row = UNIT_ROWS.find((r) => `u:${r.id}` === key);
    const name = row ? row.civics.join(" + ") : key.slice(2);
    return { fr: `Unité ${name}`, en: `Unit ${name}` };
  }
  if (key.startsWith("p:building.")) {
    const fact = BUILDING_FACTS.find((f) => `p:building.${f.key}` === key);
    if (fact) return fact.label;
  }
  return PROJECT_LABELS[key] ?? { fr: key, en: key };
}
