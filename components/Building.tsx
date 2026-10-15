import type { Dictionary } from "@/content/fr";
import { project } from "@/content/project";
import { builtinImage } from "@/lib/cms/defaults";
import type { BuildingFacts } from "@/lib/cms/types";
import { fill, formatNumber } from "@/lib/format";
import Picture from "./Picture";

export default function Building({ t, building: b }: { t: Dictionary; building: BuildingFacts }) {
  const s = t.building;
  const n = (v: number, digits = 0) => formatNumber(t.locale, v, digits);
  const ft = t.units.ft;

  const facts: [string, string][] = [
    [s.facts.area, `${n(b.sqft)} ${t.units.sqft}`],
    [s.facts.units, s.facts.unitsValue],
    [s.facts.size, `≈ ${n(b.lengthFt)} × ${n(b.depthFt)} ${ft}`],
    [s.facts.parking, s.facts.parkingValue],
    [s.facts.zoning, b.zoning],
    [s.facts.transit, s.facts.transitValue],
  ];

  return (
    <section id="building" aria-labelledby="building-title" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-8">
        <div className="lg:col-span-5">
          <p className="eyebrow text-teal">{s.eyebrow}</p>
          <h2 id="building-title" className="h2 mt-4">
            {s.title}
          </h2>
          <p className="lead mt-5 text-steel">
            {fill(s.lead, { sqft: n(b.sqft) })}
          </p>
          <dl className="mt-10 grid grid-cols-2 border-t border-line">
            {facts.map(([k, v], i) => (
              <div key={k} className={`border-b border-line py-4 ${i % 2 ? "pl-5" : "pr-5"}`}>
                <dt className="eyebrow text-steel">{k}</dt>
                <dd className="mt-1.5 text-[1.0625rem] font-semibold" style={{ fontVariationSettings: '"wdth" 104' }}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="overflow-hidden rounded-[1.25rem] bg-paper-2 lg:col-span-7">
          <Picture
            image={builtinImage(project.images.building)}
            alt={s.photoAlt}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="aspect-[4/3] h-full w-full object-cover object-[18%_50%] lg:aspect-[5/4]"
          />
        </figure>
      </div>
    </section>
  );
}
