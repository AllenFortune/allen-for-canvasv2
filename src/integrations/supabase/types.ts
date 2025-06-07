export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          billing_cycle_start: string
          created_at: string
          email: string
          id: string
          next_reset_date: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_cycle_start: string
          created_at?: string
          email: string
          id?: string
          next_reset_date?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_cycle_start?: string
          created_at?: string
          email?: string
          id?: string
          next_reset_date?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_user_usage: {
        Args: { user_email: string }
        Returns: undefined
      }
      get_current_month_usage: {
        Args: { user_email: string }
        Returns: number
      }
      get_purchased_submissions: {
        Args: { user_email: string }
        Returns: number
      }
      get_total_submission_limit: {
        Args: { user_email: string; base_limit: number }
        Returns: number
      }
      get_user_billing_info: {
        Args: { user_email: string }
        Returns: {
          billing_cycle_start: string
          next_reset_date: string
          days_remaining: number
        }[]
      }
      increment_usage: {
        Args: { user_email: string; user_uuid: string }
        Returns: number
      }
      increment_usage_with_billing_period: {
        Args: { user_email: string; user_uuid: string }
        Returns: number
      }
      reset_user_submissions: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
