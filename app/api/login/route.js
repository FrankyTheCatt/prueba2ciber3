import { users, makeSession, CORS } from '@/lib/store';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401, headers: CORS });
    }

    const session = makeSession(user);
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

    return Response.json(
      { user: { id: user.id, username: user.username } },
      {
        headers: {
          ...CORS,
          'Set-Cookie': `session=${session}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${secure}`,
        },
      }
    );
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400, headers: CORS });
  }
}
