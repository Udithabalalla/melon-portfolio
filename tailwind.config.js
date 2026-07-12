/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens driven by CSS variables so the whole UI flips
        // with the theme. `ink` = page background, `paper` = foreground.
        ink: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        paper: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "var(--line-color)",
        accent: "#e8e6df",
      },
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"],
        display: ['"Space Grotesk Variable"', "Space Grotesk", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tightest: "-0.055em",
      },
      maxWidth: {
        wide: "1400px",
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
