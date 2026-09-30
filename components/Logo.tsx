/** Glyph: the building plan in miniature, one unit lit. */
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="7" fill="#1d3a3c" />
      <path d="M6 10.5h20v11H6z" fill="none" stroke="#d4f0c9" strokeWidth="1.6" />
      <path d="M6 16h20M11 10.5v11M16 10.5v11M21 10.5v11" stroke="#d4f0c9" strokeWidth="1" strokeOpacity=".55" />
      <path d="M16 16h5v5.5h-5z" fill="#d4f0c9" />
    </svg>
  );
}

export default function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoGlyph className="h-9 w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={`text-[1.0625rem] font-[760] tracking-[-0.02em] ${tone === "dark" ? "text-ink" : "text-white"}`}
          style={{ fontVariationSettings: '"wdth" 112' }}
        >
          Boul-Industriel
        </span>
        <span className={`eyebrow mt-1 !text-[0.625rem] !tracking-[0.3em] ${tone === "dark" ? "text-steel" : "text-white/60"}`}>
          Montreal
        </span>
      </span>
    </span>
  );
}
