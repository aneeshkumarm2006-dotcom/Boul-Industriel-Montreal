import { notFound } from "next/navigation";
import { project } from "@/content/project";
import { getSiteContent } from "@/lib/cms/content";
import { buildPlan } from "@/lib/cms/plan";
import { fill } from "@/lib/format";
import { isLocale } from "@/lib/i18n";
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
import PreviewBanner from "@/components/PreviewBanner";

// Publishing from /admin re-renders the page at once (revalidatePath); the daily pass is a safety net
// that also rolls the footer year over
export const revalidate = 86400;

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const site = await getSiteContent();
  const t = site.dict[lang];
  const a40 = site.driveTimes.find((d) => d.key === "a40")?.min ?? 0;

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
    amenityFeature: site.forSale.map((u) => ({
      "@type": "LocationFeatureSpecification",
      name: `${u.civics.join(" + ")}`,
      ...(u.sqft ? { value: `${u.sqft} sq ft` } : {}),
    })),
    floorSize: { "@type": "QuantitativeValue", minValue: site.areaRange[0], maxValue: site.areaRange[1], unitCode: "FTK" },
  };

  return (
    <>
      <Header t={t} lang={lang} />
      <main id="main">
        <Hero t={t} forSale={site.forSale} areaRange={site.areaRange} a40={a40} />
        <Units
          t={t}
          layout={buildPlan(project.plan, site.forSale, site.sold)}
          forSale={site.forSale}
          sold={site.sold}
          asOf={site.availabilityAsOf}
        />
        <Included t={t} />
        {site.interior.length > 0 && (
          <Gallery
            id="interior"
            group="interior"
            eyebrow={t.interior.eyebrow}
            title={t.interior.title}
            photos={site.interior}
            alt={(p, i) => p.alt[lang] || fill(t.interior.alt, { i: i + 1 })}
            t={t}
            className="pb-20 sm:pb-28"
          />
        )}
        <WhyOwn t={t} />
        <Building t={t} building={site.building} />
        <Gallery
          id="photos"
          group="exterior"
          eyebrow={t.gallery.eyebrow}
          title={t.gallery.title}
          photos={site.gallery}
          alt={(p) => p.alt[lang]}
          t={t}
          className="pb-20 sm:pb-28"
        />
        <Location t={t} driveTimes={site.driveTimes} />
        <Contact t={t} lang={lang} forSale={site.forSale} contact={site.contact} />
      </main>
      <Footer t={t} />
      <MobileBar t={t} phone={site.contact.phone} />
      {site.preview && <PreviewBanner lang={lang} />}
      {/* The copy is client-editable now: escape "<" so a title can never close the script tag */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />
    </>
  );
}
