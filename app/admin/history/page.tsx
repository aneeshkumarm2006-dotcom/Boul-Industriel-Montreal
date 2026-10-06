import Logo from "@/components/Logo";
import HistoryActions from "@/components/admin/HistoryActions";
import { requireAdmin } from "@/lib/cms/session";
import { canWrite, listVersions, readDoc } from "@/lib/cms/store";
import { fill } from "@/lib/format";
import { getUI } from "../lang";

export default async function HistoryPage() {
  await requireAdmin();
  const { lang, ui } = await getUI();
  const h = ui.history;
  const versions = (await listVersions()).slice(0, 30);
  const docs = await Promise.all(versions.map(async (v) => ({ ref: v, doc: await readDoc(v.id).catch(() => null) })));
  const date = (iso: string) =>
    new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Toronto",
    }).format(new Date(iso));

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/admin/" aria-label={ui.appName}>
            <Logo />
          </a>
          <a href="/admin/" className="text-sm font-semibold text-teal hover:text-slate">
            ← {h.back}
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="h3 text-[1.75rem]">{h.title}</h1>
        <p className="mt-1 text-[0.9375rem] text-steel">{h.intro}</p>
        {docs.length === 0 ? (
          <p className="mt-8 rounded-xl border border-line bg-white p-6 text-steel">{h.empty}</p>
        ) : (
          <ol className="mt-8 grid gap-3">
            {docs.map(({ ref, doc }, i) => {
              const savedAt = doc?.savedAt ?? ref.savedAt;
              return (
                <li key={ref.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {date(savedAt)}
                      {i === 0 && <span className="eyebrow ml-3 rounded bg-mint px-1.5 py-0.5 !text-[0.625rem] text-slate">{h.current}</span>}
                    </p>
                    <p className="mt-0.5 text-sm text-steel">
                      {[
                        doc?.savedBy && fill(h.by, { name: doc.savedBy }),
                        doc?.restoredFrom && fill(h.restoredFrom, { date: date(doc.restoredFrom) }),
                        doc?.note,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <HistoryActions id={ref.id} current={i === 0} lang={lang} dateLabel={date(savedAt)} writable={canWrite()} />
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </>
  );
}
