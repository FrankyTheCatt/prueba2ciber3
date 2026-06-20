import { todos, readSession, nextTodoId, CORS } from '@/lib/store';

// Control de acceso CORRECTO a proposito: la app solo debe contener las 5
// vulnerabilidades intencionales (todas detectables por ZAP). Aqui NO hay IDOR.

export async function GET(req) {
  const sess = readSession(req);
  if (!sess) return Response.json({ error: 'No autenticado' }, { status: 401, headers: CORS });
  return Response.json(todos.filter((t) => t.ownerId === sess.id), { headers: CORS });
}

export async function POST(req) {
  try {
    const sess = readSession(req);
    if (!sess) return Response.json({ error: 'No autenticado' }, { status: 401, headers: CORS });
    const { title } = await req.json();
    const todo = { id: nextTodoId(), ownerId: sess.id, title: String(title || ''), done: false };
    todos.push(todo);
    return Response.json(todo, { status: 201, headers: CORS });
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400, headers: CORS });
  }
}
