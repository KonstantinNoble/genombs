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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      business_ideas_history: {
        Row: {
          analysis_mode: string | null
          budget_range: string
          business_context: string
          created_at: string
          id: string
          industry: string
          result: Json
          screenshot_urls: string[] | null
          team_size: string
          user_id: string
        }
        Insert: {
          analysis_mode?: string | null
          budget_range: string
          business_context: string
          created_at?: string
          id?: string
          industry: string
          result: Json
          screenshot_urls?: string[] | null
          team_size: string
          user_id: string
        }
        Update: {
          analysis_mode?: string | null
          budget_range?: string
          business_context?: string
          created_at?: string
          id?: string
          industry?: string
          result?: Json
          screenshot_urls?: string[] | null
          team_size?: string
          user_id?: string
        }
        Relationships: []
      }
      business_tools_history: {
        Row: {
          analysis_mode: string | null
          budget_range: string
          business_goals: string
          created_at: string
          id: string
          industry: string
          result: Json
          screenshot_urls: string[] | null
          team_size: string
          user_id: string
        }
        Insert: {
          analysis_mode?: string | null
          budget_range: string
          business_goals: string
          created_at?: string
          id?: string
          industry: string
          result: Json
          screenshot_urls?: string[] | null
          team_size: string
          user_id: string
        }
        Update: {
          analysis_mode?: string | null
          budget_range?: string
          business_goals?: string
          created_at?: string
          id?: string
          industry?: string
          result?: Json
          screenshot_urls?: string[] | null
          team_size?: string
          user_id?: string
        }
        Relationships: []
      }
      deleted_accounts: {
        Row: {
          deleted_at: string | null
          email_hash: string
          id: string
          reason: string | null
        }
        Insert: {
          deleted_at?: string | null
          email_hash: string
          id?: string
          reason?: string | null
        }
        Update: {
          deleted_at?: string | null
          email_hash?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      pending_premium: {
        Row: {
          created_at: string | null
          email: string
          freemius_customer_id: string
          freemius_subscription_id: string
          id: string
          is_premium: boolean
        }
        Insert: {
          created_at?: string | null
          email: string
          freemius_customer_id: string
          freemius_subscription_id: string
          id?: string
          is_premium?: boolean
        }
        Update: {
          created_at?: string | null
          email?: string
          freemius_customer_id?: string
          freemius_subscription_id?: string
          id?: string
          is_premium?: boolean
        }
        Relationships: []
      }
      processed_webhook_events: {
        Row: {
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          processed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          analysis_count: number | null
          analysis_window_start: string | null
          created_at: string
          deep_analysis_count: number | null
          deep_analysis_window_start: string | null
          freemius_customer_id: string | null
          freemius_subscription_id: string | null
          id: string
          ideas_count: number | null
          ideas_window_start: string | null
          is_premium: boolean
          last_analysis_at: string | null
          last_reset_date: string
          premium_since: string | null
          standard_analysis_count: number | null
          standard_analysis_window_start: string | null
          tools_count: number | null
          tools_window_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_count?: number | null
          analysis_window_start?: string | null
          created_at?: string
          deep_analysis_count?: number | null
          deep_analysis_window_start?: string | null
          freemius_customer_id?: string | null
          freemius_subscription_id?: string | null
          id?: string
          ideas_count?: number | null
          ideas_window_start?: string | null
          is_premium?: boolean
          last_analysis_at?: string | null
          last_reset_date?: string
          premium_since?: string | null
          standard_analysis_count?: number | null
          standard_analysis_window_start?: string | null
          tools_count?: number | null
          tools_window_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_count?: number | null
          analysis_window_start?: string | null
          created_at?: string
          deep_analysis_count?: number | null
          deep_analysis_window_start?: string | null
          freemius_customer_id?: string | null
          freemius_subscription_id?: string | null
          id?: string
          ideas_count?: number | null
          ideas_window_start?: string | null
          is_premium?: boolean
          last_analysis_at?: string | null
          last_reset_date?: string
          premium_since?: string | null
          standard_analysis_count?: number | null
          standard_analysis_window_start?: string | null
          tools_count?: number | null
          tools_window_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_update_analysis_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      cleanup_old_deleted_accounts: { Args: never; Returns: undefined }
      cleanup_old_processed_events: { Args: never; Returns: undefined }
      cleanup_unconfirmed_users: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
