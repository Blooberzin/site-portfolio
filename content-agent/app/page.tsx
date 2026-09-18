"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContentBundle, Idea, IdeaStatus } from "@/lib/types";

const STORAGE_IDEAS = "content-os:ideas";
const STORAGE_BUNDLES = "content-os:bundles";

const seedIdeas: Idea[] = [
  {
    id: "geo-measurement",
    title: "Como medir visibilidade de marca em respostas de LLMs",
    angle: "Criar uma metodologia prática que vá além de rankings tradicionais.",
    rationale: "Conecta GEO a uma pergunta de negócio mensurável e abre espaço para experimento próprio.",
    pillar: "GEO",
    format: "experimento",
    score: 92,
    status: "idea",
  },
  {
    id: "seo-aeo-geo",
    title: "SEO, AEO e GEO não são três estratégias isoladas",
    angle: "Mostrar a camada comum: descoberta, compreensão, confiança e citação.",
    rationale: "Ajuda a organizar termos que o mercado costuma tratar como caixas separadas.",
    pillar: "SEO + GEO + AEO",
    format: "artigo",
    score: 88,
    status: "idea",
  },
  {
    id: "content-evidence",
    title: "Conteúdo para IA precisa de evidência, não de mais volume",
    angle: "Contrapor produção em escala com sinais de verificabilidade e informação original.",
    rationale: "É uma tese forte para conteúdo autoral e pode virar checklist técnico.",
    pillar: "Marketing de Conteúdo",
    format: "linkedin",
    score: 84,
    status: "idea",
  },
];

