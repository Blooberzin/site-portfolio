import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://site-portfolio-renan-eba4.vercel.app",
  trailingSlash: "always",
  integrations: [sitemap()],
});
