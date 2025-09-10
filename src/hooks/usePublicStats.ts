import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PublicStats {
  totalSubmissions: string;
  rawTotal: number;
}

export const usePublicStats = () => {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async (): Promise<PublicStats> => {
      const { data, error } = await supabase.functions.invoke('get-public-stats');
      
      if (error) {
        console.error('Error fetching public stats:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};