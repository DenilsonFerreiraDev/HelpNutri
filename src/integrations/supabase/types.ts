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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      meals: {
        Row: {
          calorias: number
          carboidratos: number | null
          categoria: string
          created_at: string
          data: string
          gorduras: number | null
          horario: string | null
          id: string
          nome: string
          proteinas: number
          user_id: string
        }
        Insert: {
          calorias?: number
          carboidratos?: number | null
          categoria: string
          created_at?: string
          data?: string
          gorduras?: number | null
          horario?: string | null
          id?: string
          nome: string
          proteinas?: number
          user_id?: string
        }
        Update: {
          calorias?: number
          carboidratos?: number | null
          categoria?: string
          created_at?: string
          data?: string
          gorduras?: number | null
          horario?: string | null
          id?: string
          nome?: string
          proteinas?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          altura: number | null
          created_at: string
          email: string | null
          hydration_goal_ml: number
          id: string
          idade: number | null
          nivel_atividade: string | null
          nome: string
          objetivo: string | null
          peso: number | null
          sexo: string | null
        }
        Insert: {
          altura?: number | null
          created_at?: string
          email?: string | null
          hydration_goal_ml?: number
          id: string
          idade?: number | null
          nivel_atividade?: string | null
          nome?: string
          objetivo?: string | null
          peso?: number | null
          sexo?: string | null
        }
        Update: {
          altura?: number | null
          created_at?: string
          email?: string | null
          hydration_goal_ml?: number
          id?: string
          idade?: number | null
          nivel_atividade?: string | null
          nome?: string
          objetivo?: string | null
          peso?: number | null
          sexo?: string | null
        }
        Relationships: []
      }
      water_intake: {
        Row: {
          amount_ml: number
          created_at: string
          data: string
          id: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          data?: string
          id?: string
          user_id?: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          data?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_history: {
        Row: {
          created_at: string
          data: string
          id: string
          peso: number
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          peso: number
          user_id?: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          peso?: number
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calorias_gastas: number
          categoria: string
          created_at: string
          data: string
          duracao: number
          id: string
          inclinacao: number | null
          intensidade: string | null
          tipo: string
          user_id: string
          velocidade: number | null
        }
        Insert: {
          calorias_gastas?: number
          categoria?: string
          created_at?: string
          data?: string
          duracao: number
          id?: string
          inclinacao?: number | null
          intensidade?: string | null
          tipo: string
          user_id?: string
          velocidade?: number | null
        }
        Update: {
          calorias_gastas?: number
          categoria?: string
          created_at?: string
          data?: string
          duracao?: number
          id?: string
          inclinacao?: number | null
          intensidade?: string | null
          tipo?: string
          user_id?: string
          velocidade?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_profile_settings: {
        Args: {
          p_activity: string
          p_age: number
          p_goal: string
          p_height: number
          p_hydration_goal: number
          p_weight: number
        }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
