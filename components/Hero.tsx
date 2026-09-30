import type { Dictionary } from "@/content/fr";
import { forSale, project, sqftRange } from "@/content/project";
import hero from "@/content/hero.json";
import { fill, formatNumber } from "@/lib/i18n";
import Picture from "./Picture";
import { Arrow } from "./icons";

export default function Hero({ t }: { t: Dictionary }) {
  const n = (v: number) => formatNumber(t.locale, v);
  const count = forSale.length;
  const a40 = project.driveTimes.find((d) => d.key === "a40")!.min;

  return (
    <section id="top" aria-labelledby="hero-title" className="relative pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        <p className="eyebrow text-steel">{t.hero.eyebrow}</p>
        <div className="mt-5 grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h1 id="hero-title" className="display text-[2.55rem] sm:text-[3.7rem] lg:col-span-8 lg:text-[4.75rem] xl:text-[5.1rem]">
            <span className="hero-count">{count}</span> {count === 1 ? t.hero.count.one : t.hero.count.other}{" "}
            {t.hero.rest}
          </h1>
          <div className="lg:col-span-4 lg:pb-1.5">
            <p className="lead text-steel">
              {fill(t.hero.lead, { min: n(sqftRange[0]), max: n(sqftRange[1]), a40 })}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#units" className="btn btn-primary">
                {t.hero.ctaPrimary}
                <Arrow />
              </a>
              <a href="#contact" data-intent="prices" className="btn btn-ghost text-ink">
                {t.hero.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[90rem] sm:mt-12 sm:px-6 lg:px-8">
        <HeroAerial t={t} count={count} />
        <Plates t={t} />
      </div>
    </section>
  );
}

/**
 * The aerial is cropped with object-fit: cover semantics, but done by hand: the inner frame always keeps
 * the photo's exact aspect ratio, so the SVG outline and the pin stay locked to the building at every width.
 */
function HeroAerial({ t, count }: { t: Dictionary; count: number }) {
  const { width: W, height: H, outline, pin } = hero;
  const points = outline.map((p) => p.join(",")).join(" ");
  const shade = `M0 0H${W}V${H}H0Z M${outline.map((p) => p.join(" ")).join(" L")}Z`;

  return (
    <figure className="relative aspect-[4/3] overflow-hidden bg-slate [container-type:size] sm:aspect-[16/9] sm:rounded-[1.25rem] lg:aspect-[1730/660]">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `max(100cqw, calc(100cqh * ${W} / ${H}))`, aspectRatio: `${W} / ${H}` }}
      >
        <Picture
          name={hero.image}
          alt={t.hero.photoAlt}
          sizes="(min-width: 1440px) 1376px, 100vw"
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 h-full w-full">
          <path d={shade} fillRule="evenodd" fill="#0f1d1e" fillOpacity={0.3} className="outline-shade" />
          <polygon points={points} fill="#d4f0c9" fillOpacity={0.16} className="outline-fill" />
          <polygon
            points={points}
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeLinejoin="round"
            className="outline-draw [stroke-width:6] sm:[stroke-width:4]"
          />
        </svg>

        <div className="pin-in absolute" style={{ left: `${(pin[0] / W) * 100}%`, top: `${(pin[1] / H) * 100}%` }}>
          <span aria-hidden className="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint ring-4 ring-ink/25" />
          <span aria-hidden className="absolute bottom-0 left-0 h-14 w-px -translate-x-1/2 bg-white/90 sm:h-20" />
          <span className="absolute bottom-14 left-0 -translate-x-1/2 whitespace-nowrap rounded-lg bg-paper px-3 py-2 text-ink shadow-[0_12px_32px_-12px_rgba(15,29,30,.55)] sm:bottom-20 sm:px-3.5 sm:py-2.5">
            <span className="block text-[0.8125rem] font-[680] sm:text-[0.9375rem]" style={{ fontVariationSettings: '"wdth" 108' }}>
              {t.hero.pinTitle}
            </span>
            <span className="eyebrow mt-0.5 block !text-[0.625rem] text-steel sm:!text-[0.6875rem]">
              {fill(t.hero.pinDetail, { n: count })}
            </span>
          </span>
        </div>
      </div>
    </figure>
  );
}

/** Civic-number plates: the five addresses for sale, set like the numbers painted over each door. */
function Plates({ t }: { t: Dictionary }) {
  const n = (v: number) => formatNumber(t.locale, v);
  return (
    <div className="relative z-10 mx-4 -mt-8 sm:mx-8 sm:-mt-14 lg:mx-14">
      <h2 className="sr-only">{t.hero.platesLabel}</h2>
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/12 shadow-[0_28px_60px_-28px_rgba(15,29,30,.7)] sm:grid-cols-3 lg:grid-cols-[repeat(5,1fr)_1.2fr]">
        {forSale.map((u) => (
          <li key={u.id} className="bg-slate">
            <a
              href="#units"
              data-unit={u.id}
              aria-label={fill(t.hero.plateAria, { unit: u.civics.join(" + "), sqft: n(u.sqft) })}
              className="group flex h-full flex-col justify-between gap-6 p-4 transition-colors hover:bg-slate-2 sm:p-5"
            >
              <span className="flex items-baseline gap-1.5">
                <span className="civic text-[1.7rem] text-mint sm:text-[2rem]">{u.civics[0]}</span>
                {u.civics.length > 1 && <span className="mono text-xs text-mint/70">+{u.civics[1]}</span>}
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="mono text-sm text-white/75">
                  {n(u.sqft)} {t.units.sqft}
                </span>
                <span aria-hidden className="text-mint/0 transition-colors group-hover:text-mint">
                  <Arrow className="h-3.5 w-3.5 rotate-90" />
                </span>
              </span>
            </a>
          </li>
        ))}
        <li className="bg-mint">
          <a
            href="#contact"
            data-intent="prices"
            className="flex h-full flex-col justify-between gap-6 p-4 text-slate transition-colors hover:bg-white sm:p-5"
          >
            <span className="eyebrow">{t.hero.price}</span>
            <span className="h3 flex items-center gap-2 text-[1.05rem]">
              {t.hero.priceCta}
              <Arrow />
            </span>
          </a>
        </li>
      </ul>
    </div>
  );
}
