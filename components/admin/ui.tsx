"use client";

import { createContext, useContext, useLayoutEffect, useRef } from "react";
import type { AdminLang, UI } from "@/app/admin/i18n";
import type { Issue } from "@/lib/cms/merge";
import type { Values } from "@/lib/cms/defaults";
import type { Bi } from "@/lib/cms/types";
import { fill } from "@/lib/format";

// ---------- Editor context ----------

export interface EditorState {
  ui: UI;
  lang: AdminLang;
  values: Values;
  published: Values;
  set: (key: string, value: unknown) => void;
  issues: Map<string, Issue[]>;
}

export const EditorContext = createContext<EditorState | null>(null);

export function useEditor(): EditorState {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor outside <Editor>");
  return ctx;
}

// ---------- Icons (same drawing style as components/icons.tsx) ----------

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" } as const;
type IconProps = { className?: string };

export const UpIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 16 16" aria-hidden className={className} {...stroke}>
    <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
  </svg>
);
export const DownIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 16 16" aria-hidden className={className} {...stroke}>
    <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
  </svg>
);
export const CloseIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 16 16" aria-hidden className={className} {...stroke}>
    <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
  </svg>
);
export const PlusIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 16 16" aria-hidden className={className} {...stroke}>
    <path d="M8 3v10M3 8h10" />
  </svg>
);
export const ExternalIcon = ({ className = "h-3.5 w-3.5" }: IconProps) => (
  <svg viewBox="0 0 16 16" aria-hidden className={className} {...stroke}>
    <path d="M9.5 2.5h4v4M13.5 2.5 7 9M11.5 9.5v3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3" />
  </svg>
);
export const SearchIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 16 16" aria-hidden className={className} {...stroke}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="m10.5 10.5 3 3" />
  </svg>
);
export const LockIcon = ({ className = "h-3.5 w-3.5" }: IconProps) => (
  <svg viewBox="0 0 16 16" aria-hidden className={className} {...stroke}>
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
);

// ---------- Small pieces ----------

/** DOM id of the input that edits a key, for "jump to the error". */
export const fieldId = (key: string) => `f-${key.replace(/[^A-Za-z0-9_-]/g, "_")}`;

/** Input look without a width, for inputs that set their own (inputClass is full width). */
export const inputBase =
  "block rounded-lg border border-line bg-white px-3 py-2.5 text-[0.9375rem] leading-snug text-ink outline-none transition-[border-color,box-shadow] placeholder:text-steel/60 focus:border-teal focus:ring-3 focus:ring-teal/20 aria-[invalid=true]:border-red-700 aria-[invalid=true]:ring-red-700/15 disabled:bg-paper disabled:text-steel";
export const inputClass = `${inputBase} w-full`;

export const smallBtn =
  "inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-slate transition-colors hover:bg-paper-2 disabled:pointer-events-none disabled:opacity-40";

export function IconButton({
  label,
  onClick,
  disabled,
  children,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30 ${
        tone === "danger" ? "text-red-800 hover:bg-red-50" : "text-slate hover:bg-paper-2"
      }`}
    >
      {children}
    </button>
  );
}

export function Badge({ tone, children, title }: { tone: "edited" | "unpublished" | "error" | "warning"; children: React.ReactNode; title?: string }) {
  const cls = {
    edited: "bg-paper-2 text-steel",
    unpublished: "bg-mint text-slate",
    error: "bg-red-100 text-red-900",
    warning: "bg-amber-100 text-amber-900",
  }[tone];
  return (
    <span title={title} className={`eyebrow inline-flex items-center rounded px-1.5 py-0.5 !text-[0.625rem] ${cls}`}>
      {children}
    </span>
  );
}

export function issueText(ui: UI, issue: Issue): string {
  return fill(ui.issues[issue.code], { detail: issue.detail ?? "" });
}

/** Issue messages under an input; `lang` limits them to one language. */
export function IssueList({ ui, issues, lang, index }: { ui: UI; issues?: Issue[]; lang?: "fr" | "en"; index?: number }) {
  const shown = (issues ?? []).filter((i) => (lang === undefined || i.lang === lang || i.lang === undefined) && (index === undefined || i.index === index));
  if (!shown.length) return null;
  return (
    <ul className="mt-1 grid gap-0.5">
      {shown.map((i, n) => (
        <li key={n} className={`text-[0.8125rem] font-semibold ${i.level === "error" ? "text-red-800" : "text-amber-800"}`}>
          {issueText(ui, i)}
        </li>
      ))}
    </ul>
  );
}

/** Grows a textarea with its content. */
export function useAutosize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return ref;
}

export function TextInput({
  value,
  onChange,
  multiline,
  invalid,
  lang,
  placeholder,
  maxLength,
  id,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  invalid?: boolean;
  lang?: "fr" | "en";
  placeholder?: string;
  maxLength?: number;
  id?: string;
  label?: string;
}) {
  const ref = useAutosize(multiline ? value : "");
  const common = {
    id,
    value,
    lang,
    placeholder,
    maxLength,
    "aria-invalid": invalid || undefined,
    "aria-label": label,
    spellCheck: true,
    // room for the FR / EN tag in the corner
    className: `${inputClass} ${lang ? "pr-8" : ""}`,
  };
  return multiline ? (
    <textarea ref={ref} rows={2} {...common} onChange={(e) => onChange(e.target.value)} className={`${common.className} resize-none`} />
  ) : (
    <input type="text" {...common} onChange={(e) => onChange(e.target.value)} />
  );
}

/** French and English inputs side by side (stacked on phones). */
export function BiInputs({
  ui,
  value,
  onChange,
  multiline,
  issues,
  index,
  label,
  placeholder,
  footer,
  stack,
}: {
  ui: UI;
  value: Bi;
  onChange: (v: Bi) => void;
  multiline?: boolean;
  issues?: Issue[];
  index?: number;
  label: string;
  placeholder?: Bi;
  footer?: (lang: "fr" | "en") => React.ReactNode;
  stack?: boolean; // one above the other, for narrow cards
}) {
  const bad = (lang: "fr" | "en") =>
    !!issues?.some((i) => i.level === "error" && (i.lang === lang || i.lang === undefined) && (index === undefined || i.index === index));
  return (
    <div className={`grid gap-2 ${stack ? "" : "sm:grid-cols-2 sm:gap-3"}`}>
      {(["fr", "en"] as const).map((lang) => (
        <div key={lang} className="min-w-0">
          <div className="relative">
            <span aria-hidden className="eyebrow pointer-events-none absolute right-2 top-1.5 !text-[0.5625rem] text-steel/70">
              {lang.toUpperCase()}
            </span>
            <TextInput
              value={value[lang]}
              lang={lang}
              multiline={multiline}
              invalid={bad(lang)}
              placeholder={placeholder?.[lang]}
              label={`${label} (${lang.toUpperCase()})`}
              onChange={(v) => onChange({ ...value, [lang]: v })}
            />
          </div>
          {footer?.(lang)}
          <IssueList ui={ui} issues={issues} lang={lang} index={index} />
        </div>
      ))}
    </div>
  );
}

export function SectionCard({
  id,
  title,
  hint,
  aside,
  children,
}: {
  id?: string;
  title: string;
  hint?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="min-w-0 scroll-mt-36 rounded-[1.25rem] border border-line bg-white p-4 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="h3 text-[1.375rem]">{title}</h2>
          {hint && <p className="mt-1 max-w-2xl text-[0.9375rem] leading-relaxed text-steel">{hint}</p>}
        </div>
        {aside}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
