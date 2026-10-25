import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import { project } from "@/content/project";
import { getSiteContent } from "@/lib/cms/content";
import { fill, formatNumber } from "@/lib/format";
import { isLocale, locales } from "@/lib/i18n";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

// Production origin, used for canonical URLs and the social preview image
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com";

// fr and en are prerendered. Other segments render on demand and hit notFound() below; `dynamicParams = false`
// is left off because on-demand revalidation can turn such routes into 404s (Next.js issue #58137).
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#f3f5f2",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const site = await getSiteContent();
  const t = site.dict[lang];
  const description = fill(t.meta.description, {
    min: formatNumber(t.locale, site.areaRange[0]),
    max: formatNumber(t.locale, site.areaRange[1]),
    a40: site.driveTimes.find((d) => d.key === "a40")?.min ?? 0,
  });
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description,
    icons: { icon: "/favicon.svg" },
    alternates: {
      canonical: `/${lang}/`,
      languages: { "fr-CA": "/fr/", "en-CA": "/en/", "x-default": "/fr/" },
    },
    openGraph: {
      type: "website",
      siteName: project.company,
      locale: t.locale.replace("-", "_"),
      title: t.meta.title,
      description,
      url: `/${lang}/`,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: t.hero.photoAlt }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description, images: ["/og.jpg"] },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang === "fr" ? "fr-CA" : "en-CA"} className={fontVariables}>
      <body>
        <GoogleTagManagerNoScript />
        {children}
        <GoogleTagManager />
      </body>
    </html>
  );
}
