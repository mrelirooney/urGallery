/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 uses this package name for the PostCSS plugin
    "@tailwindcss/postcss": {},
  },
};

export default config;
