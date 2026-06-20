'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError('Credenciales inválidas');
      return;
    }
    // La sesión queda en una cookie HttpOnly emitida por el servidor.
    router.push('/');
  }

  return (
    <main className="container">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleLogin} className="card">
        <label>
          Usuario
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        <button type="submit">Entrar</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p className="hint">Cuentas de prueba: <code>alice / alice123</code> · <code>bob / bob123</code></p>
    </main>
  );
}
