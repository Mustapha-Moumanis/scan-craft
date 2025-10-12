import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadPdf, fetchQRResults, fetchHistory, type QRCode, type HistoryFile } from "@/lib/api";

// Query keys
export const queryKeys = {
  history: ["pdf-history"] as const,
  results: (fileName: string) => ["pdf-results", fileName] as const,
};

// Hook for uploading PDF
export const useUploadPdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPdf,
    onSuccess: (data) => {
      // Invalidate history query to refetch after upload
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
    },
  });
};

// Hook for fetching QR results
export const useQRResults = (fileName: string | null, enabled = true) => {
  return useQuery<QRCode[], Error>({
    queryKey: queryKeys.results(fileName || ""),
    queryFn: () => fetchQRResults(fileName!),
    enabled: !!fileName && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching history
export const useHistory = () => {
  return useQuery<HistoryFile[], Error>({
    queryKey: queryKeys.history,
    queryFn: fetchHistory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to prefetch results (useful for hover states)
export const usePrefetchResults = () => {
  const queryClient = useQueryClient();

  return (fileName: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.results(fileName),
      queryFn: () => fetchQRResults(fileName),
      staleTime: 5 * 60 * 1000,
    });
  };
};

