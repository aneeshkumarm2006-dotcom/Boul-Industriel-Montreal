import type { Dictionary } from "@/content/fr";
import { locales, type Locale } from "@/lib/i18n";
import LangLink from "./LangLink";
import Logo from "./Logo";

export default function Header({ t, lang }: { t: Dictionary; lang: Locale }) {
  const links = [
    ["#units", t.nav.units],
    ["#included", t.nav.included],
    ["#building", t.nav.building],
    ["#location", t.nav.location],
    ["#photos", t.nav.photos],
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only rounded-md focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-slate focus:px-4 focus:py-2 focus:text-white"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <a href="#top" aria-label={t.nav.home} className="shrink-0 rounded-md">
          <Logo />
        </a>

        <nav aria-label={t.nav.menu} className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.9375rem] font-medium">
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-ink/70 transition-colors hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div role="group" aria-label={t.nav.langLabel} className="flex rounded-lg border border-line bg-white p-0.5">
            {locales.map((l) => (
              <LangLink
                key={l}
                href={`/${l}/`}
                hrefLang={l}
                label={t.nav.langNames[l]}
                current={l === lang}
                className={`eyebrow grid h-9 min-w-10 place-items-center rounded-md px-2 transition-colors ${
                  l === lang ? "bg-slate text-mint" : "text-steel hover:bg-paper-2 hover:text-ink"
                }`}
              >
                {l.toUpperCase()}
              </LangLink>
            ))}
          </div>
          <a href="#contact" data-intent="prices" className="btn btn-primary hidden !min-h-10 !px-4 text-sm sm:inline-flex">
            {t.nav.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
