import images from "@/content/images.json";

type ImageName = keyof typeof images;

interface Props {
  name: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Responsive AVIF/WebP picture from the pre-optimized set, with a blurred placeholder. */
export default function Picture({ name, alt, sizes, priority, className }: Props) {
  const img = images[name as ImageName];
  if (!img) return null;
  const srcset = (ext: string) => img.widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(", ");
  const fallback = `/images/${name}-${img.widths[Math.min(1, img.widths.length - 1)]}.webp`;

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
