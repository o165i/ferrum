export default function Home() {
  return (
    <main style={{ fontFamily: "monospace", padding: 40 }}>
      <h1>FERRUM — backend skeleton</h1>
      <p>Это временная страница. UI из прототипа ещё не подключён.</p>
      <ul>
        <li>GET /api/health</li>
        <li>GET /api/products</li>
        <li>POST /api/auth/register</li>
        <li>POST /api/auth/signin (NextAuth) — /api/auth/[...nextauth]</li>
      </ul>
    </main>
  );
}
