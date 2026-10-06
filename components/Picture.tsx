import type { ImageSource } from "@/lib/cms/types";

interface Props {
  image: ImageSource | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Responsive AVIF/WebP picture from a pre-optimized set (build-time or uploaded), with a blurred placeholder. */
export default function Picture({ image: img, alt, sizes, priority, className }: Props) {
  if (!img) return null;
  const srcset = (ext: string) => img.widths.map((w) => `${img.base}${w}.${ext} ${w}w`).join(", ");
  const fallback = `${img.base}${img.widths[Math.min(1, img.widths.length - 1)]}.webp`;

  return (
    <picture>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        width={img.width}
        height={img.height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={className}
        style={{ backgroundImage: `url(${img.blur})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
    </picture>
  );
}
