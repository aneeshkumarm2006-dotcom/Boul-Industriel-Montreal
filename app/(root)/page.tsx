import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boul-Industriel-Montreal",
  robots: { index: false },
  icons: { icon: "/favicon.svg" },
  alternates: { languages: { "fr-CA": "/fr/", "en-CA": "/en/" } },
};

// Static export can't redirect on the server. The site opens in French; the FR / EN toggle switches to English.
const pickLanguage = `location.replace("/fr/"+location.hash);`;

export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: pickLanguage }} />
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/fr/" />
      </noscript>
      <p style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <a href="/fr/">Français</a> · <a href="/en/">English</a>
      </p>
    </>
  );
}
