import { todos, readSession, CORS } from '@/lib/store';

function owned(req, id) {
  const sess = readSession(req);
  if (!sess) return { error: 'No autenticado', status: 401 };
  const todo = todos.find((t) => t.id === Number(id));
  if (!todo) return { error: 'No encontrado', status: 404 };
  // Verificacion de propiedad CORRECTA (no hay IDOR).
  if (todo.ownerId !== sess.id) return { error: 'Prohibido', status: 403 };
  return { todo };
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const r = owned(req, id);
    if (r.error) return Response.json({ error: r.error }, { status: r.status, headers: CORS });
    const body = await req.json();
    if (typeof body.title === 'string') r.todo.title = body.title;
    if (typeof body.done === 'boolean') r.todo.done = body.done;
    return Response.json(r.todo, { headers: CORS });
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400, headers: CORS });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const r = owned(req, id);
  if (r.error) return Response.json({ error: r.error }, { status: r.status, headers: CORS });
  const idx = todos.findIndex((t) => t.id === r.todo.id);
  const [removed] = todos.splice(idx, 1);
  return Response.json({ deleted: removed }, { headers: CORS });
}
