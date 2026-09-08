import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { perfil } from "../dados/perfil";

export async function GET(context) {
  const artigos = await getCollection("artigos", ({ data }) => !data.rascunho);
  return rss({
    title: `${perfil.nome} · artigos`,
    description: perfil.descricaoSite,
    site: context.site,
    items: artigos
      .sort((a, b) => b.data.data - a.data.data)
      .map((a) => ({
        title: a.data.titulo,
        description: a.data.resumo,
        pubDate: a.data.data,
        link: `/artigos/${a.id}/`,
      })),
    customData: "<language>pt-br</language>",
  });
}
