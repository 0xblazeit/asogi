import { useQuery } from "@tanstack/react-query";

const ETH_PRICE_QUERY_KEY = ["ethPrice"];
const STALE_TIME = 30 * 1000; // 30 seconds
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export function useEthPrice() {
  return useQuery({
    queryKey: ETH_PRICE_QUERY_KEY,
    queryFn: async function () {
      const response = await fetch("/api/eth-price");
      if (!response.ok) {
        throw new Error("Failed to fetch ETH price");
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchIntervalInBackground: true, // Continue refetching even when tab is in background
    staleTime: STALE_TIME, // Consider data fresh for 30 seconds
    gcTime: CACHE_TIME, // Keep unused data in cache for 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: function (attemptIndex) {
      return Math.min(1000 * Math.pow(2, attemptIndex), 30000); // Exponential backoff
    },
  });
}
