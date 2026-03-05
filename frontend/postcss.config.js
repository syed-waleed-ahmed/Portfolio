import purgecss from "@fullhuman/postcss-purgecss";

const isProduction = process.env.NODE_ENV === "production";

export default {
  plugins: [
    ...(isProduction
      ? [
          purgecss({
            content: [
              "./index.html",
              "./src/**/*.{jsx,js,ts,tsx}",
            ],
            // Bootstrap JS dynamically adds these classes (not in JSX source)
            safelist: {
              standard: [
                "show",
                "collapse",
                "collapsing",
                "active",
                "fade",
                "is-invalid",
                "is-valid",
                "was-validated",
                "navbar-collapse",
              ],
              // Keep responsive grid + display utilities that might be missed
              greedy: [
                /^col-/,
                /^d-/,
                /^g-/,
                /^gap-/,
                /^align-/,
                /^justify-/,
                /^flex-/,
                /^text-/,
                /^fw-/,
                /^mb-/,
                /^mt-/,
                /^ms-/,
                /^me-/,
                /^mx-/,
                /^my-/,
                /^p-/,
                /^pb-/,
                /^pt-/,
                /^ps-/,
                /^pe-/,
                /^px-/,
                /^py-/,
                /^w-/,
                /^h-/,
                /^border/,
                /^rounded/,
                /^badge/,
                /^btn/,
                /^form-/,
                /^nav/,
                /^navbar/,
                /^small/,
              ],
            },
            // Keep CSS variables and keyframes
            defaultExtractor: (content) =>
              content.match(/[\w-/:]+(?<!:)/g) || [],
          }),
        ]
      : []),
  ],
};
