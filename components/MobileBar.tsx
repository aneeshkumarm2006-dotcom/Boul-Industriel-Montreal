import type { Dictionary } from "@/content/fr";
import { Phone } from "./icons";

export default function MobileBar({ t, phone }: { t: Dictionary; phone: string }) {
  return (
    <div className="on-dark fixed inset-x-0 bottom-0 z-40 grid grid-cols-[auto_1fr] gap-2 border-t border-white/10 bg-ink/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <a href={`tel:${phone}`} className="btn btn-ghost !px-4 text-white">
        <Phone />
        {t.mobileBar.call}
      </a>
      <a href="#contact" data-intent="prices" className="btn btn-mint">
        {t.mobileBar.cta}
      </a>
    </div>
  );
}
