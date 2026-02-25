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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analysis_queue: {
        Row: {
          completed_at: string | null
          conversation_id: string
          created_at: string
          error_message: string | null
          github_repo_url: string | null
          id: string
          is_own_website: boolean
          model: string
          priority: number
          profile_id: string | null
          started_at: string | null
          status: string
          url: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conversation_id: string
          created_at?: string
          error_message?: string | null
          github_repo_url?: string | null
          id?: string
          is_own_website?: boolean
          model?: string
          priority?: number
          profile_id?: string | null
          started_at?: string | null
          status?: string
          url: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string
          created_at?: string
          error_message?: string | null
          github_repo_url?: string | null
          id?: string
          is_own_website?: boolean
          model?: string
          priority?: number
          profile_id?: string | null
          started_at?: string | null
          status?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
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
      improvement_tasks: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          status: string
          title: string
          user_id: string
          website_profile_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          user_id: string
          website_profile_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          user_id?: string
          website_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "improvement_tasks_website_profile_id_fkey"
            columns: ["website_profile_id"]
            isOneToOne: false
            referencedRelation: "website_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_premium: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: number | null
          created_at: string | null
          email: string
          freemius_customer_id: string
          freemius_subscription_id: string
          id: string
          is_premium: boolean
          next_payment_date: string | null
          subscription_end_date: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: number | null
          created_at?: string | null
          email: string
          freemius_customer_id: string
          freemius_subscription_id: string
          id?: string
          is_premium?: boolean
          next_payment_date?: string | null
          subscription_end_date?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: number | null
          created_at?: string | null
          email?: string
          freemius_customer_id?: string
          freemius_subscription_id?: string
          id?: string
          is_premium?: boolean
          next_payment_date?: string | null
          subscription_end_date?: string | null
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
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      registration_attempts: {
        Row: {
          attempted_at: string
          email_hash: string | null
          id: string
          ip_hash: string
        }
        Insert: {
          attempted_at?: string
          email_hash?: string | null
          id?: string
          ip_hash: string
        }
        Update: {
          attempted_at?: string
          email_hash?: string | null
          id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          credits_reset_at: string
          credits_used: number
          daily_credits_limit: number
          freemius_customer_id: string | null
          freemius_subscription_id: string | null
          id: string
          is_premium: boolean
          last_password_reset_at: string | null
          next_payment_date: string | null
          premium_since: string | null
          subscription_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          credits_reset_at?: string
          credits_used?: number
          daily_credits_limit?: number
          freemius_customer_id?: string | null
          freemius_subscription_id?: string | null
          id?: string
          is_premium?: boolean
          last_password_reset_at?: string | null
          next_payment_date?: string | null
          premium_since?: string | null
          subscription_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          credits_reset_at?: string
          credits_used?: number
          daily_credits_limit?: number
          freemius_customer_id?: string | null
          freemius_subscription_id?: string | null
          id?: string
          is_premium?: boolean
          last_password_reset_at?: string | null
          next_payment_date?: string | null
          premium_since?: string | null
          subscription_end_date?: string | null
          updated_at?: string
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
      website_profiles: {
        Row: {
          category_scores: Json | null
          code_analysis: Json | null
          conversation_id: string
          created_at: string
          error_message: string | null
          github_repo_url: string | null
          id: string
          is_own_website: boolean
          overall_score: number | null
          profile_data: Json | null
          raw_markdown: string | null
          status: string
          url: string
          user_id: string
        }
        Insert: {
          category_scores?: Json | null
          code_analysis?: Json | null
          conversation_id: string
          created_at?: string
          error_message?: string | null
          github_repo_url?: string | null
          id?: string
          is_own_website?: boolean
          overall_score?: number | null
          profile_data?: Json | null
          raw_markdown?: string | null
          status?: string
          url: string
          user_id: string
        }
        Update: {
          category_scores?: Json | null
          code_analysis?: Json | null
          conversation_id?: string
          created_at?: string
          error_message?: string | null
          github_repo_url?: string | null
          id?: string
          is_own_website?: boolean
          overall_score?: number | null
          profile_data?: Json | null
          raw_markdown?: string | null
          status?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_profiles_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_deleted_accounts: { Args: never; Returns: undefined }
      cleanup_old_processed_events: { Args: never; Returns: undefined }
      cleanup_unconfirmed_users: { Args: never; Returns: undefined }
      deactivate_expired_subscriptions: { Args: never; Returns: undefined }
      get_auth_user_by_email: {
        Args: { lookup_email: string }
        Returns: {
          email: string
          id: string
          raw_app_meta_data: Json
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium_user: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
