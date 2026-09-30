"use client";

import { useState } from "react";
import { Arrow } from "./icons";

/** Loads the Google Maps iframe only on request, keeping ~1 MB of map scripts off the initial load. */
export default function MapFacade({
  query,
  title,
  loadLabel,
  openLabel,
  address,
  children,
}: {
  query: string;
  title: string;
  loadLabel: string;
  openLabel: string;
  address: string;
  children: React.ReactNode; // backdrop shown until the map loads
}) {
  const [loaded, setLoaded] = useState(false);
  const q = encodeURIComponent(query);

  if (loaded) {
    return (
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${q}&z=14&output=embed`}
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    <div className="relative isolate flex h-full w-full items-end overflow-hidden">
      <div className="absolute inset-0 -z-10">{children}</div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,29,30,0)_25%,rgba(15,29,30,.62)_58%,rgba(15,29,30,.9)_100%)]" />
      <div className="on-dark w-full p-5 text-white sm:p-7">
        <p className="flex items-start gap-3 font-semibold leading-snug" style={{ fontVariationSettings: '"wdth" 104' }}>
          <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-mint ring-4 ring-mint/25" />
          <span className="whitespace-pre-line">{address}</span>
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button type="button" onClick={() => setLoaded(true)} className="btn btn-mint">
            {loadLabel}
          </button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${q}`}
            target="_blank"
            rel="noopener"
            className="btn btn-ghost text-white"
          >
            {openLabel}
            <Arrow className="arrow h-4 w-4 -rotate-45" />
          </a>
        </div>
      </div>
    </div>
  );
}
