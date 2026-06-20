'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');

  async function loadTodos() {
    const res = await fetch('/api/todos');
    if (res.status === 401) { router.push('/login'); return; }
    setTodos(await res.json());
  }

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { router.push('/login'); return; }
        setUser(data.user);
        loadTodos();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setTitle('');
    loadTodos();
  }

  async function toggle(todo) {
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !todo.done }),
    });
    loadTodos();
  }

  async function remove(todo) {
    await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
    loadTodos();
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  if (!user) return null;

  return (
    <main className="container">
      <header className="topbar">
        <span>Hola, <strong>{user.username}</strong></span>
        <nav>
          <a href="/search">Buscar</a>
          <a href="/notes">Notas</a>
          <a href="https://www.ucn.cl" rel="noopener noreferrer">Sitio UCN</a>
          <button onClick={logout} className="link">Salir</button>
        </nav>
      </header>

      <h1>Mis tareas</h1>

      <form onSubmit={addTodo} className="add-form">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nueva tarea..." />
        <button type="submit">Agregar</button>
      </form>

      <ul className="todo-list">
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
              <span className={t.done ? 'done' : undefined}>{t.title}</span>
            </label>
            <small>#{t.id}</small>
            <button onClick={() => remove(t)} className="link danger">Eliminar</button>
          </li>
        ))}
        {todos.length === 0 && <li className="muted">Sin tareas todavía.</li>}
      </ul>
    </main>
  );
}
