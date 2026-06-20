import { promises as fs } from 'fs';
import path from 'path';
import { CORS } from '@/lib/store';

const NOTES_DIR = path.resolve(process.cwd(), 'data', 'notes');

function isValidFileName(name) {
  return /^[a-zA-Z0-9._-]+$/.test(name) && !name.includes('..');
}

export async function GET(req) {
  const name = new URL(req.url).searchParams.get('name') || 'bienvenida.txt';

  if (!isValidFileName(name)) {
    return Response.json(
      { error: 'Nombre de archivo inválido' },
      { status: 400, headers: CORS }
    );
  }

  const requestedPath = path.resolve(NOTES_DIR, name);
  if (!requestedPath.startsWith(`${NOTES_DIR}${path.sep}`)) {
    return Response.json({ error: 'Acceso denegado' }, { status: 403, headers: CORS });
  }

  try {
    // realpath también impide escapar mediante enlaces simbólicos dentro del directorio.
    const realNotesDir = await fs.realpath(NOTES_DIR);
    const realRequestedPath = await fs.realpath(requestedPath);
    if (!realRequestedPath.startsWith(`${realNotesDir}${path.sep}`)) {
      return Response.json({ error: 'Acceso denegado' }, { status: 403, headers: CORS });
    }

    const content = await fs.readFile(realRequestedPath, 'utf-8');
    return new Response(content, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS },
    });
  } catch {
    return Response.json({ error: 'Archivo no encontrado' }, { status: 404, headers: CORS });
  }
}
