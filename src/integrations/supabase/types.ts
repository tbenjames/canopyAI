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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged: boolean
          analysis_id: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["alert_kind"]
          message: string
          plot_id: string
          severity: Database["public"]["Enums"]["severity_level"]
        }
        Insert: {
          acknowledged?: boolean
          analysis_id?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["alert_kind"]
          message: string
          plot_id: string
          severity: Database["public"]["Enums"]["severity_level"]
        }
        Update: {
          acknowledged?: boolean
          analysis_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["alert_kind"]
          message?: string
          plot_id?: string
          severity?: Database["public"]["Enums"]["severity_level"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          bank_integrity: string | null
          canopy_health_pct: number | null
          created_at: string
          detected_species: string | null
          detected_species_alternates: Json | null
          detected_species_confidence_pct: number | null
          error: string | null
          establishment_stage: string | null
          id: string
          invasive_coverage_pct: number | null
          invasive_present: boolean | null
          invasive_species: Json | null
          model: string | null
          not_visible: Json | null
          overall_confidence_pct: number | null
          plot_id: string | null
          rationale: string | null
          raw_response: Json | null
          risk_level: Database["public"]["Enums"]["severity_level"] | null
          salinity_stress_pct: number | null
          scouring_severity:
            | Database["public"]["Enums"]["severity_level"]
            | null
          seedlings_detected: boolean | null
          site_type: string | null
          status: Database["public"]["Enums"]["analysis_status"]
          structural_risk: Database["public"]["Enums"]["severity_level"] | null
          suggested_action: string | null
          suitability: string | null
          suitability_reason: string | null
          updated_at: string
          upload_id: string
          water_body_condition: string | null
          waterlogging_pct: number | null
        }
        Insert: {
          bank_integrity?: string | null
          canopy_health_pct?: number | null
          created_at?: string
          detected_species?: string | null
          detected_species_alternates?: Json | null
          detected_species_confidence_pct?: number | null
          error?: string | null
          establishment_stage?: string | null
          id?: string
          invasive_coverage_pct?: number | null
          invasive_present?: boolean | null
          invasive_species?: Json | null
          model?: string | null
          not_visible?: Json | null
          overall_confidence_pct?: number | null
          plot_id?: string | null
          rationale?: string | null
          raw_response?: Json | null
          risk_level?: Database["public"]["Enums"]["severity_level"] | null
          salinity_stress_pct?: number | null
          scouring_severity?:
            | Database["public"]["Enums"]["severity_level"]
            | null
          seedlings_detected?: boolean | null
          site_type?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          structural_risk?: Database["public"]["Enums"]["severity_level"] | null
          suggested_action?: string | null
          suitability?: string | null
          suitability_reason?: string | null
          updated_at?: string
          upload_id: string
          water_body_condition?: string | null
          waterlogging_pct?: number | null
        }
        Update: {
          bank_integrity?: string | null
          canopy_health_pct?: number | null
          created_at?: string
          detected_species?: string | null
          detected_species_alternates?: Json | null
          detected_species_confidence_pct?: number | null
          error?: string | null
          establishment_stage?: string | null
          id?: string
          invasive_coverage_pct?: number | null
          invasive_present?: boolean | null
          invasive_species?: Json | null
          model?: string | null
          not_visible?: Json | null
          overall_confidence_pct?: number | null
          plot_id?: string | null
          rationale?: string | null
          raw_response?: Json | null
          risk_level?: Database["public"]["Enums"]["severity_level"] | null
          salinity_stress_pct?: number | null
          scouring_severity?:
            | Database["public"]["Enums"]["severity_level"]
            | null
          seedlings_detected?: boolean | null
          site_type?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          structural_risk?: Database["public"]["Enums"]["severity_level"] | null
          suggested_action?: string | null
          suitability?: string | null
          suitability_reason?: string | null
          updated_at?: string
          upload_id?: string
          water_body_condition?: string | null
          waterlogging_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_reviews: {
        Row: {
          analysis_id: string
          created_at: string
          id: string
          note: string | null
          reviewer_confidence_pct: number | null
          reviewer_id: string
          updated_at: string
          verdicts: Json
        }
        Insert: {
          analysis_id: string
          created_at?: string
          id?: string
          note?: string | null
          reviewer_confidence_pct?: number | null
          reviewer_id: string
          updated_at?: string
          verdicts?: Json
        }
        Update: {
          analysis_id?: string
          created_at?: string
          id?: string
          note?: string | null
          reviewer_confidence_pct?: number | null
          reviewer_id?: string
          updated_at?: string
          verdicts?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analysis_reviews_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          action_type: string
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          donor_email: string | null
          donor_name: string | null
          id: string
          message: string | null
          status: string
          stripe_session_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          message?: string | null
          status?: string
          stripe_session_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          message?: string | null
          status?: string
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_seen_at: string | null
          audio_path: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          created_at: string
          id: string
          language: string | null
          message_text: string
          note: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_seen_at?: string | null
          audio_path?: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          created_at?: string
          id?: string
          language?: string | null
          message_text: string
          note?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_seen_at?: string | null
          audio_path?: string | null
          category?: Database["public"]["Enums"]["feedback_category"]
          created_at?: string
          id?: string
          language?: string | null
          message_text?: string
          note?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_inquiries: {
        Row: {
          contact_name: string
          country: string
          created_at: string
          email: string
          estimated_sites: number | null
          honeypot: string | null
          id: string
          message: string
          organisation_name: string
          partnership_type: string
          status: string
          website: string | null
        }
        Insert: {
          contact_name: string
          country?: string
          created_at?: string
          email: string
          estimated_sites?: number | null
          honeypot?: string | null
          id?: string
          message: string
          organisation_name: string
          partnership_type: string
          status?: string
          website?: string | null
        }
        Update: {
          contact_name?: string
          country?: string
          created_at?: string
          email?: string
          estimated_sites?: number | null
          honeypot?: string | null
          id?: string
          message?: string
          organisation_name?: string
          partnership_type?: string
          status?: string
          website?: string | null
        }
        Relationships: []
      }
      payment_failures: {
        Row: {
          created_at: string
          environment: string
          id: string
          provider: string
          provider_transaction_id: string
          reason: string | null
          resolved_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          provider?: string
          provider_transaction_id: string
          reason?: string | null
          resolved_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          provider?: string
          provider_transaction_id?: string
          reason?: string | null
          resolved_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plots: {
        Row: {
          center_lat: number
          center_lng: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          planted_at: string | null
          radius_m: number
          site_id: string
          updated_at: string
        }
        Insert: {
          center_lat: number
          center_lng: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          planted_at?: string | null
          radius_m?: number
          site_id: string
          updated_at?: string
        }
        Update: {
          center_lat?: number
          center_lng?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          planted_at?: string | null
          radius_m?: number
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plots_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acceptances: {
        Row: {
          accepted_at: string
          id: string
          metadata: Json
          method: string
          policy_type: string
          user_id: string
          version: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          metadata?: Json
          method?: string
          policy_type: string
          user_id: string
          version: string
        }
        Update: {
          accepted_at?: string
          id?: string
          metadata?: Json
          method?: string
          policy_type?: string
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_tier: string
          avatar_url: string | null
          created_at: string
          credits_period_start: string
          email: string | null
          evaluation_credits: number
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          account_tier?: string
          avatar_url?: string | null
          created_at?: string
          credits_period_start?: string
          email?: string | null
          evaluation_credits?: number
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          account_tier?: string
          avatar_url?: string | null
          created_at?: string
          credits_period_start?: string
          email?: string | null
          evaluation_credits?: number
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          region: string | null
          roles: string[]
          species_focus: Database["public"]["Enums"]["species_focus"]
          updated_at: string
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          region?: string | null
          roles?: string[]
          species_focus?: Database["public"]["Enums"]["species_focus"]
          updated_at?: string
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          region?: string | null
          roles?: string[]
          species_focus?: Database["public"]["Enums"]["species_focus"]
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          captured_at: string | null
          captured_lat: number | null
          captured_lng: number | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["upload_kind"]
          location_source: string | null
          notes: string | null
          plot_id: string | null
          quality_flags: Json
          quality_score_pct: number | null
          storage_path: string
          thumbnail_path: string | null
          uploaded_by: string
        }
        Insert: {
          captured_at?: string | null
          captured_lat?: number | null
          captured_lng?: number | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["upload_kind"]
          location_source?: string | null
          notes?: string | null
          plot_id?: string | null
          quality_flags?: Json
          quality_score_pct?: number | null
          storage_path: string
          thumbnail_path?: string | null
          uploaded_by: string
        }
        Update: {
          captured_at?: string | null
          captured_lat?: number | null
          captured_lng?: number | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["upload_kind"]
          location_source?: string | null
          notes?: string | null
          plot_id?: string | null
          quality_flags?: Json
          quality_score_pct?: number | null
          storage_path?: string
          thumbnail_path?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      analysis_agreement_rates: {
        Row: {
          agreed_count: number | null
          agreement_pct: number | null
          corrected_count: number | null
          indicator: string | null
          not_assessable_count: number | null
          reviewed_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: { _action: string; _amount: number; _meta?: Json; _user: string }
        Returns: number
      }
      deduct_credits: {
        Args: { _action: string; _amount: number }
        Returns: number
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_monthly_credits: { Args: { _user: string }; Returns: number }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      alert_kind:
        | "waterlogging"
        | "scouring"
        | "salinity"
        | "canopy_decline"
        | "invasive_encroachment"
        | "structural_risk"
      analysis_status: "pending" | "processing" | "complete" | "failed"
      app_role: "admin" | "scientist" | "field_worker" | "donor"
      feedback_category:
        | "app_bug"
        | "vision_wrong"
        | "feature_request"
        | "tool_calibration"
      severity_level: "low" | "medium" | "high"
      species_focus: "mangrove" | "moringa" | "mixed"
      upload_kind: "photo" | "video"
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
      alert_kind: [
        "waterlogging",
        "scouring",
        "salinity",
        "canopy_decline",
        "invasive_encroachment",
        "structural_risk",
      ],
      analysis_status: ["pending", "processing", "complete", "failed"],
      app_role: ["admin", "scientist", "field_worker", "donor"],
      feedback_category: [
        "app_bug",
        "vision_wrong",
        "feature_request",
        "tool_calibration",
      ],
      severity_level: ["low", "medium", "high"],
      species_focus: ["mangrove", "moringa", "mixed"],
      upload_kind: ["photo", "video"],
    },
  },
} as const
