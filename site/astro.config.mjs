import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Troque pelo seu domínio quando registrar. Isso alimenta o sitemap,
// as URLs canônicas e as tags do Open Graph.
export default defineConfig({
  site: "https://renanbarbosa.com.br",
  integrations: [sitemap()],
});
