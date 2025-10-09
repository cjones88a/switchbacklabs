import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: { 
      center: true, 
      padding: '1rem' 
    },
    extend: {
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'Inter', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          // deep green like plug&bet
          900: '#0E1A13',
          700: '#12261A',
          600: '#173322',
          500: '#1F4630',
        },
        accent: {
          // neon-lime accent
          400: '#D9FF43',
          500: '#CCFF00',
        },
      },
      boxShadow: {
        card: '0 8px 22px rgba(0,0,0,.06)',
        subtle: '0 1px 0 rgba(0,0,0,.06)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;