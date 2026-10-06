"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { logout, preview, publish } from "@/app/admin/actions";
import { UI_STRINGS, type AdminLang, type UI } from "@/app/admin/i18n";
import type { Values } from "@/lib/cms/defaults";
import { changedKeys, diff, effective, validate, type Issue } from "@/lib/cms/merge";
import { ALL_KEYS, keyLabel } from "@/lib/cms/registry";
import type { StoreKind } from "@/lib/cms/store";
import type { Overrides } from "@/lib/cms/types";
import { fill } from "@/lib/format";
import BuildingTab from "./BuildingTab";
import ContactTab from "./ContactTab";
import LangSwitch from "./LangSwitch";
import PhotosTab from "./PhotosTab";
import TextsTab from "./TextsTab";
import UnitsTab, { todayInMontreal } from "./UnitsTab";
import { EditorContext, ExternalIcon, fieldId } from "./ui";

type Tab = "texts" | "units" | "photos" | "contact" | "building";
const TABS: Tab[] = ["texts", "units", "photos", "contact", "building"];
const AUTOSAVE = "cms-admin-autosave";

type Failure = { ok: false; error: string; issues?: Issue[] };
type Notice = { tone: "success" | "error" | "info"; text: string; actions?: "conflict" | "signin" | "viewSite" };

/** Which tab edits a key. */
function tabOf(key: string): Tab {
  if (key.startsWith("t:") || key.startsWith("l:")) return "texts";
  if (key.startsWith("u:") || key === "p:areaRange" || key === "p:availabilityAsOf") return "units";
  if (key.startsWith("m:")) return "photos";
  if (key === "p:phone" || key === "p:email" || key === "p:leadInboxes") return "contact";
  return "building";
}

