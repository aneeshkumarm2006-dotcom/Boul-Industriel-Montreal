import type { Dictionary } from "@/content/fr";
import { project } from "@/content/project";
import Logo from "./Logo";

export default function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="on-dark bg-ink pb-28 pt-14 text-white/65 md:pb-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-5">
          <Logo tone="light" />
          <p className="mt-5 text-[0.9375rem] leading-relaxed">
            {project.civicRange}, {project.street}
            <br />
            {project.borough}, {project.city} ({project.province}) {project.postalCode}
          </p>
        </div>
        <div className="text-sm leading-relaxed md:col-span-7">
          <p className="max-w-xl">{t.footer.disclaimer}</p>
          <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
            <span>
              © {new Date().getFullYear()} {project.company}. {t.footer.rights}
            </span>
            <span aria-hidden>·</span>
            <span>{t.footer.credit}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
