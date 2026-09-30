import type { Dictionary } from "@/content/fr";
import { Arrow, Check } from "./icons";

export default function WhyOwn({ t }: { t: Dictionary }) {
  const s = t.why;
  return (
    <section aria-labelledby="why-title" className="bg-paper-2 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="eyebrow text-teal">{s.eyebrow}</p>
            <h2 id="why-title" className="h2 mt-4 max-w-3xl">
              {s.title}
            </h2>
          </div>
          <p className="lead text-steel lg:col-span-5">{s.lead}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="rounded-[1.25rem] border border-line bg-white p-6 sm:p-9 lg:col-span-7">
            <h3 className="eyebrow text-teal">{s.ownerTitle}</h3>
            <ul className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {s.items.map((item) => (
                <li key={item.title} className="grid grid-cols-[1.75rem_1fr] gap-x-3.5">
                  <span aria-hidden className="grid h-7 w-7 place-items-center rounded-md bg-slate text-mint">
                    <Check />
                  </span>
                  <div>
                    <h4 className="h3 text-[1.0625rem]">{item.title}</h4>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-steel">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="on-dark flex flex-col rounded-[1.25rem] bg-slate p-6 text-white sm:p-9 lg:col-span-5">
            <p className="eyebrow text-mint/80">{s.investor.eyebrow}</p>
            <h3 className="h3 mt-3 text-[1.75rem]">{s.investor.title}</h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/70">{s.investor.body}</p>
            <ul className="mt-6 grid gap-3 border-t border-white/15 pt-6">
              {s.investor.points.map((p) => (
                <li key={p} className="flex items-center gap-3 font-semibold">
                  <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-mint text-slate">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <a href="#contact" data-intent="question" className="btn btn-mint mt-8 self-start">
              {s.investor.cta}
              <Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
