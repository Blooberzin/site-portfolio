export const runtime = "nodejs";
export const maxDuration = 30;

function yamlString(value: string) {
  return JSON.stringify(value);
}

function buildMarkdown(body: any) {
  const tags = Array.isArray(body.tags) ? body.tags : [];
  return `---\ntitulo: ${yamlString(body.title)}\nresumo: ${yamlString(body.summary)}\ndata: ${new Date().toISOString().slice(0, 10)}\ntags:\n${tags.map((tag: string) => `  - ${yamlString(tag)}`).join("\n")}\nrascunho: false\n---\n\n${body.article.trim()}\n`;
}

export async function POST(request: Request) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const repoSlug = process.env.GITHUB_REPO || "barbosarenan/site-portfolio";
    const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";
    if (!token) {
      return Response.json({ error: "GITHUB_TOKEN não configurado no ambiente da Vercel." }, { status: 412 });
    }

    const [owner, repo] = repoSlug.split("/");
    if (!owner || !repo) return Response.json({ error: "GITHUB_REPO inválido." }, { status: 500 });

    const body = await request.json();
    if (!body.slug || !body.title || !body.article) return Response.json({ error: "Conteúdo incompleto." }, { status: 400 });

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    async function gh(path: string, init?: RequestInit) {
      const response = await fetch(`https://api.github.com${path}`, { ...init, headers: { ...headers, ...(init?.headers || {}) } });
      const text = await response.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
      if (!response.ok) throw new Error(data?.message || `GitHub respondeu ${response.status}.`);
      return data;
    }

    const articlePath = `site/src/content/artigos/${body.slug}.md`;
    const existing = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${articlePath}?ref=${encodeURIComponent(baseBranch)}`, { headers });
    if (existing.ok) return Response.json({ error: `Já existe um artigo com o slug ${body.slug}.` }, { status: 409 });

    const base = await gh(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(baseBranch)}`);
    const branchName = `content/${body.slug}-${Date.now()}`;

    await gh(`/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: base.object.sha }),
    });

    const markdown = buildMarkdown(body);
    await gh(`/repos/${owner}/${repo}/contents/${articlePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `content: add ${body.slug}`,
        content: Buffer.from(markdown, "utf8").toString("base64"),
        branch: branchName,
      }),
    });

    const pr = await gh(`/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `content: ${body.title}`,
        head: branchName,
        base: baseBranch,
        body: `Artigo criado pelo Renan Content OS.\n\n**Slug:** \`${body.slug}\`\n\nRevise o texto, referências e metadados antes do merge.`,
      }),
    });

    return Response.json({ ok: true, url: pr.html_url, number: pr.number, branch: branchName });
  } catch (error) {
    console.error("github_publish_error", error);
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao publicar no GitHub." }, { status: 500 });
  }
}
