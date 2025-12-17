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
      active_strategies: {
        Row: {
          autopilot_enabled: boolean | null
          autopilot_last_generated: string | null
          completed_actions: number
          completed_phases: number
          created_at: string
          current_streak: number | null
          id: string
          is_deep_mode: boolean
          longest_streak: number | null
          name: string
          original_result: Json
          status: string
          total_actions: number
          total_focus_tasks_completed: number | null
          total_phases: number
          updated_at: string
          user_id: string
        }
        Insert: {
          autopilot_enabled?: boolean | null
          autopilot_last_generated?: string | null
          completed_actions?: number
          completed_phases?: number
          created_at?: string
          current_streak?: number | null
          id?: string
          is_deep_mode?: boolean
          longest_streak?: number | null
          name: string
          original_result: Json
          status?: string
          total_actions?: number
          total_focus_tasks_completed?: number | null
          total_phases?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          autopilot_enabled?: boolean | null
          autopilot_last_generated?: string | null
          completed_actions?: number
          completed_phases?: number
          created_at?: string
          current_streak?: number | null
          id?: string
          is_deep_mode?: boolean
          longest_streak?: number | null
          name?: string
          original_result?: Json
          status?: string
          total_actions?: number
          total_focus_tasks_completed?: number | null
          total_phases?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ads_advisor_history: {
        Row: {
          advertising_budget: string
          advertising_goals: string
          analysis_mode: string | null
          competitor_ads: string | null
          competitor_strategy: string | null
          created_at: string
          current_channels: string | null
          geographic_target: string | null
          id: string
          industry: string | null
          result: Json
          specific_requirements: string | null
          target_audience: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          advertising_budget: string
          advertising_goals: string
          analysis_mode?: string | null
          competitor_ads?: string | null
          competitor_strategy?: string | null
          created_at?: string
          current_channels?: string | null
          geographic_target?: string | null
          id?: string
          industry?: string | null
          result: Json
          specific_requirements?: string | null
          target_audience: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          advertising_budget?: string
          advertising_goals?: string
          analysis_mode?: string | null
          competitor_ads?: string | null
          competitor_strategy?: string | null
          created_at?: string
          current_channels?: string | null
          geographic_target?: string | null
          id?: string
          industry?: string | null
          result?: Json
          specific_requirements?: string | null
          target_audience?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      autopilot_focus_tasks: {
        Row: {
          action_index: number | null
          ai_reasoning: string | null
          completed_at: string | null
          created_at: string | null
          estimated_duration: string | null
          generated_for_date: string
          id: string
          is_completed: boolean | null
          phase_index: number | null
          priority: number | null
          strategy_id: string
          task_description: string | null
          task_title: string
          task_type: string | null
          user_id: string
        }
        Insert: {
          action_index?: number | null
          ai_reasoning?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_duration?: string | null
          generated_for_date: string
          id?: string
          is_completed?: boolean | null
          phase_index?: number | null
          priority?: number | null
          strategy_id: string
          task_description?: string | null
          task_title: string
          task_type?: string | null
          user_id: string
        }
        Update: {
          action_index?: number | null
          ai_reasoning?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_duration?: string | null
          generated_for_date?: string
          id?: string
          is_completed?: boolean | null
          phase_index?: number | null
          priority?: number | null
          strategy_id?: string
          task_description?: string | null
          task_title?: string
          task_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_focus_tasks_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "active_strategies"
            referencedColumns: ["id"]
          },
        ]
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
      strategy_phase_progress: {
        Row: {
          actions_completed: number[] | null
          completed_at: string | null
          created_at: string
          id: string
          milestones_completed: number[] | null
          notes: string | null
          phase_index: number
          phase_name: string
          started_at: string | null
          status: string
          strategy_id: string
          updated_at: string
        }
        Insert: {
          actions_completed?: number[] | null
          completed_at?: string | null
          created_at?: string
          id?: string
          milestones_completed?: number[] | null
          notes?: string | null
          phase_index: number
          phase_name: string
          started_at?: string | null
          status?: string
          strategy_id: string
          updated_at?: string
        }
        Update: {
          actions_completed?: number[] | null
          completed_at?: string | null
          created_at?: string
          id?: string
          milestones_completed?: number[] | null
          notes?: string | null
          phase_index?: number
          phase_name?: string
          started_at?: string | null
          status?: string
          strategy_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_strategy_phase_progress_strategy"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "active_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_phase_progress_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "active_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          ads_deep_analysis_count: number | null
          ads_deep_analysis_window_start: string | null
          ads_standard_analysis_count: number | null
          ads_standard_analysis_window_start: string | null
          analysis_count: number | null
          analysis_window_start: string | null
          auto_renew: boolean | null
          autopilot_generation_reset_date: string | null
          created_at: string
          daily_autopilot_generations: number | null
          deep_analysis_count: number | null
          deep_analysis_window_start: string | null
          freemius_customer_id: string | null
          freemius_subscription_id: string | null
          id: string
          is_premium: boolean
          last_analysis_at: string | null
          last_reset_date: string
          next_payment_date: string | null
          premium_since: string | null
          standard_analysis_count: number | null
          standard_analysis_window_start: string | null
          subscription_end_date: string | null
          tools_count: number | null
          tools_window_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ads_deep_analysis_count?: number | null
          ads_deep_analysis_window_start?: string | null
          ads_standard_analysis_count?: number | null
          ads_standard_analysis_window_start?: string | null
          analysis_count?: number | null
          analysis_window_start?: string | null
          auto_renew?: boolean | null
          autopilot_generation_reset_date?: string | null
          created_at?: string
          daily_autopilot_generations?: number | null
          deep_analysis_count?: number | null
          deep_analysis_window_start?: string | null
          freemius_customer_id?: string | null
          freemius_subscription_id?: string | null
          id?: string
          is_premium?: boolean
          last_analysis_at?: string | null
          last_reset_date?: string
          next_payment_date?: string | null
          premium_since?: string | null
          standard_analysis_count?: number | null
          standard_analysis_window_start?: string | null
          subscription_end_date?: string | null
          tools_count?: number | null
          tools_window_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ads_deep_analysis_count?: number | null
          ads_deep_analysis_window_start?: string | null
          ads_standard_analysis_count?: number | null
          ads_standard_analysis_window_start?: string | null
          analysis_count?: number | null
          analysis_window_start?: string | null
          auto_renew?: boolean | null
          autopilot_generation_reset_date?: string | null
          created_at?: string
          daily_autopilot_generations?: number | null
          deep_analysis_count?: number | null
          deep_analysis_window_start?: string | null
          freemius_customer_id?: string | null
          freemius_subscription_id?: string | null
          id?: string
          is_premium?: boolean
          last_analysis_at?: string | null
          last_reset_date?: string
          next_payment_date?: string | null
          premium_since?: string | null
          standard_analysis_count?: number | null
          standard_analysis_window_start?: string | null
          subscription_end_date?: string | null
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
