# Site do Renan Barbosa

Portfólio pessoal em Astro, com geração estática, conteúdo em Markdown, sitemap, RSS, Open Graph e dados estruturados para artigos.

## Desenvolvimento

Rodar localmente:

~~~bash
cd site
npm install
npm run dev
~~~

Build de produção:

~~~bash
cd site
npm run build
npm run preview
~~~

## Arquitetura

~~~
site/
  public/                 arquivos públicos, favicon e assets
  src/
    components/           blocos reutilizáveis
    content/artigos/      artigos em Markdown
    dados/perfil.ts       conteúdo profissional centralizado
    layouts/Base.astro    estrutura, metadata e navegação
    pages/                rotas do site
    styles/global.css     sistema visual
  astro.config.mjs
  package.json
  package-lock.json
vercel.json               configuração de build e headers
.github/workflows/site.yml
~~~

## Conteúdo

As informações profissionais recorrentes ficam em:

site/src/dados/perfil.ts

Os artigos ficam em:

site/src/content/artigos/

Front matter de artigo:

~~~yaml
---
titulo: "Título"
resumo: "Descrição curta"
data: 2026-09-20
tags: ["seo", "ia"]
rascunho: false
---
~~~

Use rascunho: true para manter um artigo fora do site e do RSS.

## Vercel

O projeto usa site/ como Root Directory na Vercel. O vercel.json mantém o framework como Astro, define npm ci + npm run build e adiciona headers de segurança.

Antes de usar um domínio próprio, atualize a propriedade site em astro.config.mjs e o sitemap em public/robots.txt.

## Princípios

- conteúdo profissional sem métricas inventadas;
- IA como ferramenta de aceleração e auditoria, não como substituta de julgamento;
- performance por simplicidade;
- poucas dependências;
- SEO técnico como parte do produto, não como acabamento.
