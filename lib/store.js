/**
 * lib/store.js
 * Almacen EN MEMORIA (sin base de datos). Se reinicia al reiniciar el server.
 */

export const users = [
  { id: 1, username: 'alice', password: 'alice123' },
  { id: 2, username: 'bob', password: 'bob123' },
];

export const todos = [
  { id: 101, ownerId: 1, title: 'Comprar café', done: false },
  { id: 102, ownerId: 1, title: 'Pagar el arriendo', done: false },
  { id: 103, ownerId: 2, title: 'Llamar al dentista', done: true },
];

let _nextId = 200;
export function nextTodoId() {
  return _nextId++;
}

// El valor de sesion es base64 de {id, username}. (No es el foco del lab; el
// foco es que la cookie viaja SIN flags de seguridad -> ver V5.)
export function makeSession(user) {
  return Buffer.from(JSON.stringify({ id: user.id, username: user.username })).toString('base64');
}

export function readSession(req) {
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (!m) return null;
  try {
    return JSON.parse(Buffer.from(decodeURIComponent(m[1]), 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

// La aplicación solo tiene consumidores same-origin, por lo que no expone CORS.
export const CORS = {};
