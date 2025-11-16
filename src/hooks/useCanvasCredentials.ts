
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCanvasCredentials = () => {
  const { session } = useAuth();

  const getCanvasCredentials = async () => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch Canvas credentials: ${profileError.message}`);
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      throw new Error('Canvas credentials not configured');
    }

    return {
      canvasUrl: profile.canvas_instance_url,
      canvasToken: profile.canvas_access_token
    };
  };

  return { getCanvasCredentials };
};
