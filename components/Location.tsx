import type { Dictionary } from "@/content/fr";
import { project } from "@/content/project";
import { fill } from "@/lib/i18n";
import MapFacade from "./MapFacade";
import Picture from "./Picture";

export default function Location({ t }: { t: Dictionary }) {
  const l = t.location;
  const a40 = project.driveTimes.find((d) => d.key === "a40")!.min;

  return (
    <section id="location" aria-labelledby="location-title" className="bg-paper-2 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-5">
          <p className="eyebrow text-teal">{l.eyebrow}</p>
          <h2 id="location-title" className="h2 mt-4">
            {fill(l.title, { a40 })}
          </h2>
          <p className="lead mt-5 text-steel">{l.lead}</p>

          <div className="sign mt-10 px-6 py-6 sm:px-8 sm:py-7">
            <h3 className="eyebrow text-white/70">{l.timesTitle}</h3>
            <ul className="mt-3 divide-y divide-white/20">
              {project.driveTimes.map((d) => (
                <li key={d.key} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span className="font-semibold" style={{ fontVariationSettings: '"wdth" 94' }}>
                    {l.places[d.key]}
                  </span>
                  <span className="mono whitespace-nowrap text-lg font-semibold text-mint">
                    {d.min}
                    <span className="ml-1 text-sm font-normal text-white/70">{l.min}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-sm text-steel">{l.timesNote}</p>
        </div>

        <div className="min-h-[440px] overflow-hidden rounded-[1.25rem] bg-slate lg:col-span-7 lg:min-h-0">
          <MapFacade
            query={project.mapsQuery}
            title={l.mapTitle}
            loadLabel={l.loadMap}
            openLabel={l.openMaps}
            address={l.address}
          >
            <Picture name={project.images.map} alt="" sizes="(min-width: 1024px) 58vw, 100vw" className="h-full w-full object-cover" />
          </MapFacade>
        </div>
      </div>
    </section>
  );
}
