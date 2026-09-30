import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boul-Industriel-Montreal",
  robots: { index: false },
  icons: { icon: "/favicon.svg" },
  alternates: { languages: { "fr-CA": "/fr/", "en-CA": "/en/" } },
};

// Static export can't redirect on the server: send French browsers to /fr/, everyone else to /en/.
const pickLanguage = `(function(){var l=(navigator.languages&&navigator.languages[0])||navigator.language||"fr";location.replace(/^fr/i.test(l)?"/fr/":"/en/")})();`;

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
