import { exitPreview } from "@/app/admin/exit-preview";

/** Shown on the site while an admin previews unpublished content (draft mode); only ever rendered dynamically. */
export default function PreviewBanner({ lang }: { lang: "fr" | "en" }) {
  const fr = lang === "fr";
  return (
    <div
      role="status"
      className="on-dark fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-ink px-4 py-2 text-sm text-white shadow-lg"
    >
      <span>
        <strong className="text-mint">{fr ? "Aperçu" : "Preview"}</strong>{" "}
        {fr ? "Ces modifications ne sont pas publiées." : "These changes aren't published."}
      </span>
      <form action={exitPreview.bind(null, lang)}>
        <button type="submit" className="rounded-md px-2 py-1 font-semibold text-mint underline underline-offset-4 hover:text-white">
          {fr ? "Quitter l'aperçu" : "Exit preview"}
        </button>
      </form>
    </div>
  );
}
