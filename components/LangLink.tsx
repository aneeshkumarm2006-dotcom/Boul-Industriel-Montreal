"use client";

/** Language switch that keeps the reader at the same section (#hash). */
export default function LangLink({
  href,
  label,
  hrefLang,
  className,
  children,
}: {
  href: string;
  label: string;
  hrefLang: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      hrefLang={hrefLang}
      aria-label={label}
      className={className}
      onClick={(e) => {
        if (!window.location.hash) return;
        e.preventDefault();
        window.location.href = href + window.location.hash;
      }}
    >
      {children}
    </a>
  );
}
