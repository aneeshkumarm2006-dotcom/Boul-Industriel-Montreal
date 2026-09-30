import type { Dictionary } from "@/content/fr";
import { project } from "@/content/project";
import images from "@/content/images.json";
import { fill } from "@/lib/i18n";
import Picture from "./Picture";
import Lightbox, { type Slide } from "./Lightbox";
import { Expand } from "./icons";

const layout = [
  "col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto",
  "aspect-square sm:aspect-auto",
  "aspect-square sm:aspect-auto",
  "aspect-square sm:aspect-auto",
  "aspect-square sm:aspect-auto",
];

export default function Gallery({ t }: { t: Dictionary }) {
  const s = t.gallery;
  const names = project.images.gallery;
  const slides: Slide[] = names.map((name) => {
    const img = images[name as keyof typeof images];
    const set = (ext: string) => img.widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(", ");
    return {
      avif: set("avif"),
      webp: set("webp"),
      src: `/images/${name}-${img.widths.at(-1)}.webp`,
      alt: s.alts[name] ?? "",
      w: img.width,
      h: img.height,
    };
  });

  return (
    <section id="photos" aria-labelledby="gallery-title" className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-t border-line pt-10 sm:pt-14">
          <p className="eyebrow text-teal">{s.eyebrow}</p>
          <h2 id="gallery-title" className="h2 mt-4">
            {s.title}
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:h-[600px] sm:grid-cols-4 sm:grid-rows-2 sm:gap-3">
          {names.map((name, i) => (
            <li key={name} className={`relative overflow-hidden rounded-xl bg-paper-2 ${layout[i] ?? ""}`}>
              <button
                type="button"
                data-lightbox={i}
                aria-label={fill(s.open, { alt: s.alts[name] ?? "" })}
                className="group block h-full w-full"
              >
                <Picture
                  name={name}
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
      <Lightbox
        slides={slides}
        labels={{ close: s.close, prev: s.prev, next: s.next, counter: s.counter }}
      />
    </section>
  );
}
