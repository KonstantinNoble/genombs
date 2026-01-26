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
      decision_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          decision_id: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          decision_id: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          decision_id?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_audit_log_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decision_records"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_records: {
        Row: {
          budget_range: string | null
          confirmed_at: string | null
          created_at: string
          deadline: string | null
          decision_context: string
          decision_title: string
          export_count: number | null
          exported_at: string | null
          id: string
          stakeholders: string[] | null
          status: string
          team_id: string | null
          user_confirmed_ownership: boolean | null
          user_id: string
          validation_id: string | null
        }
        Insert: {
          budget_range?: string | null
          confirmed_at?: string | null
          created_at?: string
          deadline?: string | null
          decision_context: string
          decision_title: string
          export_count?: number | null
          exported_at?: string | null
          id?: string
          stakeholders?: string[] | null
          status?: string
          team_id?: string | null
          user_confirmed_ownership?: boolean | null
          user_id: string
          validation_id?: string | null
        }
        Update: {
          budget_range?: string | null
          confirmed_at?: string | null
          created_at?: string
          deadline?: string | null
          decision_context?: string
          decision_title?: string
          export_count?: number | null
          exported_at?: string | null
          id?: string
          stakeholders?: string[] | null
          status?: string
          team_id?: string | null
          user_confirmed_ownership?: boolean | null
          user_id?: string
          validation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_records_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_records_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "validation_analyses"
            referencedColumns: ["id"]
          },
        ]
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
      experiment_checkpoints: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string
          experiment_id: string
          id: string
          metrics_data: Json | null
          order_index: number
          reflection: string | null
          title: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date: string
          experiment_id: string
          id?: string
          metrics_data?: Json | null
          order_index?: number
          reflection?: string | null
          title: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string
          experiment_id?: string
          id?: string
          metrics_data?: Json | null
          order_index?: number
          reflection?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_checkpoints_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_evidence: {
        Row: {
          created_at: string
          direction: string
          evidence_type: string
          experiment_id: string
          id: string
          note: string
          order_index: number
          strength: string
        }
        Insert: {
          created_at?: string
          direction: string
          evidence_type: string
          experiment_id: string
          id?: string
          note: string
          order_index?: number
          strength: string
        }
        Update: {
          created_at?: string
          direction?: string
          evidence_type?: string
          experiment_id?: string
          id?: string
          note?: string
          order_index?: number
          strength?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_evidence_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          experiment_id: string
          id: string
          notes: string | null
          order_index: number
          outcome: string | null
          title: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          experiment_id: string
          id?: string
          notes?: string | null
          order_index?: number
          outcome?: string | null
          title: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          experiment_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          outcome?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_tasks_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string
          decision_question: string | null
          decision_rationale: string | null
          duration_days: number
          end_date: string
          final_decision: string | null
          final_review: Json | null
          hypothesis: string
          id: string
          start_date: string
          status: string
          success_metrics: Json
          team_id: string | null
          title: string
          updated_at: string
          user_id: string
          validation_id: string | null
        }
        Insert: {
          created_at?: string
          decision_question?: string | null
          decision_rationale?: string | null
          duration_days: number
          end_date: string
          final_decision?: string | null
          final_review?: Json | null
          hypothesis: string
          id?: string
          start_date?: string
          status?: string
          success_metrics?: Json
          team_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          validation_id?: string | null
        }
        Update: {
          created_at?: string
          decision_question?: string | null
          decision_rationale?: string | null
          duration_days?: number
          end_date?: string
          final_decision?: string | null
          final_review?: Json | null
          hypothesis?: string
          id?: string
          start_date?: string
          status?: string
          success_metrics?: Json
          team_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          validation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "validation_analyses"
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
      team_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          freemius_customer_id: string | null
          freemius_subscription_id: string | null
          id: string
          is_premium: boolean
          last_password_reset_at: string | null
          last_reset_date: string
          next_payment_date: string | null
          premium_since: string | null
          subscription_end_date: string | null
          updated_at: string
          user_id: string
          validation_count: number | null
          validation_window_start: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          freemius_customer_id?: string | null
          freemius_subscription_id?: string | null
          id?: string
          is_premium?: boolean
          last_password_reset_at?: string | null
          last_reset_date?: string
          next_payment_date?: string | null
          premium_since?: string | null
          subscription_end_date?: string | null
          updated_at?: string
          user_id: string
          validation_count?: number | null
          validation_window_start?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          freemius_customer_id?: string | null
          freemius_subscription_id?: string | null
          id?: string
          is_premium?: boolean
          last_password_reset_at?: string | null
          last_reset_date?: string
          next_payment_date?: string | null
          premium_since?: string | null
          subscription_end_date?: string | null
          updated_at?: string
          user_id?: string
          validation_count?: number | null
          validation_window_start?: string | null
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
      validation_analyses: {
        Row: {
          citations: Json | null
          competitor_insights: string | null
          consensus_points: Json | null
          created_at: string | null
          creativity_preference: number | null
          dissent_points: Json | null
          final_recommendation: Json | null
          gemini_flash_response: Json | null
          gemini_pro_response: Json | null
          gpt_response: Json | null
          id: string
          is_premium: boolean | null
          long_term_outlook: Json | null
          majority_points: Json | null
          model_responses: Json | null
          model_weights: Json | null
          overall_confidence: number | null
          processing_time_ms: number | null
          prompt: string
          risk_preference: number | null
          selected_models: string[] | null
          strategic_alternatives: Json | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          citations?: Json | null
          competitor_insights?: string | null
          consensus_points?: Json | null
          created_at?: string | null
          creativity_preference?: number | null
          dissent_points?: Json | null
          final_recommendation?: Json | null
          gemini_flash_response?: Json | null
          gemini_pro_response?: Json | null
          gpt_response?: Json | null
          id?: string
          is_premium?: boolean | null
          long_term_outlook?: Json | null
          majority_points?: Json | null
          model_responses?: Json | null
          model_weights?: Json | null
          overall_confidence?: number | null
          processing_time_ms?: number | null
          prompt: string
          risk_preference?: number | null
          selected_models?: string[] | null
          strategic_alternatives?: Json | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          citations?: Json | null
          competitor_insights?: string | null
          consensus_points?: Json | null
          created_at?: string | null
          creativity_preference?: number | null
          dissent_points?: Json | null
          final_recommendation?: Json | null
          gemini_flash_response?: Json | null
          gemini_pro_response?: Json | null
          gpt_response?: Json | null
          id?: string
          is_premium?: boolean | null
          long_term_outlook?: Json | null
          majority_points?: Json | null
          model_responses?: Json | null
          model_weights?: Json | null
          overall_confidence?: number | null
          processing_time_ms?: number | null
          prompt?: string
          risk_preference?: number | null
          selected_models?: string[] | null
          strategic_alternatives?: Json | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_analyses_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
      check_comment_limit: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_expired_invitations: { Args: never; Returns: undefined }
      cleanup_old_deleted_accounts: { Args: never; Returns: undefined }
      cleanup_old_processed_events: { Args: never; Returns: undefined }
      cleanup_unconfirmed_users: { Args: never; Returns: undefined }
      deactivate_expired_subscriptions: { Args: never; Returns: undefined }
      get_next_comment_time: { Args: { p_user_id: string }; Returns: string }
      get_owned_teams: {
        Args: { _user_id: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_remaining_comments: { Args: { p_user_id: string }; Returns: number }
      get_user_dashboard_stats: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_validation_count: {
        Args: { reset_window?: boolean; user_uuid: string }
        Returns: undefined
      }
      is_premium_user: { Args: { _user_id: string }; Returns: boolean }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_owner: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      log_decision_action: {
        Args: { p_action: string; p_decision_id: string; p_metadata?: Json }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      team_role: "owner" | "admin" | "member" | "viewer"
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
      team_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
