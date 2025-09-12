import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface StorageStatus {
  available: boolean;
  bucketName?: string;
  error?: string;
  message: string;
}

export function useStorageStatus() {
  return useQuery({
    queryKey: ['storage', 'status'],
    queryFn: async (): Promise<StorageStatus> => {
      const response = await apiRequest('GET', '/api/storage/status');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}