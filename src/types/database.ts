// ============================================================
// Supabase Database Types
// Auto-generated style — keep in sync with 001_initial_schema.sql
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          contact_info: string
          gender: string | null
          age: number | null
          birthday: string | null
          work: string | null
          dream_city: string | null
          ask_out_preference: string | null
          comfortable_with_man_asking_woman: boolean | null
          comfortable_with_alcohol_meetcute: boolean | null
          life_in_5_years: string | null
          last_thing_that_made_you_laugh: string | null
          dream_date: string | null
          family_notes: string | null
          vice_or_red_flag: string | null
          dealbreaker: string | null
          random_curiosities: string | null
          referral_notes: string | null
          /** SENSITIVE — organizer-only, never expose in participant-facing views */
          values_or_worldview: string | null
          priority_weights: Json | null
          ready_for_love: Database['public']['Enums']['readiness_for_love'] | null
          grand_amour: string | null
          preferred_partner_age_min: number | null
          preferred_partner_age_max: number | null
          okay_with_some_deviation: boolean | null
          has_kids: Database['public']['Enums']['lifestyle_preference'] | null
          partner_has_kids: Database['public']['Enums']['lifestyle_preference'] | null
          travels_world: Database['public']['Enums']['lifestyle_preference'] | null
          partner_travels_world: Database['public']['Enums']['lifestyle_preference'] | null
          is_divorced: Database['public']['Enums']['lifestyle_preference'] | null
          partner_is_divorced: Database['public']['Enums']['lifestyle_preference'] | null
          smokes_drug_friendly: Database['public']['Enums']['lifestyle_preference'] | null
          partner_smokes_drug_friendly: Database['public']['Enums']['lifestyle_preference'] | null
          has_tattoos: Database['public']['Enums']['lifestyle_preference'] | null
          partner_has_tattoos: Database['public']['Enums']['lifestyle_preference'] | null
          fitness_level: Database['public']['Enums']['lifestyle_preference'] | null
          partner_fitness: Database['public']['Enums']['lifestyle_preference'] | null
          close_with_family: Database['public']['Enums']['lifestyle_preference'] | null
          partner_close_with_family: Database['public']['Enums']['lifestyle_preference'] | null
        }
        Insert: Omit<Database['public']['Tables']['participants']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['participants']['Insert']>
      }
      applications: {
        Row: {
          id: string
          participant_id: string
          submitted_at: string
          source_event_id: string | null
          status: Database['public']['Enums']['application_status']
          organizer_notes: string | null
          tags: string[] | null
          interview_required: boolean
          interview_completed: boolean
          interview_date: string | null
          assigned_event_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'submitted_at'> & {
          id?: string
          submitted_at?: string
        }
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          event_date: string | null
          location: string | null
          description: string | null
          status: Database['public']['Enums']['event_status']
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      event_participants: {
        Row: {
          id: string
          participant_id: string
          event_id: string
          application_id: string | null
          attendance_status: Database['public']['Enums']['attendance_status']
          organizer_notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['event_participants']['Row'], 'id'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['event_participants']['Insert']>
      }
      interviews: {
        Row: {
          id: string
          participant_id: string
          application_id: string
          scheduled_at: string | null
          completed_at: string | null
          notes: string | null
          outcome: Database['public']['Enums']['interview_outcome']
        }
        Insert: Omit<Database['public']['Tables']['interviews']['Row'], 'id'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['interviews']['Insert']>
      }
      match_outcomes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          event_id: string
          participant_a_id: string
          participant_b_id: string
          interest_status: Database['public']['Enums']['interest_status']
          organizer_notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['match_outcomes']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['match_outcomes']['Insert']>
      }
    }
    Enums: {
      application_status:
        | 'applied'
        | 'under_review'
        | 'interview_requested'
        | 'interviewed'
        | 'approved'
        | 'waitlisted'
        | 'declined'
        | 'assigned_to_event'
        | 'attended'
        | 'archived'
      event_status: 'draft' | 'open' | 'closed' | 'completed' | 'archived'
      attendance_status:
        | 'invited'
        | 'confirmed'
        | 'waitlisted'
        | 'attended'
        | 'no_show'
        | 'cancelled'
      interview_outcome: 'pending' | 'completed' | 'no_show' | 'follow_up_needed'
      interest_status:
        | 'potential_match'
        | 'one_sided_interest'
        | 'mutual_interest'
        | 'no_match'
        | 'follow_up_needed'
        | 'introduced_off_platform'
      readiness_for_love: 'yes' | 'not_sure' | 'no'
      lifestyle_preference: 'want' | 'dont_want' | 'flexible'
    }
  }
}

// ─── Convenience Row Types ────────────────────────────────────

export type ParticipantRow = Database['public']['Tables']['participants']['Row']
export type ApplicationRow = Database['public']['Tables']['applications']['Row']
export type EventRow = Database['public']['Tables']['events']['Row']
export type EventParticipantRow = Database['public']['Tables']['event_participants']['Row']
export type InterviewRow = Database['public']['Tables']['interviews']['Row']
export type MatchOutcomeRow = Database['public']['Tables']['match_outcomes']['Row']

export type ParticipantInsert = Database['public']['Tables']['participants']['Insert']
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert']
export type EventInsert = Database['public']['Tables']['events']['Insert']
