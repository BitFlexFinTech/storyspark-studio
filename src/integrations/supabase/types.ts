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
      ab_tests: {
        Row: {
          ended_at: string | null
          id: string
          started_at: string | null
          test_type: string | null
          user_id: string
          variant_a: string | null
          variant_a_metrics: Json | null
          variant_b: string | null
          variant_b_metrics: Json | null
          video_id: string | null
          winner: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          started_at?: string | null
          test_type?: string | null
          user_id: string
          variant_a?: string | null
          variant_a_metrics?: Json | null
          variant_b?: string | null
          variant_b_metrics?: Json | null
          video_id?: string | null
          winner?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          started_at?: string | null
          test_type?: string | null
          user_id?: string
          variant_a?: string | null
          variant_a_metrics?: Json | null
          variant_b?: string | null
          variant_b_metrics?: Json | null
          video_id?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          appearance: string | null
          backstory: string | null
          created_at: string
          id: string
          locked_traits: Json | null
          name: string
          personality: string | null
          role: string | null
          stories_count: number | null
          updated_at: string
          user_id: string
          voice_accent: string | null
          voice_age: string | null
          voice_type: string | null
        }
        Insert: {
          appearance?: string | null
          backstory?: string | null
          created_at?: string
          id?: string
          locked_traits?: Json | null
          name: string
          personality?: string | null
          role?: string | null
          stories_count?: number | null
          updated_at?: string
          user_id: string
          voice_accent?: string | null
          voice_age?: string | null
          voice_type?: string | null
        }
        Update: {
          appearance?: string | null
          backstory?: string | null
          created_at?: string
          id?: string
          locked_traits?: Json | null
          name?: string
          personality?: string | null
          role?: string | null
          stories_count?: number | null
          updated_at?: string
          user_id?: string
          voice_accent?: string | null
          voice_age?: string | null
          voice_type?: string | null
        }
        Relationships: []
      }
      competitor_alerts: {
        Row: {
          alert_type: string
          competitor_id: string | null
          created_at: string | null
          email_priority: string | null
          id: string
          is_active: boolean | null
          send_email: boolean | null
          threshold: number | null
          user_id: string
        }
        Insert: {
          alert_type: string
          competitor_id?: string | null
          created_at?: string | null
          email_priority?: string | null
          id?: string
          is_active?: boolean | null
          send_email?: boolean | null
          threshold?: number | null
          user_id: string
        }
        Update: {
          alert_type?: string
          competitor_id?: string | null
          created_at?: string | null
          email_priority?: string | null
          id?: string
          is_active?: boolean | null
          send_email?: boolean | null
          threshold?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_alerts_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          avg_views: number | null
          channel_id: string
          channel_name: string | null
          created_at: string | null
          id: string
          last_video_date: string | null
          subscriber_count: number | null
          user_id: string
          video_count: number | null
        }
        Insert: {
          avg_views?: number | null
          channel_id: string
          channel_name?: string | null
          created_at?: string | null
          id?: string
          last_video_date?: string | null
          subscriber_count?: number | null
          user_id: string
          video_count?: number | null
        }
        Update: {
          avg_views?: number | null
          channel_id?: string
          channel_name?: string | null
          created_at?: string | null
          id?: string
          last_video_date?: string | null
          subscriber_count?: number | null
          user_id?: string
          video_count?: number | null
        }
        Relationships: []
      }
      integration_setup: {
        Row: {
          completed: boolean | null
          created_at: string | null
          current_step: number | null
          id: string
          integration_id: string | null
          platform: string
          step_data: Json | null
          total_steps: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          integration_id?: string | null
          platform: string
          step_data?: Json | null
          total_steps?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          integration_id?: string | null
          platform?: string
          step_data?: Json | null
          total_steps?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_setup_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          oauth_state: string | null
          platform: string
          refresh_token: string | null
          status: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          oauth_state?: string | null
          platform: string
          refresh_token?: string | null
          status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          oauth_state?: string | null
          platform?: string
          refresh_token?: string | null
          status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      keywords: {
        Row: {
          competition_score: number | null
          created_at: string | null
          id: string
          keyword: string
          outlier_score: number | null
          related_keywords: Json | null
          search_volume: number | null
          trend_direction: string | null
          user_id: string
        }
        Insert: {
          competition_score?: number | null
          created_at?: string | null
          id?: string
          keyword: string
          outlier_score?: number | null
          related_keywords?: Json | null
          search_volume?: number | null
          trend_direction?: string | null
          user_id: string
        }
        Update: {
          competition_score?: number | null
          created_at?: string | null
          id?: string
          keyword?: string
          outlier_score?: number | null
          related_keywords?: Json | null
          search_volume?: number | null
          trend_direction?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          digest_day: number | null
          digest_time: string | null
          email_enabled: boolean | null
          email_for_milestones: boolean | null
          email_for_new_videos: boolean | null
          email_for_trending: boolean | null
          email_frequency: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          digest_day?: number | null
          digest_time?: string | null
          email_enabled?: boolean | null
          email_for_milestones?: boolean | null
          email_for_new_videos?: boolean | null
          email_for_trending?: boolean | null
          email_frequency?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          digest_day?: number | null
          digest_time?: string | null
          email_enabled?: boolean | null
          email_for_milestones?: boolean | null
          email_for_new_videos?: boolean | null
          email_for_trending?: boolean | null
          email_frequency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          alert_id: string | null
          competitor_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          competitor_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          alert_id?: string | null
          competitor_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "competitor_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_bot_settings: {
        Row: {
          auto_apply: boolean | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          optimization_types: string[] | null
          performance_threshold: number | null
          scan_frequency: string | null
          user_id: string
        }
        Insert: {
          auto_apply?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          optimization_types?: string[] | null
          performance_threshold?: number | null
          scan_frequency?: string | null
          user_id: string
        }
        Update: {
          auto_apply?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          optimization_types?: string[] | null
          performance_threshold?: number | null
          scan_frequency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      optimization_queue: {
        Row: {
          created_at: string | null
          current_value: string | null
          id: string
          optimization_type: string | null
          performance_data: Json | null
          selected_value: string | null
          status: string | null
          suggested_values: Json | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: string | null
          id?: string
          optimization_type?: string | null
          performance_data?: Json | null
          selected_value?: string | null
          status?: string | null
          suggested_values?: Json | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: string | null
          id?: string
          optimization_type?: string | null
          performance_data?: Json | null
          selected_value?: string | null
          status?: string | null
          suggested_values?: Json | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "optimization_queue_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenes: {
        Row: {
          audio_waveform: Json | null
          created_at: string
          duration: string | null
          id: string
          number: number
          script: string | null
          story_id: string
          title: string
          updated_at: string
          visual_description: string | null
        }
        Insert: {
          audio_waveform?: Json | null
          created_at?: string
          duration?: string | null
          id?: string
          number: number
          script?: string | null
          story_id: string
          title: string
          updated_at?: string
          visual_description?: string | null
        }
        Update: {
          audio_waveform?: Json | null
          created_at?: string
          duration?: string | null
          id?: string
          number?: number
          script?: string | null
          story_id?: string
          title?: string
          updated_at?: string
          visual_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_content: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          suggested_by_ai: boolean | null
          title: string
          updated_at: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          suggested_by_ai?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          suggested_by_ai?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_content_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string | null
          style: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          style?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          style?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      style_blueprints: {
        Row: {
          audio_profile: Json | null
          content_structure: Json | null
          created_at: string
          id: string
          mood_board: Json | null
          name: string
          source_url: string | null
          updated_at: string
          user_id: string
          visual_style: Json | null
        }
        Insert: {
          audio_profile?: Json | null
          content_structure?: Json | null
          created_at?: string
          id?: string
          mood_board?: Json | null
          name: string
          source_url?: string | null
          updated_at?: string
          user_id: string
          visual_style?: Json | null
        }
        Update: {
          audio_profile?: Json | null
          content_structure?: Json | null
          created_at?: string
          id?: string
          mood_board?: Json | null
          name?: string
          source_url?: string | null
          updated_at?: string
          user_id?: string
          visual_style?: Json | null
        }
        Relationships: []
      }
      trend_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keyword: string
          last_triggered_at: string | null
          threshold: number | null
          user_id: string
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keyword: string
          last_triggered_at?: string | null
          threshold?: number | null
          user_id: string
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keyword?: string
          last_triggered_at?: string | null
          threshold?: number | null
          user_id?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      video_analytics: {
        Row: {
          comments: number | null
          created_at: string
          date: string
          id: string
          likes: number | null
          retention_rate: number | null
          shares: number | null
          video_id: string
          views: number | null
          watch_time_hours: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          date: string
          id?: string
          likes?: number | null
          retention_rate?: number | null
          shares?: number | null
          video_id: string
          views?: number | null
          watch_time_hours?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          date?: string
          id?: string
          likes?: number | null
          retention_rate?: number | null
          shares?: number | null
          video_id?: string
          views?: number | null
          watch_time_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_analytics_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_optimizations: {
        Row: {
          created_at: string | null
          id: string
          optimization_type: string | null
          optimized_value: string | null
          original_value: string | null
          performance_after: Json | null
          performance_before: Json | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          optimization_type?: string | null
          optimized_value?: string | null
          original_value?: string | null
          performance_after?: Json | null
          performance_before?: Json | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          optimization_type?: string | null
          optimized_value?: string | null
          original_value?: string | null
          performance_after?: Json | null
          performance_before?: Json | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_optimizations_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          duration: string | null
          id: string
          published_at: string | null
          status: string | null
          story_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          duration?: string | null
          id?: string
          published_at?: string | null
          status?: string | null
          story_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          duration?: string | null
          id?: string
          published_at?: string | null
          status?: string | null
          story_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_channels: {
        Row: {
          access_token: string | null
          channel_id: string
          channel_name: string
          channel_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          refresh_token: string | null
          subscriber_count: number | null
          thumbnail_url: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
          video_count: number | null
        }
        Insert: {
          access_token?: string | null
          channel_id: string
          channel_name: string
          channel_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
          video_count?: number | null
        }
        Update: {
          access_token?: string | null
          channel_id?: string
          channel_name?: string
          channel_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
          video_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
