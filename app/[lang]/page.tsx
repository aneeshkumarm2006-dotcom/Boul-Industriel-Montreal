import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { forSale, project, sqftRange } from "@/content/project";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Units from "@/components/Units";
import Included from "@/components/Included";
import WhyOwn from "@/components/WhyOwn";
import Building from "@/components/Building";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${project.civicRange}, ${project.street}`,
    description: t.meta.title,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${project.civicRange} ${project.street}`,
      addressLocality: project.city,
      addressRegion: project.province,
      postalCode: project.postalCode,
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: project.geo.lat, longitude: project.geo.lng },
    amenityFeature: forSale.map((u) => ({
      "@type": "LocationFeatureSpecification",
      name: `${u.civics.join(" + ")}`,
      value: `${u.sqft} sq ft`,
    })),
    floorSize: { "@type": "QuantitativeValue", minValue: sqftRange[0], maxValue: sqftRange[1], unitCode: "FTK" },
  };

  return (
    <>
      <Header t={t} lang={lang} />
      <main id="main">
        <Hero t={t} />
        <Units t={t} />
        <Included t={t} />
        <WhyOwn t={t} />
        <Building t={t} />
        <Gallery t={t} />
        <Location t={t} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} />
      <MobileBar t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
