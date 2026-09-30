"use client";

/** Language switch that keeps the reader at the same section (#hash). */
export default function LangLink({
  href,
  label,
  hrefLang,
  current,
  className,
  children,
}: {
  href: string;
  label: string;
  hrefLang: string;
  current?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      hrefLang={hrefLang}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={className}
      onClick={(e) => {
        if (current) {
          e.preventDefault();
          return;
        }
        if (!window.location.hash) return;
        e.preventDefault();
        window.location.href = href + window.location.hash;
      }}
    >
      {children}
    </a>
  );
}
