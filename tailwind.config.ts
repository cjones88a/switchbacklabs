import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:     "hsl(var(--pb-bg))",     // pure white hero
        ink:    "hsl(var(--pb-ink))",    // deep green/black text
        muted:  "hsl(var(--pb-muted))",
        line:   "hsl(var(--pb-line))",
        accent: "hsl(var(--pb-accent))", // neon lime
        paper:  "hsl(var(--pb-paper))",  // off-white content sections
        stroke: "hsl(var(--pb-stroke))", // outline color for cards/CTAs
      },
      fontSize: {
        display: ["clamp(48px, 9vw, 160px)", { lineHeight: ".9", letterSpacing: "-0.04em" }],
        hero:    ["clamp(18px, 1.9vw, 22px)", { lineHeight: "1.45" }],
      },
      borderRadius: { xl: "18px", "2xl": "28px", huge: "36px" },
      boxShadow: { soft: "0 10px 40px rgba(0,0,0,.06)" },
    },
  },
  plugins: [],
};
export default config;
