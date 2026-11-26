import type { ReactNode } from "react";

// Every project picture in src/assets/projects, by file name, as the
// fingerprinted URL Vite gives it.
const pictures = import.meta.glob<string>("../../assets/projects/*.{avif,webp}", { eager: true, query: "?url", import: "default" });

const url = (image: string, width: number, format: "avif" | "webp") => pictures[`../../assets/projects/${image}-${width}.${format}`];

// Every picture comes 480 and 960 wide; a few also at a wider cut.
const widthsFor = (image: string) => [480, 960, 1120, 1440].filter((width) => url(image, width, "avif"));

export function Screenshot({ image, alt }: { image: string; alt: string }) {
  const widths = widthsFor(image);
  const srcSet = (format: "avif" | "webp") => widths.map((width) => `${url(image, width, format)} ${width}w`).join(", ");
  // The article column: the container less its gutters, up to 46rem.
  const sizes = "(min-width: 72rem) 46rem, calc(100vw - 2.5rem)";
  return (
    <picture className="screenshot">
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <img src={url(image, 960, "webp")} srcSet={srcSet("webp")} sizes={sizes} alt={alt} width={960} height={480} loading="lazy" decoding="async" />
    </picture>
  );
}

export default function Figure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="figure">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