const columns: Array<{ id: IdeaStatus; label: string }> = [
  { id: "idea", label: "Ideias" },
  { id: "research", label: "Pesquisa" },
  { id: "draft", label: "Draft" },
  { id: "approved", label: "Aprovado" },
  { id: "scheduled", label: "Agendado" },
  { id: "published", label: "Publicado" },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function localDateInput(hoursAhead = 24) {
  const d = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function Home() {
  const [view, setView] = useState<"radar" | "pipeline" | "editor" | "settings">("radar");
  const [ideas, setIdeas] = useState<Idea[]>(seedIdeas);
  const [bundles, setBundles] = useState<Record<string, ContentBundle>>({});
  const [selectedId, setSelectedId] = useState<string>(seedIdeas[0].id);
  const [signals, setSignals] = useState("");
  const [focus, setFocus] = useState("SEO, GEO, AEO, Marketing de Conteúdo e IA aplicada ao Marketing");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [outputTab, setOutputTab] = useState<"article" | "linkedin" | "instagram" | "seo">("article");
  const [scheduleAt, setScheduleAt] = useState(localDateInput());
  const [health, setHealth] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    try {
      const savedIdeas = localStorage.getItem(STORAGE_IDEAS);
      const savedBundles = localStorage.getItem(STORAGE_BUNDLES);
      if (savedIdeas) setIdeas(JSON.parse(savedIdeas));
      if (savedBundles) setBundles(JSON.parse(savedBundles));
    } catch {
      // Mantém os seeds se o storage estiver inválido.
    }
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setHealth(data.integrations ?? null))
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_IDEAS, JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_BUNDLES, JSON.stringify(bundles));
  }, [bundles]);

  const selected = useMemo(() => ideas.find((i) => i.id === selectedId) ?? ideas[0], [ideas, selectedId]);
  const bundle = selected ? bundles[selected.id] : undefined;

  const counts = useMemo(() => ({
    total: ideas.length,
    hot: ideas.filter((i) => i.score >= 85).length,
    approved: ideas.filter((i) => i.status === "approved").length,
    published: ideas.filter((i) => i.status === "published").length,
  }), [ideas]);

  function updateIdea(id: string, patch: Partial<Idea>) {
    setIdeas((current) => current.map((idea) => idea.id === id ? { ...idea, ...patch } : idea));
  }

  async function generateIdeas() {
    setBusy("ideas");
    setMessage(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "ideas", focus, signals }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível gerar pautas.");
      const next: Idea[] = data.ideas.map((idea: Omit<Idea, "id" | "status">) => ({ ...idea, id: makeId(), status: "idea" as const }));
      setIdeas((current) => [...next, ...current]);
      setSelectedId(next[0]?.id ?? selectedId);
      setMessage({ type: "success", text: `${next.length} novas oportunidades adicionadas ao radar.` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro inesperado." });
    } finally {
      setBusy(null);
    }
  }

  async function generateContent() {
    if (!selected) return;
    setBusy("content");
    setMessage(null);
    updateIdea(selected.id, { status: "research" });
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "content", idea: selected, signals }),
      });
      const data: ContentBundle & { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar o conteúdo.");
      setBundles((current) => ({ ...current, [selected.id]: data }));
      updateIdea(selected.id, { status: "draft" });
      setView("editor");
      setMessage({ type: "success", text: "Pacote multicanal criado. Revise antes de aprovar." });
    } catch (error) {
      updateIdea(selected.id, { status: "idea" });
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro inesperado." });
    } finally {
      setBusy(null);
    }
  }

  async function publishPortfolio() {
    if (!selected || !bundle) return;
    if (selected.status !== "approved") {
      setMessage({ type: "error", text: "Aprove o conteúdo antes de enviar para o portfólio." });
      return;
    }
    setBusy("github");
    setMessage(null);
    try {
      const response = await fetch("/api/publish/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao abrir o Pull Request.");
      updateIdea(selected.id, { status: "published" });
      setMessage({ type: "success", text: `Pull Request criado: ${data.url}` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro inesperado." });
    } finally {
      setBusy(null);
    }
  }

  async function scheduleSocial(network: "linkedin" | "instagram") {
    if (!selected || !bundle) return;
    if (selected.status !== "approved" && selected.status !== "scheduled") {
      setMessage({ type: "error", text: "Aprove o conteúdo antes de agendar." });
      return;
    }
    setBusy(network);
    setMessage(null);
    try {
      const media = network === "instagram"
        ? bundle.instagram.slides.map((slide, index) => {
            const url = new URL("/api/slide", window.location.origin);
            url.searchParams.set("index", String(index + 1));
            url.searchParams.set("title", slide.title);
            url.searchParams.set("body", slide.body);
            return url.toString();
          })
        : [];

      const response = await fetch("/api/publish/metricool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          text: network === "linkedin" ? bundle.linkedin : bundle.instagram.caption,
          dateTime: scheduleAt.length === 16 ? `${scheduleAt}:00` : scheduleAt,
          media,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao agendar no Metricool.");
      updateIdea(selected.id, { status: "scheduled" });
      setMessage({ type: "success", text: `${network === "linkedin" ? "LinkedIn" : "Instagram"} agendado no Metricool.` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro inesperado." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo">R</div>
          <div><h1>Renan Content OS</h1><p>Research → Evidence → Content → Distribution</p></div>
        </div>
        <nav className="nav">
          {(["radar", "pipeline", "editor", "settings"] as const).map((item) => (
            <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>
              {item === "radar" ? "Radar" : item === "pipeline" ? "Pipeline" : item === "editor" ? "Editor" : "Configurações"}
            </button>
          ))}
        </nav>
      </header>

      {view === "radar" && <>
        <section className="hero">
          <div className="heroCard">
            <div className="eyebrow">Content intelligence</div>
            <h2>Menos conteúdo genérico. Mais sinais que viram autoridade.</h2>
            <p>Use tendências, hipóteses e experimentos para criar um conteúdo-base e adaptar a tese para portfólio, LinkedIn e @testeiaqui.py.</p>
            <div className="heroActions">
              <button className="primary" onClick={generateIdeas} disabled={busy !== null}>{busy === "ideas" ? "Gerando..." : "Gerar novas pautas"}</button>
              <button className="ghost" onClick={() => setView("pipeline")}>Ver pipeline</button>
            </div>
          </div>
          <div className="heroCard stats">
            <div className="stat"><strong>{counts.total}</strong><span>pautas no radar</span></div>
            <div className="stat"><strong>{counts.hot}</strong><span>score ≥ 85</span></div>
            <div className="stat"><strong>{counts.approved}</strong><span>aprovadas</span></div>
            <div className="stat"><strong>{counts.published}</strong><span>publicadas</span></div>
          </div>
        </section>

        <section className="grid">
          <div className="panel span8">
            <div className="panelHead"><div><h3>Oportunidades</h3><small>Score editorial, não vaidade algorítmica.</small></div></div>
            <div className="ideaList">
              {[...ideas].sort((a,b) => b.score - a.score).map((idea) => (
                <article className="idea" key={idea.id}>
                  <div className="score">{idea.score}</div>
                  <div>
                    <h4>{idea.title}</h4>
                    <p>{idea.angle}</p>
                    <div className="badges"><span className="badge">{idea.pillar}</span><span className="badge">{idea.format}</span><span className="badge">{idea.status}</span></div>
                  </div>
                  <button className="ghost" onClick={() => { setSelectedId(idea.id); setView("editor"); }}>Abrir</button>
                </article>
              ))}
            </div>
          </div>
          <aside className="panel span4">
            <div className="panelHead"><div><h3>Entrada do Radar</h3><small>Cole sinais do radar diário, links ou notas.</small></div></div>
            <div className="field"><label>Temas prioritários</label><input className="input" value={focus} onChange={(e) => setFocus(e.target.value)} /></div>
            <div className="field"><label>Sinais / fontes / observações</label><textarea className="textarea" value={signals} onChange={(e) => setSignals(e.target.value)} placeholder="Ex.: link, mudança de documentação, hipótese de experimento, dado interessante..." /></div>
            <button className="primary" onClick={generateIdeas} disabled={busy !== null}>{busy === "ideas" ? "Analisando..." : "Transformar em pautas"}</button>
          </aside>
        </section>
      </>}

      {view === "pipeline" && <section className="panel" style={{ marginTop: 28 }}>
        <div className="panelHead"><div><h3>Pipeline editorial</h3><small>Do sinal até a publicação.</small></div></div>
        <div className="pipeline">
          {columns.map((column) => (
            <div className="column" key={column.id}>
              <h4>{column.label}</h4>
              {ideas.filter((idea) => idea.status === column.id).map((idea) => (
                <button className="card" key={idea.id} onClick={() => { setSelectedId(idea.id); setView("editor"); }} style={{ width: "100%", textAlign: "left", color: "inherit" }}>
                  <strong>{idea.title}</strong><small>{idea.score} · {idea.pillar}</small>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>}

      {view === "editor" && selected && <section className="grid" style={{ marginTop: 28 }}>
        <div className="panel span4">
          <div className="eyebrow">{selected.pillar}</div>
          <h2 style={{ marginBottom: 10 }}>{selected.title}</h2>
          <p className="muted" style={{ lineHeight: 1.6 }}>{selected.angle}</p>
          <div className="field"><label>Por que vale produzir</label><textarea className="textarea" value={selected.rationale} onChange={(e) => updateIdea(selected.id, { rationale: e.target.value })} /></div>
          <div className="field"><label>Status</label><select className="select" value={selected.status} onChange={(e) => updateIdea(selected.id, { status: e.target.value as IdeaStatus })}>{columns.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
          {!bundle && <button className="primary" onClick={generateContent} disabled={busy !== null}>{busy === "content" ? "Pesquisando e escrevendo..." : "Criar pacote multicanal"}</button>}
          {bundle && <div style={{ display: "grid", gap: 10 }}>
            <button className="primary" onClick={() => updateIdea(selected.id, { status: "approved" })}>Aprovar conteúdo</button>
            <button className="ghost" onClick={generateContent} disabled={busy !== null}>Regenerar pacote</button>
          </div>}
        </div>

        <div className="panel span8">
          {!bundle ? <div className="output muted">Crie o pacote multicanal para abrir o editor de artigo, LinkedIn, Instagram e SEO.</div> : <>
            <div className="panelHead"><div><h3>{bundle.title}</h3><small>{bundle.slug}</small></div></div>
            <div className="tabs">
              {(["article", "linkedin", "instagram", "seo"] as const).map((tab) => <button key={tab} className={outputTab === tab ? "active" : ""} onClick={() => setOutputTab(tab)}>{tab === "article" ? "Artigo" : tab === "linkedin" ? "LinkedIn" : tab === "instagram" ? "Instagram" : "SEO / GEO"}</button>)}
            </div>

            {outputTab === "article" && <textarea className="textarea output" value={bundle.article} onChange={(e) => setBundles((current) => ({ ...current, [selected.id]: { ...bundle, article: e.target.value } }))} />}
            {outputTab === "linkedin" && <textarea className="textarea output" value={bundle.linkedin} onChange={(e) => setBundles((current) => ({ ...current, [selected.id]: { ...bundle, linkedin: e.target.value } }))} />}
            {outputTab === "instagram" && <>
              <div className="slidePreview">{bundle.instagram.slides.map((slide, i) => <div className="slide" key={`${slide.title}-${i}`}><span className="eyebrow">{String(i+1).padStart(2,"0")} / {String(bundle.instagram.slides.length).padStart(2,"0")}</span><strong>{slide.title}</strong><p>{slide.body}</p></div>)}</div>
              <div className="field" style={{ marginTop: 16 }}><label>Legenda</label><textarea className="textarea" value={bundle.instagram.caption} onChange={(e) => setBundles((current) => ({ ...current, [selected.id]: { ...bundle, instagram: { ...bundle.instagram, caption: e.target.value } } }))} /></div>
            </>}
            {outputTab === "seo" && <div className="output"><strong>Meta title</strong>\n{bundle.seo.metaTitle}\n\n<strong>Meta description</strong>\n{bundle.seo.metaDescription}\n\n<strong>Keyword primária</strong>\n{bundle.seo.primaryKeyword}\n\n<strong>Tags</strong>\n{bundle.tags.join(" · ")}\n\n<strong>Pontos que exigem validação</strong>\n{bundle.validationNotes.map((n) => `• ${n}`).join("\n")}</div>}
          </>}
        </div>

        {bundle && <div className="panel span12">
          <div className="panelHead"><div><h3>Distribuição</h3><small>Publicação só depois de aprovação.</small></div></div>
          <div className="grid">
            <div className="span4">
              <div className="field"><label>Data / hora social</label><input className="input" type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} /></div>
            </div>
            <div className="span8" style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
              <button className="ghost" disabled={busy !== null} onClick={publishPortfolio}>{busy === "github" ? "Criando PR..." : "Enviar artigo ao portfólio"}</button>
              <button className="ghost" disabled={busy !== null} onClick={() => scheduleSocial("linkedin")}>{busy === "linkedin" ? "Agendando..." : "Agendar LinkedIn"}</button>
              <button className="ghost" disabled={busy !== null} onClick={() => scheduleSocial("instagram")}>{busy === "instagram" ? "Agendando..." : "Agendar Instagram"}</button>
            </div>
          </div>
        </div>}
      </section>}

      {view === "settings" && <section className="grid" style={{ marginTop: 28 }}>
        <div className="panel span8">
          <div className="panelHead"><div><h3>Integrações</h3><small>Segredos ficam somente no servidor/Vercel.</small></div></div>
          <div className="statusGrid">
            {[
              ["AI Gateway", health?.ai], ["GitHub Publisher", health?.github], ["Metricool API", health?.metricool]
            ].map(([label, ok]) => <div className="statusItem" key={String(label)}><span className={`dot ${ok ? "ok" : ""}`} /> <strong>{label}</strong><p className="muted">{ok ? "Configurado" : "Aguardando credencial"}</p></div>)}
          </div>
          <p className="muted" style={{ lineHeight: 1.7, marginTop: 18 }}>AI Gateway pode usar OIDC automaticamente na Vercel. GitHub e Metricool precisam de credenciais próprias do app no ambiente de produção; elas nunca são enviadas ao navegador.</p>
        </div>
        <div className="panel span4">
          <h3>Variáveis esperadas</h3>
          <div className="output muted" style={{ minHeight: 0 }}>AI_MODEL\nGITHUB_TOKEN\nGITHUB_REPO\nGITHUB_BASE_BRANCH\nMETRICOOL_TOKEN\nMETRICOOL_USER_ID\nMETRICOOL_BLOG_ID\nMETRICOOL_TIMEZONE</div>
        </div>
      </section>}

      {message && <div className={message.type} style={{ marginTop: 18 }}>{message.text}</div>}
      <footer className="footer">Renan Content OS · conteúdo autoral, distribuição assistida e aprovação humana.</footer>
    </main>
  );
}
