import { seasonKeyFor } from '@/lib/seasons';

export const runtime = 'nodejs';

export async function GET() {
  const now = new Date().toISOString();
  const key = await seasonKeyFor(now);
  if (!key) {
    return new Response('', { status: 404 });
  }
  return new Response(key, { headers: { 'Content-Type': 'text/plain' } });
}
