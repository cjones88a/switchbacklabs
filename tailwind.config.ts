import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:     "hsl(var(--pb-bg))",
        ink:    "hsl(var(--pb-ink))",
        muted:  "hsl(var(--pb-muted))",
        line:   "hsl(var(--pb-line))",
        accent: "hsl(var(--pb-accent))",
      },
      fontSize: {
        // giant display like plug&bet
        display: ["clamp(48px, 9vw, 160px)", { lineHeight: ".9", letterSpacing: "-0.04em" }],
        hero:    ["clamp(22px, 2.2vw, 28px)", { lineHeight: "1.3" }],
      },
      borderRadius: { xl: "18px", "2xl": "28px" },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,.06)",
        card: "0 2px 0 0 hsl(var(--pb-line))",
      },
    },
  },
  plugins: [],
};
export default config;
