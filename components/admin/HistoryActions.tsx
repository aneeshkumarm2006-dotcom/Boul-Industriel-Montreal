"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { previewVersion, restore } from "@/app/admin/actions";
import { UI_STRINGS, type AdminLang } from "@/app/admin/i18n";
import { fill } from "@/lib/format";

export default function HistoryActions({
  id,
  current,
  lang,
  dateLabel,
  writable,
}: {
  id: string;
  current: boolean;
  lang: AdminLang;
  dateLabel: string;
  writable: boolean;
}) {
  const ui = UI_STRINGS[lang];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function show() {
    const win = window.open("about:blank", "_blank");
    const res = await previewVersion(id, lang);
    if (res.ok && win) win.location.href = res.url;
    else {
      win?.close();
      if (!res.ok) setMessage(res.error === "UNAUTHORIZED" ? ui.sessionExpired : ui.storeError);
    }
  }

  async function bringBack() {
    if (!window.confirm(fill(ui.history.restoreConfirm, { date: dateLabel }))) return;
    setBusy(true);
    const res = await restore(id).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setMessage(ui.history.restored);
      router.refresh();
    } else {
      setMessage(res?.error === "UNAUTHORIZED" ? ui.sessionExpired : res?.error === "READ_ONLY" ? ui.readOnlyError : ui.storeError);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {message && <span className="text-sm font-semibold text-teal">{message}</span>}
      <button type="button" onClick={show} className="rounded-md px-3 py-2 text-sm font-semibold text-slate hover:bg-paper-2">
        {ui.preview}
      </button>
      {!current && writable && (
        <button type="button" onClick={bringBack} disabled={busy} className="btn btn-ghost !min-h-9 text-sm text-slate disabled:opacity-50">
          {busy ? ui.history.restoring : ui.history.restore}
        </button>
      )}
    </div>
  );
}
