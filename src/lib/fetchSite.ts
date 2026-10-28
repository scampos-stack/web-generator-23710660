export interface SiteFetchResult {
  html: string | null;
  fetchError: string | null;
  fetchTimeMs: number | null;
  httpStatus: number | null;
}

export async function fetchSite(url: string): Promise<SiteFetchResult> {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WebAuditBot/1.0; +outbound prospecting audit)",
      },
      signal: AbortSignal.timeout(15000),
    });
    const fetchTimeMs = Date.now() - started;

    if (!res.ok) {
      return {
        html: null,
        fetchError: `Page returned HTTP ${res.status}`,
        fetchTimeMs,
        httpStatus: res.status,
      };
    }

    const html = await res.text();
    return { html, fetchError: null, fetchTimeMs, httpStatus: res.status };
  } catch (err) {
    const fetchTimeMs = Date.now() - started;
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return { html: null, fetchError: message, fetchTimeMs, httpStatus: null };
  }
}