export default function Editor({
  lang,
  publishedOverrides,
  baseVersion,
  writable,
  store,
  userName,
  loadError,
}: {
  lang: AdminLang;
  publishedOverrides: Overrides;
  baseVersion: string | null;
  writable: boolean;
  store: StoreKind;
  userName: string;
  loadError: boolean;
}) {
  const ui: UI = UI_STRINGS[lang];
  const router = useRouter();
  const published = useMemo(() => effective(publishedOverrides), [publishedOverrides]);
  const [values, setValues] = useState<Values>(published);
  const [tab, setTab] = useState<Tab>("texts");
  const [busy, setBusy] = useState<"publish" | "preview" | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dialog, setDialog] = useState(false);
  const [note, setNote] = useState("");
  const [recovered, setRecovered] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [otherTab, setOtherTab] = useState(false);
  const dateEdited = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const set = useCallback((key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value })), []);
  const issueList = useMemo(() => validate(values), [values]);
  const issues = useMemo(() => {
    const map = new Map<string, Issue[]>();
    for (const i of issueList) map.set(i.key, [...(map.get(i.key) ?? []), i]);
    return map;
  }, [issueList]);
  const errors = issueList.filter((i) => i.level === "error");
  const warnings = issueList.filter((i) => i.level === "warning");
  const dirty = useMemo(() => changedKeys(values, published), [values, published]);
  const canPublish = writable && !loadError;

  // Deep links: /admin/#units opens the Units tab
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1) as Tab;
      if (TABS.includes(h)) setTab(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Unpublished changes survive a closed tab: they're kept in this browser, relative to the published version
  useEffect(() => {
    let found: Record<string, unknown> | null = null;
    try {
      const saved = JSON.parse(localStorage.getItem(AUTOSAVE) ?? "null");
      if (saved?.changes && typeof saved.changes === "object") {
        const known = Object.entries(saved.changes).filter(([k]) => ALL_KEYS.includes(k));
        if (known.length) found = Object.fromEntries(known);
      }
    } catch {}
    setRecovered(found);
  }, []);
  useEffect(() => {
    if (recovered !== null) return; // not checked yet, or the "resume?" question is still open
    try {
      if (!dirty.length) localStorage.removeItem(AUTOSAVE);
      else localStorage.setItem(AUTOSAVE, JSON.stringify({ base: baseVersion, changes: Object.fromEntries(dirty.map((k) => [k, values[k]])) }));
    } catch {}
  }, [recovered, dirty, values, baseVersion]);

  // Warn before leaving with unpublished changes
  const hasChanges = dirty.length > 0;
  useEffect(() => {
    if (!hasChanges) return;
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [hasChanges]);

  // Two tabs editing at once would overwrite each other: say so
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("cms-admin");
    channel.onmessage = (e) => {
      if (e.data === "hello") channel.postMessage("here");
      setOtherTab(true);
    };
    channel.postMessage("hello");
    return () => channel.close();
  }, []);

  // A unit changing moves the "availability as of" date to today, unless the client set the date by hand
  const onUnitChange = useCallback(() => {
    if (!dateEdited.current) set("p:availabilityAsOf", todayInMontreal());
  }, [set]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (dialog && !d.open) d.showModal();
    if (!dialog && d.open) d.close();
  }, [dialog]);

  function jumpTo(key: string) {
    setTab(tabOf(key));
    setTimeout(() => {
      const el = document.getElementById(fieldId(key)) ?? document.getElementById(fieldId(key.replace(/^t:/, "")));
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
    }, 60);
  }

  function fail(res: Failure) {
    const text: Record<string, Notice> = {
      UNAUTHORIZED: { tone: "error", text: ui.sessionExpired, actions: "signin" },
      CONFLICT: { tone: "error", text: ui.conflict, actions: "conflict" },
      READ_ONLY: { tone: "error", text: ui.readOnlyError },
      STORE_NOT_CONFIGURED: { tone: "error", text: ui.notConfigured },
      INVALID: { tone: "error", text: fill(ui.errorsBlock, { n: res.issues?.length ?? 1 }) },
    };
    setNotice(text[res.error] ?? { tone: "error", text: ui.storeError });
  }

  async function doPublish(force = false) {
    setBusy("publish");
    setNotice(null);
    try {
      const res = await publish({ overrides: diff(values), baseVersion, note, force });
      if (res.ok) {
        setDialog(false);
        setNote("");
        setNotice({ tone: "success", text: ui.published, actions: "viewSite" });
        try {
          localStorage.removeItem(AUTOSAVE);
        } catch {}
        router.refresh();
      } else {
        setDialog(false);
        fail(res);
      }
    } catch {
      setDialog(false);
      setNotice({ tone: "error", text: ui.storeError });
    } finally {
      setBusy(null);
    }
  }

  async function doPreview(siteLang: "fr" | "en") {
    // Opened right away, while the click still counts as a user gesture, so pop-up blockers allow it
    const win = window.open("about:blank", "_blank");
    setBusy("preview");
    setNotice(null);
    try {
      const res = await preview({ overrides: diff(values), baseVersion, lang: siteLang });
      if (res.ok) {
        if (win) win.location.href = res.url;
        else setNotice({ tone: "info", text: ui.popupBlocked });
      } else {
        win?.close();
        fail(res);
      }
    } catch {
      win?.close();
      setNotice({ tone: "error", text: ui.storeError });
    } finally {
      setBusy(null);
    }
  }

  const ctx = useMemo(() => ({ ui, lang, values, published, set, issues }), [ui, lang, values, published, set, issues]);
  const tabLabel = (t: Tab) => ui.tabs[t];
  const tabDirty = (t: Tab) => dirty.some((k) => tabOf(k) === t);
  const tabErrors = (t: Tab) => errors.some((i) => tabOf(i.key) === t);

  return (
    <EditorContext.Provider value={ctx}>
      <header className="z-30 border-b border-line bg-white md:sticky md:top-0 md:bg-white/95 md:backdrop-blur">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-3 sm:px-6 lg:px-8">
          <a href="/admin/" className="shrink-0" aria-label={ui.appName}>
            <Logo />
          </a>
          <p className="eyebrow hidden text-steel md:block">{ui.appName}</p>
          <div className="ml-auto flex items-center gap-1">
            {userName && <span className="mr-2 hidden text-sm text-steel lg:inline">{fill(ui.signedInAs, { name: userName })}</span>}
            <LangSwitch lang={lang} label={ui.otherLang} />
            <a href={`/${lang}/`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-semibold text-teal hover:bg-paper-2">
              {ui.viewSite}
              <ExternalIcon />
            </a>
            <form action={logout}>
              <button type="submit" className="rounded-md px-2.5 py-2 text-sm font-semibold text-steel hover:bg-paper-2 hover:text-ink">
                {ui.logout}
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto flex max-w-[90rem] flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 pb-0 pt-2 sm:px-6 lg:px-8">
          <nav aria-label={ui.appName} className="-mb-px flex max-w-full gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  history.replaceState(null, "", `#${t}`);
                }}
                aria-current={tab === t ? "page" : undefined}
                className={`relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[0.9375rem] font-semibold transition-colors ${
                  tab === t ? "border-slate text-ink" : "border-transparent text-steel hover:text-ink"
                }`}
              >
                {tabLabel(t)}
                {tabErrors(t) ? <span className="h-2 w-2 rounded-full bg-red-700" /> : tabDirty(t) && <span className="h-2 w-2 rounded-full bg-teal" />}
              </button>
            ))}
            <a href="/admin/history/" className="flex shrink-0 items-center border-b-2 border-transparent px-3 py-2.5 text-[0.9375rem] font-semibold text-steel hover:text-ink">
              {ui.tabs.history}
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-2 pb-2.5 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:justify-end max-md:border-t max-md:border-line max-md:bg-white max-md:px-4 max-md:py-2.5 max-md:shadow-[0_-8px_24px_-16px_rgba(15,29,30,.35)]">
            <span className={`text-sm max-md:mr-auto ${dirty.length ? "font-semibold text-slate" : "text-steel"}`}>
              {dirty.length ? fill(ui.pending, { n: dirty.length }) : ui.upToDate}
            </span>
            {dirty.length > 0 && (
              <button
                type="button"
                className="rounded-md px-2 py-1.5 text-sm text-steel underline-offset-4 hover:underline"
                onClick={() => window.confirm(ui.discardConfirm) && setValues(published)}
              >
                {ui.discardAll}
              </button>
            )}
            <span className="flex overflow-hidden rounded-lg border border-line">
              {(["fr", "en"] as const).map((l, i) => (
                <button
                  key={l}
                  type="button"
                  disabled={!canPublish || busy !== null}
                  onClick={() => doPreview(l)}
                  className={`min-h-10 px-3 text-sm font-semibold text-slate transition-colors hover:bg-paper-2 disabled:opacity-40 ${i ? "border-l border-line" : ""}`}
                >
                  {i === 0 ? `${busy === "preview" ? ui.previewing : ui.preview} ${l.toUpperCase()}` : l.toUpperCase()}
                </button>
              ))}
            </span>
            <button
              type="button"
              className="btn btn-primary !min-h-10 !px-4 text-sm disabled:opacity-40"
              disabled={!canPublish || busy !== null || !dirty.length}
              onClick={() => (errors.length ? jumpTo(errors[0].key) : setDialog(true))}
            >
              {busy === "publish" ? ui.publishing : ui.publish}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[90rem] px-4 py-6 max-md:pb-36 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-3 empty:hidden">
          {loadError && <Banner tone="error">{ui.storeError}</Banner>}
          {store === "none" && <Banner tone="error">{ui.notConfigured}</Banner>}
          {store === "blob" && !writable && <Banner tone="info">{ui.readOnly}</Banner>}
          {store === "fs" && <Banner tone="info">{ui.localStore}</Banner>}
          {otherTab && <Banner tone="info">{ui.otherTab}</Banner>}
          {recovered && (
            <Banner tone="info">
              {ui.restoreLocal}{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-4"
                onClick={() => {
                  setValues((v) => ({ ...v, ...recovered }));
                  setRecovered(null);
                }}
              >
                {ui.resume}
              </button>{" "}
              ·{" "}
              <button type="button" className="underline underline-offset-4" onClick={() => setRecovered(null)}>
                {ui.ignore}
              </button>
            </Banner>
          )}
          {notice && (
            <Banner tone={notice.tone} onClose={() => setNotice(null)}>
              {notice.text}{" "}
              {notice.actions === "viewSite" && (
                <a href={`/${lang}/`} target="_blank" rel="noopener" className="font-semibold underline underline-offset-4">
                  {ui.viewSite}
                </a>
              )}
              {notice.actions === "signin" && (
                <a href="/admin/login/" className="font-semibold underline underline-offset-4">
                  {ui.signInAgain}
                </a>
              )}
              {notice.actions === "conflict" && (
                <span className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-ghost !min-h-9 text-sm" onClick={() => window.location.reload()}>
                    {ui.reload}
                  </button>
                  <button type="button" className="btn btn-primary !min-h-9 text-sm" disabled={busy !== null} onClick={() => doPublish(true)}>
                    {ui.overwrite}
                  </button>
                </span>
              )}
            </Banner>
          )}
          {errors.length > 0 && (
            <Banner tone="error">
              {fill(ui.errorsBlock, { n: errors.length })}{" "}
              <button type="button" className="font-semibold underline underline-offset-4" onClick={() => jumpTo(errors[0].key)}>
                {ui.showIssues}
              </button>
            </Banner>
          )}
          {!errors.length && warnings.length > 0 && dirty.length > 0 && (
            <Banner tone="warning">
              {fill(ui.warnings, { n: warnings.length })}{" "}
              <button type="button" className="font-semibold underline underline-offset-4" onClick={() => jumpTo(warnings[0].key)}>
                {ui.showIssues}
              </button>
            </Banner>
          )}
        </div>

        {tab === "texts" && <TextsTab />}
        {tab === "units" && <UnitsTab onUnitChange={onUnitChange} onDateEdit={() => (dateEdited.current = true)} />}
        {tab === "photos" && <PhotosTab />}
        {tab === "contact" && <ContactTab />}
        {tab === "building" && <BuildingTab />}
      </main>

      <dialog
        ref={dialogRef}
        onClose={() => setDialog(false)}
        className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-[1.25rem] bg-white p-0 text-ink backdrop:bg-ink/60"
      >
        <div className="p-6 sm:p-8">
          <h2 className="h3 text-[1.5rem]">{ui.dialogTitle}</h2>
          <p className="mt-1 text-[0.9375rem] text-steel">{ui.dialogBody}</p>
          <ul className="mt-5 grid max-h-64 gap-1.5 overflow-y-auto rounded-xl bg-paper p-4 text-[0.9375rem]">
            {dirty.slice(0, 12).map((k) => (
              <li key={k} className="flex gap-2">
                <span aria-hidden className="text-teal">•</span>
                {keyLabel(k)[lang]}
              </li>
            ))}
            {dirty.length > 12 && <li className="text-steel">{fill(ui.moreChanges, { n: dirty.length - 12 })}</li>}
          </ul>
          <label className="mt-5 block text-sm font-semibold">
            {ui.noteLabel}
            <input
              value={note}
              maxLength={200}
              placeholder={ui.notePlaceholder}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-line px-3 py-2.5 font-normal outline-none focus:border-teal focus:ring-3 focus:ring-teal/20"
            />
          </label>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-ghost !min-h-11 text-sm text-slate" onClick={() => setDialog(false)}>
              {ui.cancel}
            </button>
            <button type="button" className="btn btn-primary !min-h-11 text-sm disabled:opacity-50" disabled={busy !== null} onClick={() => doPublish()}>
              {busy === "publish" ? ui.publishing : ui.confirmPublish}
            </button>
          </div>
        </div>
      </dialog>
    </EditorContext.Provider>
  );
}

function Banner({
  tone,
  children,
  onClose,
}: {
  tone: "success" | "error" | "info" | "warning";
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const cls = {
    success: "border-teal/40 bg-mint/60 text-slate",
    error: "border-red-300 bg-red-50 text-red-900",
    info: "border-line bg-white text-ink",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-[0.9375rem] ${cls}`}>
      <div>{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="×" className="-mr-1 shrink-0 rounded px-1.5 text-lg leading-none opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}
