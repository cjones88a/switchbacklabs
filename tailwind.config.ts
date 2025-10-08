import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // token aliases used by components
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        muted: "hsl(var(--muted))",
        surface: "hsl(var(--surface))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        brand: "hsl(var(--brand))",
        brand2: "hsl(var(--brand2))",
        brandFg: "hsl(var(--brand-fg))",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 0 0 hsl(var(--border)), 0 8px 24px -12px hsl(var(--shadow))",
        pop: "0 0 0 8px hsl(var(--ring) / 0.15)",
        glow: "0 0 20px hsl(var(--brand) / 0.3)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand2)))",
      },
    },
  },
  plugins: [],
};
export default config;
