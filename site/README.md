# Site do Renan Barbosa

Portfólio com blog, feito em Astro. Estático, rápido e com SEO resolvido de
fábrica: sitemap, RSS, canônica, Open Graph e dados estruturados de artigo.

## Rodar

```bash
npm install
npm run dev      # abre em localhost:4321
npm run build    # gera a pasta dist/
```

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Em vercel.com, importe o repositório. Ela reconhece Astro sozinha.
3. Em Settings > Domains, ligue o seu domínio.
4. Troque o campo `site` no `astro.config.mjs` pelo domínio real. Sem isso o
   sitemap e as URLs canônicas saem erradas.

Hospedagem é gratuita nesse formato. O único custo é o domínio.

## O que você precisa preencher antes de divulgar

Tudo que falta está em `src/dados/perfil.ts`.

- **`perfil.linkedin`** está com uma URL falsa. Troque.
- **`resultados`** está com três espaços vazios marcados como `exemplo: true`.
  Enquanto essa marca existir, o site mostra uma caixa tracejada e a etiqueta
  "preencher" na tela, de propósito, pra você não publicar número inventado sem
  perceber. Coloque o número real e apague a linha `exemplo: true`.
- **`casos`** tem dois casos com a estrutura pronta e o conteúdo pela metade.
  Preencha seguindo o padrão: o que existia antes, o que você fez, o que mudou
  depois. Sem o "depois" não é caso, é descrição de tarefa.
- **`src/pages/sobre.astro`** tem um parágrafo em negrito pedindo que você
  reescreva a seção na sua voz. O que está lá é verdadeiro, mas foi escrito por
  mim.
- **`src/pages/servicos.astro`** tem três serviços de exemplo. Mantenha só os
  que você realmente consegue entregar tendo um emprego em tempo integral.

## Publicar um artigo

Crie um arquivo `.md` em `src/content/artigos/`. O nome do arquivo vira a URL.

```markdown
---
titulo: "Título do artigo"
resumo: "Uma frase. Vira a meta description, então escreva pensando na busca."
data: 2026-09-20
tags: ["seo", "ia"]
rascunho: false
---

O texto começa aqui.
```

Com `rascunho: true`, o artigo não aparece no site nem no RSS. Serve pra deixar
começado sem publicar.

## Os dois artigos que já estão aí

`auditoria-antes-de-publicar.md` e `pauta-search-console.md` são rascunhos que eu
escrevi a partir do que você já me contou. O método é seu, a redação é minha.
Reescreva na sua voz antes de divulgar, principalmente qualquer trecho que conte
uma história pessoal.

## Como isso conversa com o testeiaqui.py

O Instagram é a versão curta e o site é a versão longa. O caminho é:

- Reels ou carrossel levanta a ideia
- o link da bio aponta para `/artigos/`
- o artigo entrega o método inteiro e ranqueia no Google

Isso resolve o problema de conteúdo de Instagram morrer em 48 horas. O artigo
continua trazendo gente meses depois, e é ele que o recrutador acha quando
procura seu nome.

## Estrutura

```
src/
  dados/perfil.ts          tudo que muda com o tempo
  content/artigos/         seus artigos em markdown
  layouts/Base.astro       cabeçalho, rodapé, meta tags
  components/Chamada.astro bloco de contato reaproveitado
  pages/                   as páginas
  styles/global.css        o sistema visual inteiro
```
