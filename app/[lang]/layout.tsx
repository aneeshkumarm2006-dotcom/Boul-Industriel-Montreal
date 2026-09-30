import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { fill, formatNumber, getDictionary, isLocale, locales } from "@/lib/i18n";
import { fontVariables } from "@/lib/fonts";
import { project, sqftRange } from "@/content/project";
import "../globals.css";

// Production origin, used for canonical URLs and the social preview image
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com";

export const dynamicParams = false;

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
  const t = getDictionary(lang);
  const description = fill(t.meta.description, {
    min: formatNumber(t.locale, sqftRange[0]),
    max: formatNumber(t.locale, sqftRange[1]),
    a40: project.driveTimes[0].min,
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
      <body>{children}</body>
    </html>
  );
}
