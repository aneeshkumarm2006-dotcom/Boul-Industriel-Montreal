"use client";

import { memo, useEffect, useMemo, useState } from "react";
import fr from "@/content/fr";
import en from "@/content/en";
import type { UI } from "@/app/admin/i18n";
import { DEFAULT_VALUES, type DriveTimeValue } from "@/lib/cms/defaults";
import { deepEqual, type Issue } from "@/lib/cms/merge";
import {
  LISTS,
  SECTIONS,
  TEXT_FIELDS,
  TOKEN_HELP,
  type ListDef,
  type ListItem,
  type SectionId,
  type TextField,
} from "@/lib/cms/registry";
import type { Bi } from "@/lib/cms/types";
import { fill, formatNumber } from "@/lib/format";
import {
  Badge,
  BiInputs,
  CloseIcon,
  DownIcon,
  ExternalIcon,
  fieldId,
  IconButton,
  IssueList,
  PlusIcon,
  SearchIcon,
  SectionCard,
  smallBtn,
  UpIcon,
  useEditor,
} from "./ui";

type Lang = "fr" | "en";

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// ---------- One text in both languages ----------

const BilingualField = memo(function BilingualField({
  field,
  value,
  pub,
  issues,
  set,
  ui,
  lang,
}: {
  field: TextField;
  value: Bi;
  pub: Bi;
  issues?: Issue[];
  set: (key: string, value: unknown) => void;
  ui: UI;
  lang: Lang;
}) {
  const edited = !deepEqual(value, field.defaults);
  const unpublished = !deepEqual(value, pub);
  const counter = (l: Lang) => {
    const limit = field.recommended;
    if (!limit) return null;
    return <p className="mt-1 text-right text-xs text-steel">{fill(ui.chars, { n: value[l].length, max: limit })}</p>;
  };

  return (
    <div id={fieldId(field.key)} className="scroll-mt-40 border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-[0.9375rem] font-semibold">{field.label[lang]}</span>
          {edited && (
            <Badge tone="edited" title={ui.editedHint}>
              {ui.edited}
            </Badge>
          )}
          {unpublished && <Badge tone="unpublished">{ui.unpublished}</Badge>}
        </div>
        <div className="flex flex-wrap gap-1">
          {unpublished && (
            <button type="button" className={smallBtn} onClick={() => set(field.key, pub)}>
              {ui.undoChange}
            </button>
          )}
          {edited && (
            <button type="button" className={smallBtn} onClick={() => set(field.key, field.defaults)}>
              {ui.resetOriginal}
            </button>
          )}
        </div>
      </div>
      {field.hint && <p className="mt-0.5 text-sm text-steel">{field.hint[lang]}</p>}
      <div className="mt-2.5">
        <BiInputs
          ui={ui}
          value={value}
          onChange={(v) => set(field.key, v)}
          multiline={field.multiline}
          issues={issues}
          label={field.label[lang]}
          footer={counter}
        />
      </div>
      {field.tokens.length > 0 && (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-steel">
          <span>{ui.variables} :</span>
          {field.tokens.map((t) => (
            <code key={t} title={TOKEN_HELP[t]?.[lang]} className="mono cursor-help rounded bg-paper-2 px-1.5 py-0.5 text-ink">
              {`{${t}}`}
            </code>
          ))}
        </p>
      )}
    </div>
  );
});

// ---------- A bilingual list ----------

const DEFAULT_LISTS = Object.fromEntries(LISTS.map((l) => [l.key, DEFAULT_VALUES[l.key] as ListItem[]]));

