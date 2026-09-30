import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import Logo from "@/components/Logo";
import { Arrow } from "@/components/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page introuvable · Page not found | Boul-Industriel-Montreal",
  robots: { index: false },
  icons: { icon: "/favicon.svg" },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr-CA" className={fontVariables}>
      <body>
        <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-4 py-16 sm:px-6">
          <a href="/fr/" aria-label="Boul-Industriel-Montreal" className="self-start">
            <Logo />
          </a>
          <p className="eyebrow mt-14 text-teal">404</p>
          <h1 className="display mt-4 text-[2.6rem] sm:text-[4rem]">Aucune unité à cette adresse.</h1>
          <p lang="en" className="lead mt-4 text-steel">
            There&apos;s no unit at this address.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/fr/" className="btn btn-primary">
              Voir les unités à vendre
              <Arrow />
            </a>
            <a href="/en/" lang="en" className="btn btn-ghost text-ink">
              See the units for sale
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
