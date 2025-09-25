// Use your live Flask backend hosted on Render
const DEFAULT_API_BASE = "https://attendify-wnl8.onrender.com/api"

/**
 * Get API base from Next.js env var.
 * For local dev, you can override with NEXT_PUBLIC_API_URL in .env.local
 */
function getNextEnv(): string | undefined {
  if (typeof process === "undefined") return undefined
  const value = process.env.NEXT_PUBLIC_API_URL
  return typeof value === "string" ? value : undefined
}

/**
 * Return API base URL (env > default).
 */
export function getApiBase(): string {
  const candidate = getNextEnv()
  if (candidate && candidate.trim().length > 0) {
    return candidate.trim().replace(/\/$/, "")
  }
  return DEFAULT_API_BASE
}

/**
 * Resolve relative paths against the API base.
 */
export function resolveApiUrl(path: string): string {
  const base = getApiBase()
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  let relative = path.startsWith("/") ? path : `/${path}`
  const trimmedBase = base.replace(/\/+$/, "")
  const baseHasApi = trimmedBase.endsWith("/api")

  if (baseHasApi && relative.startsWith("/api/")) {
    relative = relative.slice(4)
  } else if (baseHasApi && relative === "/api") {
    relative = ""
  }

  return `${trimmedBase}${relative}`
}

/**
 * Fetch wrapper.
 */
export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(resolveApiUrl(path), init)
}

/**
 * JSON fetch wrapper with type safety and error handling.
 */
export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Request failed with ${response.status}: ${text}`)
  }
  return (await response.json()) as T
}
