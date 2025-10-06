export async function debugFetch(url: string, options: RequestInit = {}) {
  const id = Math.random().toString(36).slice(2, 8);
  const opts: RequestInit = {
    cache: 'no-store',
    ...options,
    headers: { ...(options.headers || {}), 'X-Debug-Client': 'true' },
  };
  console.log(`🛰️ [${id}] Fetch`, url, opts);
  const res = await fetch(url, opts);

  const ct = res.headers.get('content-type') || '';
  let body: unknown = null;
  try {
    body = ct.includes('application/json') ? await res.clone().json() : await res.clone().text();
  } catch (e) {
    body = `(parse error: ${String(e)})`;
  }
  console.log(`✅ [${id}] ${res.status} ${res.statusText} | ${ct}`);
  console.log(`📦 [${id}] Data`, body);

  return res; // callers can still do res.json()
}


