import purgecss from "@fullhuman/postcss-purgecss";

const isProduction = process.env.NODE_ENV === "production";

export default {
  plugins: [
    ...(isProduction
      ? [
          purgecss({
            content: ["./index.html", "./src/**/*.{jsx,js,ts,tsx}"],
            safelist: {
              standard: [
                "show",
                "is-open",
                "is-active",
                "is-scrolled",
                "is-visible",
                "is-invalid",
                "is-valid",
                "is-error",
                "is-success",
                "was-validated",
              ],
            },
            defaultExtractor: (content) =>
              content.match(/[\w-/:]+(?<!:)/g) || [],
          }),
        ]
      : []),
  ],
};
