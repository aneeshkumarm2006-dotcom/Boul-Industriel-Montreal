import type { Dictionary } from "@/content/fr";
import { project } from "@/content/project";
import { fill } from "@/lib/i18n";
import UnitDrawing from "./UnitDrawing";

export default function Included({ t }: { t: Dictionary }) {
  const s = t.included;
  return (
    <section id="included" aria-labelledby="included-title" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
          <p className="eyebrow text-teal">{s.eyebrow}</p>
          <h2 id="included-title" className="h2 mt-4">
            {s.title}
          </h2>
          <p className="lead mt-5 max-w-xl text-steel">{s.lead}</p>

          <ol className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {s.items.map((item, i) => (
              <li key={item.title} className="grid grid-cols-[2rem_1fr] gap-x-4">
                <span
                  aria-hidden
                  className="mono grid h-8 w-8 place-items-center rounded-full bg-slate text-sm font-bold text-mint"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="h3 text-[1.0625rem]">{item.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-steel">
                    {fill(item.body, { gal: project.unitFeatures.waterHeaterGallons })}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className="self-start rounded-[1.25rem] border border-line bg-white p-5 sm:p-8 lg:col-span-6 lg:row-start-1">
          <UnitDrawing d={s.drawing} title={s.drawingTitle} />
          <figcaption className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line pt-4">
            <span className="eyebrow text-ink">{s.drawingTitle}</span>
            <span className="text-sm text-steel">{s.drawingNote}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
