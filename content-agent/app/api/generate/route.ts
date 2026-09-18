import { generateText, Output } from "ai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const ideaSchema = z.object({
  ideas: z.array(z.object({
    title: z.string(),
    angle: z.string(),
    rationale: z.string(),
    pillar: z.string(),
    format: z.enum(["artigo", "linkedin", "instagram", "experimento"]),
    score: z.number().int().min(0).max(100),
  })).min(3).max(6),
});

const contentSchema = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).min(2).max(8),
  article: z.string(),
  linkedin: z.string(),
  instagram: z.object({
    caption: z.string(),
    slides: z.array(z.object({ title: z.string(), body: z.string() })).min(5).max(8),
  }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    primaryKeyword: z.string(),
  }),
  validationNotes: z.array(z.string()).max(10),
});

const editorialSystem = `Você é o editor-chefe de um profissional brasileiro de Marketing especializado em SEO, GEO, AEO, Marketing de Conteúdo e IA Generativa.

Princípios editoriais:
- escreva em português do Brasil;
- priorize tese própria, clareza, evidência e utilidade prática;
- não use frases genéricas como "a IA está transformando tudo";
- não invente estatísticas, pesquisas, falas, datas, links ou fatos recentes;
- se um dado factual não estiver presente na entrada, transforme-o em ponto de validação em vez de fabricá-lo;
- diferencie os canais: artigo é aprofundado, LinkedIn é argumentativo e Instagram é visual/sintético;
- SEO, AEO e GEO devem ser tratados com precisão, sem vender conceitos novos como substitutos mágicos do SEO;
- escreva para demonstrar raciocínio e experiência, não para parecer um perfil de dicas rápidas;
- sempre que possível, proponha uma hipótese testável ou experimento.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const model = process.env.AI_MODEL || "openai/gpt-5.4";

    if (body.task === "ideas") {
      const prompt = `Crie de 4 a 6 pautas editoriais com score de oportunidade.

FOCO:
${body.focus || "SEO, GEO, AEO, Marketing de Conteúdo e IA aplicada ao Marketing"}

SINAIS / FONTES / NOTAS FORNECIDAS:
${body.signals || "Nenhum sinal específico. Gere pautas evergreen de alta densidade intelectual e indique experimentos possíveis."}

O score deve considerar: 25% atualidade/relevância do sinal fornecido, 20% aderência ao posicionamento, 20% potencial de insight original, 15% capacidade de demonstrar autoridade, 10% potencial de busca e 10% potencial social.
Evite listas de ferramentas, obviedades e títulos caça-clique.`;

      const result = await generateText({
        model,
        system: editorialSystem,
        prompt,
        output: Output.object({ schema: ideaSchema }),
      });

      return Response.json(result.output);
    }

    if (body.task === "content") {
      const idea = body.idea || {};
      const prompt = `Crie um pacote editorial multicanal a partir desta pauta.

TÍTULO/PONTO DE PARTIDA: ${idea.title || ""}
ÂNGULO: ${idea.angle || ""}
POR QUE IMPORTA: ${idea.rationale || ""}
PILAR: ${idea.pillar || ""}
FORMATO ORIGINAL: ${idea.format || ""}

SINAIS / FONTES / NOTAS DISPONÍVEIS:
${body.signals || "Nenhuma fonte foi fornecida. Não fabrique evidências ou acontecimentos recentes."}

ENTREGÁVEIS:
1) Artigo em Markdown, com introdução direta, H2/H3 claros, exemplos conceituais, implicações práticas e conclusão. Não inclua frontmatter. Escreva de forma aprofundada, não como post de rede social.
2) LinkedIn: uma tese forte e autoral; sem copiar o artigo; parágrafos curtos; sem exagero de emojis; encerre com uma pergunta que convide discussão real.
3) Instagram @testeiaqui.py: carrossel de 5 a 8 slides. Cada slide precisa de um título curto e um corpo curto. O primeiro slide deve ter um hook claro. Inclua legenda separada.
4) SEO/GEO: meta title, meta description, keyword primária e tags.
5) validationNotes: liste tudo que deveria ser checado com fonte antes da publicação. Se não houver nada factual a validar, retorne array vazio.

O slug deve ser minúsculo, ASCII, com hífens e sem acentos.`;

      const result = await generateText({
        model,
        system: editorialSystem,
        prompt,
        output: Output.object({ schema: contentSchema }),
      });

      return Response.json(result.output);
    }

    return Response.json({ error: "Tarefa inválida." }, { status: 400 });
  } catch (error) {
    console.error("generation_error", error);
    const message = error instanceof Error ? error.message : "Erro inesperado na geração.";
    return Response.json({ error: message }, { status: 500 });
  }
}
