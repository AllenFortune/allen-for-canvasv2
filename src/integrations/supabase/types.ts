export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_email: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          reason: string | null
          target_user_email: string
        }
        Insert: {
          action_type: string
          admin_email: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          reason?: string | null
          target_user_email: string
        }
        Update: {
          action_type?: string
          admin_email?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          reason?: string | null
          target_user_email?: string
        }
        Relationships: []
      }
      admin_email_campaigns: {
        Row: {
          campaign_name: string
          email_type: string
          id: string
          sent_at: string | null
          sent_by_admin_email: string
          sent_to_email: string
          success: boolean | null
          template_used: string | null
        }
        Insert: {
          campaign_name: string
          email_type: string
          id?: string
          sent_at?: string | null
          sent_by_admin_email: string
          sent_to_email: string
          success?: boolean | null
          template_used?: string | null
        }
        Update: {
          campaign_name?: string
          email_type?: string
          id?: string
          sent_at?: string | null
          sent_by_admin_email?: string
          sent_to_email?: string
          success?: boolean | null
          template_used?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      custom_gpt_files: {
        Row: {
          content_type: string | null
          created_at: string
          custom_gpt_id: string
          file_size: number | null
          filename: string
          id: string
          openai_file_id: string | null
          processed_content: string | null
          upload_status: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          custom_gpt_id: string
          file_size?: number | null
          filename: string
          id?: string
          openai_file_id?: string | null
          processed_content?: string | null
          upload_status?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          custom_gpt_id?: string
          file_size?: number | null
          filename?: string
          id?: string
          openai_file_id?: string | null
          processed_content?: string | null
          upload_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_gpt_files_custom_gpt_id_fkey"
            columns: ["custom_gpt_id"]
            isOneToOne: false
            referencedRelation: "custom_gpts"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_gpts: {
        Row: {
          canvas_config: Json | null
          created_at: string
          description: string | null
          gpt_id: string | null
          grade_level: string | null
          id: string
          knowledge_base_files: Json | null
          name: string
          openai_config: Json | null
          purpose: string | null
          socratic_config: Json | null
          status: string
          subject_area: string | null
          updated_at: string
          usage_stats: Json | null
          user_id: string
        }
        Insert: {
          canvas_config?: Json | null
          created_at?: string
          description?: string | null
          gpt_id?: string | null
          grade_level?: string | null
          id?: string
          knowledge_base_files?: Json | null
          name: string
          openai_config?: Json | null
          purpose?: string | null
          socratic_config?: Json | null
          status?: string
          subject_area?: string | null
          updated_at?: string
          usage_stats?: Json | null
          user_id: string
        }
        Update: {
          canvas_config?: Json | null
          created_at?: string
          description?: string | null
          gpt_id?: string | null
          grade_level?: string | null
          id?: string
          knowledge_base_files?: Json | null
          name?: string
          openai_config?: Json | null
          purpose?: string | null
          socratic_config?: Json | null
          status?: string
          subject_area?: string | null
          updated_at?: string
          usage_stats?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      feature_notifications: {
        Row: {
          created_at: string | null
          email: string
          feature_name: string
          id: string
          notified_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          feature_name: string
          id?: string
          notified_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          feature_name?: string
          id?: string
          notified_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          canvas_access_token: string | null
          canvas_instance_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          school_name: string | null
          updated_at: string
        }
        Insert: {
          canvas_access_token?: string | null
          canvas_instance_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          school_name?: string | null
          updated_at?: string
        }
        Update: {
          canvas_access_token?: string | null
          canvas_instance_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          school_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          referral_id: string
          reward_type: Database["public"]["Enums"]["reward_type"]
          submissions_granted: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id: string
          reward_type: Database["public"]["Enums"]["reward_type"]
          submissions_granted?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id?: string
          reward_type?: Database["public"]["Enums"]["reward_type"]
          submissions_granted?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          canvas_connected_at: string | null
          created_at: string
          id: string
          referee_email: string | null
          referee_user_id: string | null
          referral_code: string
          referrer_email: string
          referrer_user_id: string
          rewards_granted_at: string | null
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string
        }
        Insert: {
          canvas_connected_at?: string | null
          created_at?: string
          id?: string
          referee_email?: string | null
          referee_user_id?: string | null
          referral_code: string
          referrer_email: string
          referrer_user_id: string
          rewards_granted_at?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Update: {
          canvas_connected_at?: string | null
          created_at?: string
          id?: string
          referee_email?: string | null
          referee_user_id?: string | null
          referral_code?: string
          referrer_email?: string
          referrer_user_id?: string
          rewards_granted_at?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_user_id_fkey"
            columns: ["referee_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_templates: {
        Row: {
          created_at: string
          created_by: string | null
          criteria: Json
          description: string | null
          diver_alignment: Json | null
          grade_level: string | null
          id: string
          is_public: boolean | null
          name: string
          performance_levels: Json
          rubric_type: Database["public"]["Enums"]["rubric_type"]
          subject_area: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          diver_alignment?: Json | null
          grade_level?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          performance_levels?: Json
          rubric_type: Database["public"]["Enums"]["rubric_type"]
          subject_area?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          diver_alignment?: Json | null
          grade_level?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          performance_levels?: Json
          rubric_type?: Database["public"]["Enums"]["rubric_type"]
          subject_area?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rubrics: {
        Row: {
          ai_literacy_components: Json | null
          canvas_rubric_id: number | null
          course_id: number | null
          created_at: string
          criteria: Json
          description: string | null
          diver_alignment: Json | null
          export_log: Json | null
          exported_to_canvas: boolean | null
          id: string
          last_used_at: string | null
          performance_levels: Json
          points_possible: number
          rubric_type: Database["public"]["Enums"]["rubric_type"]
          source_assignment_id: number | null
          source_content: string | null
          source_type: string | null
          status: Database["public"]["Enums"]["rubric_status"]
          title: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          ai_literacy_components?: Json | null
          canvas_rubric_id?: number | null
          course_id?: number | null
          created_at?: string
          criteria?: Json
          description?: string | null
          diver_alignment?: Json | null
          export_log?: Json | null
          exported_to_canvas?: boolean | null
          id?: string
          last_used_at?: string | null
          performance_levels?: Json
          points_possible?: number
          rubric_type?: Database["public"]["Enums"]["rubric_type"]
          source_assignment_id?: number | null
          source_content?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["rubric_status"]
          title: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          ai_literacy_components?: Json | null
          canvas_rubric_id?: number | null
          course_id?: number | null
          created_at?: string
          criteria?: Json
          description?: string | null
          diver_alignment?: Json | null
          export_log?: Json | null
          exported_to_canvas?: boolean | null
          id?: string
          last_used_at?: string | null
          performance_levels?: Json
          points_possible?: number
          rubric_type?: Database["public"]["Enums"]["rubric_type"]
          source_assignment_id?: number | null
          source_content?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["rubric_status"]
          title?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      submission_purchases: {
        Row: {
          amount: number
          created_at: string
          email: string
          id: string
          status: string
          stripe_session_id: string | null
          submissions_purchased: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          submissions_purchased?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          submissions_purchased?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          account_status: string | null
          billing_cycle_start: string
          created_at: string
          email: string
          id: string
          next_reset_date: string | null
          pause_reason: string | null
          paused_at: string | null
          paused_by: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          unlimited_override: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_status?: string | null
          billing_cycle_start: string
          created_at?: string
          email: string
          id?: string
          next_reset_date?: string | null
          pause_reason?: string | null
          paused_at?: string | null
          paused_by?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          unlimited_override?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_status?: string | null
          billing_cycle_start?: string
          created_at?: string
          email?: string
          id?: string
          next_reset_date?: string | null
          pause_reason?: string | null
          paused_at?: string | null
          paused_by?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          unlimited_override?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      usage_history: {
        Row: {
          base_submissions_used: number
          billing_period: string
          created_at: string
          email: string
          id: string
          period_end: string
          period_start: string
          plan_tier: string
          purchased_submissions_used: number
          total_available: number
          user_id: string
        }
        Insert: {
          base_submissions_used?: number
          billing_period: string
          created_at?: string
          email: string
          id?: string
          period_end: string
          period_start: string
          plan_tier: string
          purchased_submissions_used?: number
          total_available?: number
          user_id: string
        }
        Update: {
          base_submissions_used?: number
          billing_period?: string
          created_at?: string
          email?: string
          id?: string
          period_end?: string
          period_start?: string
          plan_tier?: string
          purchased_submissions_used?: number
          total_available?: number
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          billing_period: string | null
          created_at: string
          email: string
          id: string
          month_year: string
          submissions_used: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_period?: string | null
          created_at?: string
          email: string
          id?: string
          month_year: string
          submissions_used?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_period?: string | null
          created_at?: string
          email?: string
          id?: string
          month_year?: string
          submissions_used?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_grading_preferences: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          prompt_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          prompt_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          prompt_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_user_usage: { Args: { user_email: string }; Returns: undefined }
      encrypt_canvas_token: { Args: { token: string }; Returns: string }
      encrypt_canvas_token_secure: { Args: { token: string }; Returns: string }
      generate_referral_code:
        | { Args: { user_id_param: string }; Returns: string }
        | { Args: { user_email: string }; Returns: string }
      get_admin_user_list: {
        Args: never
        Returns: {
          account_status: string
          canvas_connected: boolean
          created_at: string
          current_month_submissions: number
          email: string
          full_name: string
          id: string
          last_usage_date: string
          purchased_submissions: number
          school_name: string
          subscription_limit: number
          subscription_status: string
          subscription_tier: string
          total_submissions: number
        }[]
      }
      get_admin_user_stats: {
        Args: never
        Returns: {
          canvas_connected: number
          canvas_not_connected: number
          recent_signups: number
          total_users: number
        }[]
      }
      get_current_month_usage: { Args: { user_email: string }; Returns: number }
      get_monthly_revenue_stats: {
        Args: never
        Returns: {
          current_month_mrr: number
          current_month_name: string
          growth_percentage: number
          previous_month_mrr: number
          previous_month_name: string
        }[]
      }
      get_purchased_submissions: {
        Args: { user_email: string }
        Returns: number
      }
      get_total_submission_limit: {
        Args: { base_limit: number; user_email: string }
        Returns: number
      }
      get_user_billing_info: {
        Args: { user_email: string }
        Returns: {
          billing_cycle_start: string
          days_remaining: number
          next_reset_date: string
        }[]
      }
      get_user_referral_stats: {
        Args: { user_email_param: string }
        Returns: {
          completed_referrals: number
          pending_referrals: number
          referral_code: string
          total_referrals: number
          total_rewards_earned: number
        }[]
      }
      get_weekly_revenue_trend: {
        Args: never
        Returns: {
          churned_this_week: number
          current_week_new_mrr: number
          new_subscribers_this_week: number
          previous_week_new_mrr: number
          week_growth_percentage: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_rubric_usage: {
        Args: { rubric_id: string }
        Returns: undefined
      }
      increment_usage: {
        Args: { user_email: string; user_uuid: string }
        Returns: number
      }
      increment_usage_with_billing_period: {
        Args: { user_email: string; user_uuid: string }
        Returns: number
      }
      process_referral_rewards: {
        Args: { referee_email_param: string; referee_user_id_param: string }
        Returns: undefined
      }
      reset_user_submissions: {
        Args: { user_email: string }
        Returns: undefined
      }
      validate_subscription_tier: { Args: { tier: string }; Returns: boolean }
      validate_user_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      referral_status: "pending" | "completed" | "rewarded"
      reward_type: "referrer_bonus" | "referee_bonus"
      rubric_status: "draft" | "published" | "archived"
      rubric_type: "analytic" | "holistic" | "single_point"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      referral_status: ["pending", "completed", "rewarded"],
      reward_type: ["referrer_bonus", "referee_bonus"],
      rubric_status: ["draft", "published", "archived"],
      rubric_type: ["analytic", "holistic", "single_point"],
    },
  },
} as const
