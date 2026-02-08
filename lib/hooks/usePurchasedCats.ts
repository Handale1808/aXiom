import { useState, useEffect, useCallback } from "react";
import { getUserPurchasedCatAliensAction } from "@/lib/services/catAlienActions";
import { useUser } from "@/lib/context/UserContext";

interface Cat {
  id: string;
  name: string;
  svgImage: string;
}

interface UsePurchasedCatsReturn {
  cats: Cat[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePurchasedCats(): UsePurchasedCatsReturn {
  const { user } = useUser();
  const [cats, setCats] = useState<Cat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = useCallback(async () => {
    if (!user?.id) {
      setCats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const purchasedCats = await getUserPurchasedCatAliensAction(user.id);
      setCats(
        purchasedCats.map((pc) => ({
          id: pc.catAlienId,
          name: pc.name,
          svgImage: pc.svgImage,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cats");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  return {
    cats,
    isLoading,
    error,
    refetch: fetchCats,
  };
}