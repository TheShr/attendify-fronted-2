// lib/routes.ts

// ✅ Default API base (your Render backend)
const DEFAULT_API_BASE = "https://attendify-wnl8.onrender.com/api";

/**
 * Get API base from Next.js environment variable.
 * For local dev, you can override with NEXT_PUBLIC_API_URL in .env.local.
 */
function getNextEnv(): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env.NEXT_PUBLIC_API_URL;
  return typeof value === "string" ? value : undefined;
}

/**
 * Return API base URL (env > default).
 */
export function getApiBase(): string {
  const candidate = getNextEnv();
  if (candidate && candidate.trim().length > 0) {
    return candidate.trim().replace(/\/$/, "");
  }
  return DEFAULT_API_BASE;
}

/**
 * Resolve relative paths against the API base.
 * Example:
 *   resolveApiUrl("/teacher/courses") =>
 *   "https://attendify-wnl8.onrender.com/api/teacher/courses"
 */
export function resolveApiUrl(path: string): string {
  const base = getApiBase();

  // If already full URL, return as-is
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Ensure path starts with a single leading slash
  let relative = path.startsWith("/") ? path : `/${path}`;

  // Strip trailing slashes from base
  const trimmedBase = base.replace(/\/+$/, "");
  const baseHasApi = trimmedBase.endsWith("/api");

  // Avoid double "/api/api"
  if (baseHasApi && relative.startsWith("/api/")) {
    relative = relative.slice(4);
  } else if (baseHasApi && relative === "/api") {
    relative = "";
  }

  return `${trimmedBase}${relative}`;
}

/**
 * Fetch wrapper.
 */
export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(resolveApiUrl(path), {
    ...init,
    credentials: "include", // ✅ ensure cookies (JWT in cookies) are sent
  });
}

/**
 * JSON fetch wrapper with type safety and error handling.
 */
export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed with ${response.status}: ${text}`);
  }
  return (await response.json()) as T;
}

// ✅ Export a single constant if you need direct base
export const API_BASE = getApiBase();
