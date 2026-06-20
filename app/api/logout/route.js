import { CORS } from '@/lib/store';

export async function POST() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return Response.json(
    { ok: true },
    {
      headers: {
        ...CORS,
        'Set-Cookie': `session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
      },
    }
  );
}
