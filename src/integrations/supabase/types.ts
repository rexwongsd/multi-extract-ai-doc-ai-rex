export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          address: string | null
          created_at: string
          folder: string | null
          id: string
          notes: string | null
          position: Json
          rating: number | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          notes?: string | null
          position: Json
          rating?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          notes?: string | null
          position?: Json
          rating?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_contact: string | null
          met_at: string | null
          name: string
          next_reminder: string | null
          phone: string | null
          relationship: string
          sentiment: Database["public"]["Enums"]["sentiment_type"] | null
          starred: boolean | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          met_at?: string | null
          name: string
          next_reminder?: string | null
          phone?: string | null
          relationship?: string
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          starred?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          met_at?: string | null
          name?: string
          next_reminder?: string | null
          phone?: string | null
          relationship?: string
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          starred?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      design_templates: {
        Row: {
          category: string
          config: Json
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          preview_image_url: string | null
        }
        Insert: {
          category: string
          config?: Json
          created_at?: string
          description: string
          id: string
          is_active?: boolean
          name: string
          preview_image_url?: string | null
        }
        Update: {
          category?: string
          config?: Json
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          preview_image_url?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          contact_id: string
          content: string
          created_at: string | null
          id: string
          sentiment: Database["public"]["Enums"]["sentiment_type"] | null
          tags: string[] | null
          type: Database["public"]["Enums"]["note_type"] | null
          user_id: string
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string | null
          id?: string
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["note_type"] | null
          user_id: string
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string | null
          id?: string
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["note_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string
          preferences: Json | null
          role: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name: string
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name: string
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          completed: boolean | null
          contact_id: string
          created_at: string | null
          id: string
          message: string
          reminder_date: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          contact_id: string
          created_at?: string | null
          id?: string
          message: string
          reminder_date: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          contact_id?: string
          created_at?: string | null
          id?: string
          message?: string
          reminder_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      Signup: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      todos: {
        Row: {
          attachments: Json | null
          categories: string[] | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_archived: boolean | null
          priority: string | null
          reminder: Json | null
          status: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          categories?: string[] | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          priority?: string | null
          reminder?: Json | null
          status?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          categories?: string[] | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          priority?: string | null
          reminder?: Json | null
          status?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      website_projects: {
        Row: {
          analysis_data: Json | null
          created_at: string
          id: string
          selected_template_id: string | null
          source_file_name: string | null
          source_type: string
          source_url: string | null
          status: string
          template_customizations: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string
          id?: string
          selected_template_id?: string | null
          source_file_name?: string | null
          source_type: string
          source_url?: string | null
          status?: string
          template_customizations?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string
          id?: string
          selected_template_id?: string | null
          source_file_name?: string | null
          source_type?: string
          source_url?: string | null
          status?: string
          template_customizations?: Json | null
          title?: string
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
      can_access_realtime: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_user_categories: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_todos: number
          completed_todos: number
          pending_todos: number
          overdue_todos: number
          high_priority_todos: number
          medium_priority_todos: number
          low_priority_todos: number
        }[]
      }
      get_user_tags: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      search_todos: {
        Args: {
          user_uuid: string
          search_query: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          user_id: string
          title: string
          description: string
          status: boolean
          priority: string
          due_date: string
          categories: string[]
          tags: string[]
          created_at: string
          updated_at: string
          rank: number
        }[]
      }
    }
    Enums: {
      note_type: "note" | "call" | "email" | "meeting"
      sentiment_type: "positive" | "neutral" | "needs-attention"
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
      note_type: ["note", "call", "email", "meeting"],
      sentiment_type: ["positive", "neutral", "needs-attention"],
    },
  },
} as const
