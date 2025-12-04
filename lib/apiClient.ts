let lastRequestId: string | null = null;

export function getLastRequestId(): string | null {
  return lastRequestId;
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Extract request ID from response headers
  const requestId = response.headers.get("X-Request-Id");
  if (requestId) {
    lastRequestId = requestId;
    (window as any).__lastRequestId = requestId; // ← ADD THIS LINE
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: { message: "An error occurred" },
    }));

    const errorMessage =
      errorData.error?.message || errorData.message || "An error occurred";

    // Log error with request ID for debugging
    console.error("API Error:", {
      url,
      status: response.status,
      message: errorMessage,
      requestId: requestId || "unknown",
      timestamp: new Date().toISOString(),
    });

    throw new Error(errorMessage);
  }

  return response.json();
}