function PairList({ def, value, pub, issues }: { def: ListDef; value: ListItem[]; pub: ListItem[]; issues?: Issue[] }) {
  const { ui, lang, set } = useEditor();
  const edited = !deepEqual(value, DEFAULT_LISTS[def.key]);
  const unpublished = !deepEqual(value, pub);
  const update = (items: ListItem[]) => set(def.key, items);
  const move = (i: number, d: number) => {
    const items = [...value];
    [items[i], items[i + d]] = [items[i + d], items[i]];
    update(items);
  };
  const empty = (): Bi => ({ fr: "", en: "" });

  return (
    <div id={fieldId(def.key)} className="scroll-mt-40 border-t border-line py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.9375rem] font-semibold">{def.label[lang]}</span>
          {edited && <Badge tone="edited">{ui.edited}</Badge>}
          {unpublished && <Badge tone="unpublished">{ui.unpublished}</Badge>}
        </div>
        <div className="flex gap-1">
          {unpublished && (
            <button type="button" className={smallBtn} onClick={() => update(pub)}>
              {ui.undoChange}
            </button>
          )}
          {edited && (
            <button type="button" className={smallBtn} onClick={() => update(DEFAULT_LISTS[def.key])}>
              {ui.resetOriginal}
            </button>
          )}
        </div>
      </div>
      {def.hint && <p className="mt-0.5 text-sm text-steel">{def.hint[lang]}</p>}
      <IssueList ui={ui} issues={issues?.filter((i) => i.index === undefined)} />

      <ol className="mt-3 grid gap-3">
        {value.map((item, i) => (
          <li key={i} className="rounded-xl border border-line bg-paper/60 p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="eyebrow text-steel">{fill(ui.item, { n: i + 1 })}</span>
              {!def.fixed && (
                <span className="flex">
                  <IconButton label={ui.moveUp} onClick={() => move(i, -1)} disabled={i === 0}>
                    <UpIcon />
                  </IconButton>
                  <IconButton label={ui.moveDown} onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                    <DownIcon />
                  </IconButton>
                  <IconButton
                    label={ui.remove}
                    tone="danger"
                    disabled={value.length <= def.min}
                    onClick={() => update(value.filter((_, n) => n !== i))}
                  >
                    <CloseIcon />
                  </IconButton>
                </span>
              )}
            </div>
            <p className="mb-1 text-xs font-semibold text-steel">{ui.itemTitle}</p>
            <BiInputs
              ui={ui}
              value={item.title}
              index={i}
              issues={issues?.filter((x) => x.detail !== "body")}
              label={`${def.label[lang]} ${i + 1}`}
              onChange={(title) => update(value.map((it, n) => (n === i ? { ...it, title } : it)))}
            />
            {def.body !== "none" &&
              (item.body ? (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-semibold text-steel">{ui.itemBody}</p>
                    {def.body === "optional" && (
                      <button
                        type="button"
                        className={smallBtn}
                        onClick={() => update(value.map((it, n) => (n === i ? { title: it.title } : it)))}
                      >
                        {ui.removeBody}
                      </button>
                    )}
                  </div>
                  <BiInputs
                    ui={ui}
                    value={item.body}
                    multiline
                    label={`${def.label[lang]} ${i + 1} — ${ui.itemBody}`}
                    onChange={(body) => update(value.map((it, n) => (n === i ? { ...it, body } : it)))}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={`${smallBtn} mt-2`}
                  onClick={() => update(value.map((it, n) => (n === i ? { ...it, body: empty() } : it)))}
                >
                  <PlusIcon /> {ui.addBody}
                </button>
              ))}
            <IssueList ui={ui} issues={issues?.filter((x) => x.index === i && (x.detail === "body" || x.code === "translation"))} />
          </li>
        ))}
      </ol>
      {!def.fixed && value.length < def.max && (
        <button
          type="button"
          className={`${smallBtn} mt-3`}
          onClick={() => update([...value, def.body === "required" ? { title: empty(), body: empty() } : { title: empty() }])}
        >
          <PlusIcon /> {ui.add}
        </button>
      )}
    </div>
  );
}

// ---------- Google preview ----------

