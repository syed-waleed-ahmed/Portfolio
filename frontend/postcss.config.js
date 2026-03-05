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
              // Only keep patterns that Bootstrap JS adds dynamically
              // All static utility classes (col-md-6, d-flex, etc.) are found
              // automatically by PurgeCSS scanning JSX source files
              greedy: [
                /^nav/,
                /^form-/,
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
