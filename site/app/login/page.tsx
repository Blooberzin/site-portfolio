import styles from "./login.module.css";

export const metadata = {
  title: "Acesso privado · Renan Content OS",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/";

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <div className={styles.eyebrow}>PRIVATE WORKSPACE</div>
        <h1>Renan Content OS</h1>
        <p>Área privada para pesquisa, criação, aprovação e publicação de conteúdo.</p>

        <form action="/api/auth/login" method="post" className={styles.form}>
          <input type="hidden" name="next" value={next} />
          <label>
            Usuário
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            Senha
            <input name="passcode" type="password" autoComplete="current-password" required />
          </label>
          {params.error ? <div className={styles.error}>Credenciais inválidas.</div> : null}
          <button type="submit" className={styles.button}>Entrar</button>
        </form>
      </section>
    </main>
  );
}
