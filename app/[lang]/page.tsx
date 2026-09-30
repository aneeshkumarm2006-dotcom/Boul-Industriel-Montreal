import { notFound } from "next/navigation";
import { fill, getDictionary, isLocale } from "@/lib/i18n";
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
      ...(u.sqft ? { value: `${u.sqft} sq ft` } : {}),
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
        {project.images.interior.length > 0 && (
          <Gallery
            id="interior"
            group="interior"
            eyebrow={t.interior.eyebrow}
            title={t.interior.title}
            names={project.images.interior}
            alt={(name, i) => t.gallery.alts[name] ?? fill(t.interior.alt, { i: i + 1 })}
            t={t}
            className="pb-20 sm:pb-28"
          />
        )}
        <WhyOwn t={t} />
        <Building t={t} />
        <Gallery
          id="photos"
          group="exterior"
          eyebrow={t.gallery.eyebrow}
          title={t.gallery.title}
          names={project.images.gallery}
          alt={(name) => t.gallery.alts[name] ?? ""}
          t={t}
          className="pb-20 sm:pb-28"
        />
        <Location t={t} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} />
      <MobileBar t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
