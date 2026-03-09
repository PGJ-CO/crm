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
      deal_scores: {
        Row: {
          created_at: string
          factors: Json | null
          id: string
          lead_id: string | null
          property_snapshot_id: string | null
          score: number
          score_history: Json | null
          tier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          factors?: Json | null
          id?: string
          lead_id?: string | null
          property_snapshot_id?: string | null
          score?: number
          score_history?: Json | null
          tier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          factors?: Json | null
          id?: string
          lead_id?: string | null
          property_snapshot_id?: string | null
          score?: number
          score_history?: Json | null
          tier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_scores_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      heat_map_data: {
        Row: {
          avg_deal_profit: number | null
          avg_dom: number | null
          avg_equity_percent: number | null
          buyer_demand_index: number | null
          data_period: string | null
          deal_count: number | null
          id: string
          investor_activity_index: number | null
          lat: number | null
          lng: number | null
          property_count: number | null
          roi_score: number | null
          seller_distress_index: number | null
          trend: string | null
          updated_at: string
          zip_code: string
        }
        Insert: {
          avg_deal_profit?: number | null
          avg_dom?: number | null
          avg_equity_percent?: number | null
          buyer_demand_index?: number | null
          data_period?: string | null
          deal_count?: number | null
          id?: string
          investor_activity_index?: number | null
          lat?: number | null
          lng?: number | null
          property_count?: number | null
          roi_score?: number | null
          seller_distress_index?: number | null
          trend?: string | null
          updated_at?: string
          zip_code: string
        }
        Update: {
          avg_deal_profit?: number | null
          avg_dom?: number | null
          avg_equity_percent?: number | null
          buyer_demand_index?: number | null
          data_period?: string | null
          deal_count?: number | null
          id?: string
          investor_activity_index?: number | null
          lat?: number | null
          lng?: number | null
          property_count?: number | null
          roi_score?: number | null
          seller_distress_index?: number | null
          trend?: string | null
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
      lead_list_members: {
        Row: {
          added_at: string
          id: string
          lead_list_id: string
          property_snapshot_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          lead_list_id: string
          property_snapshot_id: string
        }
        Update: {
          added_at?: string
          id?: string
          lead_list_id?: string
          property_snapshot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_list_members_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_list_members_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          property_count: number | null
          saved_search_id: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          property_count?: number | null
          saved_search_id?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          property_count?: number | null
          saved_search_id?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_lists_saved_search_id_fkey"
            columns: ["saved_search_id"]
            isOneToOne: false
            referencedRelation: "saved_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      property_snapshots: {
        Row: {
          annual_taxes: number | null
          arv: number | null
          baths: number | null
          beds: number | null
          city: string | null
          code_violation_count: number | null
          condition: string | null
          county: string | null
          created_at: string
          current_value: number | null
          data_source: string | null
          days_on_market: number | null
          distress_score: number | null
          equity_percent: number | null
          estimated_equity: number | null
          has_code_violations: boolean | null
          id: string
          is_absentee: boolean | null
          is_divorce: boolean | null
          is_high_equity: boolean | null
          is_out_of_state: boolean | null
          is_pre_foreclosure: boolean | null
          is_probate: boolean | null
          is_tired_landlord: boolean | null
          is_vacant: boolean | null
          last_sale_date: string | null
          last_sale_price: number | null
          lot_sqft: number | null
          mortgage_balance: number | null
          mortgage_lender: string | null
          mortgage_rate: number | null
          mortgage_term: number | null
          occupancy_status: string | null
          owner_mailing_address: string | null
          owner_name: string | null
          owner_type: string | null
          ownership_years: number | null
          property_address: string
          property_type: string | null
          purchase_date: string | null
          purchase_price: number | null
          raw_data: Json | null
          rental_units: number | null
          rental_value: number | null
          sqft: number | null
          state: string | null
          tax_assessed_value: number | null
          tax_delinquent: boolean | null
          tax_delinquent_amount: number | null
          updated_at: string
          year_built: number | null
          zip: string | null
          zoning: string | null
        }
        Insert: {
          annual_taxes?: number | null
          arv?: number | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          code_violation_count?: number | null
          condition?: string | null
          county?: string | null
          created_at?: string
          current_value?: number | null
          data_source?: string | null
          days_on_market?: number | null
          distress_score?: number | null
          equity_percent?: number | null
          estimated_equity?: number | null
          has_code_violations?: boolean | null
          id?: string
          is_absentee?: boolean | null
          is_divorce?: boolean | null
          is_high_equity?: boolean | null
          is_out_of_state?: boolean | null
          is_pre_foreclosure?: boolean | null
          is_probate?: boolean | null
          is_tired_landlord?: boolean | null
          is_vacant?: boolean | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          lot_sqft?: number | null
          mortgage_balance?: number | null
          mortgage_lender?: string | null
          mortgage_rate?: number | null
          mortgage_term?: number | null
          occupancy_status?: string | null
          owner_mailing_address?: string | null
          owner_name?: string | null
          owner_type?: string | null
          ownership_years?: number | null
          property_address: string
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          raw_data?: Json | null
          rental_units?: number | null
          rental_value?: number | null
          sqft?: number | null
          state?: string | null
          tax_assessed_value?: number | null
          tax_delinquent?: boolean | null
          tax_delinquent_amount?: number | null
          updated_at?: string
          year_built?: number | null
          zip?: string | null
          zoning?: string | null
        }
        Update: {
          annual_taxes?: number | null
          arv?: number | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          code_violation_count?: number | null
          condition?: string | null
          county?: string | null
          created_at?: string
          current_value?: number | null
          data_source?: string | null
          days_on_market?: number | null
          distress_score?: number | null
          equity_percent?: number | null
          estimated_equity?: number | null
          has_code_violations?: boolean | null
          id?: string
          is_absentee?: boolean | null
          is_divorce?: boolean | null
          is_high_equity?: boolean | null
          is_out_of_state?: boolean | null
          is_pre_foreclosure?: boolean | null
          is_probate?: boolean | null
          is_tired_landlord?: boolean | null
          is_vacant?: boolean | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          lot_sqft?: number | null
          mortgage_balance?: number | null
          mortgage_lender?: string | null
          mortgage_rate?: number | null
          mortgage_term?: number | null
          occupancy_status?: string | null
          owner_mailing_address?: string | null
          owner_name?: string | null
          owner_type?: string | null
          ownership_years?: number | null
          property_address?: string
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          raw_data?: Json | null
          rental_units?: number | null
          rental_value?: number | null
          sqft?: number | null
          state?: string | null
          tax_assessed_value?: number | null
          tax_delinquent?: boolean | null
          tax_delinquent_amount?: number | null
          updated_at?: string
          year_built?: number | null
          zip?: string | null
          zoning?: string | null
        }
        Relationships: []
      }
      repair_estimates: {
        Row: {
          arv: number | null
          contingency_amount: number | null
          contingency_percent: number | null
          cost_per_sqft: number | null
          created_at: string
          estimated_profit: number | null
          holding_costs: number | null
          id: string
          lead_id: string | null
          line_items: Json | null
          name: string
          notes: string | null
          photos: string[] | null
          property_snapshot_id: string | null
          purchase_price: number | null
          roi_percent: number | null
          selling_costs: number | null
          status: string | null
          subtotal: number | null
          total: number | null
          updated_at: string
          version: number | null
        }
        Insert: {
          arv?: number | null
          contingency_amount?: number | null
          contingency_percent?: number | null
          cost_per_sqft?: number | null
          created_at?: string
          estimated_profit?: number | null
          holding_costs?: number | null
          id?: string
          lead_id?: string | null
          line_items?: Json | null
          name?: string
          notes?: string | null
          photos?: string[] | null
          property_snapshot_id?: string | null
          purchase_price?: number | null
          roi_percent?: number | null
          selling_costs?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          arv?: number | null
          contingency_amount?: number | null
          contingency_percent?: number | null
          cost_per_sqft?: number | null
          created_at?: string
          estimated_profit?: number | null
          holding_costs?: number | null
          id?: string
          lead_id?: string | null
          line_items?: Json | null
          name?: string
          notes?: string | null
          photos?: string[] | null
          property_snapshot_id?: string | null
          purchase_price?: number | null
          roi_percent?: number | null
          selling_costs?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_estimates_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          estimated_count: number | null
          filters: Json
          id: string
          is_preset: boolean | null
          last_run_at: string | null
          name: string
          schedule: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_count?: number | null
          filters?: Json
          id?: string
          is_preset?: boolean | null
          last_run_at?: string | null
          name: string
          schedule?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_count?: number | null
          filters?: Json
          id?: string
          is_preset?: boolean | null
          last_run_at?: string | null
          name?: string
          schedule?: string | null
        }
        Relationships: []
      }
      skip_trace_results: {
        Row: {
          associates: Json | null
          confidence_score: number | null
          created_at: string
          current_address: string | null
          emails: Json | null
          id: string
          is_dnc: boolean | null
          is_litigator: boolean | null
          owner_name: string
          phones: Json | null
          property_snapshot_id: string | null
          provider: string | null
          raw_response: Json | null
          relatives: Json | null
          status: string | null
        }
        Insert: {
          associates?: Json | null
          confidence_score?: number | null
          created_at?: string
          current_address?: string | null
          emails?: Json | null
          id?: string
          is_dnc?: boolean | null
          is_litigator?: boolean | null
          owner_name: string
          phones?: Json | null
          property_snapshot_id?: string | null
          provider?: string | null
          raw_response?: Json | null
          relatives?: Json | null
          status?: string | null
        }
        Update: {
          associates?: Json | null
          confidence_score?: number | null
          created_at?: string
          current_address?: string | null
          emails?: Json | null
          id?: string
          is_dnc?: boolean | null
          is_litigator?: boolean | null
          owner_name?: string
          phones?: Json | null
          property_snapshot_id?: string | null
          provider?: string | null
          raw_response?: Json | null
          relatives?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skip_trace_results_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
