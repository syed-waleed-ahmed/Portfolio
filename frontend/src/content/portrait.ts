// The hero portrait's responsive sources. The hero renders them and the home
// page's <head> preloads the AVIF set from the same values, so the preload
// always matches the image the browser picks and it is fetched once.

const widths = [
  { file: "Profile-192", width: 192 },
  { file: "Profile-320", width: 320 },
  { file: "Profile", width: 680 },
] as const;

const srcset = (format: "avif" | "webp") => widths.map(({ file, width }) => `/images/${file}.${format} ${width}w`).join(", ");

export const PORTRAIT = {
  avif: srcset("avif"),
  webp: srcset("webp"),
  fallback: "/images/Profile.webp",
  // Rendered width: 4.5rem on a phone, 11rem from 48rem, 15rem from 64rem
  // (Hero.css). The root font scales above 120rem, hence the vw step.
  sizes: "(min-width: 120rem) 12.5vw, (min-width: 64rem) 240px, (min-width: 48rem) 176px, 72px",
  intrinsic: 680,
} as const;
