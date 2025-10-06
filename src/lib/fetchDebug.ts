export async function debugFetch(url: string, options: RequestInit = {}) {
  const id = Math.random().toString(36).slice(2, 8);
  const opts: RequestInit = {
    ...options,
    headers: {
      ...(options.headers || {}),
      'X-Debug-Id': id,
    },
    // ensure no caching so requests show in Network tab
    cache: 'no-store',
    // @ts-expect-error next runtime option
    next: { revalidate: 0 },
  };
  // eslint-disable-next-line no-console
  console.log(`🛰️ [${id}] Fetching`, url, opts);
  const res = await fetch(url, opts);
  // eslint-disable-next-line no-console
  console.log(`✅ [${id}] Response`, res.status, res.statusText);
  const cloned = res.clone();
  let data: unknown = null;
  try {
    data = await cloned.json();
  } catch {
    data = null;
  }
  // eslint-disable-next-line no-console
  console.log(`📦 [${id}] Data`, data);
  return res;
}


