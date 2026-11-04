import { seasonKeyFor } from '@/lib/seasons';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const now = new Date().toISOString();
    const key = await seasonKeyFor(now);
    if (!key) {
      return new Response('', { status: 404 });
    }
    return new Response(key, { headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    console.error('[season-key]', err instanceof Error ? err.message : err);
    return new Response('', { status: 503 });
  }
}
