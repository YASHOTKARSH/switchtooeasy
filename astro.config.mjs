import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://switchtooeasy.netlify.app",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap(), react()],

  compressHTML: true,
});