function SeoPreview() {
  const { ui, values } = useEditor();
  const title = values["t:meta.title"] as Bi;
  const desc = values["t:meta.description"] as Bi;
  const [min, max] = values["p:areaRange"] as [number, number];
  const a40 = (values["p:driveTimes"] as DriveTimeValue[]).find((d) => d.key === "a40")?.min ?? 0;
  // The production domain when it's configured, otherwise this one (read after hydration)
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const [origin, setOrigin] = useState(site ? new URL(site).host : "");
  useEffect(() => {
    if (!site) setOrigin(window.location.host);
  }, [site]);

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      {(["fr", "en"] as const).map((l) => {
        const locale = (l === "fr" ? fr : en).locale;
        const text = fill(desc[l], { min: formatNumber(locale, min), max: formatNumber(locale, max), a40 });
        return (
          <figure key={l} lang={l} className="rounded-xl border border-line p-4" style={{ fontFamily: "arial, sans-serif" }}>
            <figcaption className="eyebrow mb-2 text-steel" style={{ fontFamily: "var(--font-mono)" }}>
              {ui.seoPreview} · {l.toUpperCase()}
            </figcaption>
            <p className="truncate text-[0.8125rem] text-[#202124]">
              {origin} › {l}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[1.125rem] leading-snug text-[#1a0dab]">{title[l]}</p>
            <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-[#4d5156]">{text}</p>
          </figure>
        );
      })}
    </div>
  );
}

// ---------- The tab ----------

export default function TextsTab() {
  const { ui, lang, values, published, set, issues } = useEditor();
  const [q, setQ] = useState("");
  const query = fold(q.trim());

  const sections = useMemo(() => {
    const matchText = (f: TextField) => {
      if (!query) return true;
      const v = values[f.key] as Bi;
      return [f.label.fr, f.label.en, v.fr, v.en].some((s) => fold(s).includes(query));
    };
    const matchList = (l: ListDef) => {
      if (!query) return true;
      const items = values[l.key] as ListItem[];
      return [l.label.fr, l.label.en, ...items.flatMap((it) => [it.title.fr, it.title.en, it.body?.fr ?? "", it.body?.en ?? ""])].some((s) =>
        fold(s).includes(query),
      );
    };
    return SECTIONS.map((section) => {
      const fields = TEXT_FIELDS.filter((f) => f.section === section.id && matchText(f));
      const lists = LISTS.filter((l) => l.section === section.id && matchList(l));
      return { section, basic: fields.filter((f) => !f.advanced), advanced: fields.filter((f) => f.advanced), lists };
    }).filter((s) => !query || s.basic.length + s.advanced.length + s.lists.length > 0);
  }, [query, values]);

  const count = (id: SectionId) => {
    const keys = [...TEXT_FIELDS.filter((f) => f.section === id).map((f) => f.key), ...LISTS.filter((l) => l.section === id).map((l) => l.key)];
    return {
      unpublished: keys.filter((k) => !deepEqual(values[k], published[k])).length,
      errors: keys.filter((k) => issues.get(k)?.some((i) => i.level === "error")).length,
    };
  };

  const field = (f: TextField) => (
    <BilingualField
      key={f.key}
      field={f}
      value={values[f.key] as Bi}
      pub={published[f.key] as Bi}
      issues={issues.get(f.key)}
      set={set}
      ui={ui}
      lang={lang}
    />
  );
  const list = (l: ListDef) => (
    <PairList key={l.key} def={l} value={values[l.key] as ListItem[]} pub={published[l.key] as ListItem[]} issues={issues.get(l.key)} />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-40 lg:self-start">
        <label className="relative block">
          <span className="sr-only">{ui.search}</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ui.search}
            className="block w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-[0.9375rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/20"
          />
        </label>
        <nav className="mt-4 hidden lg:block">
          <ul className="grid gap-0.5">
            {SECTIONS.map((s) => {
              const c = count(s.id);
              return (
                <li key={s.id}>
                  <a
                    href={`#s-${s.id}`}
                    className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[0.9375rem] text-ink/80 hover:bg-white hover:text-ink"
                  >
                    <span className="truncate">{s.label[lang]}</span>
                    <span className="flex gap-1">
                      {c.errors > 0 && <span className="h-2 w-2 rounded-full bg-red-700" />}
                      {c.unpublished > 0 && <span className="h-2 w-2 rounded-full bg-teal" />}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="grid min-w-0 gap-6">
        {sections.length === 0 && <p className="rounded-xl bg-white p-6 text-steel">{fill(ui.noResults, { q })}</p>}
        {sections.map(({ section, basic, advanced, lists }) => {
          const placed = new Set<string>();
          return (
            <SectionCard
              key={section.id}
              id={`s-${section.id}`}
              title={section.label[lang]}
              aside={
                <a
                  href={`/${lang}/${section.anchor}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:text-slate"
                >
                  {ui.viewOnSite}
                  <ExternalIcon />
                </a>
              }
            >
              {section.id === "seo" && <SeoPreview />}
              {basic.map((f) => {
                const after = lists.filter((l) => l.after === f.path);
                after.forEach((l) => placed.add(l.key));
                return [field(f), ...after.map(list)];
              })}
              {lists.filter((l) => !placed.has(l.key)).map(list)}
              {advanced.length > 0 &&
                (query ? (
                  advanced.map(field)
                ) : (
                  <details className="group mt-5 rounded-xl border border-line px-4 py-3 open:pb-5">
                    <summary className="cursor-pointer select-none text-sm font-semibold text-steel group-open:mb-4">{ui.advanced}</summary>
                    {advanced.map(field)}
                  </details>
                ))}
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
