import type { Dictionary } from "@/content/fr";
import type { Photo } from "@/lib/cms/types";
import { fill } from "@/lib/format";
import Picture from "./Picture";
import Lightbox, { type Slide } from "./Lightbox";
import { Expand } from "./icons";

// Five photos: one large, four small. Any other count: one large, the rest in an even grid.
const five = [
  "col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto",
  "aspect-square sm:aspect-auto",
  "aspect-square sm:aspect-auto",
  "aspect-square sm:aspect-auto",
  "aspect-square sm:aspect-auto",
];

export default function Gallery({
  t,
  id,
  group,
  eyebrow,
  title,
  photos: shown,
  alt,
  className,
}: {
  t: Dictionary;
  id: string;
  group: string;
  eyebrow: string;
  title: string;
  photos: readonly Photo[];
  alt: (photo: Photo, i: number) => string;
  className?: string;
}) {
  const s = t.gallery;
  const slides: Slide[] = shown.map((img, i) => {
    const set = (ext: string) => img.widths.map((w) => `${img.base}${w}.${ext} ${w}w`).join(", ");
    return {
      avif: set("avif"),
      webp: set("webp"),
      src: `${img.base}${img.widths.at(-1)}.webp`,
      alt: alt(img, i),
      w: img.width,
      h: img.height,
    };
  });
  const isFive = shown.length === 5;
  const cell = (i: number) =>
    isFive ? five[i] : i === 0 ? "col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto" : "aspect-square sm:aspect-auto";

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-t border-line pt-10 sm:pt-14">
          <p className="eyebrow text-teal">{eyebrow}</p>
          <h2 id={`${id}-title`} className="h2 mt-4">
            {title}
          </h2>
        </div>
        <ul
          className={`grid grid-cols-2 gap-2 sm:gap-3 ${
            isFive ? "sm:h-[600px] sm:grid-cols-4 sm:grid-rows-2" : "sm:auto-rows-[190px] sm:grid-cols-3 lg:auto-rows-[220px] lg:grid-cols-4"
          }`}
        >
          {shown.map((photo, i) => (
            <li key={photo.key} className={`relative overflow-hidden rounded-xl bg-paper-2 ${cell(i)}`}>
              <button
                type="button"
                data-lightbox={`${group}:${i}`}
                aria-label={fill(s.open, { alt: slides[i].alt })}
                className="group block h-full w-full"
              >
                <Picture
                  image={photo}
                  alt=""
                  sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                />
                <span
                  aria-hidden
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Expand />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Lightbox group={group} slides={slides} labels={{ close: s.close, prev: s.prev, next: s.next, counter: s.counter }} />
    </section>
  );
}
