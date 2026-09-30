"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow } from "./icons";

/** Sideways-scrolling row of civic plates with the pricing card pinned at the end. */
export default function PlateStrip({
  label,
  hint,
  prev,
  next,
  price,
  children,
}: {
  label: string;
  hint: string;
  prev: string;
  next: string;
  price: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  const arrow = "grid h-8 w-8 place-items-center rounded-md text-mint transition-colors hover:bg-slate-3 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="relative z-10 mx-4 -mt-8 overflow-hidden rounded-xl bg-slate shadow-[0_28px_60px_-28px_rgba(15,29,30,.7)] sm:mx-8 sm:-mt-14 lg:mx-14">
      <div className="flex items-center justify-between gap-4 border-b border-white/12 py-2 pl-4 pr-2 sm:pl-5">
        <h2 className="eyebrow text-mint/85">{label}</h2>
        <div className="flex items-center gap-1">
          <span className="eyebrow mr-2 hidden text-white/45 sm:inline">{hint}</span>
          <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label={prev} className={arrow}>
            <Arrow className="h-4 w-4 rotate-180" />
          </button>
          <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label={next} className={arrow}>
            <Arrow className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-[1fr_13rem] lg:grid-cols-[1fr_15rem]">
        <div className="relative min-w-0">
          <ul ref={ref} className="plate-scroll flex snap-x snap-mandatory gap-px overflow-x-auto bg-white/12">
            {children}
          </ul>
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate transition-opacity ${edge.end ? "opacity-0" : "opacity-100"}`}
          />
        </div>
        <div className="border-t border-white/12 sm:border-l sm:border-t-0">{price}</div>
      </div>
    </div>
  );
}
