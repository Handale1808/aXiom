// lib/apiClient.ts
const API_BASE =
  (typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined)
    : process.env.NEXT_PUBLIC_API_BASE_URL) || "";

function joinUrl(path: string) {
  // Handles absolute and relative paths gracefully
  try {
    return new URL(path, API_BASE || "").toString();
  } catch {
    return path; // Fallback
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = joinUrl(path);

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  // Expect JSON responses from your API
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.error?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}
