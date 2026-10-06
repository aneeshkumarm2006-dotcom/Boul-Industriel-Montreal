"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setAdminLang } from "@/app/admin/actions";
import type { AdminLang } from "@/app/admin/i18n";

/** Switches the admin interface between French and English (the site content is always edited in both). */
export default function LangSwitch({ lang, label, className = "" }: { lang: AdminLang; label: string; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setAdminLang(lang === "fr" ? "en" : "fr");
          router.refresh();
        })
      }
      lang={lang === "fr" ? "en" : "fr"}
      className={`eyebrow rounded-md px-2.5 py-2 text-steel transition-colors hover:bg-paper-2 hover:text-ink disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  );
}
