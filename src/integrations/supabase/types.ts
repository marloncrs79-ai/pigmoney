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
      ai_insights: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          message: string
          mood_tag: string
          scope: string
          severity: string
          year_month: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          message: string
          mood_tag?: string
          scope: string
          severity?: string
          year_month: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          message?: string
          mood_tag?: string
          scope?: string
          severity?: string
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_memory_context: {
        Row: {
          category: string
          couple_id: string
          created_at: string
          id: string
          suggestion: string | null
          summary: string
          trend: string
          year_month_end: string
          year_month_start: string
        }
        Insert: {
          category: string
          couple_id: string
          created_at?: string
          id?: string
          suggestion?: string | null
          summary: string
          trend?: string
          year_month_end: string
          year_month_start: string
        }
        Update: {
          category?: string
          couple_id?: string
          created_at?: string
          id?: string
          suggestion?: string | null
          summary?: string
          trend?: string
          year_month_end?: string
          year_month_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_memory_context_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_feedback: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      card_transactions: {
        Row: {
          amount_total: number
          card_id: string
          category: string
          couple_id: string
          created_at: string
          description: string
          first_invoice_month: string
          id: string
          installments: number
        }
        Insert: {
          amount_total?: number
          card_id: string
          category: string
          couple_id: string
          created_at?: string
          description: string
          first_invoice_month: string
          id?: string
          installments?: number
        }
        Update: {
          amount_total?: number
          card_id?: string
          category?: string
          couple_id?: string
          created_at?: string
          description?: string
          first_invoice_month?: string
          id?: string
          installments?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_transactions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_members: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_members_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          closing_day: number
          couple_id: string
          created_at: string
          due_day: number
          holder_name: string
          id: string
          limit_amount: number
          nickname: string
        }
        Insert: {
          closing_day: number
          couple_id: string
          created_at?: string
          due_day: number
          holder_name: string
          id?: string
          limit_amount?: number
          nickname: string
        }
        Update: {
          closing_day?: number
          couple_id?: string
          created_at?: string
          due_day?: number
          holder_name?: string
          id?: string
          limit_amount?: number
          nickname?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_tasks: {
        Row: {
          completed_at: string | null
          couple_id: string
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          id: string
          priority: string
          related_reference: string | null
          related_scope: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          couple_id: string
          created_at?: string
          created_by?: string
          description: string
          due_date?: string | null
          id?: string
          priority?: string
          related_reference?: string | null
          related_scope?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          couple_id?: string
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          related_reference?: string | null
          related_scope?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_tasks_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_expenses: {
        Row: {
          amount: number
          card_id: string | null
          category: string
          couple_id: string
          created_at: string
          date: string | null
          description: string | null
          due_day: number
          id: string
          is_active: boolean
          name: string
          notes: string | null
          paid_with_card: boolean
          payment_method: string | null
          type: string
        }
        Insert: {
          amount?: number
          card_id?: string | null
          category: string
          couple_id: string
          created_at?: string
          date?: string | null
          description?: string | null
          due_day: number
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          paid_with_card?: boolean
          payment_method?: string | null
          type?: string
        }
        Update: {
          amount?: number
          card_id?: string | null
          category?: string
          couple_id?: string
          created_at?: string
          date?: string | null
          description?: string | null
          due_day?: number
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          paid_with_card?: boolean
          payment_method?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_expenses_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_expenses_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      income: {
        Row: {
          base_amount: number | null
          couple_id: string
          created_at: string
          date: string
          effective_from: string | null
          gross_amount: number
          id: string
          is_salary_revision: boolean | null
          net_amount: number
          source: string
          type: string
        }
        Insert: {
          base_amount?: number | null
          couple_id: string
          created_at?: string
          date: string
          effective_from?: string | null
          gross_amount?: number
          id?: string
          is_salary_revision?: boolean | null
          net_amount?: number
          source: string
          type?: string
        }
        Update: {
          base_amount?: number | null
          couple_id?: string
          created_at?: string
          date?: string
          effective_from?: string | null
          gross_amount?: number
          id?: string
          is_salary_revision?: boolean | null
          net_amount?: number
          source?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      income_components: {
        Row: {
          amount: number
          couple_id: string
          created_at: string
          id: string
          income_id: string | null
          months: number[] | null
          name: string
          recurrence: string
          type: string
        }
        Insert: {
          amount?: number
          couple_id: string
          created_at?: string
          id?: string
          income_id?: string | null
          months?: number[] | null
          name: string
          recurrence?: string
          type: string
        }
        Update: {
          amount?: number
          couple_id?: string
          created_at?: string
          id?: string
          income_id?: string | null
          months?: number[] | null
          name?: string
          recurrence?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_components_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_components_income_id_fkey"
            columns: ["income_id"]
            isOneToOne: false
            referencedRelation: "income"
            referencedColumns: ["id"]
          },
        ]
      }
      income_events: {
        Row: {
          amount: number
          couple_id: string
          created_at: string
          id: string
          months: number[]
          name: string
        }
        Insert: {
          amount?: number
          couple_id: string
          created_at?: string
          id?: string
          months: number[]
          name: string
        }
        Update: {
          amount?: number
          couple_id?: string
          created_at?: string
          id?: string
          months?: number[]
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_events_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_snapshots: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          piggy_bank_end_balance: number
          projected_savings: number
          status: string
          total_card_invoices: number
          total_fixed_expenses: number
          total_income: number
          total_variable_expenses: number
          year_month: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          piggy_bank_end_balance?: number
          projected_savings?: number
          status?: string
          total_card_invoices?: number
          total_fixed_expenses?: number
          total_income?: number
          total_variable_expenses?: number
          year_month: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          piggy_bank_end_balance?: number
          projected_savings?: number
          status?: string
          total_card_invoices?: number
          total_fixed_expenses?: number
          total_income?: number
          total_variable_expenses?: number
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_snapshots_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      piggy_bank_movements: {
        Row: {
          amount: number
          couple_id: string
          created_at: string
          date: string
          id: string
          piggy_bank_id: string | null
          reason: string | null
          type: string
        }
        Insert: {
          amount?: number
          couple_id: string
          created_at?: string
          date: string
          id?: string
          piggy_bank_id?: string | null
          reason?: string | null
          type: string
        }
        Update: {
          amount?: number
          couple_id?: string
          created_at?: string
          date?: string
          id?: string
          piggy_bank_id?: string | null
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "piggy_bank_movements_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piggy_bank_movements_piggy_bank_id_fkey"
            columns: ["piggy_bank_id"]
            isOneToOne: false
            referencedRelation: "piggy_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      piggy_banks: {
        Row: {
          couple_id: string
          created_at: string
          current_balance: number
          goal_amount: number | null
          id: string
          name: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          current_balance?: number
          goal_amount?: number | null
          id?: string
          name?: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          current_balance?: number
          goal_amount?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "piggy_bank_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_deductions: {
        Row: {
          amount_monthly: number
          couple_id: string
          created_at: string
          description: string
          end_month: string | null
          id: string
          installments_paid: number
          installments_total: number
          start_month: string
        }
        Insert: {
          amount_monthly?: number
          couple_id: string
          created_at?: string
          description: string
          end_month?: string | null
          id?: string
          installments_paid?: number
          installments_total?: number
          start_month: string
        }
        Update: {
          amount_monthly?: number
          couple_id?: string
          created_at?: string
          description?: string
          end_month?: string | null
          id?: string
          installments_paid?: number
          installments_total?: number
          start_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_deductions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      supabase_migrations: {
        Row: {
          applied_at: string | null
          name: string | null
          version: string
        }
        Insert: {
          applied_at?: string | null
          name?: string | null
          version: string
        }
        Update: {
          applied_at?: string | null
          name?: string | null
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_family_space: { Args: { name: string }; Returns: Json }
      is_couple_member: { Args: { _couple_id: string }; Returns: boolean }
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
