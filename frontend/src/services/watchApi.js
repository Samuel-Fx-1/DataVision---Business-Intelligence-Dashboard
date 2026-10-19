// Talks only to our own backend. No provider keys or third-party URLs live in the browser.
const RAW = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
// Works whether VITE_API_BASE_URL is "https://host" or "https://host/api" (or empty with the Vite proxy).
const API = RAW.endsWith('/api') ? RAW : `${RAW}/api`;

export async function fetchWatchOptions(matchId, country, signal) {
  const query = country ? `?country=${encodeURIComponent(country)}` : '';
  const res = await fetch(`${API}/matches/${encodeURIComponent(matchId)}/watch${query}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // keep body null; handled below
  }

  if (!res.ok || !body || !body.success) {
    throw new Error(body?.error?.message || 'We could not load broadcaster details.');
  }
  return body;
}
