export const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/$/, "");
export const API_HOST = new URL(API).host;

export async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);
  const type = response.headers.get("content-type") || "";
  return type.includes("text/csv") ? response.blob() : response.json();
}

export const query = (values) => new URLSearchParams(values).toString();
