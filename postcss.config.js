// postcss.config.js
// Works with Tailwind v4 (preferred) and v3 fallback.
let plugins;
try {
  // Tailwind v4
  // eslint-disable-next-line import/no-extraneous-dependencies
  require.resolve('@tailwindcss/postcss');
  plugins = { '@tailwindcss/postcss': {} };
} catch (_) {
  // Tailwind v3
  // eslint-disable-next-line import/no-extraneous-dependencies
  plugins = { tailwindcss: {}, autoprefixer: {} };
}
module.exports = { plugins };
