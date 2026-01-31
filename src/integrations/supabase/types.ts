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
      blood_inventory: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          id: string
          last_updated: string
          units_available: number
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          id?: string
          last_updated?: string
          units_available?: number
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          id?: string
          last_updated?: string
          units_available?: number
        }
        Relationships: []
      }
      donations: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          collected_by: string | null
          created_at: string
          donation_center: string | null
          donation_date: string
          donor_id: string
          hemoglobin_at_donation: number | null
          id: string
          notes: string | null
          units_donated: number
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          collected_by?: string | null
          created_at?: string
          donation_center?: string | null
          donation_date?: string
          donor_id: string
          hemoglobin_at_donation?: number | null
          id?: string
          notes?: string | null
          units_donated?: number
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          collected_by?: string | null
          created_at?: string
          donation_center?: string | null
          donation_date?: string
          donor_id?: string
          hemoglobin_at_donation?: number | null
          id?: string
          notes?: string | null
          units_donated?: number
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string | null
          blood_group: Database["public"]["Enums"]["blood_group"]
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          chronic_disease_details: string | null
          city: string | null
          date_of_birth: string
          eligibility_reason: string | null
          email: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          has_chronic_disease: boolean | null
          height: number | null
          hemoglobin_level: number | null
          id: string
          is_eligible: boolean | null
          is_on_medication: boolean | null
          is_pregnant: boolean | null
          last_donation_date: string | null
          last_major_surgery_date: string | null
          last_tattoo_date: string | null
          medication_details: string | null
          phone: string | null
          pincode: string | null
          registered_at: string
          state: string | null
          total_donations: number | null
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          address?: string | null
          blood_group: Database["public"]["Enums"]["blood_group"]
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          chronic_disease_details?: string | null
          city?: string | null
          date_of_birth: string
          eligibility_reason?: string | null
          email: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          has_chronic_disease?: boolean | null
          height?: number | null
          hemoglobin_level?: number | null
          id?: string
          is_eligible?: boolean | null
          is_on_medication?: boolean | null
          is_pregnant?: boolean | null
          last_donation_date?: string | null
          last_major_surgery_date?: string | null
          last_tattoo_date?: string | null
          medication_details?: string | null
          phone?: string | null
          pincode?: string | null
          registered_at?: string
          state?: string | null
          total_donations?: number | null
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          address?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"]
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          chronic_disease_details?: string | null
          city?: string | null
          date_of_birth?: string
          eligibility_reason?: string | null
          email?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          has_chronic_disease?: boolean | null
          height?: number | null
          hemoglobin_level?: number | null
          id?: string
          is_eligible?: boolean | null
          is_on_medication?: boolean | null
          is_pregnant?: boolean | null
          last_donation_date?: string | null
          last_major_surgery_date?: string | null
          last_tattoo_date?: string | null
          medication_details?: string | null
          phone?: string | null
          pincode?: string | null
          registered_at?: string
          state?: string | null
          total_donations?: number | null
          updated_at?: string
          user_id?: string
          weight?: number
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
      app_role: "admin" | "donor"
      blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      gender: "male" | "female" | "other"
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
      app_role: ["admin", "donor"],
      blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      gender: ["male", "female", "other"],
    },
  },
} as const
