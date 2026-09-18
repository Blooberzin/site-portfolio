export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const token = process.env.METRICOOL_TOKEN;
    const userId = process.env.METRICOOL_USER_ID;
    const blogId = process.env.METRICOOL_BLOG_ID;
    const timezone = process.env.METRICOOL_TIMEZONE || "America/Sao_Paulo";

    if (!token || !userId || !blogId) {
      return Response.json({ error: "Metricool API ainda não configurada. Defina METRICOOL_TOKEN, METRICOOL_USER_ID e METRICOOL_BLOG_ID na Vercel." }, { status: 412 });
    }

    const body = await request.json();
    const network = body.network;
    if (!['linkedin', 'instagram'].includes(network)) {
      return Response.json({ error: "Rede não suportada neste fluxo." }, { status: 400 });
    }
    if (!body.text || !body.dateTime) {
      return Response.json({ error: "Texto e data/hora são obrigatórios." }, { status: 400 });
    }

    const media = Array.isArray(body.media) ? body.media.filter(Boolean) : [];
    if (network === "instagram" && media.length === 0) {
      return Response.json({ error: "Instagram exige mídia. O Content OS gera URLs públicas dos slides automaticamente quando está em produção." }, { status: 400 });
    }
    if (media.some((url: string) => /localhost|127\.0\.0\.1/.test(url))) {
      return Response.json({ error: "As imagens do Instagram precisam estar em uma URL pública. Faça o deploy do Content OS antes de agendar o carrossel." }, { status: 400 });
    }

    const payload = {
      publicationDate: {
        dateTime: body.dateTime,
        timezone,
      },
      text: body.text,
      providers: [{ network }],
      autoPublish: true,
      draft: false,
      shortener: false,
      saveExternalMediaFiles: media.length > 0,
      ...(media.length > 0 ? { media } : {}),
    };

    const url = new URL("https://app.metricool.com/api/v2/scheduler/posts");
    url.searchParams.set("blogId", blogId);
    url.searchParams.set("userId", userId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Mc-Auth": token,
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data: any = raw;
    try { data = raw ? JSON.parse(raw) : null; } catch { /* mantém texto */ }

    if (!response.ok) {
      console.error("metricool_error", response.status, raw);
      return Response.json({ error: typeof data === "string" ? data : data?.message || `Metricool respondeu ${response.status}.` }, { status: response.status });
    }

    return Response.json({ ok: true, network, result: data });
  } catch (error) {
    console.error("metricool_publish_error", error);
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao agendar no Metricool." }, { status: 500 });
  }
}
