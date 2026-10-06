import type { Dictionary } from "@/content/fr";
import { project } from "@/content/project";
import type { ContactInfo, UnitForSale } from "@/lib/cms/types";
import { formatNumber } from "@/lib/format";
import ContactForm from "./ContactForm";
import { Mail, Phone } from "./icons";

export default function Contact({
  t,
  lang,
  forSale,
  contact,
}: {
  t: Dictionary;
  lang: string;
  forSale: UnitForSale[];
  contact: Pick<ContactInfo, "phone" | "phoneDisplay" | "email">;
}) {
  const c = t.contact;
  const units = forSale.map((u) => ({
    id: u.id,
    label: u.sqft ? `${u.civics.join(" + ")} · ${formatNumber(t.locale, u.sqft)} ${t.units.sqft}` : u.civics.join(" + "),
  }));

  return (
    <section id="contact" aria-labelledby="contact-title" className="on-dark bg-slate py-20 text-white sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-5">
          <p className="eyebrow text-mint/80">{c.eyebrow}</p>
          <h2 id="contact-title" className="h2 mt-4">
            {c.title}
          </h2>
          <p className="lead mt-5 max-w-md text-white/70">{c.lead}</p>

          <div className="mt-10 border-t border-white/15 pt-6">
            <p className="eyebrow text-white/55">{c.phoneLabel}</p>
            <a
              href={`tel:${contact.phone}`}
              className="mt-2 inline-flex items-center gap-3 text-[1.75rem] font-bold tracking-[-0.01em] text-mint transition-colors hover:text-white"
              style={{ fontVariationSettings: '"wdth" 112' }}
            >
              <Phone className="h-6 w-6" />
              <span className="mono !font-semibold">{contact.phoneDisplay}</span>
            </a>
            <p className="mt-1 text-sm text-white/60">{c.team}</p>
            {contact.email && (
              <>
                <p className="eyebrow mt-7 text-white/55">{c.emailLabel}</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-2 inline-flex items-center gap-2.5 font-semibold text-white transition-colors hover:text-mint"
                >
                  <Mail />
                  {contact.email}
                </a>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <ContactForm
            s={c}
            units={units}
            endpoint={project.contact.formEndpoint}
            email={contact.email}
            phone={contact.phone}
            phoneDisplay={contact.phoneDisplay}
            lang={lang}
          />
        </div>
      </div>
    </section>
  );
}
