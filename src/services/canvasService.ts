import { supabase } from '@/integrations/supabase/client';

export interface CanvasCredentials {
  canvasUrl: string;
  canvasToken: string;
}

export interface CanvasExportRequest {
  rubricId: string;
  courseId?: number;
  assignmentId?: number;
  discussionId?: number;
  associationType: 'assignment' | 'discussion';
}

export interface CanvasExportResponse {
  success: boolean;
  canvasRubricId?: number;
  error?: string;
}

class CanvasService {
  async getCredentials(userId: string): Promise<CanvasCredentials> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch Canvas credentials: ${error.message}`);
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      throw new Error('Canvas credentials not configured');
    }

    return {
      canvasUrl: profile.canvas_instance_url,
      canvasToken: profile.canvas_access_token
    };
  }

  async exportRubricToCanvas(request: CanvasExportRequest): Promise<CanvasExportResponse> {
    const { data, error } = await supabase.functions.invoke('export-rubric-to-canvas', {
      body: request
    });

    if (error) {
      throw new Error(`Canvas export failed: ${error.message}`);
    }

    return data;
  }

  async testConnection(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('test-canvas-connection', {
        body: { userId }
      });

      if (error) throw error;
      return data?.connected || false;
    } catch (error) {
      console.error('Canvas connection test failed:', error);
      return false;
    }
  }
}

export const canvasService = new CanvasService();