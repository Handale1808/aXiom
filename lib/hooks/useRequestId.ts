import { useState, useEffect } from "react";
import { getLastRequestId } from "@/lib/apiClient";

export function useRequestId() {
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    // Check for request ID after each render
    const id = getLastRequestId();
    if (id && id !== requestId) {
      setRequestId(id);
    }
  });

  return requestId;
}