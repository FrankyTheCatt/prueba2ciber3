import { CORS } from '@/lib/store';

function getSafeRedirectTarget(rawTarget, requestUrl) {
  if (
    !rawTarget ||
    !rawTarget.startsWith('/') ||
    rawTarget.startsWith('//') ||
    rawTarget.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(rawTarget)
  ) {
    return '/';
  }

  const requestOrigin = new URL(requestUrl).origin;
  const target = new URL(rawTarget, requestOrigin);
  if (target.origin !== requestOrigin) return '/';

  return `${target.pathname}${target.search}${target.hash}`;
}

export async function GET(req) {
  const rawTarget = new URL(req.url).searchParams.get('url');
  const target = getSafeRedirectTarget(rawTarget, req.url);

  return new Response(null, {
    status: 302,
    headers: { Location: target, ...CORS },
  });
}
