// Ensures calls run client-side, disable caching, and log a readable trace.
// Use this wrapper for every /api/* call you want visible in Network.

export type DebugFetchReturn<T = unknown> = {
  res: Response;
  data: T | null;
  id: string;
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export async function debugFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<DebugFetchReturn<T>> {
  // If running on server for some reason, bail with a clear error.
  if (!isBrowser()) {
    // This prevents silent server-side fetches that won't appear in the Network tab
    throw new Error(`debugFetch("${url}") called on the server. Move this call into a client component or useEffect.`);
  }

  const id = Math.random().toString(36).slice(2, 8);
  const opts: RequestInit = {
    cache: 'no-store', // force browser request
    ...options,
    headers: {
      ...(options.headers || {}),
      'X-Debug-Client': 'true', // easy to filter in Network
    },
  };

  // Absolute URL avoids iframe/wrong-origin issues
  const absoluteUrl = url.startsWith('http')
    ? url
    : `${window.location.origin}${url}`;

  console.log(`🛰️ [${id}] FETCH ->`, absoluteUrl, opts);

  const res = await fetch(absoluteUrl, opts);

  const ct = res.headers.get('content-type') || '';
  let data: unknown = null;
  try {
    data = ct.includes('application/json')
      ? await res.clone().json()
      : await res.clone().text();
  } catch (e) {
    data = `(body parse error: ${String(e)})`;
  }

  console.log(
    `✅ [${id}] ${res.status} ${res.statusText} | ${ct || 'no content-type'}`
  );
  console.log(`📦 [${id}] DATA ->`, data);

  return { res, data: data as T, id };
}
