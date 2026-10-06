import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { getAdminLang } from "./lang";
import "../globals.css";

export const metadata: Metadata = {
  title: "Administration · Boul-Industriel-Montreal",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1d3a3c",
  width: "device-width",
  initialScale: 1,
};

// Its own root layout: the site's /[lang] layout sets the page language from the URL.
// Sessions are checked in each page and action, not here (layouts don't re-run on navigation).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const lang = await getAdminLang();
  return (
    <html lang={lang === "fr" ? "fr-CA" : "en-CA"} className={fontVariables}>
      <body className="bg-paper-2 text-ink">{children}</body>
    </html>
  );
}
