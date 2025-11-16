
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCanvasCredentials = () => {
  const { session } = useAuth();

  const getCanvasCredentials = async () => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Use the secure RPC function to get decrypted credentials
    const { data, error } = await supabase.rpc('get_canvas_credentials', {
      user_id_param: session.user.id
    });

    if (error) {
      console.error('Error fetching Canvas credentials:', error);
      throw new Error(`Failed to fetch Canvas credentials: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Canvas credentials not configured');
    }

    const credentials = data[0];
    
    if (!credentials.canvas_instance_url || !credentials.canvas_access_token) {
      throw new Error('Canvas credentials not configured');
    }

    return {
      canvasUrl: credentials.canvas_instance_url,
      canvasToken: credentials.canvas_access_token
    };
  };

  return { getCanvasCredentials };
};
