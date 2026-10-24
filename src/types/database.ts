export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type BaseInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type BaseUpdate = {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          display_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: BaseInsert & {
          user_id: string;
          email: string;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          is_active?: boolean;
        };
        Update: BaseUpdate & {
          user_id?: string;
          email?: string;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          is_active?: boolean;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          display_name: string;
          headline: string;
          description: string;
          avatar_media_id: string | null;
          background_media_id: string | null;
          theme: Json;
          social_links: Json;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          display_name?: string;
          headline?: string;
          description?: string;
          avatar_media_id?: string | null;
          background_media_id?: string | null;
          theme?: Json;
          social_links?: Json;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          status: Database["public"]["Enums"]["page_status"];
          seo_title: string | null;
          seo_description: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: BaseInsert & {
          title: string;
          slug: string;
          status?: Database["public"]["Enums"]["page_status"];
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
        };
        Update: BaseUpdate & Partial<Omit<Database["public"]["Tables"]["pages"]["Insert"], "id">>;
        Relationships: [];
      };
      page_blocks: {
        Row: {
          id: string;
          page_id: string;
          type: Database["public"]["Enums"]["block_type"];
          name: string;
          content: Json;
          styles: Json;
          position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: BaseInsert & {
          page_id: string;
          type: Database["public"]["Enums"]["block_type"];
          name: string;
          content?: Json;
          styles?: Json;
          position?: number;
          is_active?: boolean;
        };
        Update: BaseUpdate & Partial<Omit<Database["public"]["Tables"]["page_blocks"]["Insert"], "id">>;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          status: Database["public"]["Enums"]["note_status"];
          is_pinned: boolean;
          parent_id: string | null;
          current_version_id: string | null;
          published_version_id: string | null;
          cover_media_id: string | null;
          seo_title: string | null;
          seo_description: string | null;
          reading_time_minutes: number;
          published_at: string | null;
          deleted_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: BaseInsert & {
          title: string;
          slug: string;
          excerpt?: string;
          status?: Database["public"]["Enums"]["note_status"];
          is_pinned?: boolean;
          parent_id?: string | null;
          current_version_id?: string | null;
          published_version_id?: string | null;
          cover_media_id?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          reading_time_minutes?: number;
          published_at?: string | null;
          deleted_at?: string | null;
          created_by?: string | null;
        };
        Update: BaseUpdate & Partial<Omit<Database["public"]["Tables"]["notes"]["Insert"], "id">>;
        Relationships: [];
      };
      note_view_stats: {
        Row: {
          note_id: string;
          view_count: number;
          created_at: string;
        };
        Insert: {
          note_id: string;
          view_count?: number;
          created_at?: string;
        };
        Update: {
          note_id?: string;
          view_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      note_view_visitors: {
        Row: {
          note_id: string;
          visitor_hash: string;
          last_counted_at: string;
          created_at: string;
        };
        Insert: {
          note_id: string;
          visitor_hash: string;
          last_counted_at?: string;
          created_at?: string;
        };
        Update: {
          note_id?: string;
          visitor_hash?: string;
          last_counted_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      note_versions: {
        Row: {
          id: string;
          note_id: string;
          version_number: number;
          title: string;
          content: Json;
          plain_text: string;
          change_summary: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          version_number: number;
          title: string;
          content?: Json;
          plain_text?: string;
          change_summary?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["note_versions"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          parent_id: string | null;
          position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: BaseInsert & {
          name: string;
          slug: string;
          description?: string | null;
          color?: string;
          parent_id?: string | null;
          position?: number;
          is_active?: boolean;
        };
        Update: BaseUpdate & Partial<Omit<Database["public"]["Tables"]["categories"]["Insert"], "id">>;
        Relationships: [];
      };
      note_categories: {
        Row: { note_id: string; category_id: string; created_at: string };
        Insert: { note_id: string; category_id: string; created_at?: string };
        Update: { note_id?: string; category_id?: string; created_at?: string };
        Relationships: [];
      };
      media_files: {
        Row: {
          id: string;
          object_key: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
          width: number | null;
          height: number | null;
          alt_text: string | null;
          folder: string;
          status: Database["public"]["Enums"]["media_status"];
          visibility: Database["public"]["Enums"]["media_visibility"];
          requested_visibility: Database["public"]["Enums"]["media_visibility"];
          failure_reason: string | null;
          expires_at: string | null;
          verified_at: string | null;
          deleted_at: string | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: BaseInsert & {
          object_key: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          folder?: string;
          status?: Database["public"]["Enums"]["media_status"];
          visibility?: Database["public"]["Enums"]["media_visibility"];
          requested_visibility?: Database["public"]["Enums"]["media_visibility"];
          failure_reason?: string | null;
          expires_at?: string | null;
          verified_at?: string | null;
          deleted_at?: string | null;
          uploaded_by?: string | null;
        };
        Update: BaseUpdate & Partial<Omit<Database["public"]["Tables"]["media_files"]["Insert"], "id">>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: unknown | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: unknown | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      media_reference_count: { Args: { p_media_id: string }; Returns: number };
      publish_note: {
        Args: { p_note_id: string; p_version_id: string };
        Returns: Database["public"]["Tables"]["notes"]["Row"];
      };
      save_note: {
        Args: {
          p_note_id: string | null;
          p_title: string;
          p_slug: string;
          p_excerpt: string;
          p_status: Database["public"]["Enums"]["note_status"];
          p_is_pinned: boolean;
          p_parent_id: string | null;
          p_category_ids: string[];
          p_content: Json;
          p_plain_text: string;
          p_change_summary: string;
          p_seo_title: string | null;
          p_seo_description: string | null;
          p_reading_time_minutes: number;
        };
        Returns: Database["public"]["Tables"]["notes"]["Row"];
      };
      save_category: {
        Args: {
          p_category_id: string | null;
          p_name: string;
          p_slug: string;
          p_description: string;
          p_color: string;
          p_parent_id: string | null;
          p_position: number;
          p_is_active: boolean;
        };
        Returns: Database["public"]["Tables"]["categories"]["Row"];
      };
      delete_category: {
        Args: { p_category_id: string };
        Returns: Database["public"]["Tables"]["categories"]["Row"];
      };
      soft_delete_note: {
        Args: { p_note_id: string };
        Returns: Database["public"]["Tables"]["notes"]["Row"];
      };
      restore_note: {
        Args: { p_note_id: string };
        Returns: Database["public"]["Tables"]["notes"]["Row"];
      };
      register_note_view: {
        Args: { p_note_id: string; p_visitor_hash: string };
        Returns: number;
      };
    };
    Enums: {
      user_role: "ADMIN";
      page_status: "DRAFT" | "PUBLISHED";
      note_status: "DRAFT" | "PRIVATE" | "PUBLIC" | "ARCHIVED";
      media_status: "PENDING" | "READY" | "FAILED" | "DELETED";
      block_type:
        | "TEXT"
        | "HEADING"
        | "BUTTON"
        | "IMAGE"
        | "BANNER"
        | "VIDEO"
        | "CARD"
        | "DIVIDER"
        | "NOTE_LIST"
        | "SOCIAL_LINKS";
      media_visibility: "PUBLIC" | "PRIVATE";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
