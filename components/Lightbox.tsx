"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow } from "./icons";

export interface Slide {
  avif: string;
  webp: string;
  src: string;
  alt: string;
  w: number;
  h: number;
}

/** Native <dialog> lightbox, opened by any [data-lightbox="<group>:<index>"] button on the page. */
export default function Lightbox({
  group,
  slides,
  labels,
}: {
  group: string;
  slides: Slide[];
  labels: { close: string; prev: string; next: string; counter: string };
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-lightbox]");
      const [g, i] = btn?.dataset.lightbox?.split(":") ?? [];
      if (g !== group) return;
      setIndex(Number(i));
      ref.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [group]);

  const go = (d: number) => setIndex((i) => (i === null ? i : (i + d + slides.length) % slides.length));
  const slide = index === null ? null : slides[index];

  return (
    <dialog
      ref={ref}
      onClose={() => setIndex(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="on-dark m-auto max-h-[94vh] max-w-[94vw] bg-transparent p-0 text-white backdrop:bg-ink/92 backdrop:backdrop-blur-sm"
    >
      {slide && (
        <figure>
          <picture>
            <source type="image/avif" srcSet={slide.avif} sizes="94vw" />
            <source type="image/webp" srcSet={slide.webp} sizes="94vw" />
            <img
              src={slide.src}
              alt={slide.alt}
              width={slide.w}
              height={slide.h}
              className="h-auto max-h-[80vh] w-auto max-w-[94vw] rounded-lg object-contain"
            />
          </picture>
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="max-w-xl text-sm text-white/80">
              <span className="mono mr-3 text-mint">
                {labels.counter.replace("{i}", String(index! + 1)).replace("{n}", String(slides.length))}
              </span>
              {slide.alt}
            </span>
            <span className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className="btn btn-ghost !min-h-10 !px-3 text-white">
                <Arrow className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={labels.next} className="btn btn-ghost !min-h-10 !px-3 text-white">
                <Arrow className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => ref.current?.close()} className="btn btn-mint !min-h-10 !px-4 text-sm" autoFocus>
                {labels.close}
              </button>
            </span>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}
