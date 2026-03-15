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
      building_permits: {
        Row: {
          address: string
          contractor_name: string | null
          created_at: string
          id: string
          issue_date: string | null
          permit_date: string | null
          permit_number: string | null
          permit_type: string | null
          property_snapshot_id: string | null
          raw_data: Json | null
          status: string | null
          valuation_amount: number | null
          work_description: string | null
        }
        Insert: {
          address: string
          contractor_name?: string | null
          created_at?: string
          id?: string
          issue_date?: string | null
          permit_date?: string | null
          permit_number?: string | null
          permit_type?: string | null
          property_snapshot_id?: string | null
          raw_data?: Json | null
          status?: string | null
          valuation_amount?: number | null
          work_description?: string | null
        }
        Update: {
          address?: string
          contractor_name?: string | null
          created_at?: string
          id?: string
          issue_date?: string | null
          permit_date?: string | null
          permit_number?: string | null
          permit_type?: string | null
          property_snapshot_id?: string | null
          raw_data?: Json | null
          status?: string | null
          valuation_amount?: number | null
          work_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "building_permits_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      buy_box_match_results: {
        Row: {
          arv_score: number | null
          buy_box_id: string
          created_at: string
          deal_margin_score: number | null
          id: string
          layout_score: number | null
          lead_property_id: string | null
          location_score: number | null
          overall_match_score: number | null
          pass_status: string | null
          price_score: number | null
          primary_failure_reason: string | null
          primary_success_reason: string | null
          property_snapshot_id: string | null
          property_type_score: number | null
          reason_failed_summary: string | null
          reason_passed_summary: string | null
          recommended_action: string | null
          rehab_score: number | null
          school_district_score: number | null
          strategy_fit_score: number | null
          strategy_type: string | null
        }
        Insert: {
          arv_score?: number | null
          buy_box_id: string
          created_at?: string
          deal_margin_score?: number | null
          id?: string
          layout_score?: number | null
          lead_property_id?: string | null
          location_score?: number | null
          overall_match_score?: number | null
          pass_status?: string | null
          price_score?: number | null
          primary_failure_reason?: string | null
          primary_success_reason?: string | null
          property_snapshot_id?: string | null
          property_type_score?: number | null
          reason_failed_summary?: string | null
          reason_passed_summary?: string | null
          recommended_action?: string | null
          rehab_score?: number | null
          school_district_score?: number | null
          strategy_fit_score?: number | null
          strategy_type?: string | null
        }
        Update: {
          arv_score?: number | null
          buy_box_id?: string
          created_at?: string
          deal_margin_score?: number | null
          id?: string
          layout_score?: number | null
          lead_property_id?: string | null
          location_score?: number | null
          overall_match_score?: number | null
          pass_status?: string | null
          price_score?: number | null
          primary_failure_reason?: string | null
          primary_success_reason?: string | null
          property_snapshot_id?: string | null
          property_type_score?: number | null
          reason_failed_summary?: string | null
          reason_passed_summary?: string | null
          recommended_action?: string | null
          rehab_score?: number | null
          school_district_score?: number | null
          strategy_fit_score?: number | null
          strategy_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buy_box_match_results_buy_box_id_fkey"
            columns: ["buy_box_id"]
            isOneToOne: false
            referencedRelation: "buy_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buy_box_match_results_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      buy_box_rule_results: {
        Row: {
          actual_value: string | null
          buy_box_id: string
          created_at: string
          expected_value: string | null
          explanation: string | null
          fail_severity: string | null
          id: string
          lead_property_id: string | null
          match_result_id: string
          passed: boolean | null
          rule_name: string
        }
        Insert: {
          actual_value?: string | null
          buy_box_id: string
          created_at?: string
          expected_value?: string | null
          explanation?: string | null
          fail_severity?: string | null
          id?: string
          lead_property_id?: string | null
          match_result_id: string
          passed?: boolean | null
          rule_name: string
        }
        Update: {
          actual_value?: string | null
          buy_box_id?: string
          created_at?: string
          expected_value?: string | null
          explanation?: string | null
          fail_severity?: string | null
          id?: string
          lead_property_id?: string | null
          match_result_id?: string
          passed?: boolean | null
          rule_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "buy_box_rule_results_buy_box_id_fkey"
            columns: ["buy_box_id"]
            isOneToOne: false
            referencedRelation: "buy_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buy_box_rule_results_match_result_id_fkey"
            columns: ["match_result_id"]
            isOneToOne: false
            referencedRelation: "buy_box_match_results"
            referencedColumns: ["id"]
          },
        ]
      }
      buy_boxes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          max_cash_left_in_deal: number | null
          max_purchase_price: number | null
          max_rehab_budget: number | null
          max_sqft: number | null
          min_arv: number | null
          min_baths: number | null
          min_beds: number | null
          min_equity_spread: number | null
          min_profit: number | null
          min_profit_margin_pct: number | null
          min_purchase_price: number | null
          min_rent: number | null
          min_rent_to_price_ratio: number | null
          min_sqft: number | null
          min_year_built: number | null
          name: string
          notes: string | null
          preferred_condition_levels: string[] | null
          preferred_finish_level: string | null
          property_types_allowed: string[] | null
          strategy_type: string
          target_cities: string[] | null
          target_hold_period_months: number | null
          target_neighborhoods: string[] | null
          target_school_districts: string[] | null
          target_states: string[] | null
          target_zip_codes: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          max_cash_left_in_deal?: number | null
          max_purchase_price?: number | null
          max_rehab_budget?: number | null
          max_sqft?: number | null
          min_arv?: number | null
          min_baths?: number | null
          min_beds?: number | null
          min_equity_spread?: number | null
          min_profit?: number | null
          min_profit_margin_pct?: number | null
          min_purchase_price?: number | null
          min_rent?: number | null
          min_rent_to_price_ratio?: number | null
          min_sqft?: number | null
          min_year_built?: number | null
          name: string
          notes?: string | null
          preferred_condition_levels?: string[] | null
          preferred_finish_level?: string | null
          property_types_allowed?: string[] | null
          strategy_type?: string
          target_cities?: string[] | null
          target_hold_period_months?: number | null
          target_neighborhoods?: string[] | null
          target_school_districts?: string[] | null
          target_states?: string[] | null
          target_zip_codes?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          max_cash_left_in_deal?: number | null
          max_purchase_price?: number | null
          max_rehab_budget?: number | null
          max_sqft?: number | null
          min_arv?: number | null
          min_baths?: number | null
          min_beds?: number | null
          min_equity_spread?: number | null
          min_profit?: number | null
          min_profit_margin_pct?: number | null
          min_purchase_price?: number | null
          min_rent?: number | null
          min_rent_to_price_ratio?: number | null
          min_sqft?: number | null
          min_year_built?: number | null
          name?: string
          notes?: string | null
          preferred_condition_levels?: string[] | null
          preferred_finish_level?: string | null
          property_types_allowed?: string[] | null
          strategy_type?: string
          target_cities?: string[] | null
          target_hold_period_months?: number | null
          target_neighborhoods?: string[] | null
          target_school_districts?: string[] | null
          target_states?: string[] | null
          target_zip_codes?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      code_violations: {
        Row: {
          address: string
          case_number: string | null
          created_at: string
          description: string | null
          id: string
          property_snapshot_id: string | null
          raw_data: Json | null
          status: string | null
          violation_date: string | null
          violation_type: string | null
        }
        Insert: {
          address: string
          case_number?: string | null
          created_at?: string
          description?: string | null
          id?: string
          property_snapshot_id?: string | null
          raw_data?: Json | null
          status?: string | null
          violation_date?: string | null
          violation_type?: string | null
        }
        Update: {
          address?: string
          case_number?: string | null
          created_at?: string
          description?: string | null
          id?: string
          property_snapshot_id?: string | null
          raw_data?: Json | null
          status?: string | null
          violation_date?: string | null
          violation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_violations_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      crime_data: {
        Row: {
          address: string | null
          created_at: string
          crime_type: string | null
          id: string
          incident_date: string | null
          lat: number | null
          lng: number | null
          neighborhood: string | null
          offense_category: string | null
          raw_data: Json | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          crime_type?: string | null
          id?: string
          incident_date?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string | null
          offense_category?: string | null
          raw_data?: Json | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          crime_type?: string | null
          id?: string
          incident_date?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string | null
          offense_category?: string | null
          raw_data?: Json | null
          zip_code?: string | null
        }
        Relationships: []
      }
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
      demographics: {
        Row: {
          created_at: string
          education_bachelors_pct: number | null
          employment_rate: number | null
          housing_occupancy_rate: number | null
          id: string
          median_age: number | null
          median_income: number | null
          median_rent: number | null
          population: number | null
          poverty_rate: number | null
          raw_data: Json | null
          year: number
          zip_code: string
        }
        Insert: {
          created_at?: string
          education_bachelors_pct?: number | null
          employment_rate?: number | null
          housing_occupancy_rate?: number | null
          id?: string
          median_age?: number | null
          median_income?: number | null
          median_rent?: number | null
          population?: number | null
          poverty_rate?: number | null
          raw_data?: Json | null
          year: number
          zip_code: string
        }
        Update: {
          created_at?: string
          education_bachelors_pct?: number | null
          employment_rate?: number | null
          housing_occupancy_rate?: number | null
          id?: string
          median_age?: number | null
          median_income?: number | null
          median_rent?: number | null
          population?: number | null
          poverty_rate?: number | null
          raw_data?: Json | null
          year?: number
          zip_code?: string
        }
        Relationships: []
      }
      evictions: {
        Row: {
          address: string
          case_number: string | null
          created_at: string
          defendant: string | null
          filing_date: string | null
          id: string
          judgment_amount: number | null
          plaintiff: string | null
          property_snapshot_id: string | null
          raw_data: Json | null
          status: string | null
        }
        Insert: {
          address: string
          case_number?: string | null
          created_at?: string
          defendant?: string | null
          filing_date?: string | null
          id?: string
          judgment_amount?: number | null
          plaintiff?: string | null
          property_snapshot_id?: string | null
          raw_data?: Json | null
          status?: string | null
        }
        Update: {
          address?: string
          case_number?: string | null
          created_at?: string
          defendant?: string | null
          filing_date?: string | null
          id?: string
          judgment_amount?: number | null
          plaintiff?: string | null
          property_snapshot_id?: string | null
          raw_data?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evictions_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      foreclosure_stats: {
        Row: {
          created_at: string
          id: string
          mom_change: number | null
          month: string
          new_starts: number | null
          raw_data: Json | null
          releases: number | null
          source: string | null
          total_activity: number | null
          yoy_change: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          mom_change?: number | null
          month: string
          new_starts?: number | null
          raw_data?: Json | null
          releases?: number | null
          source?: string | null
          total_activity?: number | null
          yoy_change?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          mom_change?: number | null
          month?: string
          new_starts?: number | null
          raw_data?: Json | null
          releases?: number | null
          source?: string | null
          total_activity?: number | null
          yoy_change?: number | null
        }
        Relationships: []
      }
      foreclosures: {
        Row: {
          address: string
          case_number: string | null
          created_at: string
          estimated_arv: number | null
          id: string
          legal_description: string | null
          opening_bid: number | null
          opportunity_score: number | null
          property_snapshot_id: string | null
          property_type: string | null
          raw_data: Json | null
          sale_date: string | null
          sale_time: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address: string
          case_number?: string | null
          created_at?: string
          estimated_arv?: number | null
          id?: string
          legal_description?: string | null
          opening_bid?: number | null
          opportunity_score?: number | null
          property_snapshot_id?: string | null
          property_type?: string | null
          raw_data?: Json | null
          sale_date?: string | null
          sale_time?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          case_number?: string | null
          created_at?: string
          estimated_arv?: number | null
          id?: string
          legal_description?: string | null
          opening_bid?: number | null
          opportunity_score?: number | null
          property_snapshot_id?: string | null
          property_type?: string | null
          raw_data?: Json | null
          sale_date?: string | null
          sale_time?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "foreclosures_property_snapshot_id_fkey"
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
      market_trends: {
        Row: {
          created_at: string
          days_on_market: number | null
          homes_sold: number | null
          id: string
          inventory: number | null
          median_sale_price: number | null
          mom_change: number | null
          month: string
          new_listings: number | null
          price_per_sqft: number | null
          raw_data: Json | null
          source: string | null
          yoy_change: number | null
          zip_code: string
        }
        Insert: {
          created_at?: string
          days_on_market?: number | null
          homes_sold?: number | null
          id?: string
          inventory?: number | null
          median_sale_price?: number | null
          mom_change?: number | null
          month: string
          new_listings?: number | null
          price_per_sqft?: number | null
          raw_data?: Json | null
          source?: string | null
          yoy_change?: number | null
          zip_code: string
        }
        Update: {
          created_at?: string
          days_on_market?: number | null
          homes_sold?: number | null
          id?: string
          inventory?: number | null
          median_sale_price?: number | null
          mom_change?: number | null
          month?: string
          new_listings?: number | null
          price_per_sqft?: number | null
          raw_data?: Json | null
          source?: string | null
          yoy_change?: number | null
          zip_code?: string
        }
        Relationships: []
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
      rental_licenses: {
        Row: {
          address: string
          created_at: string
          expiration_date: string | null
          id: string
          issue_date: string | null
          license_number: string | null
          license_type: string | null
          num_units: number | null
          owner_name: string | null
          property_snapshot_id: string | null
          raw_data: Json | null
          status: string | null
        }
        Insert: {
          address: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          issue_date?: string | null
          license_number?: string | null
          license_type?: string | null
          num_units?: number | null
          owner_name?: string | null
          property_snapshot_id?: string | null
          raw_data?: Json | null
          status?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          issue_date?: string | null
          license_number?: string | null
          license_type?: string | null
          num_units?: number | null
          owner_name?: string | null
          property_snapshot_id?: string | null
          raw_data?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_licenses_property_snapshot_id_fkey"
            columns: ["property_snapshot_id"]
            isOneToOne: false
            referencedRelation: "property_snapshots"
            referencedColumns: ["id"]
          },
        ]
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
      schools: {
        Row: {
          address: string | null
          created_at: string
          enrollment: number | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          rating: number | null
          raw_data: Json | null
          school_type: string | null
          student_teacher_ratio: number | null
          test_scores: number | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          enrollment?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          rating?: number | null
          raw_data?: Json | null
          school_type?: string | null
          student_teacher_ratio?: number | null
          test_scores?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          enrollment?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          rating?: number | null
          raw_data?: Json | null
          school_type?: string | null
          student_teacher_ratio?: number | null
          test_scores?: number | null
          updated_at?: string
          zip_code?: string | null
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
      tax_delinquencies: {
        Row: {
          address: string
          amount_owed: number | null
          created_at: string
          id: string
          lien_status: string | null
          parcel_number: string | null
          penalty_interest: number | null
          property_snapshot_id: string | null
          raw_data: Json | null
          tax_year: number | null
          total_due: number | null
          updated_at: string
        }
        Insert: {
          address: string
          amount_owed?: number | null
          created_at?: string
          id?: string
          lien_status?: string | null
          parcel_number?: string | null
          penalty_interest?: number | null
          property_snapshot_id?: string | null
          raw_data?: Json | null
          tax_year?: number | null
          total_due?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          amount_owed?: number | null
          created_at?: string
          id?: string
          lien_status?: string | null
          parcel_number?: string | null
          penalty_interest?: number | null
          property_snapshot_id?: string | null
          raw_data?: Json | null
          tax_year?: number | null
          total_due?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_delinquencies_property_snapshot_id_fkey"
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
