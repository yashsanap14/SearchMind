import { useState, useCallback } from "react";
import { SearchRequest, SearchResponse } from "@/shared/types";

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState<SearchResponse | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() } as SearchRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const searchResult: SearchResponse = await response.json();
      setCurrentSearch(searchResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setCurrentSearch(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    currentSearch,
    performSearch,
    clearSearch,
  };
}
