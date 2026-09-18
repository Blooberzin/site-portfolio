# Renan Content OS

Painel editorial para transformar sinais sobre SEO, GEO, AEO, Marketing de Conteúdo e IA aplicada ao Marketing em conteúdo multicanal, com aprovação humana antes da distribuição.

## O que já está implementado

- Radar de pautas com score editorial.
- Geração estruturada com Vercel AI SDK + AI Gateway.
- Pipeline: ideia → pesquisa → draft → aprovado → agendado → publicado.
- Pacote multicanal: artigo, LinkedIn, carrossel/legenda do Instagram e metadados SEO/GEO.
- Persistência local no navegador para o MVP.
- Publicação de artigo no `site-portfolio` por branch + Pull Request.
- Agendamento de LinkedIn e Instagram via backend proxy da API do Metricool.
- Geração dinâmica de slides 1080×1350 para o carrossel do Instagram.
- Health check das integrações.

## Deploy na Vercel

Crie um novo projeto apontando para este mesmo repositório e defina **Root Directory** como `content-agent`.

O AI Gateway pode usar OIDC automaticamente quando habilitado no projeto Vercel. Para GitHub e Metricool, configure as variáveis descritas em `.env.example` no ambiente de produção.

## Segurança

Nunca coloque tokens no cliente. As rotas `/api/publish/github` e `/api/publish/metricool` executam no servidor e leem credenciais apenas de variáveis de ambiente.

O conteúdo só é distribuído depois de passar para o status `approved` no painel.

## Fluxo recomendado

1. O radar diário traz sinais recentes e links.
2. Cole os sinais no Radar do Content OS.
3. Gere/score as pautas.
4. Abra uma pauta e gere o pacote multicanal.
5. Revise especialmente `validationNotes`.
6. Aprove o conteúdo.
7. Envie o artigo para o portfólio (PR) e agende LinkedIn/Instagram.

## Observação sobre fontes

O gerador foi instruído a não inventar estatísticas, pesquisas, datas ou fatos recentes. Quando a entrada não traz evidência suficiente, ele deve registrar o ponto em `validationNotes` para checagem antes da publicação.
