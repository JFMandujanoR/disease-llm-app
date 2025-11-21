// frontend/src/api.js

// frontend/src/api.js
// Use a safe API base so the code works with either a configured __API_BASE__ constant
// (injected at build time) or with Vite's `import.meta.env.VITE_API_BASE`, and finally
// fallback to a relative path (empty string) which lets the browser call /api/... on
// the same origin (development proxy or backend served static files).
const API_BASE = (typeof __API_BASE__ !== "undefined" && __API_BASE__) || import.meta.env.VITE_API_BASE || "";

async function handleJsonResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Fetch available datasets / metrics
export async function fetchDiseases() {
  const res = await fetch(`${API_BASE}/api/diseases`);
  return handleJsonResponse(res); // expects { diseases: ["cases","deaths"] }
}

export async function fetchData(dataset, metric = null) {
  const params = new URLSearchParams({ dataset });
  if (metric) params.set("metric", metric);
  const url = `${API_BASE}/api/data?${params.toString()}`;
  const res = await fetch(url);
  return handleJsonResponse(res);
}

