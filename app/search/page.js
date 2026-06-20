import { todos } from '@/lib/store';

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q ?? '';
  const results = todos.filter((t) =>
    t.title.toLowerCase().includes(String(q).toLowerCase())
  );

  return (
    <main className="container">
      <h1>Buscar tareas</h1>

      <form method="get" className="search-form">
        <input name="q" defaultValue={q} placeholder="Buscar..." />
        <button type="submit">Buscar</button>
      </form>

      <p>Resultados para: <b>{q}</b></p>

      <ul>
        {results.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>

      <p><a href="/">Volver al inicio</a></p>
    </main>
  );
}
