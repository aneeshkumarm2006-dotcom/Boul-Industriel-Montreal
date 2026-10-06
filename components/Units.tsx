import type { Dictionary } from "@/content/fr";
import type { PlanLayout } from "@/lib/cms/plan";
import type { UnitForSale } from "@/lib/cms/types";
import UnitPlan from "./UnitPlan";

export default function Units({
  t,
  layout,
  forSale,
  sold,
  asOf,
}: {
  t: Dictionary;
  layout: PlanLayout;
  forSale: UnitForSale[];
  sold: string[];
  asOf: string;
}) {
  const s = t.plan;
  return (
    <section id="units" aria-labelledby="units-title" className="on-dark bg-slate py-20 text-white sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 grid max-w-7xl gap-6 lg:mb-16 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="eyebrow text-mint/80">{s.eyebrow}</p>
            <h2 id="units-title" className="h2 mt-4">
              {s.title}
            </h2>
          </div>
          <p className="lead text-white/70 lg:col-span-5">{s.intro}</p>
        </div>
        <UnitPlan s={s} locale={t.locale} sqft={t.units.sqft} layout={layout} forSale={forSale} sold={sold} asOf={asOf} />
      </div>
    </section>
  );
}
